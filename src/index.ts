import type { Context } from "@deepseek-ai/cordis";
import z from "@deepseek-ai/schemastery";
import type {} from "@deepseek-ai/dsh-attachment";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import {
  assertUsableApiKey,
  LlmError,
  resolveRetryPolicy,
  RetryPolicySchema,
  type LlmResolvedModelInfo,
  type ReasoningEffortId,
  type RetryPolicyConfig,
} from "@deepseek-ai/dsh-llm";
import { discoverModels } from "./discovery.js";
import {
  PiAiAdapter,
  type PiAiAdapterOptions,
  type ResolvedPiAiProviderProfile,
} from "./ai-adapter.js";
import type { OpenAICompletionsCompat } from "@earendil-works/pi-ai";
type PiAiCompatProfile = Pick<OpenAICompletionsCompat, "thinkingFormat" | "supportsReasoningEffort">;
type PiAiThinkingFormat = NonNullable<PiAiCompatProfile["thinkingFormat"]>;
import {
  createProvider,
  envApiKeyAuth,
  lazyApi,
  type Api,
  type Model,
  type ModelThinkingLevel,
  type ProviderStreams,
  type ThinkingLevelMap,
} from "@earendil-works/pi-ai";

const THINKING_LEVELS = [
  "off", "minimal", "low", "medium", "high", "xhigh", "max",
] as const satisfies readonly ModelThinkingLevel[];
const THINKING_LEVEL_SET = new Set<string>(THINKING_LEVELS);
const SUPPORTED_APIS = ["openai-completions", "openai-responses"] as const;

type SupportedApi = (typeof SUPPORTED_APIS)[number];
type ModelDefaults = ReadonlyMap<string, ReadonlyMap<string, ModelThinkingLevel>>;

export type ReasoningEfforts = Partial<Record<ModelThinkingLevel, string | null>>;

export interface CustomModelProfile {
  id: string;
  name?: string;
  contextWindow?: number;
  maxTokens?: number;
  input?: Array<"text" | "image">;
  reasoningEfforts?: false | ReasoningEfforts;
  defaultReasoningEffort?: ModelThinkingLevel;
  compat?: PiAiCompatProfile;
}

export interface CustomProviderProfile {
  displayName?: string;
  apiKeyEnv?: string;
  api?: SupportedApi;
  baseURL: string;
  headers?: Record<string, string>;
  compat?: PiAiCompatProfile;
  streamIdleTimeoutMs?: number;
  cacheRetention?: "none" | "short" | "long";
  retryPolicy?: RetryPolicyConfig;
  models: CustomModelProfile[];
}

export interface Config {
  providers?: Record<string, CustomProviderProfile>;
}

const THINKING_FORMATS = [
  "openai",
  "deepseek",
  "openrouter",
  "together",
  "zai",
  "qwen",
  "string-thinking",
  "ant-ling",
] as const satisfies readonly PiAiThinkingFormat[];

const compatSchema = z.object({
  thinkingFormat: z.union(THINKING_FORMATS),
  supportsReasoningEffort: z.boolean(),
});
const reasoningEffortsSchema = z.dict(
  z.union([z.string(), z.const(null)]),
  z.union(THINKING_LEVELS),
);
const modelSchema = z.object({
  id: z.string().required(),
  name: z.string(),
  contextWindow: z.number().step(1).min(1),
  maxTokens: z.number().step(1).min(1),
  input: z.array(z.union(["text", "image"] as const)),
  reasoningEfforts: z.union([z.const(false), reasoningEffortsSchema]),
  defaultReasoningEffort: z.union(THINKING_LEVELS),
  compat: compatSchema,
});
const providerSchema = z.object({
  displayName: z.string(),
  apiKeyEnv: z.string().role("credential-ref"),
  api: z.union(SUPPORTED_APIS),
  baseURL: z.string(),
  headers: z.dict(z.string()),
  compat: compatSchema,
  streamIdleTimeoutMs: z.number().step(1).min(1),
  cacheRetention: z.union(["none", "short", "long"] as const),
  retryPolicy: RetryPolicySchema,
  models: z.array(modelSchema),
});

/** Runtime schema used by Cordis and the DSH settings surface. */
export const Config = z.object({
  providers: z.dict(providerSchema).default({}),
}) as unknown as z<Config>;

export interface NormalizedConfig {
  profiles: ReadonlyMap<string, ResolvedPiAiProviderProfile>;
  defaults: ModelDefaults;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function positiveInteger(value: unknown, fallback: number, path: string): number {
  const resolved = value === undefined ? fallback : value;
  if (typeof resolved !== "number" || !Number.isInteger(resolved) || resolved <= 0) {
    throw new Error("dsh-custom-models: " + path + " must be a positive integer");
  }
  return resolved;
}

function readDefault(provider: string, model: string, value: unknown): ModelThinkingLevel | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !THINKING_LEVEL_SET.has(value)) {
    throw new Error(
      "dsh-custom-models: provider route '" + provider + "' model '" + model +
      "' has invalid defaultReasoningEffort " + JSON.stringify(value) +
      "; expected one of " + THINKING_LEVELS.join(", "),
    );
  }
  return value as ModelThinkingLevel;
}

