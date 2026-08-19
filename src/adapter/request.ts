import {
  LlmError,
  ReasoningEffortId,
  attributionHeaders,
  type LlmModelReasoningInfo,
} from "@deepseek-ai/dsh-llm";
import {
  getSupportedThinkingLevels,
  type CacheRetention,
  type Model,
  type ModelThinkingLevel,
  type SimpleStreamOptions,
} from "@earendil-works/pi-ai";
import type { ResolvedPiAiProviderProfile } from "./profile.js";

const PROMPT_CACHE_APIS = new Set(["openai-completions", "openai-responses"]);

/** Copy profile stream knobs into pi-ai's common option vocabulary. */
export function profileOptions(
  profile: ResolvedPiAiProviderProfile,
  reasoning: ModelThinkingLevel | undefined,
  apiKey: string | undefined,
): SimpleStreamOptions {
  const enabledReasoning = reasoning === "off" ? undefined : reasoning;
  return {
    maxRetries: 0,
    ...(apiKey === undefined ? {} : { apiKey }),
    ...(enabledReasoning === undefined ? {} : { reasoning: enabledReasoning }),
    ...(profile.thinkingBudgets === undefined ? {} : { thinkingBudgets: profile.thinkingBudgets }),
    ...(profile.cacheRetention === undefined ? {} : { cacheRetention: profile.cacheRetention }),
    ...(profile.transport === undefined ? {} : { transport: profile.transport }),
    ...(profile.timeoutMs === undefined ? {} : { timeoutMs: profile.timeoutMs }),
    ...(profile.websocketConnectTimeoutMs === undefined
      ? {}
      : { websocketConnectTimeoutMs: profile.websocketConnectTimeoutMs }),
  };
}

/**
 * The profile default this exact model can actually take, for DESCRIBING it.
 * A configured level the model does not support yields none rather than
 * throwing: resolveModel builds the model catalog, and a catalog that fails
 * takes its whole provider out of every picker.
 */
export function describableReasoningLevel(
  model: Model<string>,
  effort: string | undefined,
): ModelThinkingLevel | undefined {
  if (effort === undefined) return undefined;
  return getSupportedThinkingLevels(model).some((level) => level === effort)
    ? effort as ModelThinkingLevel
    : undefined;
}

/** Validate an explicit Harness/profile effort without invoking pi-ai's clamp. */
export function resolveReasoningLevel(
  model: Model<string>,
  effort: string | undefined,
): ModelThinkingLevel | undefined {
  if (effort === undefined) return undefined;
  if (getSupportedThinkingLevels(model).some((level) => level === effort)) {
    return effort as ModelThinkingLevel;
  }
  throw new LlmError(
    "pi-ai provider \"" + model.provider + "\" model \"" + model.id +
      "\" does not support reasoning effort \"" + effort + "\"",
    "UNSUPPORTED_REASONING_EFFORT",
  );
}

/**
 * Selectable reasoning efforts for one model, or nothing at all.
 * A model that carries no reasoning metadata is reported by pi-ai as supporting
 * the single level `off`. Omitting reasoning entirely is the seam's way of
 * saying the capability is unavailable.
 */
export function reasoningInfo(
  model: Model<string>,
  defaultLevel: ModelThinkingLevel | undefined,
): { reasoning: LlmModelReasoningInfo } | Record<string, never> {
  if (!model.reasoning) return {};
  return {
    reasoning: {
      efforts: getSupportedThinkingLevels(model).map((level) => ({
        id: ReasoningEffortId(level),
        name: level.charAt(0).toUpperCase() + level.slice(1),
      })),
      ...(defaultLevel === undefined ? {} : { defaultEffort: ReasoningEffortId(defaultLevel) }),
    },
  };
}

/** Merge deployment headers while removing case-insensitive attribution collisions. */
export function requestHeaders(headers: Record<string, string> | undefined): Record<string, string> {
  const attribution = attributionHeaders();
  const reserved = new Set(Object.keys(attribution).map((name) => name.toLowerCase()));
  return {
    ...Object.fromEntries(Object.entries(headers ?? {}).filter(([name]) => !reserved.has(name.toLowerCase()))),
    ...attribution,
  };
}

/** Write sessionId as prompt_cache_key for OpenAI-compatible APIs when caching is enabled. */
export function applyPromptCacheKey(
  payload: unknown,
  api: string,
  sessionId: unknown,
  cacheRetention: CacheRetention | undefined,
): unknown {
  if (!PROMPT_CACHE_APIS.has(api) || sessionId === undefined || cacheRetention === "none") return;
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) return;
  return { ...payload, prompt_cache_key: String(sessionId) };
}
