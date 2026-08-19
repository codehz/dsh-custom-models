/**
 * Durable replay metadata and assistant-history reconstruction.
 *
 * Harness content remains the durable source for text and tool calls. This
 * module stores only the provider-native metadata needed to reconstruct a
 * @codehz/ai input item list on a later request.
 */
import {
  LlmError,
  type Message,
  type ReplayEnvelope,
} from "@deepseek-ai/dsh-llm";
import type { InputItem, OpaqueItem, ReplayItem } from "@codehz/ai";
import type { SupportedApi } from "./profile.js";

const STOP_REASONS = new Set([
  "end_turn", "tool_call", "max_output_tokens", "content_filter", "error", "unknown",
]);

export type NanoReplayBlock =
  | { type: "text" }
  | { type: "reasoning"; visibility?: "full" | "summary" | "redacted" | "opaque"; itemId?: string }
  | { type: "tool-call" };

export interface NanoReplayResponse {
  kind: "codehz-ai";
  version: 1;
  api: SupportedApi;
  provider: string;
  model: string;
  stopReason?: string;
  opaque?: OpaqueItem[];
}

interface ValidatedReplayState {
  response: NanoReplayResponse;
  blocks: NanoReplayBlock[];
}

function invalidReplay(message: string): never {
  throw new LlmError("invalid custom-models replay state: " + message, "INVALID_REPLAY_STATE");
}

function optionalString(value: unknown, label: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return invalidReplay(label + " must be a string");
  return value;
}

function isOpaqueItem(value: unknown): value is OpaqueItem {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return item.type === "opaque"
    && typeof item.source === "string"
    && (item.purpose === "replay" || item.purpose === "provider_state" || item.purpose === "unknown");
}

/**
 * Detach an opaque item without copying optional fields whose value is undefined.
 *
 * @codehz/ai's item constructors include optional properties in the returned
 * object (for example, `id: undefined`). That is harmless for normal JSON.stringify,
 * which silently drops the property, but the session log deliberately validates
 * lossless JSON and rejects it. Replay state is embedded in the terminal stream
 * chunk, so it must already satisfy that stricter boundary.
 */
function durableOpaqueItem(item: OpaqueItem): OpaqueItem {
  return {
    type: "opaque",
    ...(item.id === undefined ? {} : { id: item.id }),
    source: item.source,
    purpose: item.purpose,
    payload: item.payload,
  };
}

/** Project a successful @codehz/ai turn into the durable replay envelope. */
export function toReplayState(options: {
  api: SupportedApi;
  provider: string;
  model: string;
  stopReason?: string;
  replay: readonly ReplayItem[];
}): ReplayEnvelope {
  const blocks: NanoReplayBlock[] = [];
  const opaque: OpaqueItem[] = [];
  for (const item of options.replay) {
    switch (item.type) {
      case "message":
        if (item.role === "assistant") {
          for (const block of item.content) {
            if (block.type === "text" || block.type === "json") blocks.push({ type: "text" });
          }
        }
        break;
      case "reasoning":
        blocks.push({
          type: "reasoning",
          visibility: item.visibility,
          ...(item.id === undefined ? {} : { itemId: item.id }),
        });
        break;
      case "tool_call":
        blocks.push({ type: "tool-call" });
        break;
      case "opaque":
        opaque.push(durableOpaqueItem(item));
        break;
      default:
        break;
    }
  }
  return {
    response: {
      kind: "codehz-ai",
      version: 1,
      api: options.api,
      provider: options.provider,
      model: options.model,
      ...(options.stopReason === undefined ? {} : { stopReason: options.stopReason }),
      ...(opaque.length > 0 ? { opaque } : {}),
    },
    blocks,
  };
}

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
  if (response.kind !== "codehz-ai") return invalidReplay("unknown state kind");
  if (response.version !== 1) return invalidReplay("unsupported version " + String(response.version));
  for (const key of ["api", "provider", "model"] as const) {
    const field = response[key];
    if (typeof field !== "string" || field.length === 0) {
      return invalidReplay(key + " must be a non-empty string");
    }
  }
  if (response.api !== "openai-completions" && response.api !== "openai-responses") {
    return invalidReplay("unknown api");
  }
  if (response.stopReason !== undefined && !STOP_REASONS.has(String(response.stopReason))) {
    return invalidReplay("unknown stopReason");
  }
  const opaque = response.opaque;
  if (opaque !== undefined) {
    if (!Array.isArray(opaque) || !opaque.every(isOpaqueItem)) {
      return invalidReplay("opaque must be an array of opaque items");
    }
  }
  const blocks = envelope.blocks;
  if (!Array.isArray(blocks)) return invalidReplay("blocks must be an array");
  const validated: NanoReplayBlock[] = [];
  for (const [index, raw] of blocks.entries()) {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      return invalidReplay("block " + index + " must be an object");
    }
    const block = raw as Record<string, unknown>;
    const type = block.type;
    if (type !== "text" && type !== "reasoning" && type !== "tool-call") {
      return invalidReplay("block " + index + " has an unknown type");
    }
    if (type === "reasoning") {
      const visibility = block.visibility;
      if (
        visibility !== undefined
        && visibility !== "full"
        && visibility !== "summary"
        && visibility !== "redacted"
        && visibility !== "opaque"
      ) {
        return invalidReplay("block " + index + " visibility is invalid");
      }
      validated.push({
        type,
        ...(typeof visibility === "string" ? { visibility } : {}),
        ...(typeof block.itemId === "string" ? { itemId: block.itemId } : {}),
      });
      continue;
    }
    validated.push({ type });
  }
  return {
    response: {
      kind: "codehz-ai",
      version: 1,
      api: response.api,
      provider: response.provider as string,
      model: response.model as string,
      ...(optionalString(response.stopReason, "stopReason") === undefined
        ? {}
        : { stopReason: String(response.stopReason) }),
      ...(opaque === undefined ? {} : { opaque: opaque as OpaqueItem[] }),
    },
    blocks: validated,
  };
}