function resolveReasoning(
  provider: string,
  model: string,
  efforts: false | ReasoningEfforts | undefined,
): Pick<Model<Api>, "reasoning" | "thinkingLevelMap"> {
  if (efforts === undefined || efforts === false) return { reasoning: false };
  if (!isRecord(efforts) || Object.keys(efforts).length === 0) {
    throw new Error(
      "dsh-custom-models: provider route '" + provider + "' model '" + model +
      "' reasoningEfforts must be false or a non-empty object",
    );
  }

  for (const level of Object.keys(efforts)) {
    if (!THINKING_LEVEL_SET.has(level)) {
      throw new Error(
        "dsh-custom-models: unknown reasoning effort '" + level +
        "' for '" + provider + "/" + model + "'",
      );
    }
  }

  const map: ThinkingLevelMap = {};
  let hasThinkingLevel = false;
  for (const level of THINKING_LEVELS) {
    const wire = efforts[level];
    if (wire === undefined) {
      map[level] = null;
      continue;
    }
    if (wire === null) {
      if (level !== "off") {
        throw new Error(
          "dsh-custom-models: reasoningEfforts." + level +
          " for '" + provider + "/" + model + "' requires a wire value",
        );
      }
      delete map.off;
      continue;
    }
    if (typeof wire !== "string" || wire.length === 0) {
      throw new Error(
        "dsh-custom-models: reasoningEfforts." + level +
        " for '" + provider + "/" + model + "' must be a non-empty string",
      );
    }
    map[level] = wire;
    if (level !== "off") hasThinkingLevel = true;
  }
  if (!hasThinkingLevel) {
    throw new Error(
      "dsh-custom-models: provider route '" + provider + "' model '" + model +
      "' must declare at least one reasoning level beyond off",
    );
  }
  return { reasoning: true, thinkingLevelMap: map };
}

function streamsFor(api: SupportedApi): ProviderStreams {
  if (api === "openai-completions") {
    return lazyApi(() => import("@earendil-works/pi-ai/api/openai-completions"));
  }
  return lazyApi(() => import("@earendil-works/pi-ai/api/openai-responses"));
}

function zeroCost(): Model<Api>["cost"] {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
}

function declaredCompat(compat: PiAiCompatProfile | undefined): PiAiCompatProfile | undefined {
  if (compat === undefined) return undefined;
  return compat.thinkingFormat === undefined && compat.supportsReasoningEffort === undefined
    ? undefined
    : compat;
}

