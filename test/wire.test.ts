import { expect, test } from "bun:test";
import { PerModelReasoningPiAiAdapter, normalizeConfig } from "../src/index.js";

function completionsBody(text: string): string {
  const chunks = [
    {
      id: "chatcmpl-test",
      object: "chat.completion.chunk",
      created: 1,
      model: "reasoner",
      choices: [{ index: 0, delta: { role: "assistant", content: text }, finish_reason: null }],
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
  return chunks.map((chunk) => "data: " + JSON.stringify(chunk) + "\n\n").join("") + "data: [DONE]\n\n";
}

function responsesBody(): string {
  return [
    'event: response.output_item.added\ndata: {"item":{"id":"m1","type":"message"}}\n\n',
    'event: response.output_text.delta\ndata: {"item_id":"m1","delta":"ok"}\n\n',
    'event: response.output_text.done\ndata: {"item_id":"m1","text":"ok"}\n\n',
    `event: response.completed\ndata: ${JSON.stringify({
      response: {
        id: "resp-1",
        model: "chat",
        output: [{ id: "m1", type: "message", content: [{ type: "output_text", text: "ok" }] }],
        usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
      },
    })}\n\n`,
  ].join("");
}

test("routes Messages requests to the Anthropic endpoint", async () => {
  let payload: Record<string, unknown> | undefined;
  let pathname = "";
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      pathname = new URL(request.url).pathname;
      payload = await request.json() as Record<string, unknown>;
      return new Response('event: message_start\ndata: {"message":{"id":"m","role":"assistant","content":[]}}\n\nevent: message_stop\ndata: {}\n\n', { headers: { "content-type": "text/event-stream" } });
    },
  });
  try {
    const normalized = normalizeConfig({ providers: { wire: { api: "messages", baseURL: server.url.toString() + "v1", models: [{ id: "claude" }] } } });
    const adapter = new PerModelReasoningPiAiAdapter({ profiles: () => normalized.profiles, resolveApiKey: async () => "test-key" }, normalized.defaults);
    for await (const _chunk of adapter.stream({ provider: "wire", model: "claude", messages: [{ role: "user", content: [{ type: "text", text: "hello" }] }] } as never)) {}
    expect(pathname).toBe("/v1/messages");
    expect(payload?.model).toBe("claude");
    expect(payload?.messages).toEqual([{ role: "user", content: "hello" }]);
  } finally {
    server.stop(true);
  }
});

test("routes Ollama requests to the api/chat endpoint", async () => {
  let pathname = "";
  const server = Bun.serve({
    port: 0,
    fetch(request) {
      pathname = new URL(request.url).pathname;
      return new Response(JSON.stringify({ message: { role: "assistant", content: "ok" }, done: true }), { headers: { "content-type": "application/json" } });
    },
  });
  try {
    const normalized = normalizeConfig({ providers: { wire: { api: "ollama", baseURL: server.url.toString(), models: [{ id: "llama" }] } } });
    const adapter = new PerModelReasoningPiAiAdapter({ profiles: () => normalized.profiles, resolveApiKey: async () => undefined }, normalized.defaults);
    for await (const _chunk of adapter.stream({ provider: "wire", model: "llama", messages: [{ role: "user", content: [{ type: "text", text: "hello" }] }] } as never)) {}
    expect(pathname).toBe("/api/chat");
  } finally {
    server.stop(true);
  }
});

test("sends the model-specific reasoning effort wire value", async () => {
  let payload: Record<string, unknown> | undefined;
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      payload = await request.json() as Record<string, unknown>;
      return new Response(completionsBody("ok"), { headers: { "content-type": "text/event-stream" } });
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
    const adapter = new PerModelReasoningPiAiAdapter({
      profiles: () => normalized.profiles,
      resolveApiKey: async () => "test-key",
    }, normalized.defaults);
    for await (const _chunk of adapter.stream({
      provider: "wire",
      model: "reasoner",
      reasoningEffort: "max" as never,
      messages: [{ role: "user", content: [{ type: "text", text: "hello" }] }],
    } as never)) {}

    expect(payload?.reasoning_effort).toBe("ultra");
  } finally {
    server.stop(true);
  }
});

