import type { Effort, EffortMap } from "./types.js";

export function defaultWire(effort: Effort): string | null {
  return effort === "off" ? null : effort;
}

export function isCustomWire(effort: Effort, value: string | null | undefined): boolean {
  if (value === undefined) return false;
  if (effort === "off") return value !== null && value !== "";
  return value !== effort && value !== "" && value !== null;
}

export function parseWireInput(effort: Effort, value: string): string | null {
  const trimmed = value.trim();
  if (effort === "off") return trimmed === "" ? null : trimmed;
  return trimmed === "" ? effort : trimmed;
}

export function enableEffort(map: EffortMap, effort: Effort): EffortMap {
  return { ...map, [effort]: defaultWire(effort) };
}

export function disableEffort(map: EffortMap, effort: Effort): EffortMap {
  const next = { ...map };
  delete next[effort];
  return next;
}

export function setEffortWire(map: EffortMap, effort: Effort, value: string): EffortMap {
  return {
    ...map,
    [effort]: effort === "off" && value === "" ? null : value,
  };
}

export function normalizeEffortMap(map: EffortMap): EffortMap {
  const next: EffortMap = {};
  for (const [effort, value] of Object.entries(map) as Array<[Effort, string | null | undefined]>) {
    if (value === undefined) continue;
    next[effort] = parseWireInput(effort, value ?? "");
  }
  return next;
}

export function customEffortCount(map: EffortMap): number {
  return (Object.entries(map) as Array<[Effort, string | null | undefined]>)
    .filter(([effort, value]) => isCustomWire(effort, value))
    .length;
}