/** Validate configuration and construct public pi-ai providers without private DSH imports. */
export function normalizeConfig(config: Config = {}): NormalizedConfig {
  if (!isRecord(config)) throw new Error("dsh-custom-models: config must be an object");
  const rawProviders = config.providers;
  if (rawProviders === undefined) return { profiles: new Map(), defaults: new Map() };
  if (!isRecord(rawProviders)) {
    throw new Error("dsh-custom-models: config.providers must be an object");
  }

  const profiles = new Map<string, ResolvedPiAiProviderProfile>();
  const defaults = new Map<string, ReadonlyMap<string, ModelThinkingLevel>>();

  for (const [provider, raw] of Object.entries(rawProviders)) {
    if (!isRecord(raw)) {
      throw new Error("dsh-custom-models: provider route '" + provider + "' must be an object");
    }
    const profile = raw as unknown as CustomProviderProfile;
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
    if (!(SUPPORTED_APIS as readonly string[]).includes(api)) {
      throw new Error(
        "dsh-custom-models: provider route '" + provider + "' api must be " +
        SUPPORTED_APIS.join(" or "),
      );
    }

    const displayName = profile.displayName ?? provider;
    const providerCompat = declaredCompat(profile.compat);
    const routeDefaults = new Map<string, ModelThinkingLevel>();
    const configuredMaxTokens = new Map<string, number>();
    const seen = new Set<string>();
    const models: Model<Api>[] = profile.models.map((entry, index) => {
      if (!isRecord(entry) || typeof entry.id !== "string" || entry.id.length === 0) {
        throw new Error(
          "dsh-custom-models: provider route '" + provider + "' models[" + index + "] needs id",
        );
      }
      if (seen.has(entry.id)) {
        throw new Error(
          "dsh-custom-models: provider route '" + provider + "' has duplicate model '" +
          entry.id + "'",
        );
      }
      seen.add(entry.id);

      const contextWindow = positiveInteger(
        entry.contextWindow,
        262_144,
        "providers." + provider + ".models." + entry.id + ".contextWindow",
      );
      const maxTokens = positiveInteger(
        entry.maxTokens,
        32_768,
        "providers." + provider + ".models." + entry.id + ".maxTokens",
      );
      if (entry.maxTokens !== undefined) configuredMaxTokens.set(entry.id, maxTokens);

      const input = entry.input !== undefined && entry.input.length > 0
        ? entry.input
        : undefined;
      if (
        input !== undefined &&
        input.some((modality) => modality !== "text" && modality !== "image")
      ) {
        throw new Error(
          "dsh-custom-models: model '" + provider + "/" + entry.id +
          "' input must contain text and/or image",
        );
      }

      const reasoning = resolveReasoning(provider, entry.id, entry.reasoningEfforts);
      const defaultEffort = readDefault(provider, entry.id, entry.defaultReasoningEffort);
      if (defaultEffort !== undefined) {
        if (
          entry.reasoningEfforts === undefined ||
          entry.reasoningEfforts === false ||
          entry.reasoningEfforts[defaultEffort] === undefined
        ) {
          const configuredEfforts = entry.reasoningEfforts === false
            ? undefined
            : entry.reasoningEfforts;
          const supported = configuredEfforts === undefined
            ? "none"
            : THINKING_LEVELS.filter((level) => configuredEfforts[level] !== undefined).join(", ");
          throw new Error(
            "dsh-custom-models: provider route '" + provider + "' model '" + entry.id +
            "' sets defaultReasoningEffort '" + defaultEffort +
            "', but its supported efforts are: " + supported,
          );
        }
        routeDefaults.set(entry.id, defaultEffort);
      }
      const modelCompat = declaredCompat(entry.compat);
      if (modelCompat !== undefined && api !== "openai-completions") {
        throw new Error(
          "dsh-custom-models: model '" + provider + "/" + entry.id +
          "' compat is only valid for openai-completions",
        );
      }

      return {
        id: entry.id,
        name: entry.name ?? entry.id,
        api,
        provider,
        baseUrl: profile.baseURL,
        input: input ?? ["text"],
        cost: zeroCost(),
        contextWindow,
        maxTokens,
        ...reasoning,
        ...api === "openai-completions"
          ? { compat: { ...providerCompat, ...modelCompat } }
          : {},
      } as Model<Api>;
    });

    const piProvider = createProvider({
      id: provider,
      name: displayName,
      baseUrl: profile.baseURL,
      ...(profile.headers === undefined ? {} : { headers: profile.headers }),
      auth: {
        apiKey: envApiKeyAuth(
          displayName,
          apiKeyEnv === undefined ? [] : [apiKeyEnv],
        ),
      },
      models,
      api: streamsFor(api),
    });

    const streamIdleTimeoutMs = positiveInteger(
      profile.streamIdleTimeoutMs,
      300_000,
      "providers." + provider + ".streamIdleTimeoutMs",
    );
    profiles.set(provider, {
      provider,
      displayName,
      api,
      baseURL: profile.baseURL,
      streamIdleTimeoutMs,
      ...(profile.cacheRetention === undefined ? {} : { cacheRetention: profile.cacheRetention }),
      retryPolicy: resolveRetryPolicy(profile.retryPolicy, "providers." + provider + ".retryPolicy"),
      piProvider,
      configuredMaxTokens,
      ...(apiKeyEnv === undefined ? {} : { apiKeyEnv }),
      ...(profile.headers === undefined ? {} : { headers: profile.headers }),
      ...(providerCompat === undefined ? {} : { compat: providerCompat }),
    });
    if (routeDefaults.size > 0) defaults.set(provider, routeDefaults);
  }

  return { profiles, defaults };
}

/** Official pi-ai transport with exact-model defaults layered into metadata. */
export class PerModelReasoningPiAiAdapter extends PiAiAdapter {
  readonly #defaults: () => ModelDefaults;

  constructor(options: PiAiAdapterOptions, defaults: ModelDefaults | (() => ModelDefaults)) {
    super(options);
    this.#defaults = typeof defaults === "function" ? defaults : () => defaults;
  }

  override async resolveModel(
    provider: string,
    model: string,
    signal?: AbortSignal,
  ): Promise<LlmResolvedModelInfo> {
    const resolved = await super.resolveModel(provider, model, signal);
    const configured = this.#defaults().get(provider)?.get(model);
    if (configured === undefined) return resolved;
    const reasoning = resolved.reasoning;
    if (reasoning === undefined || !reasoning.efforts.some((effort) => effort.id === configured)) {
      const supported = reasoning?.efforts.map((effort) => effort.id).join(", ") || "none";
      throw new LlmError(
        "dsh-custom-models: provider route '" + provider + "' model '" + model +
        "' sets defaultReasoningEffort '" + configured +
        "', but its supported efforts are: " + supported,
        "UNSUPPORTED_REASONING_EFFORT",
      );
    }
    return {
      ...resolved,
      reasoning: { ...reasoning, defaultEffort: configured as ReasoningEffortId },
    };
  }
}

