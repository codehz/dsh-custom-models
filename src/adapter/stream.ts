/**
 * @codehz/ai event translation into the Harness streaming protocol.
 */
import {
  CallId,
  CONTEXT_WINDOW_EXCEEDED_CODE,
  EMPTY_RESPONSE_CODE,
  LlmError,
  QUOTA_EXCEEDED_CODE,
  isContextWindowExceededError,
  isQuotaExceededError,
  type ContentBlock,
  type FinishReason,
  type StreamChunk,
  type TokenUsage,
} from "@deepseek-ai/dsh-llm";
import {
  AIError,
  AIProviderError,
  type AIStreamEvent,
  type ReplayItem,
  type StopReason,
  type Usage as AiUsage,
} from "@codehz/ai";
import type { SupportedApi } from "./profile.js";
import { toReplayState } from "./replay.js";

export function mapUsage(usage: AiUsage | undefined): TokenUsage | undefined {
  if (usage === undefined) return undefined;
  const input = usage.inputTokens ?? 0;
  const output = usage.outputTokens ?? 0;
  const cacheRead = usage.cachedInputTokens ?? 0;
  const uncachedInput = Math.max(0, input - cacheRead);
  return {
    inputTokens: uncachedInput,
    outputTokens: output,
    ...(cacheRead > 0 ? { cacheReadTokens: cacheRead } : {}),
    ...(usage.cacheWriteInputTokens !== undefined && usage.cacheWriteInputTokens > 0
      ? { cacheWriteTokens: usage.cacheWriteInputTokens }
      : {}),
    ...(usage.reasoningTokens !== undefined && usage.reasoningTokens > 0
      ? { reasoningTokens: usage.reasoningTokens }
      : {}),
  };
}

function classifyError(message: string, code?: string, status?: number): string {
  if (code === "AUTH_ERROR" || status === 401 || status === 403) return "AUTH";
  if (isQuotaExceededError(message) || /\bquota\b/i.test(code ?? "")) return QUOTA_EXCEEDED_CODE;
  if (status === 429 || /rate.?limit/i.test(message) || code === "RATE_LIMIT") return "RATE_LIMIT";
  if (status === 400 || /invalid.?request/i.test(message)) return "INVALID_REQUEST";
  if (status !== undefined && status >= 500) return "SERVER";
  if (/\btime(?:d)?\s*out\b|timeout/i.test(message) || code === "TIMEOUT" || code === "LOOKUP_TIMEOUT") {
    return "TIMEOUT";
  }
  if (
    /stream ended (?:before|without)\b/i.test(message)
    || code === "STREAM_ERROR"
    || code === "STREAM_PROTOCOL_ERROR"
    || code === "STREAM_INCOMPLETE"
  ) {
    return "TRANSPORT";
  }
  if (
    /\b(?:network|connection|socket|fetch)\b|\bECONN[A-Z]+\b/i.test(message)
    || /\b(?:other side closed|HTTP2 request did not get a response|WebSocket closed unexpectedly)\b/i.test(message)
    || /\bterminated\b|premature close/i.test(message)
  ) {
    return "TRANSPORT";
  }
  return code && code.length > 0 ? code : "PROVIDER_ERROR";
}

function errorText(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) return error.message;
  return String(error);
}

export function mapStopReason(
  stopReason: StopReason | undefined,
  options: {
    model: string;
    empty: boolean;
    usage?: AiUsage;
    contextWindow?: number;
    errorMessage?: string;
  },
): FinishReason {
  const overflowText = options.errorMessage ?? "";
  const total = (options.usage?.inputTokens ?? 0) + (options.usage?.outputTokens ?? 0);
  const overflow =
    isContextWindowExceededError(overflowText)
    || (options.contextWindow !== undefined && total >= options.contextWindow && (options.usage?.outputTokens ?? 0) === 0);
  if (overflow) {
    return {
      kind: "error",
      failure: {
        message: overflowText || ("custom-models detected context overflow for model \"" + options.model + "\""),
        code: CONTEXT_WINDOW_EXCEEDED_CODE,
      },
    };
  }
  switch (stopReason) {
    case "tool_call":
      return { kind: "tool-calls" };
    case "max_output_tokens":
      return { kind: "max-tokens" };
    case "error":
      return {
        kind: "error",
        failure: {
          message: overflowText || "custom-models stream error",
          code: classifyError(overflowText),
        },
      };
    case "content_filter":
      return {
        kind: "error",
        failure: {
          message: overflowText || "custom-models content filter",
          code: "CONTENT_FILTER",
        },
      };
    case "end_turn":
    case "unknown":
    case undefined:
      if (options.empty) {
        return {
          kind: "error",
          failure: {
            message: "model \"" + options.model + "\" returned a completed response with no content",
            code: EMPTY_RESPONSE_CODE,
          },
        };
      }
      return { kind: "stop" };
    default:
      return { kind: "stop" };
  }
}

function textOf(block: { type: string; text?: string } | undefined): string {
  return block?.type === "text" && typeof block.text === "string" ? block.text : "";
}

