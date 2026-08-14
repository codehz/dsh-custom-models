import type { Effort, EffortMap } from "./types.js";
export declare function defaultWire(effort: Effort): string | null;
export declare function isCustomWire(effort: Effort, value: string | null | undefined): boolean;
export declare function parseWireInput(effort: Effort, value: string): string | null;
export declare function enableEffort(map: EffortMap, effort: Effort): EffortMap;
export declare function disableEffort(map: EffortMap, effort: Effort): EffortMap;
export declare function setEffortWire(map: EffortMap, effort: Effort, value: string): EffortMap;
export declare function normalizeEffortMap(map: EffortMap): EffortMap;
export declare function customEffortCount(map: EffortMap): number;
//# sourceMappingURL=reasoning.d.ts.map