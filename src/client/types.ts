export type ApiKind = "openai-completions" | "openai-responses" | "messages" | "ollama" | "gemini";
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
  input: { text: boolean; image: boolean };
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
  headers: Array<{ key: string; value: string }>;
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

export const EFFORTS: readonly Effort[] = [
  "off", "minimal", "low", "medium", "high", "xhigh", "max",
];
export const THINKING_FORMATS: readonly ThinkingFormat[] = [
  "openai", "deepseek", "openrouter", "together", "zai", "qwen",
  "string-thinking", "ant-ling",
];

export function emptyCompat(): CompatDraft {
  return { thinkingFormat: "", supportsReasoningEffort: "" };
}

export function emptyModel(): ModelDraft {
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

export function emptyProvider(): ProviderDraft {
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
