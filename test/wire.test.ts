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
