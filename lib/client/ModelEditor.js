import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { Pill } from "@deepseek-ai/dsh-client-ui-primitives";
import { validationKey } from "./locales.js";
import { customEffortCount, defaultWire, disableEffort, enableEffort, isCustomWire, setEffortWire, } from "./reasoning.js";
import { EFFORTS, THINKING_FORMATS, } from "./types.js";
function Field({ label, error, children, }) {
    return _jsxs("label", { className: "cm-model-field", children: [_jsx("span", { className: "cm-model-field-label", children: label }), children, error ? _jsx("span", { className: "cm-error", children: error }) : null] });
}
function IconChevron({ open }) {
    return _jsx("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, style: { transform: open ? "rotate(90deg)" : undefined, transition: "transform 120ms ease" }, children: _jsx("path", { d: "M6 3.5L10.5 8L6 12.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
function IconTrash() {
    return _jsx("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: _jsx("path", { d: "M2.5 4h11M6.5 4V2.5h3V4M4 4l.7 9a1 1 0 001 .9h4.6a1 1 0 001-.9L12 4M6.5 6.8v4.4M9.5 6.8v4.4", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
export function ModelEditor({ model, index, api, disabled, expanded, errors, t, onChange, onToggle, onRemove, }) {
    const path = "models." + index;
    const hasErrors = Object.keys(errors).some((key) => key === path || key.startsWith(path + "."));
    useEffect(() => {
        if (hasErrors && !expanded)
            onToggle();
    }, [hasErrors]);
    const message = (suffix) => {
        const key = validationKey(errors[path + suffix]);
        return key === undefined ? undefined : t(key);
    };
    const update = (change) => {
        const next = structuredClone(model);
        change(next);
        onChange(next);
    };
    const efforts = model.reasoningEfforts;
    const overrideErrors = efforts === false
        ? []
        : EFFORTS.filter((effort) => message(".reasoningEfforts." + effort) !== undefined);
    const overrideCount = efforts === false ? 0 : customEffortCount(efforts);
    const [overrideOpen, setOverrideOpen] = useState(overrideCount > 0);
    const showOverrides = overrideOpen || overrideErrors.length > 0;
    useEffect(() => {
        if (overrideErrors.length > 0)
            setOverrideOpen(true);
    }, [overrideErrors.length]);
    return _jsxs("div", { className: "cm-model-entry", children: [_jsxs("div", { className: "cm-model-row", children: [_jsx("input", { className: "cm-input", value: model.id, placeholder: t("modelId"), "aria-label": t("modelId") + " " + (index + 1), disabled: disabled, onChange: (event) => update((draft) => { draft.id = event.target.value; }) }), _jsx("input", { className: "cm-input", value: model.name, placeholder: t("modelNamePlaceholder"), "aria-label": t("modelName") + " " + (index + 1), disabled: disabled, onChange: (event) => update((draft) => { draft.name = event.target.value; }) }), _jsx("button", { type: "button", className: "cm-icon", "aria-label": t("modelAdvanced") + " " + (index + 1), "aria-expanded": expanded, title: t("modelAdvanced"), onClick: onToggle, children: _jsx(IconChevron, { open: expanded }) }), _jsx("button", { type: "button", className: "cm-icon cm-icon-danger", "aria-label": t("removeModel") + " " + (index + 1), title: t("removeModel"), disabled: disabled, onClick: onRemove, children: _jsx(IconTrash, {}) })] }), expanded ? _jsxs("div", { className: "cm-model-advanced", children: [_jsx(Field, { label: t("contextWindow"), error: message(".contextWindow"), children: _jsx("input", { className: "cm-input", inputMode: "numeric", value: model.contextWindow, placeholder: "256K", "aria-label": t("contextWindow") + " " + (index + 1), disabled: disabled, onChange: (event) => update((draft) => { draft.contextWindow = event.target.value; }) }) }), _jsx(Field, { label: t("maxTokens"), error: message(".maxTokens"), children: _jsx("input", { className: "cm-input", inputMode: "numeric", value: model.maxTokens, placeholder: "32K", "aria-label": t("maxTokens") + " " + (index + 1), disabled: disabled, onChange: (event) => update((draft) => { draft.maxTokens = event.target.value; }) }) }), _jsxs("div", { className: "cm-model-extra cm-row-checks", children: [_jsxs("label", { className: "cm-check", children: [_jsx("input", { type: "checkbox", checked: model.input.text, disabled: disabled, onChange: (event) => update((draft) => { draft.input.text = event.target.checked; }) }), t("text")] }), _jsxs("label", { className: "cm-check", children: [_jsx("input", { type: "checkbox", checked: model.input.image, disabled: disabled, onChange: (event) => update((draft) => { draft.input.image = event.target.checked; }) }), t("image")] }), message(".input") ? _jsx("span", { className: "cm-error", children: message(".input") }) : null] }), _jsxs("label", { className: "cm-model-extra cm-check", children: [_jsx("input", { type: "checkbox", checked: efforts !== false, disabled: disabled, onChange: (event) => update((draft) => {
                                    draft.reasoningEfforts = event.target.checked ? {} : false;
                                    if (!event.target.checked)
                                        draft.defaultReasoningEffort = "";
                                }) }), t("reasoning")] }), efforts !== false ? _jsxs(_Fragment, { children: [_jsxs("div", { className: "cm-model-extra cm-effort-block", children: [_jsx("div", { className: "cm-effort-label", children: t("efforts") }), _jsx("div", { className: "cm-effort-pills", role: "group", "aria-label": t("efforts"), children: EFFORTS.map((effort) => {
                                            const enabled = Object.hasOwn(efforts, effort);
                                            const custom = enabled && isCustomWire(effort, efforts[effort]);
                                            return _jsxs(Pill, { type: "button", active: enabled, disabled: disabled, "aria-pressed": enabled, className: custom ? "cm-effort-custom" : undefined, title: custom ? t("customWireHint").replace("{effort}", effort).replace("{value}", String(efforts[effort])) : undefined, onClick: () => update((draft) => {
                                                    if (draft.reasoningEfforts === false)
                                                        return;
                                                    if (Object.hasOwn(draft.reasoningEfforts, effort)) {
                                                        draft.reasoningEfforts = disableEffort(draft.reasoningEfforts, effort);
                                                        if (draft.defaultReasoningEffort === effort)
                                                            draft.defaultReasoningEffort = "";
                                                    }
                                                    else {
                                                        draft.reasoningEfforts = enableEffort(draft.reasoningEfforts, effort);
                                                    }
                                                }), children: [effort, custom ? _jsxs("span", { className: "cm-effort-wire", children: ["\u2192 ", String(efforts[effort])] }) : null] }, effort);
                                        }) }), _jsx("p", { className: "cm-effort-hint", children: t("effortHint") }), message(".reasoningEfforts") ? _jsx("p", { className: "cm-error", children: message(".reasoningEfforts") }) : null] }), _jsx(Field, { label: t("defaultEffort"), error: message(".defaultReasoningEffort"), children: _jsxs("select", { className: "cm-input cm-select", value: model.defaultReasoningEffort, disabled: disabled, onChange: (event) => update((draft) => {
                                        draft.defaultReasoningEffort = event.target.value;
                                    }), children: [_jsx("option", { value: "", children: t("inherit") }), EFFORTS.filter((effort) => Object.hasOwn(efforts, effort)).map((effort) => _jsx("option", { value: effort, children: effort }, effort))] }) }), Object.keys(efforts).length > 0 ? _jsxs("div", { className: "cm-model-extra cm-override", children: [_jsxs("button", { type: "button", className: "cm-override-toggle", "aria-expanded": showOverrides, disabled: disabled, onClick: () => setOverrideOpen((value) => !value), children: [_jsx(IconChevron, { open: showOverrides }), t("overrideWires"), overrideCount > 0 ? _jsx("span", { className: "cm-override-count", children: t("overrideCount").replace("{count}", String(overrideCount)) }) : null] }), showOverrides ? _jsxs("div", { className: "cm-override-list", children: [_jsx("p", { className: "cm-override-hint", children: t("overrideHint") }), EFFORTS.filter((effort) => Object.hasOwn(efforts, effort)).map((effort) => {
                                                const error = message(".reasoningEfforts." + effort);
                                                const value = efforts[effort];
                                                return _jsx(Field, { label: effort === "off" ? t("offWire") : t("wireFor").replace("{effort}", effort), error: error, children: _jsx("input", { className: "cm-input", "aria-label": effort + " " + t("wireValue"), placeholder: effort === "off" ? t("offOmit") : String(defaultWire(effort)), value: value ?? "", disabled: disabled, onChange: (event) => update((draft) => {
                                                            if (draft.reasoningEfforts === false)
                                                                return;
                                                            draft.reasoningEfforts = setEffortWire(draft.reasoningEfforts, effort, event.target.value);
                                                        }) }) }, effort);
                                            })] }) : null] }) : null] }) : null, api === "openai-completions" ? _jsxs(_Fragment, { children: [_jsx(Field, { label: t("thinkingFormat"), children: _jsxs("select", { className: "cm-input cm-select", value: model.compat.thinkingFormat, disabled: disabled, onChange: (event) => update((draft) => {
                                        draft.compat.thinkingFormat = event.target.value;
                                    }), children: [_jsx("option", { value: "", children: t("inherit") }), THINKING_FORMATS.map((format) => _jsx("option", { value: format, children: format }, format))] }) }), _jsx(Field, { label: t("supportsReasoningEffort"), children: _jsxs("select", { className: "cm-input cm-select", value: model.compat.supportsReasoningEffort, disabled: disabled, onChange: (event) => update((draft) => {
                                        draft.compat.supportsReasoningEffort = event.target.value;
                                    }), children: [_jsx("option", { value: "", children: t("inherit") }), _jsx("option", { value: "true", children: "true" }), _jsx("option", { value: "false", children: "false" })] }) })] }) : null] }) : null] });
}
//# sourceMappingURL=ModelEditor.js.map