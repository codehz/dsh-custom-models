import { type LlmDiscoveredModel, type LlmModelDiscoveryRequest } from "@deepseek-ai/dsh-llm";
export declare function listingUrl(baseURL: string): string;
/** Read one OpenAI-compatible `GET /models` reply. */
export declare function readListing(body: unknown): LlmDiscoveredModel[];
/**
 * Interrogate one draft provider endpoint via the OpenAI-compatible
 * `GET {baseURL}/models` listing.
 */
export declare function discoverModels(request: LlmModelDiscoveryRequest, storedApiKey?: () => Promise<string | undefined>, extraHeaders?: Record<string, string>): Promise<readonly LlmDiscoveredModel[]>;
//# sourceMappingURL=discovery.d.ts.map