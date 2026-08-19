/**
 * Generic @codehz/ai-backed implementation of the Harness LLM seam.
 *
 * Each resolution produces one immutable snapshot of validated profiles. A
 * configuration change builds a new snapshot rather than mutating the one in
 * use. Credentials stay outside that snapshot: the harness resolves a route's
 * key through its own seam and this adapter constructs a fresh @codehz/ai
 * client per request.
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
import {
  ChatCompletionsAdapter,
  ResponsesAdapter,
  createAIClient,
} from "@codehz/ai";
import { toAiRequest } from "./context.js";
import type {
  CodehzAiAdapterOptions,
  ResolvedModel,
  ResolvedProviderProfile,
} from "./profile.js";
import {
  promptCacheSettings,
  reasoningExtraBody,
  reasoningInfo,
  requestHeaders,
  resolveReasoningLevel,
} from "./request.js";
import { mapThrownError, toStreamChunks } from "./stream.js";

interface Snapshot {
  profiles: ReadonlyMap<string, ResolvedProviderProfile>;
}

/**
 * @codehz/ai-backed multi-provider adapter. Each operation reads the current
 * profiles, so a configuration change reaches the next request without a restart.
 */
export class CodehzAiAdapter extends LlmAdapter {
  readonly #config: CodehzAiAdapterOptions;
  #snapshot: Snapshot | undefined;

  constructor(config: CodehzAiAdapterOptions) {
    super();
    this.#config = config;
  }

  /**
   * The snapshot for the current profiles. Resolution memoizes its result, so
   * an unchanged configuration is recognized by identity; a changed one gets a
   * brand-new snapshot, leaving any snapshot an operation already captured
   * untouched for as long as that operation holds it.
   */
  #current(): Snapshot {
    const profiles = this.#config.profiles();
    if (this.#snapshot?.profiles === profiles) return this.#snapshot;
    this.#snapshot = { profiles };
    return this.#snapshot;
  }

  /** The profile for one route within one snapshot, or the not-owned failure. */
  #profileOf(snapshot: Snapshot, provider: string): ResolvedProviderProfile {
    const profile = snapshot.profiles.get(provider);
    if (profile === undefined) {
      throw new LlmError("custom-models adapter does not own provider \"" + provider + "\"", "NO_ADAPTER");
    }
    return profile;
  }

  /** The configured descriptor for one exact route/model pair within one snapshot. */
  #modelOf(snapshot: Snapshot, provider: string, model: string): ResolvedModel {
    const profile = this.#profileOf(snapshot, provider);
    const resolved = profile.modelsById.get(model);
    if (resolved === undefined) {
      throw new LlmError(
        "custom-models provider \"" + provider + "\" has no configured model \"" + model + "\"",
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
    const profile = this.#profileOf(snapshot, provider);
    return profile.models.map((model) => ({
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
    const configuredMaxTokens = profile.configuredMaxTokens.get(model);
    return {
      provider,
      id: model,
      name: resolvedModel.name,
      inputModalities: [...resolvedModel.input],
      context: { contextWindow: resolvedModel.contextWindow },
      ...(configuredMaxTokens === undefined ? {} : { defaultMaxTokens: configuredMaxTokens }),
      ...reasoningInfo(resolvedModel, undefined),
    };
  }

  override async *stream(options: GenerateOptions): AsyncGenerator<StreamChunk> {
    if (options.stop !== undefined) {
      throw new LlmError("custom-models does not support GenerateOptions.stop", "UNSUPPORTED_OPTION");
    }
    const snapshot = this.#current();
    const profile = this.#profileOf(snapshot, options.provider);
    const model = this.#modelOf(snapshot, options.provider, options.model);
    const reasoning = resolveReasoningLevel(model, options.reasoningEffort);
    const apiKey = await this.#config.resolveApiKey(options.provider, profile);
    const consumer = new AbortController();
    const upstream = options.signal === undefined ? consumer.signal : AbortSignal.any([options.signal, consumer.signal]);
    const streamIdleTimeoutMs = profile.streamIdleTimeoutMs;
    const watchdog = idleWatchdog(upstream, streamIdleTimeoutMs, "LLM_STREAM_IDLE_TIMEOUT");
    try {
      try {
        const containsImage = options.messages.some((message) => contentHasImage(message.content));
        if (containsImage && !model.input.includes("image")) {
          throw new LlmError("custom-models model \"" + model.id + "\" does not support image input", "UNSUPPORTED_CONTENT");
        }
        const attachments = containsImage ? this.#config.resolveAttachments?.() : undefined;
        if (containsImage && attachments === undefined) {
          throw new LlmError("custom-models image input requires the durable attachment service", "UNSUPPORTED_CONTENT");
        }
        const onReplayDegrade = (reason: string) => {
          this.#config.onReplayDegrade?.({
            provider: options.provider,
            model: options.model,
            reason,
          });
        };
        const converted = await toAiRequest(options, attachments, onReplayDegrade);
        const extraBody = reasoningExtraBody(profile, model, reasoning);
        const cache = promptCacheSettings(profile.api, options.sessionId, profile.cacheRetention);
        const headers = requestHeaders(profile.headers);
        const backendOptions = {
          apiKey: apiKey ?? "",
          baseUrl: profile.baseURL,
          headers,
          ...(Object.keys(extraBody).length === 0 ? {} : { extraBody }),
        };
        const backend = profile.api === "openai-responses"
          ? new ResponsesAdapter(backendOptions)
          : new ChatCompletionsAdapter(backendOptions);
        const client = createAIClient({
          adapter: backend,
          model: options.model,
          signal: watchdog.signal,
        });
        const iterator = toStreamChunks(
          client.stream({
            ...converted,
            ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
            ...(options.maxTokens === undefined ? {} : { maxOutputTokens: options.maxTokens }),
            ...(cache === undefined ? {} : { cache }),
            signal: watchdog.signal,
          }),
          {
            api: profile.api,
            provider: options.provider,
            model: options.model,
            contextWindow: model.contextWindow,
          },
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
            consumer.abort("custom-models stream consumer stopped");
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
            "custom-models stream idle timeout after " + streamIdleTimeoutMs + "ms",
            "TIMEOUT",
            { cause: error },
          );
        }
        if (options.signal?.aborted) {
          throw new LlmError("custom-models request aborted by caller", "ABORTED", { cause: error });
        }
        throw mapThrownError(error);
      } finally {
        consumer.abort("custom-models stream consumer stopped");
      }
    } finally {
      watchdog[Symbol.dispose]();
    }
  }
}

/** @deprecated Use {@link CodehzAiAdapter}. */
export class PiAiAdapter extends CodehzAiAdapter {}
