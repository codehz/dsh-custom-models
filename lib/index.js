import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { assertUsableApiKey, LlmError, resolveRetryPolicy, } from "@deepseek-ai/dsh-llm";
import { PiAiAdapter, } from "@deepseek-ai/dsh-llm-pi-ai";
import { createProvider, envApiKeyAuth, lazyApi, } from "@earendil-works/pi-ai";
const THINKING_LEVELS = [
    "off", "minimal", "low", "medium", "high", "xhigh", "max",
];
const THINKING_LEVEL_SET = new Set(THINKING_LEVELS);
const SUPPORTED_APIS = ["openai-completions", "openai-responses"];
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function positiveInteger(value, fallback, path) {
    const resolved = value === undefined ? fallback : value;
    if (typeof resolved !== "number" || !Number.isInteger(resolved) || resolved <= 0) {
        throw new Error("dsh-custom-models: " + path + " must be a positive integer");
    }
    return resolved;
}
function readDefault(provider, model, value) {
    if (value === undefined)
        return undefined;
    if (typeof value !== "string" || !THINKING_LEVEL_SET.has(value)) {
        throw new Error("dsh-custom-models: provider route '" + provider + "' model '" + model +
            "' has invalid defaultReasoningEffort " + JSON.stringify(value) +
            "; expected one of " + THINKING_LEVELS.join(", "));
    }
    return value;
}
function resolveReasoning(provider, model, efforts) {
    if (efforts === undefined || efforts === false)
        return { reasoning: false };
    if (!isRecord(efforts) || Object.keys(efforts).length === 0) {
        throw new Error("dsh-custom-models: provider route '" + provider + "' model '" + model +
            "' reasoningEfforts must be false or a non-empty object");
    }
    for (const level of Object.keys(efforts)) {
        if (!THINKING_LEVEL_SET.has(level)) {
            throw new Error("dsh-custom-models: unknown reasoning effort '" + level +
                "' for '" + provider + "/" + model + "'");
        }
    }
    const map = {};
    let hasThinkingLevel = false;
    for (const level of THINKING_LEVELS) {
        const wire = efforts[level];
        if (wire === undefined) {
            map[level] = null;
            continue;
        }
        if (wire === null) {
            if (level !== "off") {
                throw new Error("dsh-custom-models: reasoningEfforts." + level +
                    " for '" + provider + "/" + model + "' requires a wire value");
            }
            delete map.off;
            continue;
        }
        if (typeof wire !== "string" || wire.length === 0) {
            throw new Error("dsh-custom-models: reasoningEfforts." + level +
                " for '" + provider + "/" + model + "' must be a non-empty string");
        }
        map[level] = wire;
        if (level !== "off")
            hasThinkingLevel = true;
    }
    if (!hasThinkingLevel) {
        throw new Error("dsh-custom-models: provider route '" + provider + "' model '" + model +
            "' must declare at least one reasoning level beyond off");
    }
    return { reasoning: true, thinkingLevelMap: map };
}
function streamsFor(api) {
    if (api === "openai-completions") {
        return lazyApi(() => import("@earendil-works/pi-ai/api/openai-completions"));
    }
    return lazyApi(() => import("@earendil-works/pi-ai/api/openai-responses"));
}
function zeroCost() {
    return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
}
/** Validate configuration and construct public pi-ai providers without private DSH imports. */
export function normalizeConfig(config = {}) {
    if (!isRecord(config))
        throw new Error("dsh-custom-models: config must be an object");
    const rawProviders = config.providers;
    if (rawProviders === undefined)
        return { profiles: new Map(), defaults: new Map() };
    if (!isRecord(rawProviders)) {
        throw new Error("dsh-custom-models: config.providers must be an object");
    }
    const profiles = new Map();
    const defaults = new Map();
    for (const [provider, raw] of Object.entries(rawProviders)) {
        if (!isRecord(raw)) {
            throw new Error("dsh-custom-models: provider route '" + provider + "' must be an object");
        }
        const profile = raw;
        if (typeof profile.baseURL !== "string" || profile.baseURL.length === 0) {
            throw new Error("dsh-custom-models: provider route '" + provider + "' needs baseURL");
        }
        if (!Array.isArray(profile.models) || profile.models.length === 0) {
            throw new Error("dsh-custom-models: provider route '" + provider + "' needs models");
        }
        const apiKeyEnv = profile.apiKeyEnv === undefined
            ? undefined
            : credentialRef(profile.apiKeyEnv);
        const api = profile.api ?? "openai-completions";
        if (!SUPPORTED_APIS.includes(api)) {
            throw new Error("dsh-custom-models: provider route '" + provider + "' api must be " +
                SUPPORTED_APIS.join(" or "));
        }
        const displayName = profile.displayName ?? provider;
        const routeDefaults = new Map();
        const configuredMaxTokens = new Map();
        const seen = new Set();
        const models = profile.models.map((entry, index) => {
            if (!isRecord(entry) || typeof entry.id !== "string" || entry.id.length === 0) {
                throw new Error("dsh-custom-models: provider route '" + provider + "' models[" + index + "] needs id");
            }
            if (seen.has(entry.id)) {
                throw new Error("dsh-custom-models: provider route '" + provider + "' has duplicate model '" +
                    entry.id + "'");
            }
            seen.add(entry.id);
            const contextWindow = positiveInteger(entry.contextWindow, 262_144, "providers." + provider + ".models." + entry.id + ".contextWindow");
            const maxTokens = positiveInteger(entry.maxTokens, 32_768, "providers." + provider + ".models." + entry.id + ".maxTokens");
            if (entry.maxTokens !== undefined)
                configuredMaxTokens.set(entry.id, maxTokens);
            if (entry.input !== undefined &&
                (!Array.isArray(entry.input) ||
                    entry.input.length === 0 ||
                    entry.input.some((modality) => modality !== "text" && modality !== "image"))) {
                throw new Error("dsh-custom-models: model '" + provider + "/" + entry.id +
                    "' input must contain text and/or image");
            }
            const reasoning = resolveReasoning(provider, entry.id, entry.reasoningEfforts);
            const defaultEffort = readDefault(provider, entry.id, entry.defaultReasoningEffort);
            if (defaultEffort !== undefined)
                routeDefaults.set(entry.id, defaultEffort);
            if (entry.compat !== undefined && api !== "openai-completions") {
                throw new Error("dsh-custom-models: model '" + provider + "/" + entry.id +
                    "' compat is only valid for openai-completions");
            }
            return {
                id: entry.id,
                name: entry.name ?? entry.id,
                api,
                provider,
                baseUrl: profile.baseURL,
                input: entry.input ?? ["text"],
                cost: zeroCost(),
                contextWindow,
                maxTokens,
                ...reasoning,
                ...api === "openai-completions"
                    ? { compat: { ...profile.compat, ...entry.compat } }
                    : {},
            };
        });
        const piProvider = createProvider({
            id: provider,
            name: displayName,
            baseUrl: profile.baseURL,
            ...(profile.headers === undefined ? {} : { headers: profile.headers }),
            auth: {
                apiKey: envApiKeyAuth(displayName, apiKeyEnv === undefined ? [] : [apiKeyEnv]),
            },
            models,
            api: streamsFor(api),
        });
        const streamIdleTimeoutMs = positiveInteger(profile.streamIdleTimeoutMs, 300_000, "providers." + provider + ".streamIdleTimeoutMs");
        profiles.set(provider, {
            provider,
            displayName,
            api,
            baseURL: profile.baseURL,
            streamIdleTimeoutMs,
            retryPolicy: resolveRetryPolicy(profile.retryPolicy, "providers." + provider + ".retryPolicy"),
            piProvider,
            configuredMaxTokens,
            ...(apiKeyEnv === undefined ? {} : { apiKeyEnv }),
            ...(profile.headers === undefined ? {} : { headers: profile.headers }),
            ...(profile.compat === undefined ? {} : { compat: profile.compat }),
        });
        if (routeDefaults.size > 0)
            defaults.set(provider, routeDefaults);
    }
    return { profiles, defaults };
}
/** Official pi-ai transport with exact-model defaults layered into metadata. */
export class PerModelReasoningPiAiAdapter extends PiAiAdapter {
    #defaults;
    constructor(options, defaults) {
        super(options);
        this.#defaults = defaults;
    }
    async resolveModel(provider, model, signal) {
        const resolved = await super.resolveModel(provider, model, signal);
        const configured = this.#defaults.get(provider)?.get(model);
        if (configured === undefined)
            return resolved;
        const reasoning = resolved.reasoning;
        if (reasoning === undefined || !reasoning.efforts.some((effort) => effort.id === configured)) {
            const supported = reasoning?.efforts.map((effort) => effort.id).join(", ") || "none";
            throw new LlmError("dsh-custom-models: provider route '" + provider + "' model '" + model +
                "' sets defaultReasoningEffort '" + configured +
                "', but its supported efforts are: " + supported, "UNSUPPORTED_REASONING_EFFORT");
        }
        return {
            ...resolved,
            reasoning: { ...reasoning, defaultEffort: configured },
        };
    }
}
async function validateDefaults(adapter, defaults) {
    for (const [provider, models] of defaults) {
        for (const model of models.keys())
            await adapter.resolveModel(provider, model);
    }
}
export const name = "custom-models";
export const inject = ["llm"];
export async function apply(ctx, config = {}) {
    const { profiles, defaults } = normalizeConfig(config);
    if (profiles.size === 0) {
        ctx.logger.info("dsh-custom-models: no providers configured; extension is dormant");
        return;
    }
    const resolveApiKey = async (provider, profile) => {
        const ref = profile.apiKeyEnv;
        if (ref === undefined)
            return undefined;
        const credentials = ctx.get("credentials");
        const value = credentials !== undefined
            ? (await credentials.resolve(ref))?.value
            : launchEnvironmentOf(ctx).get(ref)?.value;
        if (value !== undefined && value.length > 0) {
            return assertUsableApiKey(value, "dsh-custom-models", String(ref));
        }
        throw new LlmError("dsh-custom-models: no credential for provider route '" + provider +
            "'; " + String(ref) + " is not configured", "MISSING_CREDENTIAL");
    };
    const adapter = new PerModelReasoningPiAiAdapter({
        profiles: () => profiles,
        resolveApiKey,
        resolveAttachments: () => ctx.get("attachments"),
    }, defaults);
    await validateDefaults(adapter, defaults);
    ctx.llm.registerAdapter([...profiles.keys()], adapter);
}
//# sourceMappingURL=index.js.map