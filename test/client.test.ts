import { describe, expect, test } from "bun:test";
import { Config as ConfigSchema, normalizeConfig, type CustomProviderProfile } from "../src/index.js";
import { providerFromValue, providerToValue } from "../src/client/model-utils.js";
import {
  customEffortCount,
  enableEffort,
  isCustomWire,
  normalizeEffortMap,
} from "../src/client/reasoning.js";
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
