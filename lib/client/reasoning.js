export function defaultWire(effort) {
    return effort === "off" ? null : effort;
}
export function isCustomWire(effort, value) {
    if (value === undefined)
        return false;
    if (effort === "off")
        return value !== null && value !== "";
    return value !== effort && value !== "" && value !== null;
}
export function parseWireInput(effort, value) {
    const trimmed = value.trim();
    if (effort === "off")
        return trimmed === "" ? null : trimmed;
    return trimmed === "" ? effort : trimmed;
}
export function enableEffort(map, effort) {
    return { ...map, [effort]: defaultWire(effort) };
}
export function disableEffort(map, effort) {
    const next = { ...map };
    delete next[effort];
    return next;
}
export function setEffortWire(map, effort, value) {
    return {
        ...map,
        [effort]: effort === "off" && value === "" ? null : value,
    };
}
export function normalizeEffortMap(map) {
    const next = {};
    for (const [effort, value] of Object.entries(map)) {
        if (value === undefined)
            continue;
        next[effort] = parseWireInput(effort, value ?? "");
    }
    return next;
}
export function customEffortCount(map) {
    return Object.entries(map)
        .filter(([effort, value]) => isCustomWire(effort, value))
        .length;
}
//# sourceMappingURL=reasoning.js.map