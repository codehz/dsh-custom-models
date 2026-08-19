/**
 * Harness request-history conversion into pi-ai's Context vocabulary.
 */
import type { AttachmentStore } from "@deepseek-ai/dsh-attachment";
import {
  CallId,
  LlmError,
  contentHasImage,
  type ContentBlock,
  type GenerateOptions,
  type Message,
  type ToolResultBlock,
} from "@deepseek-ai/dsh-llm";
import type {
  Context as PiContext,
  ImageContent,
  Message as PiMessage,
  TextContent,
  Tool,
  ToolResultMessage,
} from "@earendil-works/pi-ai";
import { toPiAssistant } from "./replay.js";

type UserContent = string | (TextContent | ImageContent)[];

function isToolResult(block: ContentBlock): block is ToolResultBlock {
  return block.type === "tool-result";
}

/** Join the text blocks of a harness message. */
function flattenText(message: Message): string {
  return message.content.filter((block) => block.type === "text").map((block) => block.text).join("");
}

/** Flatten text recursively inside one tool result. */
function toolResultText(blocks: readonly ContentBlock[]): string {
  return blocks.map((block) => {
    if (block.type === "text") return block.text;
    if (block.type === "tool-result") return toolResultText(block.content);
    return "";
  }).join("");
}

function userText(content: UserContent): PiMessage {
  return { role: "user", content, timestamp: 0 };
}

function recordAssistant(
  message: Message,
  toolNames: Map<string, string>,
  onReplayDegrade?: (reason: string) => void,
): PiMessage {
  const assistant = toPiAssistant(message, onReplayDegrade);
  for (const block of assistant.content) {
    if (block.type === "toolCall") toolNames.set(CallId(block.id), block.name);
  }
  return assistant;
}

function toolResultMessage(
  result: ToolResultBlock,
  toolNames: Map<string, string>,
  content: (TextContent | ImageContent)[],
): ToolResultMessage {
  return {
    role: "toolResult",
    toolCallId: result.toolCallId,
    toolName: toolNames.get(result.toolCallId) ?? "unknown",
    content,
    isError: result.isError ?? false,
    timestamp: 0,
  };
}

async function userContent(
  blocks: readonly ContentBlock[],
  attachments: AttachmentStore,
): Promise<UserContent> {
  const content: (TextContent | ImageContent)[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case "text":
        if (block.text.length > 0) content.push({ type: "text", text: block.text });
        break;
      case "image": {
        const stored = await attachments.readImage(block.attachment);
        content.push({
          type: "image",
          data: Buffer.from(stored.data).toString("base64"),
          mimeType: stored.ref.mediaType,
        });
        break;
      }
      case "tool-result": {
        const nested = await userContent(block.content, attachments);
        if (typeof nested === "string") {
          if (nested.length > 0) content.push({ type: "text", text: nested });
        } else {
          content.push(...nested);
        }
        break;
      }
      default:
        break;
    }
  }
  if (content.every((block) => block.type === "text")) {
    return content.map((block) => block.text).join("");
  }
  return content;
}

function toolsOf(options: GenerateOptions): Tool[] | undefined {
  return options.tools?.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters as Tool["parameters"],
  }));
}

/** Assemble the request-level pi-ai context envelope shared by both conversion paths. */
function piContext(options: GenerateOptions, messages: PiMessage[]): PiContext {
  const tools = toolsOf(options);
  return {
    ...(options.system === undefined ? {} : { systemPrompt: options.system }),
    messages,
    ...(tools !== undefined && tools.length > 0 ? { tools } : {}),
  };
}

function textOnlyContext(
  options: GenerateOptions,
  onReplayDegrade?: (reason: string) => void,
): PiContext {
  const toolNames = new Map<string, string>();
  const messages: PiMessage[] = [];
  for (const message of options.messages) {
    if (contentHasImage(message.content)) {
      throw new LlmError("pi-ai image conversion requires the durable attachment service", "UNSUPPORTED_CONTENT");
    }
    if (message.role === "system") {
      messages.push(userText(flattenText(message)));
      continue;
    }
    if (message.role === "assistant") {
      messages.push(recordAssistant(message, toolNames, onReplayDegrade));
      continue;
    }
    const text = flattenText(message);
    const results = message.content.filter(isToolResult);
    if (text.length > 0 || results.length === 0) messages.push(userText(text));
    for (const result of results) {
      messages.push(toolResultMessage(result, toolNames, [{
        type: "text",
        text: toolResultText(result.content) || "(no output)",
      }]));
    }
  }
  return piContext(options, messages);
}

async function toPiContextWithImages(
  options: GenerateOptions,
  attachments: AttachmentStore,
  onReplayDegrade?: (reason: string) => void,
): Promise<PiContext> {
  const toolNames = new Map<string, string>();
  const messages: PiMessage[] = [];
  for (const message of options.messages) {
    if (message.role === "system") {
      if (contentHasImage(message.content)) {
        throw new LlmError("pi-ai cannot represent an image in an in-history system message", "UNSUPPORTED_CONTENT");
      }
      messages.push(userText(flattenText(message)));
      continue;
    }
    if (message.role === "assistant") {
      messages.push(recordAssistant(message, toolNames, onReplayDegrade));
      continue;
    }
    const content = await userContent(message.content.filter((block) => block.type !== "tool-result"), attachments);
    const results = message.content.filter(isToolResult);
    if (content.length > 0 || results.length === 0) messages.push(userText(content));
    for (const result of results) {
      const resultContent = await userContent(result.content, attachments);
      messages.push(toolResultMessage(
        result,
        toolNames,
        typeof resultContent === "string"
          ? [{ type: "text", text: resultContent || "(no output)" }]
          : resultContent,
      ));
    }
  }
  return piContext(options, messages);
}

/** Convert text-only harness history to a synchronous pi-ai Context. */
export function toPiContext(
  options: GenerateOptions,
  attachments?: undefined,
  onReplayDegrade?: (reason: string) => void,
): PiContext;
/** Convert harness history to a pi-ai Context while resolving durable images. */
export function toPiContext(
  options: GenerateOptions,
  attachments: AttachmentStore,
  onReplayDegrade?: (reason: string) => void,
): Promise<PiContext>;
export function toPiContext(
  options: GenerateOptions,
  attachments?: AttachmentStore,
  onReplayDegrade?: (reason: string) => void,
): PiContext | Promise<PiContext> {
  return attachments === undefined
    ? textOnlyContext(options, onReplayDegrade)
    : toPiContextWithImages(options, attachments, onReplayDegrade);
}
