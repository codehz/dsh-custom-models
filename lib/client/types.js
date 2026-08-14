export const EFFORTS = [
    "off", "minimal", "low", "medium", "high", "xhigh", "max",
];
export const THINKING_FORMATS = [
    "openai", "deepseek", "openrouter", "together", "zai", "qwen",
    "string-thinking", "ant-ling",
];
export function emptyCompat() {
    return { thinkingFormat: "", supportsReasoningEffort: "" };
}
export function emptyModel() {
    return {
        id: "",
        name: "",
        contextWindow: "",
        maxTokens: "",
        input: { text: true, image: false },
        reasoningEfforts: false,
        defaultReasoningEffort: "",
        compat: emptyCompat(),
    };
}
export function emptyProvider() {
    return {
        route: "",
        displayName: "",
        apiKeyEnv: "",
        api: "openai-completions",
        baseURL: "",
        headers: [],
        compat: emptyCompat(),
        streamIdleTimeoutMs: "",
        retryPolicy: {
            mode: "",
            maxRetries: "",
            retryableCodes: "",
            initialDelayMs: "",
            maxDelayMs: "",
            jitterRatio: "",
        },
        models: [emptyModel()],
    };
}
//# sourceMappingURL=types.js.map