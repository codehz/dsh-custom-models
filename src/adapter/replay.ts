/**
 * Durable pi-ai replay metadata and assistant-history reconstruction.
 *
 * Harness content remains the durable source for text and tool calls. This
 * module stores only the provider-native metadata needed to reconstruct a
 * pi-ai assistant message on a later request.
 */
import {
  LlmError,
  type Message,
  type ModelMessageSource,
  type ReplayEnvelope,
} from "@deepseek-ai/dsh-llm";
import type {
  Api,
  AssistantMessage,
  StopReason,
  TextContent,
  ThinkingContent,
  ToolCall,
  Usage,
} from "@earendil-works/pi-ai";

const STOP_REASONS = new Set<StopReason>(["stop", "length", "toolUse", "error", "aborted"]);

/** Per-block half of the pi-ai replay envelope, one entry per content block. */
export type PiAiReplayBlock =
  | { type: "text"; textSignature?: string }
  | { type: "reasoning"; thinkingSignature?: string; redacted?: boolean }
  | { type: "tool-call"; thoughtSignature?: string };

/** Versioned response-level half of the pi-ai replay envelope. */
export interface PiAiReplayResponse {
  kind: "pi-ai";
  version: 2;
  api: Api;
  provider: string;
  model: string;
  responseModel?: string;
  responseId?: string;
  stopReason: StopReason;
}

interface ValidatedReplayState {
  response: PiAiReplayResponse;
  blocks: PiAiReplayBlock[];
}

/** Parse tool-call argument JSON; tolerate model malformations with {}. */
export function parseArguments(raw: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {}
  return {};
}

/** Construct the zero usage value required by historical pi-ai messages. */
function emptyPiUsage(): Usage {
  return {
    input: 0,
    output: 0,
    cacheRead: 0,
    cacheWrite: 0,
    totalTokens: 0,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
  };
}

function invalidReplay(message: string): never {
  throw new LlmError("invalid pi-ai replay state: " + message, "INVALID_REPLAY_STATE");
}

function optionalString(value: unknown, label: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return invalidReplay(label + " must be a string");
  return value;
}

/**
 * Project a successful pi-ai response into the minimal durable replay state.
 * The per-block half is index-aligned with the streamed blocks (pi-ai content
 * order), so BlockAssembler prunes an entry with its block whenever assembly
 * removes one.
 */
export function toPiReplayState(message: AssistantMessage): ReplayEnvelope {
  return {
    response: {
      kind: "pi-ai",
      version: 2,
      api: message.api,
      provider: message.provider,
      model: message.model,
      ...(message.responseModel === undefined ? {} : { responseModel: message.responseModel }),
      ...(message.responseId === undefined ? {} : { responseId: message.responseId }),
      stopReason: message.stopReason,
    },
    blocks: message.content.map((block): PiAiReplayBlock => {
      switch (block.type) {
        case "text":
          return {
            type: "text",
            ...(block.textSignature === undefined ? {} : { textSignature: block.textSignature }),
          };
        case "thinking":
          return {
            type: "reasoning",
            ...(block.thinkingSignature === undefined ? {} : { thinkingSignature: block.thinkingSignature }),
            ...(block.redacted === undefined ? {} : { redacted: block.redacted }),
          };
        case "toolCall":
          return {
            type: "tool-call",
            ...(block.thoughtSignature === undefined ? {} : { thoughtSignature: block.thoughtSignature }),
          };
      }
    }),
  };
}

/** Validate the durable adapter-private envelope before it reaches pi-ai. */
function readReplayState(value: unknown): ValidatedReplayState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return invalidReplay("expected a replay envelope");
  }
  const envelope = value as Record<string, unknown>;
  const rawResponse = envelope.response;
  if (typeof rawResponse !== "object" || rawResponse === null || Array.isArray(rawResponse)) {
    return invalidReplay("expected a response object");
  }
  const response = rawResponse as Record<string, unknown>;
  if (response.kind !== "pi-ai") return invalidReplay("unknown state kind");
  if (response.version !== 2) return invalidReplay("unsupported version " + String(response.version));
  for (const key of ["api", "provider", "model"] as const) {
    const field = response[key];
    if (typeof field !== "string" || field.length === 0) {
      return invalidReplay(key + " must be a non-empty string");
    }
  }
  if (!STOP_REASONS.has(String(response.stopReason) as StopReason)) {
    return invalidReplay("unknown stopReason");
  }
  const responseModel = optionalString(response.responseModel, "responseModel");
  const responseId = optionalString(response.responseId, "responseId");
  const blocks = envelope.blocks;
  if (!Array.isArray(blocks)) return invalidReplay("blocks must be an array");
  const validated: PiAiReplayBlock[] = [];
  for (const [index, raw] of blocks.entries()) {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      return invalidReplay("block " + index + " must be an object");
    }
    const block = raw as Record<string, unknown>;
    const type = block.type;
    if (type !== "text" && type !== "reasoning" && type !== "tool-call") {
      return invalidReplay("block " + index + " has an unknown type");
    }
    for (const signature of ["textSignature", "thinkingSignature", "thoughtSignature"] as const) {
      if (block[signature] !== undefined && typeof block[signature] !== "string") {
        return invalidReplay("block " + index + " " + signature + " must be a string");
      }
    }
    if (block.redacted !== undefined && typeof block.redacted !== "boolean") {
      return invalidReplay("block " + index + " redacted must be boolean");
    }
    if (type === "text") {
      validated.push({
        type,
        ...(typeof block.textSignature === "string" ? { textSignature: block.textSignature } : {}),
      });
      continue;
    }
    if (type === "reasoning") {
      validated.push({
        type,
        ...(typeof block.thinkingSignature === "string" ? { thinkingSignature: block.thinkingSignature } : {}),
        ...(typeof block.redacted === "boolean" ? { redacted: block.redacted } : {}),
      });
      continue;
    }
    validated.push({
      type,
      ...(typeof block.thoughtSignature === "string" ? { thoughtSignature: block.thoughtSignature } : {}),
    });
  }
  return {
    response: {
      kind: "pi-ai",
      version: 2,
      api: response.api as Api,
      provider: response.provider as string,
      model: response.model as string,
      ...(responseModel === undefined ? {} : { responseModel }),
      ...(responseId === undefined ? {} : { responseId }),
      stopReason: response.stopReason as StopReason,
    },
    blocks: validated,
  };
}

