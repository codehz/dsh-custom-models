/**
 * Generic pi-ai-backed implementation of the Harness LLM seam.
 *
 * Each resolution produces one immutable snapshot — the profiles plus a Models
 * collection holding the Provider each route built — and an operation captures
 * a whole snapshot before its first await. A configuration change builds a new
 * collection rather than mutating the one in use.
 *
 * Credentials stay outside that collection. The harness resolves a route's key
 * through its own seam and passes it as the request's apiKey option.
 */
import { idleWatchdog, timeoutOf } from "@deepseek-ai/dsh-timeout";
import {
  LlmAdapter,
  LlmError,
  contentHasImage,
  type GenerateOptions,
  type LlmModelInfo,
  type LlmProviderInfo,
  type LlmResolvedModelInfo,
  type ResolvedRetryPolicy,
  type StreamChunk,
} from "@deepseek-ai/dsh-llm";
import { createModels, type Model, type Models } from "@earendil-works/pi-ai";
import { toPiContext } from "./context.js";
import type { PiAiAdapterOptions, ResolvedPiAiProviderProfile } from "./profile.js";
import {
  applyPromptCacheKey,
  describableReasoningLevel,
  profileOptions,
  reasoningInfo,
  requestHeaders,
  resolveReasoningLevel,
} from "./request.js";
import { toStreamChunks } from "./stream.js";

interface Snapshot {
  profiles: ReadonlyMap<string, ResolvedPiAiProviderProfile>;
  models: Models;
}

/**
 * pi-ai-backed multi-provider adapter. Each operation reads the current
 * profiles, so a configuration change reaches the next request without a
 * restart; model descriptors come from the collection those profiles built.
 */
export class PiAiAdapter extends LlmAdapter {
  readonly #config: PiAiAdapterOptions;
  #snapshot: Snapshot | undefined;

  constructor(config: PiAiAdapterOptions) {
    super();
    this.#config = config;
  }

  /**
   * The snapshot for the current profiles. Resolution memoizes its result, so
   * an unchanged configuration is recognized by identity; a changed one gets a
   * brand-new collection, leaving any snapshot an operation already captured
   * untouched for as long as that operation holds it.
   */
  #current(): Snapshot {
    const profiles = this.#config.profiles();
    if (this.#snapshot?.profiles === profiles) return this.#snapshot;
    const models = createModels();
    for (const profile of profiles.values()) models.setProvider(profile.piProvider);
    this.#snapshot = { profiles, models };
    return this.#snapshot;
  }

