import type { AttachmentStore } from "@deepseek-ai/dsh-attachment";
import type { CredentialRef } from "@deepseek-ai/dsh-credentials";
import type { ResolvedRetryPolicy } from "@deepseek-ai/dsh-llm";
import type {
  CacheRetention,
  ModelThinkingLevel,
  Provider,
  ThinkingBudgets,
  Transport,
} from "@earendil-works/pi-ai";

/** Validated profile the adapter reads on every operation. */
export interface ResolvedPiAiProviderProfile {
  provider: string;
  displayName: string;
  api?: string;
  baseURL?: string;
  compat?: Record<string, unknown>;
  apiKeyEnv?: CredentialRef;
  headers?: Record<string, string>;
  reasoning?: ModelThinkingLevel;
  thinkingBudgets?: ThinkingBudgets;
  cacheRetention?: CacheRetention;
  transport?: Transport;
  timeoutMs?: number;
  websocketConnectTimeoutMs?: number;
  streamIdleTimeoutMs: number;
  retryPolicy?: ResolvedRetryPolicy;
  configuredMaxTokens: ReadonlyMap<string, number>;
  piProvider: Provider;
}

/** Constructor options for the pi-ai adapter. */
export interface PiAiAdapterOptions {
  /** Current validated profiles by provider route; called once per operation. */
  profiles: () => ReadonlyMap<string, ResolvedPiAiProviderProfile>;
  /** Resolve the credential for one already-resolved profile. */
  resolveApiKey: (provider: string, profile: ResolvedPiAiProviderProfile) => Promise<string | undefined>;
  /** Resolve the optional durable attachment service at request time. */
  resolveAttachments?: () => AttachmentStore | undefined;
  /**
   * Observe one assistant history message degrading to provider-neutral
   * conversion because its stored replay state is unusable by this build.
   */
  onReplayDegrade?: (detail: { provider: string; model: string; reason: string }) => void;
}
