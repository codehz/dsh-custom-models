import type { ProviderDraft } from "./types.js";

export type DraftChange<T> = (value: T) => void;

export function updateDraft<T>(
  current: T,
  change: DraftChange<T>,
): T {
  const next = structuredClone(current);
  change(next);
  return next;
}

export function parseHeaders(value: string): ProviderDraft["headers"] {
  return value.split("\n").filter(Boolean).map((line) => {
    const separator = line.indexOf(":");
    return separator < 0
      ? { key: line.trim(), value: "" }
      : { key: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() };
  });
}

export function serializeHeaders(headers: ProviderDraft["headers"]): string {
  return headers.map(({ key, value }) => key + ": " + value).join("\n");
}
