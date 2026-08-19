/**
 * Harness request-history conversion into @codehz/ai input items.
 */
import type { AttachmentStore } from "@deepseek-ai/dsh-attachment";
import {
  LlmError,
  contentHasImage,
  type ContentBlock,
  type GenerateOptions,
  type Message,
  type ToolResultBlock,
} from "@deepseek-ai/dsh-llm";
import type { ContentBlock as AiContentBlock, InputItem, ToolDefinition } from "@codehz/ai";
import { toInputItems } from "./replay.js";

function isToolResult(block: ContentBlock): block is ToolResultBlock {
  return block.type === "tool-result";
}

function flattenText(message: Message): string {
  return message.content.filter((block) => block.type === "text").map((block) => block.text).join("");
}

function toolResultText(blocks: readonly ContentBlock[]): string {
  return blocks.map((block) => {
    if (block.type === "text") return block.text;
    if (block.type === "tool-result") return toolResultText(block.content);
    return "";
  }).join("");
}

function recordAssistant(
  message: Message,
  toolNames: Map<string, string>,
  onReplayDegrade?: (reason: string) => void,
): InputItem[] {
  const items = toInputItems(message, onReplayDegrade);
  for (const item of items) {
    if (item.type === "tool_call") toolNames.set(item.id, item.name);
  }
  return items;
}

function toolResultItem(
  result: ToolResultBlock,
  toolNames: Map<string, string>,
  content: AiContentBlock[],
): InputItem {
  return {
    type: "tool_result",
    callId: result.toolCallId,
    toolName: toolNames.get(result.toolCallId) ?? "unknown",
    outcome: result.isError ? "error" : "success",
    content: content.length > 0 ? content : [{ type: "text", text: "(no output)" }],
  };
}

function imageDataUrl(data: Uint8Array, mediaType: string): string {
  return "data:" + mediaType + ";base64," + Buffer.from(data).toString("base64");
}

async function userBlocks(
  blocks: readonly ContentBlock[],
  attachments: AttachmentStore | undefined,
): Promise<AiContentBlock[]> {
  const content: AiContentBlock[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case "text":
        if (block.text.length > 0) content.push({ type: "text", text: block.text });
        break;
      case "image": {
        if (attachments === undefined) {
          throw new LlmError("custom-models image conversion requires the durable attachment service", "UNSUPPORTED_CONTENT");
        }
        const stored = await attachments.readImage(block.attachment);
        content.push({ type: "image", imageUrl: imageDataUrl(stored.data, stored.ref.mediaType) });
        break;
      }
      case "tool-result": {
        content.push(...await userBlocks(block.content, attachments));
        break;
      }
      default:
        break;
    }
  }
  return content;
}

function toolsOf(options: GenerateOptions): ToolDefinition[] | undefined {
  return options.tools?.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.parameters,
  }));
}

export interface ConvertedRequest {
  instructions?: string;
  input: InputItem[];
  tools?: ToolDefinition[];
}

export async function toAiRequest(
  options: GenerateOptions,
  attachments: AttachmentStore | undefined,
  onReplayDegrade?: (reason: string) => void,
): Promise<ConvertedRequest> {
  const toolNames = new Map<string, string>();
  const input: InputItem[] = [];
  for (const message of options.messages) {
    if (message.role === "system") {
      if (contentHasImage(message.content)) {
        throw new LlmError("custom-models cannot represent an image in an in-history system message", "UNSUPPORTED_CONTENT");
      }
      const text = flattenText(message);
      if (text.length > 0) {
        input.push({ type: "message", role: "user", content: [{ type: "text", text }] });
      }
      continue;
    }
    if (message.role === "assistant") {
      input.push(...recordAssistant(message, toolNames, onReplayDegrade));
      continue;
    }
    const results = message.content.filter(isToolResult);
    const nonResults = message.content.filter((block) => block.type !== "tool-result");
    const content = await userBlocks(nonResults, attachments);
    if (content.length > 0 || results.length === 0) {
      input.push({
        type: "message",
        role: "user",
        content: content.length > 0 ? content : [{ type: "text", text: flattenText(message) }],
      });
    }
    for (const result of results) {
      const resultContent = await userBlocks(result.content, attachments);
      if (resultContent.length === 0) {
        const text = toolResultText(result.content);
        input.push(toolResultItem(result, toolNames, [{ type: "text", text: text || "(no output)" }]));
      } else {
        input.push(toolResultItem(result, toolNames, resultContent));
      }
    }
  }
  const tools = toolsOf(options);
  return {
    ...(options.system === undefined ? {} : { instructions: options.system }),
    input,
    ...(tools !== undefined && tools.length > 0 ? { tools } : {}),
  };
}