export function mapThrownError(error: unknown): LlmError {
  if (error instanceof LlmError) return error;
  const message = errorText(error);
  const code = error instanceof AIError ? error.code : undefined;
  const status = error instanceof AIProviderError ? error.statusCode : undefined;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new LlmError("custom-models request aborted by caller", "ABORTED", { cause: error });
  }
  return new LlmError(
    message,
    classifyError(message, code, status),
    { cause: error instanceof Error ? error : undefined },
  );
}

interface OpenBlock {
  index: number;
  kind: "text" | "reasoning" | "tool-call";
  text: string;
  name: string;
  ended: boolean;
}

export async function* toStreamChunks(
  events: AsyncIterable<AIStreamEvent>,
  options: {
    api: SupportedApi;
    provider: string;
    model: string;
    contextWindow?: number;
  },
): AsyncGenerator<StreamChunk> {
  const blocks = new Map<string, OpenBlock>();
  let nextIndex = 0;
  let sawContent = false;
  let lastUsage: AiUsage | undefined;

  const open = (id: string, kind: OpenBlock["kind"], name = ""): OpenBlock => {
    const existing = blocks.get(id);
    if (existing !== undefined) return existing;
    const opened: OpenBlock = { index: nextIndex++, kind, text: "", name, ended: false };
    blocks.set(id, opened);
    return opened;
  };

  const finish = function* (id: string): Generator<StreamChunk> {
    const opened = blocks.get(id);
    if (opened === undefined || opened.ended) return;
    opened.ended = true;
    let block: ContentBlock;
    if (opened.kind === "text") block = { type: "text", text: opened.text };
    else if (opened.kind === "reasoning") block = { type: "reasoning", text: opened.text };
    else {
      block = {
        type: "tool-call",
        id: CallId(id),
        name: opened.name,
        arguments: opened.text.length > 0 ? opened.text : "{}",
      };
    }
    yield { type: "block-end", index: opened.index, block };
  };

  for await (const event of events) {
    switch (event.type) {
      case "response.started":
      case "response.warning":
        break;
      case "response.auxiliary":
        if (event.usage !== undefined) lastUsage = event.usage;
        break;
      case "message.started": {
        const opened = open(event.item.id, "text");
        yield { type: "block-start", index: opened.index, blockType: "text" };
        break;
      }
      case "message.delta": {
        const text = textOf(event.delta);
        if (text.length === 0) break;
        sawContent = true;
        const opened = open(event.itemId, "text");
        opened.text += text;
        yield { type: "text-delta", index: opened.index, text };
        break;
      }
      case "message.completed":
        yield* finish(event.itemId);
        break;
      case "reasoning.started": {
        const opened = open(event.item.id, "reasoning");
        yield { type: "block-start", index: opened.index, blockType: "reasoning" };
        break;
      }
      case "reasoning.delta": {
        const text = textOf(event.delta);
        if (text.length === 0) break;
        sawContent = true;
        const opened = open(event.itemId, "reasoning");
        opened.text += text;
        yield { type: "reasoning-delta", index: opened.index, text };
        break;
      }
      case "reasoning.completed":
        yield* finish(event.itemId);
        break;
      case "tool_call.started": {
        sawContent = true;
        const opened = open(event.item.id, "tool-call", event.item.name);
        opened.name = event.item.name;
        yield { type: "block-start", index: opened.index, blockType: "tool-call" };
        break;
      }
      case "tool_call.delta": {
        const delta = event.delta.argumentsText ?? "";
        const opened = open(event.itemId, "tool-call");
        opened.text += delta;
        yield {
          type: "tool-call-delta",
          index: opened.index,
          id: CallId(event.itemId),
          ...(opened.name.length > 0 ? { name: opened.name } : {}),
          argumentsDelta: delta,
        };
        break;
      }
      case "tool_call.completed":
        yield* finish(event.itemId);
        break;
      case "response.completed": {
        for (const id of blocks.keys()) yield* finish(id);
        const replay = event.replay as ReplayItem[];
        const usage = mapUsage(event.usage ?? lastUsage);
        if (usage !== undefined) yield { type: "usage", usage };
        const empty = !sawContent && !replay.some((item) => (
          item.type === "message" || item.type === "reasoning" || item.type === "tool_call"
        ));
        const usageForFinish = event.usage ?? lastUsage;
        yield {
          type: "finish",
          reason: mapStopReason(event.stopReason, {
            model: options.model,
            empty,
            ...(usageForFinish === undefined ? {} : { usage: usageForFinish }),
            ...(options.contextWindow === undefined ? {} : { contextWindow: options.contextWindow }),
          }),
          replayState: toReplayState({
            api: options.api,
            provider: options.provider,
            model: options.model,
            ...(event.stopReason === undefined ? {} : { stopReason: event.stopReason }),
            replay,
          }),
        };
        return;
      }
      default:
        break;
    }
  }
  throw new LlmError("custom-models event stream ended without response.completed", "STREAM_CLOSED");
}
