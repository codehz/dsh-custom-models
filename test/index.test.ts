import { describe, expect, test } from "bun:test";
import { Context } from "@deepseek-ai/cordis";
import { LlmRuntime } from "@deepseek-ai/dsh-llm";
import { SettingsProvider, type SettingsNamespace } from "@deepseek-ai/dsh-settings";
import {
  Config as ConfigSchema,
  PerModelReasoningPiAiAdapter,
  apply,
  discoverModels,
  inject,
  listingUrl,
  normalizeConfig,
  readListing,
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

class MemorySettings extends SettingsProvider {
  readonly writable = true;

  protected async load(): Promise<Record<string, unknown>> {
    return {};
  }

  protected async persist(_ns: SettingsNamespace, _section: Record<string, unknown>): Promise<void> {}
}

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

describe("settings namespace exposure", () => {
  test("publishes a bootstrap configurable-provider row with no providers", async () => {
    const ctx = new Context();
    await ctx.plugin(LlmRuntime);
    await ctx.plugin(MemorySettings);
    await ctx.plugin({ apply, inject }, { providers: {} });

    expect(ctx.llm.listConfigurableProviders()).toContainEqual({
      provider: "custom-models",
      displayName: "Custom models",
      settingsNs: "custom-models",
      settingsPath: ["providers", "custom-models"],
      declared: true,
    });
    expect(ctx.settings.describe().map((entry) => String(entry.ns))).toContain("custom-models");
    await ctx.fiber.dispose();
  });

  test("registers OpenAI-compatible model discovery for the settings namespace", async () => {
    const ctx = new Context();
    await ctx.plugin(LlmRuntime);
    await ctx.plugin(MemorySettings);
    await ctx.plugin({ apply, inject }, { providers: {} });

    const original = globalThis.fetch;
    globalThis.fetch = (async () => new Response(JSON.stringify({
      data: [{ id: "remote-chat", name: "Remote Chat", context_window: 128000 }],
    }), { status: 200 })) as unknown as typeof fetch;
    try {
      await expect(ctx.llm.discoverModels("custom-models", {
        baseURL: "https://gateway.example/v1",
        api: "openai-completions",
      })).resolves.toEqual([
        { id: "remote-chat", name: "Remote Chat", contextWindow: 128000 },
      ]);
    } finally {
      globalThis.fetch = original;
      await ctx.fiber.dispose();
    }
  });
});

describe("openai model listing", () => {
  test("joins the listing path without collapsing a gateway prefix", () => {
    expect(listingUrl("https://gateway.example/openai/v1/")).toBe(
      "https://gateway.example/openai/v1/models",
    );
  });

  test("reads ids and optional capacities from a standard listing", () => {
    expect(readListing({
      data: [
        { id: "plain" },
        { id: "", name: "ignored" },
        {
          id: "think",
          display_name: "Think",
          context_length: 256000,
          max_output_tokens: 8192,
        },
      ],
    })).toEqual([
      { id: "plain" },
      { id: "think", name: "Think", contextWindow: 256000, maxTokens: 8192 },
    ]);
  });

  test("rejects a reply that is not an OpenAI listing", () => {
    expect(() => readListing({ models: [{ id: "x" }] })).toThrow('no "data" array');
  });

  test("surfaces HTTP failures from GET /models", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () => new Response("nope", { status: 401 })) as unknown as typeof fetch;
    try {
      await expect(discoverModels({
        baseURL: "https://gateway.example/v1",
      })).rejects.toThrow("answered 401; check the API key");
    } finally {
      globalThis.fetch = original;
    }
  });
});

describe("runtime configuration schema", () => {
  test("defaults an omitted providers dictionary", () => {
    expect(ConfigSchema({})).toEqual({ providers: {} });
  });

  test("rejects malformed model capacities before normalization", () => {
    expect(() => ConfigSchema({
      providers: {
        acme: {
          baseURL: "https://gateway.example/v1",
          models: [{ id: "broken", contextWindow: 0 }],
        },
      },
    })).toThrow();
  });

  test("keeps omitted model input and compat semantically absent", async () => {
    const parsed = ConfigSchema({
      providers: {
        acme: {
          api: "openai-responses",
          baseURL: "https://gateway.example/v1",
          models: [{ id: "plain" }],
        },
      },
    });
    const normalized = normalizeConfig(parsed);
    const adapter = new PerModelReasoningPiAiAdapter(
      {
        profiles: () => normalized.profiles,
        resolveApiKey: async () => undefined,
      },
      normalized.defaults,
    );

    expect((await adapter.resolveModel("acme", "plain")).inputModalities).toEqual(["text"]);
  });
});

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

  test("reads per-model defaults from a replaceable snapshot", async () => {
    const normalized = normalizeConfig({ providers: { acme: baseProvider } });
    let defaults = normalized.defaults;
    const adapter = new PerModelReasoningPiAiAdapter(
      {
        profiles: () => normalized.profiles,
        resolveApiKey: async () => undefined,
      },
      () => defaults,
    );

    expect(String((await adapter.resolveModel("acme", "acme-think")).reasoning?.defaultEffort)).toBe("high");
    defaults = new Map();
    expect((await adapter.resolveModel("acme", "acme-think")).reasoning?.defaultEffort).toBeUndefined();
  });

  test("rejects a default the model does not advertise while normalizing", () => {
    const provider = structuredClone(baseProvider) as CustomProviderProfile;
    provider.models[0]!.defaultReasoningEffort = "medium";

    expect(() => normalizeConfig({ providers: { acme: provider } })).toThrow(
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
    const model = normalized.profiles.get("acme")?.modelsById.get("acme-think");

    expect(model?.thinkingLevelMap?.max).toBe("ultra");
    expect(model?.thinkingLevelMap?.medium).toBeNull();
    expect(model?.thinkingLevelMap?.off).toBeUndefined();
  });
});
