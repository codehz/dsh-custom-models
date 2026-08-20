import type { PromptCacheSettings } from "@codehz/ai";
import {
  LlmError,
  ReasoningEffortId,
  attributionHeaders,
  type LlmModelReasoningInfo,
} from "@deepseek-ai/dsh-llm";
import type {
  CacheRetention,
  CompatProfile,
  ResolvedModel,
  ResolvedProviderProfile,
  SupportedApi,
  ThinkingFormat,
  ThinkingLevel,
  ThinkingLevelMap,
} from "./profile.js";

const PROMPT_CACHE_APIS = new Set<SupportedApi>(["openai-completions", "openai-responses"]);
const THINKING_LEVEL_ORDER: readonly ThinkingLevel[] = [
  "off", "minimal", "low", "medium", "high", "xhigh", "max",
];

export function supportedThinkingLevels(model: ResolvedModel): ThinkingLevel[] {
  if (!model.reasoning) return [];
  return THINKING_LEVEL_ORDER.filter((level) => {
    const mapped = model.thinkingLevelMap?.[level];
    if (mapped === null) return false;
    if (level === "xhigh" || level === "max") return mapped !== undefined;
    return true;
  });
}

/** Validate an explicit Harness/profile effort without silently clamping. */
export function resolveReasoningLevel(
  model: ResolvedModel,
  effort: string | undefined,
): ThinkingLevel | undefined {
  if (effort === undefined) return undefined;
  if (supportedThinkingLevels(model).some((level) => level === effort)) {
    return effort as ThinkingLevel;
  }
  throw new LlmError(
    "custom-models provider \"" + model.id + "\" does not support reasoning effort \"" + effort + "\"",
    "UNSUPPORTED_REASONING_EFFORT",
  );
}

/**
 * Selectable reasoning efforts for one model, or nothing at all.
 * Omitting reasoning entirely is the seam's way of saying the capability is unavailable.
 */
