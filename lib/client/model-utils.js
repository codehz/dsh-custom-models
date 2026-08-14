import { capacityText, numericCapacity } from "./capacity.js";
import { normalizeEffortMap } from "./reasoning.js";
import { EFFORTS, THINKING_FORMATS, emptyCompat, } from "./types.js";
function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
}
function text(value) {
    return typeof value === "string" ? value : "";
}
function numericText(value) {
    return typeof value === "number" ? String(value) : "";
}
function numeric(value) {
    return value === "" ? undefined : Number(value);
}
function compatFromValue(value) {
    const source = record(value);
    const thinking = text(source.thinkingFormat);
    return {
        thinkingFormat: THINKING_FORMATS.includes(thinking)
            ? thinking
            : "",
        supportsReasoningEffort: typeof source.supportsReasoningEffort === "boolean"
            ? String(source.supportsReasoningEffort)
            : "",
    };
}
function compatToValue(value) {
    const result = {};
    if (value.thinkingFormat !== "")
        result.thinkingFormat = value.thinkingFormat;
    if (value.supportsReasoningEffort !== "") {
        result.supportsReasoningEffort = value.supportsReasoningEffort === "true";
    }
    return Object.keys(result).length === 0 ? undefined : result;
}
export function providersOf(layer) {
    return record(record(layer).providers);
}
function reasoningFromValue(value) {
    if (value === false || value === undefined)
        return false;
    const source = record(value);
    const result = {};
    for (const effort of EFFORTS) {
        const wire = source[effort];
        if (wire === null || typeof wire === "string")
            result[effort] = wire;
    }
    return Object.keys(result).length === 0 ? false : result;
}
function modelFromValue(value) {
    const source = record(value);
    const input = Array.isArray(source.input) ? source.input : [];
    const defaultEffort = text(source.defaultReasoningEffort);
    return {
        id: text(source.id),
        name: text(source.name),
        contextWindow: capacityText(source.contextWindow),
        maxTokens: capacityText(source.maxTokens),
        input: {
            text: input.length === 0 || input.includes("text"),
            image: input.includes("image"),
        },
        reasoningEfforts: reasoningFromValue(source.reasoningEfforts),
        defaultReasoningEffort: EFFORTS.includes(defaultEffort)
            ? defaultEffort
            : "",
        compat: compatFromValue(source.compat),
    };
}
export function providerFromValue(route, value) {
    const source = record(value);
    const retry = record(source.retryPolicy);
    const backoff = record(retry.backoff);
    const rawModels = Array.isArray(source.models) ? source.models : [];
    const retryMode = retry.mode === "normal" || retry.mode === "always" ? retry.mode : "";
    return {
        route,
        displayName: text(source.displayName),
        apiKeyEnv: text(source.apiKeyEnv),
        api: source.api === "openai-responses" ? "openai-responses" : "openai-completions",
        baseURL: text(source.baseURL),
        headers: Object.entries(record(source.headers)).map(([key, header]) => ({
            key,
            value: text(header),
        })),
        compat: compatFromValue(source.compat),
        streamIdleTimeoutMs: numericText(source.streamIdleTimeoutMs),
        retryPolicy: {
            mode: retryMode,
            maxRetries: numericText(retry.maxRetries),
            retryableCodes: Array.isArray(retry.retryableCodes)
                ? retry.retryableCodes.map(String).join(", ")
                : "",
            initialDelayMs: numericText(backoff.initialDelayMs),
            maxDelayMs: numericText(backoff.maxDelayMs),
            jitterRatio: numericText(backoff.jitterRatio),
        },
        models: rawModels.map(modelFromValue),
    };
}
function modelToValue(model) {
    const contextWindow = numericCapacity(model.contextWindow);
    const maxTokens = numericCapacity(model.maxTokens);
    const compat = compatToValue(model.compat);
    return {
        id: model.id.trim(),
        ...(model.name.trim() === "" ? {} : { name: model.name.trim() }),
        ...(contextWindow === undefined ? {} : { contextWindow }),
        ...(maxTokens === undefined ? {} : { maxTokens }),
        input: [
            ...(model.input.text ? ["text"] : []),
            ...(model.input.image ? ["image"] : []),
        ],
        reasoningEfforts: model.reasoningEfforts === false
            ? false
            : normalizeEffortMap(model.reasoningEfforts),
        ...(model.defaultReasoningEffort === ""
            ? {}
            : { defaultReasoningEffort: model.defaultReasoningEffort }),
        ...(compat === undefined ? {} : { compat }),
    };
}
export function providerToValue(draft) {
    const idle = numeric(draft.streamIdleTimeoutMs);
    const retries = numeric(draft.retryPolicy.maxRetries);
    const initialDelayMs = numeric(draft.retryPolicy.initialDelayMs);
    const maxDelayMs = numeric(draft.retryPolicy.maxDelayMs);
    const jitterRatio = draft.retryPolicy.jitterRatio === ""
        ? undefined
        : Number(draft.retryPolicy.jitterRatio);
    const backoff = {
        ...(initialDelayMs === undefined ? {} : { initialDelayMs }),
        ...(maxDelayMs === undefined ? {} : { maxDelayMs }),
        ...(jitterRatio === undefined ? {} : { jitterRatio }),
    };
    const retryPolicy = draft.retryPolicy.mode === ""
        ? undefined
        : {
            mode: draft.retryPolicy.mode,
            ...(draft.retryPolicy.mode === "normal" && retries !== undefined ? { maxRetries: retries } : {}),
            ...(draft.retryPolicy.mode === "normal" && draft.retryPolicy.retryableCodes.trim() !== ""
                ? {
                    retryableCodes: draft.retryPolicy.retryableCodes
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean),
                }
                : {}),
            ...(Object.keys(backoff).length === 0 ? {} : { backoff }),
        };
    const compat = compatToValue(draft.compat);
    return {
        ...(draft.displayName.trim() === "" ? {} : { displayName: draft.displayName.trim() }),
        apiKeyEnv: draft.apiKeyEnv,
        api: draft.api,
        baseURL: draft.baseURL.trim(),
        headers: Object.fromEntries(draft.headers
            .filter(({ key }) => key.trim() !== "")
            .map(({ key, value }) => [key.trim(), value])),
        ...(compat === undefined ? {} : { compat }),
        ...(idle === undefined ? {} : { streamIdleTimeoutMs: idle }),
        ...(retryPolicy === undefined ? {} : { retryPolicy }),
        models: draft.models.map(modelToValue),
    };
}
//# sourceMappingURL=model-utils.js.map