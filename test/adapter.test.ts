import { describe, expect, test } from "bun:test";
import { CallId, LlmError, type Message, type MessageSource } from "@deepseek-ai/dsh-llm";
import type { ReplayItem } from "@codehz/ai";
import { toInputItems, toReplayState } from "../src/adapter/replay.js";
import { promptCacheSettings, resolveReasoningLevel } from "../src/adapter/request.js";
import { mapStopReason, mapUsage, toStreamChunks } from "../src/adapter/stream.js";
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
  test("omits undefined optional fields from opaque replay state", () => {
    const replayState = toReplayState({
      api: "openai-completions",
      provider: "acme",
      model: "think",
      replay: [{
        type: "opaque",
        id: undefined,
        source: "chat.completions",
        purpose: "replay",
        payload: { reasoning_content: "plan" },
      } as unknown as ReplayItem],
    });
    const response = replayState.response as { opaque?: unknown[] };
    const opaque = response.opaque?.[0] as Record<string, unknown>;
    expect(opaque).toEqual({
      type: "opaque",
      source: "chat.completions",
      purpose: "replay",
      payload: { reasoning_content: "plan" },
    });
    expect(Object.hasOwn(opaque, "id")).toBe(false);
  });

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

function hasUndefined(value: unknown): boolean {
  if (value === undefined) return true;
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value)) return value.some(hasUndefined);
  return Object.values(value).some(hasUndefined);
}

describe("stream mapping", () => {
  test("keeps tool-call stream chunks losslessly JSON-serializable", async () => {
    const events = [
      { type: "tool_call.started", item: { id: "call-tool", name: "run_code" } },
      { type: "tool_call.delta", itemId: "call-tool", delta: { argumentsText: "{}" } },
      { type: "tool_call.completed", itemId: "call-tool" },
      {
        type: "response.completed",
        stopReason: "tool_call",
        replay: [
          { type: "tool_call", id: "call-tool", name: "run_code", argumentsText: "{}" },
          {
            type: "opaque",
            id: undefined,
            source: "chat.completions",
            purpose: "replay",
            payload: { reasoning_content: "plan" },
          },
        ],
      },
    ] as never[];
    async function* input() {
      yield* events;
    }

    const chunks = [];
    for await (const chunk of toStreamChunks(input(), {
      api: "openai-completions",
      provider: "acme",
      model: "think",
    })) {
      chunks.push(chunk);
    }

    expect(chunks.some((chunk) => chunk.type === "tool-call-delta")).toBe(true);
    expect(chunks.some((chunk) => chunk.type === "block-end" && chunk.block.type === "tool-call")).toBe(true);
    expect(hasUndefined(chunks)).toBe(false);
  });

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
  test("maps cacheRetention onto portable @codehz/ai cache settings", () => {
    expect(promptCacheSettings("openai-completions", "sess", undefined))
      .toEqual({ key: "sess" });
    expect(promptCacheSettings("openai-completions", 12345, "short"))
      .toEqual({ key: "12345", ttl: "short" });
    expect(promptCacheSettings("openai-responses", "sess", "long"))
      .toEqual({ key: "sess", ttl: "long" });
    expect(promptCacheSettings("openai-completions", "sess", "none"))
      .toEqual({ mode: "off" });
    expect(promptCacheSettings("openai-responses", undefined, "short"))
      .toBeUndefined();
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