  /** The profile for one route within one snapshot, or the not-owned failure. */
  #profileOf(snapshot: Snapshot, provider: string): ResolvedPiAiProviderProfile {
    const profile = snapshot.profiles.get(provider);
    if (profile === undefined) {
      throw new LlmError("pi-ai adapter does not own provider \"" + provider + "\"", "NO_ADAPTER");
    }
    return profile;
  }

  /** The configured descriptor for one exact route/model pair within one snapshot. */
  #modelOf(snapshot: Snapshot, provider: string, model: string): Model<string> {
    this.#profileOf(snapshot, provider);
    const resolved = snapshot.models.getModel(provider, model);
    if (resolved === undefined) {
      throw new LlmError(
        "pi-ai provider \"" + provider + "\" has no configured model \"" + model + "\"",
        "UNKNOWN_MODEL",
      );
    }
    return resolved;
  }

  override providerInfo(provider: string): LlmProviderInfo {
    return {
      id: provider,
      name: this.#current().profiles.get(provider)?.displayName ?? provider,
    };
  }

  override providerRetryPolicy(provider: string): ResolvedRetryPolicy | undefined {
    return this.#current().profiles.get(provider)?.retryPolicy;
  }

  override async listModels(provider: string): Promise<readonly LlmModelInfo[]> {
    const snapshot = this.#current();
    this.#profileOf(snapshot, provider);
    return snapshot.models.getModels(provider).map((model) => ({
      provider,
      id: model.id,
      name: model.name,
      inputModalities: [...model.input],
    }));
  }

  override async resolveModel(
    provider: string,
    model: string,
    _signal?: AbortSignal,
  ): Promise<LlmResolvedModelInfo> {
    const snapshot = this.#current();
    const profile = this.#profileOf(snapshot, provider);
    const resolvedModel = this.#modelOf(snapshot, provider, model);
    const defaultLevel = describableReasoningLevel(resolvedModel, profile.reasoning);
    const configuredMaxTokens = profile.configuredMaxTokens.get(model);
    return {
      provider,
      id: model,
      name: resolvedModel.name,
      inputModalities: [...resolvedModel.input],
      context: { contextWindow: resolvedModel.contextWindow },
      ...(configuredMaxTokens === undefined ? {} : { defaultMaxTokens: configuredMaxTokens }),
      ...reasoningInfo(resolvedModel, defaultLevel),
    };
  }

  override async *stream(options: GenerateOptions): AsyncGenerator<StreamChunk> {
    if (options.stop !== undefined) {
      throw new LlmError("llm-pi-ai does not support GenerateOptions.stop", "UNSUPPORTED_OPTION");
    }
    const snapshot = this.#current();
    const profile = this.#profileOf(snapshot, options.provider);
    const model = this.#modelOf(snapshot, options.provider, options.model);
    const reasoning = resolveReasoningLevel(model, options.reasoningEffort ?? profile.reasoning);
    const apiKey = await this.#config.resolveApiKey(options.provider, profile);
    const consumer = new AbortController();
    const upstream = options.signal === undefined ? consumer.signal : AbortSignal.any([options.signal, consumer.signal]);
    const streamIdleTimeoutMs = profile.streamIdleTimeoutMs;
    const watchdog = idleWatchdog(upstream, streamIdleTimeoutMs, "LLM_STREAM_IDLE_TIMEOUT");
    try {
      try {
        const containsImage = options.messages.some((message) => contentHasImage(message.content));
        if (containsImage && !model.input.includes("image")) {
          throw new LlmError("pi-ai model \"" + model.id + "\" does not support image input", "UNSUPPORTED_CONTENT");
        }
        const attachments = containsImage ? this.#config.resolveAttachments?.() : undefined;
        if (containsImage && attachments === undefined) {
          throw new LlmError("pi-ai image input requires the durable attachment service", "UNSUPPORTED_CONTENT");
        }
        const onReplayDegrade = (reason: string) => {
          this.#config.onReplayDegrade?.({
            provider: options.provider,
            model: options.model,
            reason,
          });
        };
        const context = attachments === undefined
          ? toPiContext(options, undefined, onReplayDegrade)
          : await toPiContext(options, attachments, onReplayDegrade);
        const iterator = toStreamChunks(
          snapshot.models.streamSimple(model, context, {
            ...profileOptions(profile, reasoning, apiKey),
            ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
            ...(options.maxTokens === undefined ? {} : { maxTokens: options.maxTokens }),
            ...(options.sessionId === undefined ? {} : { sessionId: String(options.sessionId) }),
            onPayload: (payload) => applyPromptCacheKey(
              payload,
              model.api,
              options.sessionId,
              profile.cacheRetention,
            ),
            signal: watchdog.signal,
            headers: requestHeaders(profile.headers),
          }),
          model.contextWindow,
        )[Symbol.asyncIterator]();
        let exhausted = false;
        try {
          for (;;) {
            const result = await watchdog.next(iterator);
            const timeout = timeoutOf(watchdog.signal, "LLM_STREAM_IDLE_TIMEOUT");
            if (timeout !== undefined) throw timeout;
            if (result.done) {
              exhausted = true;
              return;
            }
            yield result.value;
          }
        } finally {
          if (!exhausted) {
            consumer.abort("pi-ai stream consumer stopped");
            try {
              await iterator.return?.(undefined);
            } catch {
              // The SDK teardown after abort is best-effort.
            }
          }
        }
      } catch (error) {
        if (timeoutOf(watchdog.signal, "LLM_STREAM_IDLE_TIMEOUT") !== undefined) {
          throw new LlmError(
            "pi-ai stream idle timeout after " + streamIdleTimeoutMs + "ms",
            "TIMEOUT",
            { cause: error },
          );
        }
        if (options.signal?.aborted) {
          throw new LlmError("pi-ai request aborted by caller", "ABORTED", { cause: error });
        }
        throw error;
      } finally {
        consumer.abort("pi-ai stream consumer stopped");
      }
    } finally {
      watchdog[Symbol.dispose]();
    }
  }
}
