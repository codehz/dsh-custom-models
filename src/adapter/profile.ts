import type { AttachmentStore } from "@deepseek-ai/dsh-attachment";
import type { CredentialRef } from "@deepseek-ai/dsh-credentials";
import type { ResolvedRetryPolicy } from "@deepseek-ai/dsh-llm";

export const THINKING_LEVELS = [
  "off", "minimal", "low", "medium", "high", "xhigh", "max",
] as const;

export type ThinkingLevel = (typeof THINKING_LEVELS)[number];
export type ThinkingLevelMap = Partial<Record<ThinkingLevel, string | null>>;
export type SupportedApi = "openai-completions" | "openai-responses";
export type ThinkingFormat =
  | "openai"
  | "deepseek"
  | "openrouter"
  | "together"
  | "zai"
  | "qwen"
  | "string-thinking"
  | "ant-ling";
export type CacheRetention = "none" | "short" | "long";

export interface CompatProfile {
  thinkingFormat?: ThinkingFormat;
  supportsReasoningEffort?: boolean;
}

export interface ResolvedModel {
  id: string;
  name: string;
  input: Array<"text" | "image">;
  contextWindow: number;
  maxTokens: number;
  reasoning: boolean;
  thinkingLevelMap?: ThinkingLevelMap;
  compat?: CompatProfile;
}

/** Validated profile the adapter reads on every operation. */
export interface ResolvedProviderProfile {
  provider: string;
  displayName: string;
  api: SupportedApi;
  baseURL: string;
  compat?: CompatProfile;
  apiKeyEnv?: CredentialRef;
  headers?: Record<string, string>;
  cacheRetention?: CacheRetention;
  streamIdleTimeoutMs: number;
  retryPolicy?: ResolvedRetryPolicy;
  configuredMaxTokens: ReadonlyMap<string, number>;
  models: readonly ResolvedModel[];
  modelsById: ReadonlyMap<string, ResolvedModel>;
}

/** Constructor options for the @codehz/ai adapter. */
export interface CodehzAiAdapterOptions {
  /** Current validated profiles by provider route; called once per operation. */
  profiles: () => ReadonlyMap<string, ResolvedProviderProfile>;
  /** Resolve the credential for one already-resolved profile. */
  resolveApiKey: (provider: string, profile: ResolvedProviderProfile) => Promise<string | undefined>;
  /** Resolve the optional durable attachment service at request time. */
  resolveAttachments?: () => AttachmentStore | undefined;
  /**
   * Observe one assistant history message degrading to provider-neutral
   * conversion because its stored replay state is unusable by this build.
   */
  onReplayDegrade?: (detail: { provider: string; model: string; reason: string }) => void;
}

/** @deprecated Use {@link CodehzAiAdapterOptions}. */
export type PiAiAdapterOptions = CodehzAiAdapterOptions;
/** @deprecated Use {@link ResolvedProviderProfile}. */
export type ResolvedPiAiProviderProfile = ResolvedProviderProfile;