/** Convert provider-neutral blocks without trusting them as same-model replay. */
function foreignAssistant(message: Message): AssistantMessage {
  const source = message.source.kind === "model" ? message.source : undefined;
  const content: AssistantMessage["content"] = [];
  for (const block of message.content) {
    switch (block.type) {
      case "text":
        content.push({ type: "text", text: block.text });
        break;
      case "reasoning":
        content.push({ type: "thinking", thinking: block.text });
        break;
      case "tool-call":
        content.push({
          type: "toolCall",
          id: block.id,
          name: block.name,
          arguments: parseArguments(block.arguments),
        });
        break;
      case "image":
        throw new LlmError(
          "pi-ai chat history cannot represent structured assistant image output",
          "UNSUPPORTED_CONTENT",
        );
      default:
        break;
    }
  }
  return {
    role: "assistant",
    content,
    api: "dsh-foreign",
    provider: source?.provider ?? "dsh-foreign",
    model: source?.model ?? "dsh-foreign",
    usage: emptyPiUsage(),
    stopReason: content.some((piece) => piece.type === "toolCall") ? "toolUse" : "stop",
    timestamp: 0,
  };
}

/** Recombine durable Harness content with validated pi-ai replay metadata. */
function replayedAssistant(
  message: Message,
  source: ModelMessageSource,
  rawState: unknown,
): AssistantMessage {
  const state = readReplayState(rawState);
  if (state.response.provider !== source.provider) return invalidReplay("provider does not match assistant source");
  if (state.response.model !== source.model) return invalidReplay("model does not match assistant source");
  if (state.blocks.length !== message.content.length) return invalidReplay("block count does not match assistant content");
  const content = message.content.map((block, index): TextContent | ThinkingContent | ToolCall => {
    const replay = state.blocks[index];
    if (replay === undefined || replay.type !== block.type) {
      return invalidReplay("block " + index + " does not match assistant content");
    }
    switch (block.type) {
      case "text":
        return {
          type: "text",
          text: block.text,
          ...(replay.type === "text" && replay.textSignature !== undefined
            ? { textSignature: replay.textSignature }
            : {}),
        };
      case "reasoning":
        return {
          type: "thinking",
          thinking: block.text,
          ...(replay.type === "reasoning" && replay.thinkingSignature !== undefined
            ? { thinkingSignature: replay.thinkingSignature }
            : {}),
          ...(replay.type === "reasoning" && replay.redacted !== undefined ? { redacted: replay.redacted } : {}),
        };
      case "tool-call":
        return {
          type: "toolCall",
          id: block.id,
          name: block.name,
          arguments: parseArguments(block.arguments),
          ...(replay.type === "tool-call" && replay.thoughtSignature !== undefined
            ? { thoughtSignature: replay.thoughtSignature }
            : {}),
        };
      default:
        return invalidReplay("block " + index + " has an unsupported Harness type");
    }
  });
  return {
    role: "assistant",
    content,
    api: state.response.api,
    provider: state.response.provider,
    model: state.response.model,
    ...(state.response.responseModel === undefined ? {} : { responseModel: state.response.responseModel }),
    ...(state.response.responseId === undefined ? {} : { responseId: state.response.responseId }),
    usage: emptyPiUsage(),
    stopReason: state.response.stopReason,
    timestamp: 0,
  };
}

/**
 * Convert one durable Harness assistant message into pi-ai history.
 *
 * Durable content is the authoritative record; replay metadata only restores
 * native fidelity (ids, signatures). A replay state this build cannot use
 * therefore degrades the one message to provider-neutral history instead of
 * failing the request.
 */
export function toPiAssistant(
  message: Message,
  onDegrade?: (reason: string) => void,
): AssistantMessage {
  const source = message.source;
  if (source.kind !== "model" || source.replayState === undefined) return foreignAssistant(message);
  try {
    return replayedAssistant(message, source, source.replayState);
  } catch (error) {
    if (!(error instanceof LlmError) || error.code !== "INVALID_REPLAY_STATE") throw error;
    onDegrade?.(error.message);
    return foreignAssistant(message);
  }
}
