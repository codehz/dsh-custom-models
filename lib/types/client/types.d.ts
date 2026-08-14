export type ApiKind = "openai-completions" | "openai-responses";
export type Effort = "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
export type ThinkingFormat = "openai" | "deepseek" | "openrouter" | "together" | "zai" | "qwen" | "string-thinking" | "ant-ling";
export type EffortMap = Partial<Record<Effort, string | null>>;
export interface CompatDraft {
    thinkingFormat: ThinkingFormat | "";
    supportsReasoningEffort: "" | "true" | "false";
}
export interface ModelDraft {
    id: string;
    name: string;
    contextWindow: string;
    maxTokens: string;
    input: {
        text: boolean;
        image: boolean;
    };
    reasoningEfforts: false | EffortMap;
    defaultReasoningEffort: Effort | "";
    compat: CompatDraft;
}
export interface ProviderDraft {
    route: string;
    displayName: string;
    apiKeyEnv: string;
    api: ApiKind;
    baseURL: string;
    headers: Array<{
        key: string;
        value: string;
    }>;
    compat: CompatDraft;
    streamIdleTimeoutMs: string;
    retryPolicy: {
        mode: "" | "normal" | "always";
        maxRetries: string;
        retryableCodes: string;
        initialDelayMs: string;
        maxDelayMs: string;
        jitterRatio: string;
    };
    models: ModelDraft[];
}
export interface ValidationResult {
    valid: boolean;
    errors: Record<string, string>;
}
export declare const EFFORTS: readonly Effort[];
export declare const THINKING_FORMATS: readonly ThinkingFormat[];
export declare function emptyCompat(): CompatDraft;
export declare function emptyModel(): ModelDraft;
export declare function emptyProvider(): ProviderDraft;
//# sourceMappingURL=types.d.ts.map