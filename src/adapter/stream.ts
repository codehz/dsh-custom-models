/**
 * pi-ai assistant event translation into the Harness streaming protocol.
 *
 * pi-ai tool-call arguments are parsed objects while the Harness keeps their
 * raw JSON representation. pi-ai also reports failures as terminal stream
 * events, which this module maps into Harness finish chunks.
 */
import {
  CallId,
  CONTEXT_WINDOW_EXCEEDED_CODE,
  EMPTY_RESPONSE_CODE,
  LlmError,
  QUOTA_EXCEEDED_CODE,
  isContextWindowExceededError,
  isQuotaExceededError,
  type FinishReason,
  type StreamChunk,
  type TokenUsage,
} from "@deepseek-ai/dsh-llm";
import {
  isContextOverflow,
  type AssistantMessage,
  type AssistantMessageEvent,
  type Usage as PiUsage,
} from "@earendil-works/pi-ai";
import { toPiReplayState } from "./replay.js";

/** Map pi-ai usage (reasoning folded into output by pi-ai). */
export function mapUsage(usage: PiUsage): TokenUsage {
  return {
    inputTokens: usage.input,
    outputTokens: usage.output,
    ...(usage.cacheRead > 0 ? { cacheReadTokens: usage.cacheRead } : {}),
    ...(usage.cacheWrite > 0 ? { cacheWriteTokens: usage.cacheWrite } : {}),
  };
}

function classifyPiAiError(message: string): string {
  if (/\b(?:401|403)\b/.test(message)) return "AUTH";
  if (isQuotaExceededError(message)) return QUOTA_EXCEEDED_CODE;
  if (/\b429\b|rate.?limit/i.test(message)) return "RATE_LIMIT";
  if (/\b400\b|invalid.?request/i.test(message)) return "INVALID_REQUEST";
  if (/\b5\d\d\b/.test(message)) return "SERVER";
  if (/\btime(?:d)?\s*out\b|timeout/i.test(message)) return "TIMEOUT";
  if (/stream ended (?:before|without)\b/i.test(message)) return "TRANSPORT";
  if (
    /\b(?:network|connection|socket|fetch)\b|\bECONN[A-Z]+\b/i.test(message) ||
    /\b(?:other side closed|HTTP2 request did not get a response|WebSocket closed unexpectedly)\b/i.test(message) ||
    /\bterminated\b|premature close/i.test(message)
  ) {
    return "TRANSPORT";
  }
  return "PI_AI_ERROR";
}

/**
 * Map a terminal pi-ai event to the harness finish reason.
 * Recognized error text, stop usage above contextWindow, and zero-output
 * length usage that fills the window map to CONTEXT_WINDOW_EXCEEDED; a stop
 * with no content blocks maps to an EMPTY_RESPONSE error.
 */
export function mapStopReason(message: AssistantMessage, contextWindow?: number): FinishReason {
  const piAiOverflow = isContextOverflow(message, contextWindow);
  const harnessOverflow = message.stopReason === "error"
    && message.errorMessage !== undefined
    && isContextWindowExceededError(message.errorMessage);
  if (piAiOverflow || harnessOverflow) {
    return {
      kind: "error",
      failure: {
        message: message.errorMessage ?? ("pi-ai detected context overflow for model \"" + message.model + "\""),
        code: CONTEXT_WINDOW_EXCEEDED_CODE,
      },
    };
  }
  switch (message.stopReason) {
    case "stop":
      if (message.content.length === 0) {
        return {
          kind: "error",
          failure: {
            message: "model \"" + message.model + "\" returned a completed response with no content",
            code: EMPTY_RESPONSE_CODE,
          },
        };
      }
      return { kind: "stop" };
    case "length":
      return { kind: "max-tokens" };
    case "toolUse":
      return { kind: "tool-calls" };
    case "aborted":
      return {
        kind: "aborted",
        failure: {
          message: message.errorMessage ?? "pi-ai stream aborted",
          code: "ABORTED",
        },
      };
    case "error": {
      const text = message.errorMessage ?? "pi-ai stream error";
      return {
        kind: "error",
        failure: {
          message: text,
          code: classifyPiAiError(text),
        },
      };
    }
  }
}

/**
 * Translate the pi-ai event stream into StreamChunks. pi-ai never throws
 * mid-stream — failures arrive as error events, which become error/aborted
 * finish chunks.
 */
export async function* toStreamChunks(
  events: AsyncIterable<AssistantMessageEvent>,
  contextWindow?: number,
): AsyncGenerator<StreamChunk> {
  const toolIds = new Map<number, { id: string; name: string }>();
  for await (const event of events) {
    switch (event.type) {
      case "start":
        break;
      case "text_start":
        yield { type: "block-start", index: event.contentIndex, blockType: "text" };
        break;
      case "text_delta":
        yield { type: "text-delta", index: event.contentIndex, text: event.delta };
        break;
      case "text_end":
        yield { type: "block-end", index: event.contentIndex, block: { type: "text", text: event.content } };
        break;
      case "thinking_start":
        yield { type: "block-start", index: event.contentIndex, blockType: "reasoning" };
        break;
      case "thinking_delta":
        yield { type: "reasoning-delta", index: event.contentIndex, text: event.delta };
        break;
      case "thinking_end":
        yield { type: "block-end", index: event.contentIndex, block: { type: "reasoning", text: event.content } };
        break;
      case "toolcall_start": {
        const partial = event.partial.content[event.contentIndex];
        const id = partial?.type === "toolCall" ? partial.id : "";
        const name = partial?.type === "toolCall" ? partial.name : "";
        toolIds.set(event.contentIndex, { id, name });
        yield { type: "block-start", index: event.contentIndex, blockType: "tool-call" };
        break;
      }
      case "toolcall_delta": {
        const known = toolIds.get(event.contentIndex);
        yield {
          type: "tool-call-delta",
          index: event.contentIndex,
          id: CallId(known?.id ?? ""),
          ...(known?.name !== undefined && known.name.length > 0 ? { name: known.name } : {}),
          argumentsDelta: event.delta,
        };
        break;
      }
      case "toolcall_end":
        yield {
          type: "block-end",
          index: event.contentIndex,
          block: {
            type: "tool-call",
            id: CallId(event.toolCall.id),
            name: event.toolCall.name,
            arguments: JSON.stringify(event.toolCall.arguments),
          },
        };
        break;
      case "done":
        yield { type: "usage", usage: mapUsage(event.message.usage) };
        yield {
          type: "finish",
          reason: mapStopReason(event.message, contextWindow),
          replayState: toPiReplayState(event.message),
        };
        return;
      case "error":
        yield { type: "usage", usage: mapUsage(event.error.usage) };
        yield { type: "finish", reason: mapStopReason(event.error, contextWindow) };
        return;
    }
  }
  throw new LlmError("pi-ai event stream ended without done/error", "STREAM_CLOSED");
}
