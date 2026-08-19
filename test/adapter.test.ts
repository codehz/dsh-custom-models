import { describe, expect, test } from "bun:test";
import { CallId, LlmError, type Message, type MessageSource } from "@deepseek-ai/dsh-llm";
import type { AssistantMessage } from "@earendil-works/pi-ai";
import { toPiAssistant, toPiReplayState } from "../src/adapter/replay.js";
import { applyPromptCacheKey, resolveReasoningLevel } from "../src/adapter/request.js";
import { mapStopReason, mapUsage } from "../src/adapter/stream.js";

const usage = {
  input: 1,
  output: 2,
  cacheRead: 3,
  cacheWrite: 0,
  totalTokens: 6,
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
};

function assistant(content: AssistantMessage["content"]): AssistantMessage {
  return {
    role: "assistant",
    content,
    api: "openai-completions",
    provider: "acme",
    model: "think",
    usage,
    stopReason: "stop",
    timestamp: 0,
  };
}

function harnessMessage(
  content: Message["content"],
  source: MessageSource = { kind: "model", provider: "acme", model: "think" },
): Message {
  return {
    id: "msg" as Message["id"],
    role: "assistant",
    content,
    source,
  };
}

describe("replay reconstruction", () => {
  test("round-trips signatures and degrades a mismatched envelope", () => {
    const native = assistant([
      { type: "thinking", thinking: "plan", thinkingSignature: "sig-think" },
      { type: "text", text: "ok", textSignature: "sig-text" },
      { type: "toolCall", id: "call-1", name: "search", arguments: { q: "x" }, thoughtSignature: "sig-tool" },
    ]);
    const replayState = toPiReplayState(native);
    const restored = toPiAssistant(harnessMessage([
      { type: "reasoning", text: "plan" },
      { type: "text", text: "ok" },
      { type: "tool-call", id: CallId("call-1"), name: "search", arguments: "{\"q\":\"x\"}" },
    ], { kind: "model", provider: "acme", model: "think", replayState }));

    expect(restored.api).toBe("openai-completions");
    expect(restored.content).toEqual([
      { type: "thinking", thinking: "plan", thinkingSignature: "sig-think" },
      { type: "text", text: "ok", textSignature: "sig-text" },
      { type: "toolCall", id: "call-1", name: "search", arguments: { q: "x" }, thoughtSignature: "sig-tool" },
    ]);

    let reason = "";
    const degraded = toPiAssistant(harnessMessage(
      [{ type: "text", text: "ok" }],
      { kind: "model", provider: "other", model: "think", replayState },
    ), (detail) => { reason = detail; });
    expect(degraded.api).toBe("dsh-foreign");
    expect(reason).toContain("provider does not match");
  });
});

describe("stream mapping", () => {
  test("maps usage and empty-stop to EMPTY_RESPONSE", () => {
    expect(mapUsage(usage)).toEqual({ inputTokens: 1, outputTokens: 2, cacheReadTokens: 3 });
    expect(mapStopReason(assistant([]))).toEqual({
      kind: "error",
      failure: {
        message: 'model "think" returned a completed response with no content',
        code: "EMPTY_RESPONSE",
      },
    });
  });
});

describe("request options", () => {
  test("writes sessionId as prompt_cache_key only for cacheable OpenAI APIs", () => {
    expect(applyPromptCacheKey({ model: "chat" }, "openai-completions", "sess", undefined))
      .toEqual({ model: "chat", prompt_cache_key: "sess" });
    expect(applyPromptCacheKey({ model: "chat" }, "openai-completions", "sess", "none")).toBeUndefined();
    expect(applyPromptCacheKey({ model: "chat" }, "anthropic-messages", "sess", undefined)).toBeUndefined();
  });

  test("refuses an unsupported reasoning effort", () => {
    expect(() => resolveReasoningLevel({
      id: "plain",
      name: "plain",
      api: "openai-completions",
      provider: "acme",
      baseUrl: "https://example",
      reasoning: false,
      input: ["text"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 1000,
      maxTokens: 100,
    }, "high")).toThrow(LlmError);
  });
});