async function captureAdapterPayload(
  cacheRetention: "none" | "short" | "long" | undefined,
  sessionId: unknown,
  api: "openai-completions" | "openai-responses" = "openai-completions",
) {
  let payload: Record<string, unknown> | undefined;
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      payload = await request.json() as Record<string, unknown>;
      const body = api === "openai-responses"
        ? responsesBody()
        : completionsBody("");
      return new Response(body, { headers: { "content-type": "text/event-stream" } });
    },
  });
  try {
    const normalized = normalizeConfig({
      providers: {
        wire: {
          api,
          baseURL: server.url.toString() + "v1",
          ...(cacheRetention === undefined ? {} : { cacheRetention }),
          models: [{ id: "chat" }],
        },
      },
    });
    const adapter = new PerModelReasoningPiAiAdapter({
      profiles: () => normalized.profiles,
      resolveApiKey: async () => "test-key",
    }, normalized.defaults);
    for await (const _chunk of adapter.stream({
      provider: "wire",
      model: "chat",
      system: "system",
      messages: [{ role: "user", content: [{ type: "text", text: "hello" }] }],
      sessionId,
    } as never)) {}
    return payload;
  } finally {
    server.stop(true);
  }
}

test("local adapter sends sessionId verbatim as prompt_cache_key for default cache", async () => {
  const payload = await captureAdapterPayload(undefined, "default-session");
  expect(payload?.prompt_cache_key).toBe("default-session");
  expect(payload).not.toHaveProperty("prompt_cache_retention");
});

test("local adapter maps short cacheRetention to in_memory retention", async () => {
  const payload = await captureAdapterPayload("short", 12345);
  expect(payload?.prompt_cache_key).toBe("12345");
  expect(payload?.prompt_cache_retention).toBe("in_memory");
});

test("local adapter maps long cacheRetention to 24h retention", async () => {
  const payload = await captureAdapterPayload("long", "long-session");
  expect(payload?.prompt_cache_key).toBe("long-session");
  expect(payload?.prompt_cache_retention).toBe("24h");
});

test("local adapter omits prompt_cache_key when cacheRetention is none", async () => {
  const payload = await captureAdapterPayload("none", "session-raw");
  expect(payload).not.toHaveProperty("prompt_cache_key");
  expect(payload).not.toHaveProperty("prompt_cache_retention");
});

test("local adapter sends a long sessionId verbatim for openai-responses", async () => {
  const sessionId = "responses-session-" + "x".repeat(80);
  const payload = await captureAdapterPayload(undefined, sessionId, "openai-responses");
  expect(payload?.prompt_cache_key).toBe(sessionId);
  expect(payload).not.toHaveProperty("prompt_cache_options");
});

test("local adapter maps Responses short cacheRetention into prompt_cache_options", async () => {
  const payload = await captureAdapterPayload("short", "responses-short", "openai-responses");
  expect(payload?.prompt_cache_key).toBe("responses-short");
  expect(payload?.prompt_cache_options).toEqual({ retention: "in_memory" });
});

test("local adapter maps Responses long cacheRetention into prompt_cache_options", async () => {
  const payload = await captureAdapterPayload("long", "responses-long", "openai-responses");
  expect(payload?.prompt_cache_key).toBe("responses-long");
  expect(payload?.prompt_cache_options).toEqual({ retention: "24h" });
});

test("local adapter omits the Responses cache key when cacheRetention is none", async () => {
  const payload = await captureAdapterPayload("none", "responses-session", "openai-responses");
  expect(payload).not.toHaveProperty("prompt_cache_key");
  expect(payload).not.toHaveProperty("prompt_cache_options");
});
