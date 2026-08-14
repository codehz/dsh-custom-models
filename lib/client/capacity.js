const CAPACITY_PATTERN = /^(\d+(?:\.\d+)?)([km])?$/i;
const CAPACITY_SCALE = { k: 1_000, m: 1_000_000 };
export function parseCapacity(text) {
    const trimmed = text.trim();
    if (trimmed.length === 0)
        return undefined;
    const match = CAPACITY_PATTERN.exec(trimmed);
    if (match === null)
        return Number.NaN;
    const suffix = match[2]?.toLowerCase();
    const scale = suffix === "k" || suffix === "m" ? CAPACITY_SCALE[suffix] : 1;
    const scaled = Number(match[1]) * scale;
    const rounded = Math.round(scaled);
    return Math.abs(scaled - rounded) < 1e-6 ? rounded : scaled;
}
export function formatCapacity(value) {
    if (!Number.isInteger(value) || value <= 0)
        return String(value);
    if (value % CAPACITY_SCALE.m === 0)
        return String(value / CAPACITY_SCALE.m) + "M";
    if (value % CAPACITY_SCALE.k === 0)
        return String(value / CAPACITY_SCALE.k) + "K";
    return String(value);
}
export function capacityText(value) {
    return typeof value === "number" && Number.isFinite(value) ? formatCapacity(value) : "";
}
export function isPositiveCapacity(value) {
    const parsed = parseCapacity(value);
    if (parsed === undefined)
        return value.trim() === "";
    return Number.isInteger(parsed) && parsed > 0 && Number.isSafeInteger(parsed);
}
export function numericCapacity(value) {
    const parsed = parseCapacity(value);
    return parsed !== undefined && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
//# sourceMappingURL=capacity.js.map