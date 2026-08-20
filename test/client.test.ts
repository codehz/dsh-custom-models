import { describe, expect, test } from "bun:test";
import { Config as ConfigSchema, normalizeConfig, type CustomProviderProfile } from "../src/index.js";
import { adoptDiscoveredModels, moveModel, providerFromValue, providerToValue } from "../src/client/model-utils.js";
import {
  customEffortCount,
  enableEffort,
  isCustomWire,
  normalizeEffortMap,
} from "../src/client/reasoning.js";
import { formatCapacity, parseCapacity } from "../src/client/capacity.js";
import { emptyProvider } from "../src/client/types.js";
import { deriveKeyRef, validateProviderDraft } from "../src/client/validation.js";

describe("client provider editor", () => {
  test("derives a stable dedicated credential reference", () => {
    expect(deriveKeyRef("acme-gateway")).toBe("ACME_GATEWAY_API_KEY");
    expect(deriveKeyRef("acme", " SHARED_KEY ")).toBe("SHARED_KEY");
  });

  test("treats same-name wires as identity and off null as default", () => {
    expect(isCustomWire("high", "high")).toBe(false);
    expect(isCustomWire("high", "")).toBe(false);
    expect(isCustomWire("high", "ultra")).toBe(true);
    expect(isCustomWire("off", null)).toBe(false);
    expect(isCustomWire("off", "")).toBe(false);
    expect(isCustomWire("off", "off")).toBe(true);
    expect(normalizeEffortMap({ off: "", high: "  ", max: "ultra" })).toEqual({
      off: null,
      high: "high",
      max: "ultra",
    });
  });

  test("accepts off null and validates defaults by key presence", () => {
    const draft = emptyProvider();
    draft.route = "acme";
    draft.baseURL = "https://gateway.example/v1";
    draft.models[0]!.id = "thinking";
    draft.models[0]!.reasoningEfforts = { off: null, high: "ultra" };
    draft.models[0]!.defaultReasoningEffort = "off";

    expect(validateProviderDraft(draft)).toEqual({ valid: true, errors: {} });
    delete draft.models[0]!.reasoningEfforts.off;
    expect(validateProviderDraft(draft).errors["models.0.defaultReasoningEffort"]).toBe("defaultInvalid");
  });

  test("serializes every retry and reasoning field into a valid host config", () => {
    const draft = emptyProvider();
    draft.route = "acme";
    draft.baseURL = "https://gateway.example/v1";
    draft.retryPolicy = {
      mode: "normal",
      maxRetries: "0",
      retryableCodes: "RATE_LIMIT, SERVER_ERROR",
      initialDelayMs: "250",
      maxDelayMs: "5000",
      jitterRatio: "0.2",
    };
    draft.models[0]!.id = "thinking";
    draft.models[0]!.reasoningEfforts = { off: null, high: "ultra" };
    draft.models[0]!.defaultReasoningEffort = "high";

    const profile = providerToValue({ ...draft, apiKeyEnv: deriveKeyRef(draft.route) });
    const parsed = ConfigSchema({ providers: { acme: profile as unknown as CustomProviderProfile } });
    expect(() => normalizeConfig(parsed)).not.toThrow();
    expect((profile.retryPolicy as { backoff: object }).backoff).toEqual({
      initialDelayMs: 250,
      maxDelayMs: 5000,
      jitterRatio: 0.2,
    });
  });

  test("defaults selected efforts to same-name wire values", () => {
    const draft = emptyProvider();
    draft.route = "acme";
    draft.baseURL = "https://gateway.example/v1";
    draft.models[0]!.id = "thinking";
    draft.models[0]!.reasoningEfforts = enableEffort({}, "high");

    expect(draft.models[0]!.reasoningEfforts).toEqual({ high: "high" });
    expect(validateProviderDraft(draft)).toEqual({ valid: true, errors: {} });
    const profile = providerToValue({ ...draft, apiKeyEnv: deriveKeyRef(draft.route) });
    expect(profile.models).toEqual([
      expect.objectContaining({ reasoningEfforts: { high: "high" } }),
    ]);
    expect(() => normalizeConfig({
      providers: { acme: profile as unknown as CustomProviderProfile },
    })).not.toThrow();
  });

  test("normalizes blank overrides back to identity values", () => {
    const draft = emptyProvider();
    draft.route = "acme";
    draft.baseURL = "https://gateway.example/v1";
    draft.models[0]!.id = "thinking";
    draft.models[0]!.reasoningEfforts = { off: "", high: "  ", max: "ultra" };

    expect(validateProviderDraft(draft)).toEqual({ valid: true, errors: {} });
    const efforts = normalizeEffortMap(draft.models[0]!.reasoningEfforts);
    expect(providerToValue(draft).models).toEqual([
      expect.objectContaining({ reasoningEfforts: { off: null, high: "high", max: "ultra" } }),
    ]);
    expect(efforts).toEqual({ off: null, high: "high", max: "ultra" });
    expect(customEffortCount(efforts)).toBe(1);
  });

  test("accepts K/M capacity spellings and formats them back", () => {
    expect(parseCapacity("1M")).toBe(1_000_000);
    expect(parseCapacity("256K")).toBe(256_000);
    expect(formatCapacity(1_000_000)).toBe("1M");
    expect(formatCapacity(256_000)).toBe("256K");

    const draft = emptyProvider();
    draft.route = "acme";
    draft.baseURL = "https://gateway.example/v1";
    draft.models[0]!.id = "plain";
    draft.models[0]!.contextWindow = "1M";
    draft.models[0]!.maxTokens = "256K";

    expect(validateProviderDraft(draft)).toEqual({ valid: true, errors: {} });
    expect(providerToValue(draft).models).toEqual([
      expect.objectContaining({ contextWindow: 1_000_000, maxTokens: 256_000 }),
    ]);
    expect(providerFromValue("acme", {
      baseURL: "https://gateway.example/v1",
      models: [{ id: "plain", contextWindow: 1_000_000, maxTokens: 256_000 }],
    }).models[0]).toEqual(expect.objectContaining({
      contextWindow: "1M",
      maxTokens: "256K",
    }));
  });

  test("adopts discovered models without clobbering existing rows", () => {
    const draft = emptyProvider();
    draft.models[0]!.id = "keep";
    draft.models[0]!.name = "Kept";
    draft.models.push(emptyProvider().models[0]!);

    const adopted = adoptDiscoveredModels(
      draft.models,
      [
        { id: "keep", name: "Remote Keep", contextWindow: 1000 },
        { id: "new", name: "New", contextWindow: 256_000, maxTokens: 32_000 },
        { id: "skip" },
      ],
      new Set(["keep", "new"]),
    );

    expect(adopted).toEqual([
      expect.objectContaining({ id: "keep", name: "Kept" }),
      expect.objectContaining({ id: "new", name: "New", contextWindow: "256K", maxTokens: "32K" }),
    ]);
  });

  test("moves model rows without mutating the original order", () => {
    const draft = emptyProvider();
    draft.models[0]!.id = "first";
    draft.models.push({ ...emptyProvider().models[0]!, id: "second" });
    draft.models.push({ ...emptyProvider().models[0]!, id: "third" });

    expect(moveModel(draft.models, 0, 2).map((model) => model.id)).toEqual(["second", "third", "first"]);
    expect(draft.models.map((model) => model.id)).toEqual(["first", "second", "third"]);
  });

  test("treats schema-materialized empty input as inherited text", () => {
    const parsed = ConfigSchema({
      providers: {
        acme: {
          baseURL: "https://gateway.example/v1",
          models: [{ id: "plain" }],
        },
      },
    });
    const draft = providerFromValue("acme", parsed.providers?.acme);
    expect(draft.models[0]?.input).toEqual({ text: true, image: false });
    expect(draft.models[0]?.reasoningEfforts).toBe(false);
  });
});
