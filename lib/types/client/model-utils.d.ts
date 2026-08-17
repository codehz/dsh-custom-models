import { type ModelDraft, type ProviderDraft } from "./types.js";
export interface DiscoveredModel {
    id: string;
    name?: string;
    contextWindow?: number;
    maxTokens?: number;
}
export declare function modelFromDiscovered(candidate: DiscoveredModel): ModelDraft;
/** Merge picked listing rows into the draft catalog, keeping existing edits. */
export declare function adoptDiscoveredModels(models: readonly ModelDraft[], candidates: readonly DiscoveredModel[], picked: ReadonlySet<string>): ModelDraft[];
export declare function providersOf(layer: unknown): Record<string, unknown>;
export declare function providerFromValue(route: string, value: unknown): ProviderDraft;
export declare function providerToValue(draft: ProviderDraft): Record<string, unknown>;
//# sourceMappingURL=model-utils.d.ts.map