type FlattenedAssistant =
  | { type: "text"; text: string }
  | { type: "reasoning"; text: string }
  | { type: "tool-call"; id: string; name: string; arguments: string };

function flattenAssistantContent(message: Message): FlattenedAssistant[] {
  const content: FlattenedAssistant[] = [];
  for (const block of message.content) {
    switch (block.type) {
      case "text":
        content.push({ type: "text", text: block.text });
        break;
      case "reasoning":
        content.push({ type: "reasoning", text: block.text });
        break;
      case "tool-call":
        content.push({
          type: "tool-call",
          id: block.id,
          name: block.name,
          arguments: block.arguments,
        });
        break;
      case "image":
        throw new LlmError(
          "custom-models chat history cannot represent structured assistant image output",
          "UNSUPPORTED_CONTENT",
        );
      default:
        break;
    }
  }
  return content;
}

function itemsFromAssistantContent(
  content: FlattenedAssistant[],
  replay?: ValidatedReplayState,
): InputItem[] {
  const items: InputItem[] = [];
  let text: string[] = [];
  const flushText = () => {
    if (text.length === 0) return;
    items.push({
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: text.join("") }],
    });
    text = [];
  };
  for (const [index, block] of content.entries()) {
    const meta = replay?.blocks[index];
    if (replay !== undefined && (meta === undefined || meta.type !== block.type)) {
      return invalidReplay("block " + index + " does not match assistant content");
    }
    switch (block.type) {
      case "text":
        text.push(block.text);
        break;
      case "reasoning":
        flushText();
        items.push({
          type: "reasoning",
          visibility: meta?.type === "reasoning" ? (meta.visibility ?? "full") : "full",
          ...(meta?.type === "reasoning" && meta.itemId !== undefined ? { id: meta.itemId } : {}),
          content: [{ type: "text", text: block.text }],
        });
        break;
      case "tool-call":
        flushText();
        items.push({
          type: "tool_call",
          id: block.id,
          name: block.name,
          argumentsText: block.arguments,
        });
        break;
    }
  }
  flushText();
  if (replay?.response.opaque !== undefined) items.push(...replay.response.opaque);
  return items;
}

/**
 * Convert one durable Harness assistant message into @codehz/ai input items.
 *
 * Durable content is the authoritative record; replay metadata only restores
 * native fidelity (ids, opaque payloads). A replay state this build cannot use
 * therefore degrades the one message to provider-neutral history instead of
 * failing the request.
 */
export function toInputItems(
  message: Message,
  onDegrade?: (reason: string) => void,
): InputItem[] {
  const source = message.source;
  const content = flattenAssistantContent(message);
  if (source.kind !== "model" || source.replayState === undefined) {
    return itemsFromAssistantContent(content);
  }
  try {
    const state = readReplayState(source.replayState);
    if (state.response.provider !== source.provider) {
      return invalidReplay("provider does not match assistant source");
    }
    if (state.response.model !== source.model) {
      return invalidReplay("model does not match assistant source");
    }
    if (state.blocks.length !== content.length) {
      return invalidReplay("block count does not match assistant content");
    }
    return itemsFromAssistantContent(content, state);
  } catch (error) {
    if (!(error instanceof LlmError) || error.code !== "INVALID_REPLAY_STATE") throw error;
    onDegrade?.(error.message);
    return itemsFromAssistantContent(content);
  }
}