export { discoverModels, listingUrl, readListing } from "./discovery.js";

export const name = "custom-models";
export const inject = ["llm", "settings"];

const SETTINGS_NS = settingsNamespace(name);
const SETTINGS_EXPOSURE_ROUTE = "custom-models";

export function apply(ctx: Context, config: Config = {}): void {
  let source = () => config;
  let normalized = normalizeConfig(config);

  const resolveApiKey: PiAiAdapterOptions["resolveApiKey"] = async (provider, profile) => {
    const ref = profile.apiKeyEnv;
    if (ref === undefined) return undefined;
    const credentials = ctx.get("credentials");
    const value = credentials !== undefined
      ? (await credentials.resolve(ref))?.value
      : launchEnvironmentOf(ctx).get(ref)?.value;
    if (value !== undefined && value.length > 0) {
      return assertUsableApiKey(value, "dsh-custom-models", String(ref));
    }
    throw new LlmError(
      "dsh-custom-models: no credential for provider route '" + provider +
      "'; " + String(ref) + " is not configured",
      "MISSING_CREDENTIAL",
    );
  };

  const adapter = new PerModelReasoningPiAiAdapter(
    {
      profiles: () => normalized.profiles,
      resolveApiKey,
      resolveAttachments: () => ctx.get("attachments"),
    },
    () => normalized.defaults,
  );

  let registration: ReturnType<typeof ctx.llm.registerAdapter> | undefined;
  const reconcile = () => {
    const next = normalizeConfig(source());
    const previous = normalized;
    normalized = next;
    try {
      const routes = [...next.profiles.keys()];
      if (registration === undefined) {
        if (routes.length > 0) registration = ctx.llm.registerAdapter(routes, adapter);
      } else {
        registration.replace(routes);
      }
      if (routes.length === 0) {
        ctx.logger.info("dsh-custom-models: no providers configured; extension is dormant");
      }
    } catch (error) {
      // Route preparation failures happen before mutation and must restore the
      // previous adapter snapshot. DSH invariant listeners are the only errors
      // allowed to escape after commitRoutes has swapped the registry, so in
      // that case the new snapshot must stay aligned with the committed routes.
      if (!isRecord(error) || error.code !== "INVARIANT") normalized = previous;
      throw error;
    }
  };

  reconcile();
  // HostApiProxy intentionally exposes only settings namespaces referenced by
  // the configurable-provider directory (plus a small built-in allowlist).
  // This stable bootstrap row grants the independent Custom models page access
  // even before it contains its first provider. It does not register an LLM
  // adapter route; if configured through the built-in Models page, it simply
  // becomes a normal provider profile with the same route.
  ctx.llm.registerConfigurableProviders([{
    provider: SETTINGS_EXPOSURE_ROUTE,
    displayName: "Custom models",
    settingsNs: SETTINGS_NS,
    settingsPath: ["providers", SETTINGS_EXPOSURE_ROUTE],
    declared: true,
  }]);
  const storedApiKey = async (provider?: string) => {
    if (provider === undefined) return undefined;
    const profile = normalized.profiles.get(provider);
    if (profile?.apiKeyEnv === undefined) return undefined;
    const credentials = ctx.get("credentials");
    const value = credentials !== undefined
      ? (await credentials.resolve(profile.apiKeyEnv))?.value
      : launchEnvironmentOf(ctx).get(profile.apiKeyEnv)?.value;
    if (value === undefined || value.length === 0) return undefined;
    return assertUsableApiKey(value, "dsh-custom-models", String(profile.apiKeyEnv));
  };
  ctx.llm.registerModelDiscovery(SETTINGS_NS, (request) => {
    const profile = request.provider === undefined
      ? undefined
      : normalized.profiles.get(request.provider);
    return discoverModels(
      request,
      () => storedApiKey(request.provider),
      profile?.headers,
    );
  });
  const scope = ctx.settings.register(SETTINGS_NS, Config, {
    base: config,
    validate: (value) => {
      normalizeConfig(value);
    },
  });
  source = () => scope.get();
  const reconcileSettings = () => {
    try {
      reconcile();
    } catch (error) {
      ctx.logger.error(
        "dsh-custom-models: keeping the previous provider registration after a refused settings update",
      );
      ctx.logger.error(error);
    }
  };
  reconcileSettings();
  scope.watch(reconcileSettings);
}
