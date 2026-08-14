import { describe, expect, test } from "bun:test";
import { Context } from "@deepseek-ai/cordis";
import { LlmRuntime } from "@deepseek-ai/dsh-llm";
import {
  PerModelReasoningPiAiAdapter,
  normalizeConfig,
  type Config,
  type CustomProviderProfile,
} from "../src/index.js";

const baseProvider = {
  displayName: "Acme Gateway",
  api: "openai-completions",
  baseURL: "https://gateway.example/v1",
  models: [
    {
      id: "acme-think",
      name: "Acme Think",
      contextWindow: 128_000,
      maxTokens: 16_384,
      reasoningEfforts: {
        off: null,
        low: "low",
        high: "high",
        max: "ultra",
      },
      defaultReasoningEffort: "high",
    },
    {
      id: "acme-chat",
      contextWindow: 64_000,
      maxTokens: 8_192,
      reasoningEfforts: false,
    },
  ],
} satisfies NonNullable<Config["providers"]>[string];

function adapterFor(config: Config) {
  const normalized = normalizeConfig(config);
  return new PerModelReasoningPiAiAdapter(
    {
      profiles: () => normalized.profiles,
      resolveApiKey: async () => undefined,
    },
    normalized.defaults,
  );
}

describe("per-model reasoning defaults", () => {
  test("materializes a configured exact-model default", async () => {
    const adapter = adapterFor({ providers: { acme: baseProvider } });
    const model = await adapter.resolveModel("acme", "acme-think");

    expect(model.reasoning?.efforts.map((effort) => String(effort.id))).toEqual([
      "off", "low", "high", "max",
    ]);
    expect(String(model.reasoning?.defaultEffort)).toBe("high");
  });

  test("materializes the default through DSH resolveCallConfig", async () => {
    const normalized = normalizeConfig({ providers: { acme: baseProvider } });
    const adapter = new PerModelReasoningPiAiAdapter(
      {
        profiles: () => normalized.profiles,
        resolveApiKey: async () => undefined,
      },
      normalized.defaults,
    );
    const runtime = new LlmRuntime(new Context());
    runtime.registerAdapter(["acme"], adapter);

    const resolved = await runtime.resolveCallConfig({ provider: "acme", model: "acme-think" });
    expect(String(resolved.reasoningEffort)).toBe("high");
  });

  test("leaves a model without a default unchanged", async () => {
    const adapter = adapterFor({ providers: { acme: baseProvider } });
    const model = await adapter.resolveModel("acme", "acme-chat");
    expect(model.reasoning).toBeUndefined();
  });

  test("rejects a default the model does not advertise", async () => {
    const provider = structuredClone(baseProvider) as CustomProviderProfile;
    provider.models[0]!.defaultReasoningEffort = "medium";
    const adapter = adapterFor({ providers: { acme: provider } });

    await expect(adapter.resolveModel("acme", "acme-think")).rejects.toThrow(
      "defaultReasoningEffort 'medium'",
    );
  });

  test("rejects invalid credential references while normalizing", () => {
    const provider = structuredClone(baseProvider) as CustomProviderProfile;
    provider.apiKeyEnv = "not-a-shell-variable";
    expect(() => normalizeConfig({ providers: { acme: provider } })).toThrow();
  });

  test("rejects an unknown default while normalizing", () => {
    const provider = structuredClone(baseProvider) as unknown as Record<string, unknown>;
    const models = provider.models as Array<Record<string, unknown>>;
    models[0]!.defaultReasoningEffort = "turbo";

    expect(() => normalizeConfig({ providers: { acme: provider as never } })).toThrow(
      "invalid defaultReasoningEffort",
    );
  });

  test("rejects unknown reasoning effort keys", () => {
    const provider = structuredClone(baseProvider) as unknown as Record<string, unknown>;
    const models = provider.models as Array<Record<string, unknown>>;
    models[0]!.reasoningEfforts = { high: "high", turbo: "turbo" };

    expect(() => normalizeConfig({ providers: { acme: provider as never } })).toThrow(
      "unknown reasoning effort 'turbo'",
    );
  });

  test("maps a DSH effort to a provider-specific wire spelling", () => {
    const normalized = normalizeConfig({ providers: { acme: baseProvider } });
    const model = normalized.profiles.get("acme")?.piProvider
      .getModels()
      .find((candidate) => candidate.id === "acme-think");

    expect(model?.thinkingLevelMap?.max).toBe("ultra");
    expect(model?.thinkingLevelMap?.medium).toBeNull();
    expect(model?.thinkingLevelMap?.off).toBeUndefined();
  });
});
