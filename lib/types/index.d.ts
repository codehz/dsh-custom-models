import type { Context } from "@deepseek-ai/cordis";
import z from "@deepseek-ai/schemastery";
import { type LlmResolvedModelInfo, type RetryPolicyConfig } from "@deepseek-ai/dsh-llm";
import { PiAiAdapter, type PiAiAdapterOptions, type PiAiCompatProfile, type ResolvedPiAiProviderProfile } from "@deepseek-ai/dsh-llm-pi-ai";
import { type ModelThinkingLevel } from "@earendil-works/pi-ai";
declare const SUPPORTED_APIS: readonly ["openai-completions", "openai-responses"];
type SupportedApi = (typeof SUPPORTED_APIS)[number];
type ModelDefaults = ReadonlyMap<string, ReadonlyMap<string, ModelThinkingLevel>>;
export type ReasoningEfforts = Partial<Record<ModelThinkingLevel, string | null>>;
export interface CustomModelProfile {
    id: string;
    name?: string;
    contextWindow?: number;
    maxTokens?: number;
    input?: Array<"text" | "image">;
    reasoningEfforts?: false | ReasoningEfforts;
    defaultReasoningEffort?: ModelThinkingLevel;
    compat?: PiAiCompatProfile;
}
export interface CustomProviderProfile {
    displayName?: string;
    apiKeyEnv?: string;
    api?: SupportedApi;
    baseURL: string;
    headers?: Record<string, string>;
    compat?: PiAiCompatProfile;
    streamIdleTimeoutMs?: number;
    retryPolicy?: RetryPolicyConfig;
    models: CustomModelProfile[];
}
export interface Config {
    providers?: Record<string, CustomProviderProfile>;
}
/** Runtime schema used by Cordis and the DSH settings surface. */
export declare const Config: z<Config>;
export interface NormalizedConfig {
    profiles: ReadonlyMap<string, ResolvedPiAiProviderProfile>;
    defaults: ModelDefaults;
}
/** Validate configuration and construct public pi-ai providers without private DSH imports. */
export declare function normalizeConfig(config?: Config): NormalizedConfig;
/** Official pi-ai transport with exact-model defaults layered into metadata. */
export declare class PerModelReasoningPiAiAdapter extends PiAiAdapter {
    #private;
    constructor(options: PiAiAdapterOptions, defaults: ModelDefaults | (() => ModelDefaults));
    resolveModel(provider: string, model: string, signal?: AbortSignal): Promise<LlmResolvedModelInfo>;
}
export { discoverModels, listingUrl, readListing } from "./discovery.js";
export declare const name = "custom-models";
export declare const inject: string[];
export declare function apply(ctx: Context, config?: Config): void;
//# sourceMappingURL=index.d.ts.map