export function reasoningInfo(
  model: ResolvedModel,
  defaultLevel: ThinkingLevel | undefined,
): { reasoning: LlmModelReasoningInfo } | Record<string, never> {
  if (!model.reasoning) return {};
  return {
    reasoning: {
      efforts: supportedThinkingLevels(model).map((level) => ({
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

/**
 * Map DSH provider cacheRetention + sessionId onto @codehz/ai portable cache.
 * Retention short/long become provider TTL hints; none disables caching.
 */
export function promptCacheSettings(
  api: SupportedApi,
  sessionId: unknown,
  cacheRetention: CacheRetention | undefined,
): PromptCacheSettings | undefined {
  if (!PROMPT_CACHE_APIS.has(api)) return undefined;
  if (cacheRetention === "none") return { mode: "off" };
  if (sessionId === undefined) return undefined;
  return {
    key: String(sessionId),
    ...(cacheRetention === undefined ? {} : { ttl: cacheRetention }),
  };
}

function hostnameOf(baseURL: string): string {
  try {
    return new URL(baseURL).hostname.toLowerCase();
  } catch {
    return baseURL.toLowerCase();
  }
}

function detectThinkingFormat(provider: string, baseURL: string): ThinkingFormat {
  const host = hostnameOf(baseURL);
  const id = provider.toLowerCase();
  if (id.includes("deepseek") || host.includes("deepseek.com")) return "deepseek";
  if (id.includes("zai") || host.includes("z.ai") || host.includes("bigmodel.cn")) return "zai";
  if (id.includes("together") || host.includes("together.ai") || host.includes("together.xyz")) return "together";
  if (id.includes("ant-ling") || host.includes("ant-ling.com")) return "ant-ling";
  if (id.includes("openrouter") || host.includes("openrouter.ai")) return "openrouter";
  if (id.includes("qwen") || host.includes("dashscope")) return "qwen";
  return "openai";
}

function detectSupportsReasoningEffort(format: ThinkingFormat): boolean {
  return format !== "zai" && format !== "together" && format !== "ant-ling" && format !== "qwen";
}

function resolvedCompat(
  profile: ResolvedProviderProfile,
  model: ResolvedModel,
): Required<Pick<CompatProfile, "thinkingFormat" | "supportsReasoningEffort">> {
  const format = model.compat?.thinkingFormat
    ?? profile.compat?.thinkingFormat
    ?? detectThinkingFormat(profile.provider, profile.baseURL);
  return {
    thinkingFormat: format,
    supportsReasoningEffort: model.compat?.supportsReasoningEffort
      ?? profile.compat?.supportsReasoningEffort
      ?? detectSupportsReasoningEffort(format),
  };
}

function mappedWire(map: ThinkingLevelMap | undefined, level: ThinkingLevel): string | undefined {
  const mapped = map?.[level];
  if (mapped === null) return undefined;
  if (typeof mapped === "string" && mapped.length > 0) return mapped;
  // `off: null` is stored as a missing key and means "supported by omitting the field".
  if (level === "off") return undefined;
  return level;
}

/**
 * Map a DSH reasoning effort onto @codehz/ai extraBody fields.
 * @codehz/ai only writes portable reasoning_effort / reasoning.effort;
 * third-party dialects stay in extraBody so they override those keys.
 */
export function reasoningExtraBody(
  profile: ResolvedProviderProfile,
  model: ResolvedModel,
  effort: ThinkingLevel | undefined,
): Record<string, unknown> {
  if (!model.reasoning) return {};
  const enabled = effort !== undefined && effort !== "off";
  const wire = enabled ? mappedWire(model.thinkingLevelMap, effort) : undefined;
  const offWire = mappedWire(model.thinkingLevelMap, "off");
  if (profile.api === "openai-responses") {
    if (enabled && wire !== undefined) return { reasoning: { effort: wire } };
    if (!enabled && model.thinkingLevelMap?.off !== null && offWire !== undefined) {
      return { reasoning: { effort: offWire } };
    }
    return {};
  }

  if (profile.api === "messages") {
    if (!enabled) return { thinking: { type: "disabled" } };
    const budget = wire !== undefined && /^\\d+$/.test(wire) ? Number(wire) : 4096;
    return { thinking: { type: "enabled", budget_tokens: budget } };
  }

  if (profile.api === "ollama") {
    if (!enabled) return { think: false };
    return { think: wire === "low" || wire === "medium" || wire === "high" ? wire : true };
  }

  if (profile.api === "gemini") {
    if (!enabled) return { generationConfig: { thinkingConfig: { includeThoughts: false } } };
    const level = (wire ?? effort ?? "medium").toUpperCase();
    const thinkingLevel = level === "MINIMAL" || level === "LOW" || level === "MEDIUM" || level === "HIGH" ? level : "MEDIUM";
    return { generationConfig: { thinkingConfig: { includeThoughts: true, thinkingLevel } } };
  }

  const compat = resolvedCompat(profile, model);
  switch (compat.thinkingFormat) {
    case "zai":
      return {
        thinking: enabled ? { type: "enabled", clear_thinking: false } : { type: "disabled" },
        ...(enabled && compat.supportsReasoningEffort && wire !== undefined
          ? { reasoning_effort: wire }
          : {}),
      };
    case "qwen":
      return { enable_thinking: enabled };
    case "deepseek":
      return {
        ...(enabled
          ? { thinking: { type: "enabled" } }
          : model.thinkingLevelMap?.off !== null
            ? { thinking: { type: "disabled" } }
            : {}),
        ...(enabled && compat.supportsReasoningEffort && wire !== undefined
          ? { reasoning_effort: wire }
          : {}),
      };
    case "openrouter":
      if (enabled && wire !== undefined) return { reasoning: { effort: wire } };
      if (!enabled && model.thinkingLevelMap?.off !== null && offWire !== undefined) {
        return { reasoning: { effort: offWire } };
      }
      return {};
    case "ant-ling":
      return enabled && wire !== undefined ? { reasoning: { effort: wire } } : {};
    case "together":
      return {
        reasoning: { enabled },
        ...(enabled && compat.supportsReasoningEffort && wire !== undefined
          ? { reasoning_effort: wire }
          : {}),
      };
    case "string-thinking":
      if (enabled && wire !== undefined) return { thinking: wire };
      if (!enabled && model.thinkingLevelMap?.off !== null && offWire !== undefined) {
        return { thinking: offWire };
      }
      return {};
    case "openai":
    default:
      if (enabled && compat.supportsReasoningEffort && wire !== undefined) {
        return { reasoning_effort: wire };
      }
      if (!enabled && compat.supportsReasoningEffort && typeof model.thinkingLevelMap?.off === "string") {
        return { reasoning_effort: model.thinkingLevelMap.off };
      }
      return {};
  }
}

