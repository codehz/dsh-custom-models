import { describe, expect, test } from "bun:test";
import { CallId, LlmError, type Message, type MessageSource } from "@deepseek-ai/dsh-llm";
import type { ReplayItem } from "@codehz/ai";
import { toInputItems, toReplayState } from "../src/adapter/replay.js";
import { applyPromptCacheKey, resolveReasoningLevel } from "../src/adapter/request.js";
import { mapStopReason, mapUsage } from "../src/adapter/stream.js";
import type { ResolvedModel } from "../src/adapter/profile.js";

const usage = {
  inputTokens: 4,
  outputTokens: 2,
  cachedInputTokens: 3,
};

function replayItems(): ReplayItem[] {
  return [
    {
      type: "reasoning",
      id: "think-1",
      visibility: "full",
      content: [{ type: "text", text: "plan" }],
    },
    {
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "ok" }],
    },
    {
      type: "tool_call",
      id: "call-1",
      name: "search",
      argumentsText: '{"q":"x"}',
    },
    {
      type: "opaque",
      source: "chat.completions",
      purpose: "replay",
      payload: { reasoning_content: "plan" },
    },
  ];
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
  test("round-trips opaque payloads and degrades a mismatched envelope", () => {
    const replayState = toReplayState({
      api: "openai-completions",
      provider: "acme",
      model: "think",
      stopReason: "tool_call",
      replay: replayItems(),
    });
    const restored = toInputItems(harnessMessage([
      { type: "reasoning", text: "plan" },
      { type: "text", text: "ok" },
      { type: "tool-call", id: CallId("call-1"), name: "search", arguments: '{"q":"x"}' },
    ], { kind: "model", provider: "acme", model: "think", replayState }));

    expect(restored).toEqual([
      {
        type: "reasoning",
        visibility: "full",
        id: "think-1",
        content: [{ type: "text", text: "plan" }],
      },
      {
        type: "message",
        role: "assistant",
        content: [{ type: "text", text: "ok" }],
      },
      {
        type: "tool_call",
        id: "call-1",
        name: "search",
        argumentsText: '{"q":"x"}',
      },
      {
        type: "opaque",
        source: "chat.completions",
        purpose: "replay",
        payload: { reasoning_content: "plan" },
      },
    ]);

    let reason = "";
    const degraded = toInputItems(harnessMessage(
      [{ type: "text", text: "ok" }],
      { kind: "model", provider: "other", model: "think", replayState },
    ), (detail) => { reason = detail; });
    expect(degraded).toEqual([
      {
        type: "message",
        role: "assistant",
        content: [{ type: "text", text: "ok" }],
      },
    ]);
    expect(reason).toContain("provider does not match");
  });
});

describe("stream mapping", () => {
  test("maps usage and empty-stop to EMPTY_RESPONSE", () => {
    expect(mapUsage(usage)).toEqual({ inputTokens: 1, outputTokens: 2, cacheReadTokens: 3 });
    expect(mapStopReason("end_turn", { model: "think", empty: true })).toEqual({
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
    expect(applyPromptCacheKey({ model: "chat" }, "openai-completions", "sess", "none"))
      .toEqual({ model: "chat" });
    expect(applyPromptCacheKey({ model: "chat" }, "openai-responses", "sess", "none"))
      .toEqual({ model: "chat" });
  });

  test("refuses an unsupported reasoning effort", () => {
    const model: ResolvedModel = {
      id: "plain",
      name: "plain",
      input: ["text"],
      contextWindow: 1000,
      maxTokens: 100,
      reasoning: false,
    };
    expect(() => resolveReasoningLevel(model, "high")).toThrow(LlmError);
  });
});
