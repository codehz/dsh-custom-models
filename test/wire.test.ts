import { expect, test } from "bun:test";
import type { Api, Model } from "@earendil-works/pi-ai";
import { normalizeConfig } from "../src/index.js";

test("sends the model-specific reasoning effort wire value", async () => {
  let payload: Record<string, unknown> | undefined;
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      payload = await request.json() as Record<string, unknown>;
      const chunks = [
        {
          id: "chatcmpl-test",
          object: "chat.completion.chunk",
          created: 1,
          model: "reasoner",
          choices: [{ index: 0, delta: { role: "assistant", content: "ok" }, finish_reason: null }],
        },
        {
          id: "chatcmpl-test",
          object: "chat.completion.chunk",
          created: 1,
          model: "reasoner",
          choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        },
      ];
      const body = chunks.map((chunk) => "data: " + JSON.stringify(chunk) + "\n\n").join("") +
        "data: [DONE]\n\n";
      return new Response(body, { headers: { "content-type": "text/event-stream" } });
    },
  });

  try {
    const normalized = normalizeConfig({
      providers: {
        wire: {
          baseURL: server.url.toString() + "v1",
          models: [{
            id: "reasoner",
            reasoningEfforts: { high: "intense", max: "ultra" },
            defaultReasoningEffort: "max",
          }],
        },
      },
    });
    const profile = normalized.profiles.get("wire");
    const model = profile?.piProvider.getModels()[0] as Model<Api>;
    const events = profile?.piProvider.streamSimple(
      model,
      { messages: [{ role: "user", content: "hello", timestamp: Date.now() }] },
      { apiKey: "test-key", reasoning: "max" },
    );
    if (events === undefined) throw new Error("missing stream");
    for await (const _event of events) {
      // Drain the provider stream so the request and SSE parser both complete.
    }

    expect(payload?.reasoning_effort).toBe("ultra");
  } finally {
    server.stop(true);
  }
});

async function captureAdapterPayload(cacheRetention: "none" | "short" | undefined, sessionId: unknown) {
  let payload: Record<string, unknown> | undefined;
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      payload = await request.json() as Record<string, unknown>;
      const chunk = { id: "cache-test", object: "chat.completion.chunk", created: 1, model: "chat", choices: [{ index: 0, delta: {}, finish_reason: "stop" }], usage: { prompt_tokens: 1, completion_tokens: 0, total_tokens: 1 } };
      return new Response(`data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`, { headers: { "content-type": "text/event-stream" } });
    },
  });
  try {
    const normalized = normalizeConfig({ providers: { wire: { baseURL: server.url.toString() + "v1", ...(cacheRetention === undefined ? {} : { cacheRetention }), models: [{ id: "chat" }] } } });
    const { PerModelReasoningPiAiAdapter } = await import("../src/index.js");
    const adapter = new PerModelReasoningPiAiAdapter({ profiles: () => normalized.profiles, resolveApiKey: async () => "test-key" }, normalized.defaults);
    for await (const _chunk of adapter.stream({ provider: "wire", model: "chat", system: "system", messages: [{ role: "user", content: [{ type: "text", text: "hello" }] }], sessionId } as never)) {}
    return payload;
  } finally { server.stop(true); }
}

test("local adapter sends sessionId verbatim as prompt_cache_key for default cache", async () => {
  const payload = await captureAdapterPayload(undefined, "default-session");
  expect(payload?.prompt_cache_key).toBe("default-session");
});

test("local adapter sends sessionId verbatim as prompt_cache_key for short cache", async () => {
  const payload = await captureAdapterPayload("short", 12345);
  expect(payload?.prompt_cache_key).toBe("12345");
});

test("local adapter omits prompt_cache_key when cacheRetention is none", async () => {
  const payload = await captureAdapterPayload("none", "session-raw");
  expect(payload).not.toHaveProperty("prompt_cache_key");
});
