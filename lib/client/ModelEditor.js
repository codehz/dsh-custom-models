import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { Button, Input } from "@deepseek-ai/dsh-client-ui-primitives";
import { validationKey } from "./locales.js";
import { EFFORTS, THINKING_FORMATS, } from "./types.js";
function Field({ label, error, children, wide, }) {
    return _jsxs("label", { className: "cm-field" + (wide ? " cm-wide" : ""), children: [_jsx("span", { children: label }), children, error ? _jsx("span", { className: "cm-error", children: error }) : null] });
}
export function ModelEditor({ model, index, api, disabled, errors, t, onChange, onRemove, }) {
    const path = "models." + index;
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
    return _jsxs("fieldset", { className: "cm-card", disabled: disabled, children: [_jsxs("legend", { children: [t("models"), " ", index + 1] }), _jsxs("div", { className: "cm-card-head", children: [_jsx("strong", { children: model.id || "—" }), _jsx(Button, { size: "sm", disabled: disabled, onClick: onRemove, children: t("removeModel") })] }), _jsxs("div", { className: "cm-grid", children: [_jsx(Field, { label: t("modelId"), error: message(".id"), children: _jsx(Input, { value: model.id, onChange: (event) => update((draft) => { draft.id = event.target.value; }) }) }), _jsx(Field, { label: t("modelName"), children: _jsx(Input, { value: model.name, onChange: (event) => update((draft) => { draft.name = event.target.value; }) }) }), _jsx(Field, { label: t("contextWindow"), error: message(".contextWindow"), children: _jsx(Input, { inputMode: "numeric", value: model.contextWindow, onChange: (event) => update((draft) => { draft.contextWindow = event.target.value; }) }) }), _jsx(Field, { label: t("maxTokens"), error: message(".maxTokens"), children: _jsx(Input, { inputMode: "numeric", value: model.maxTokens, onChange: (event) => update((draft) => { draft.maxTokens = event.target.value; }) }) }), _jsxs("div", { className: "cm-wide cm-row", children: [_jsxs("label", { className: "cm-check", children: [_jsx("input", { type: "checkbox", checked: model.input.text, onChange: (event) => update((draft) => { draft.input.text = event.target.checked; }) }), t("text")] }), _jsxs("label", { className: "cm-check", children: [_jsx("input", { type: "checkbox", checked: model.input.image, onChange: (event) => update((draft) => { draft.input.image = event.target.checked; }) }), t("image")] }), message(".input") ? _jsx("span", { className: "cm-error", children: message(".input") }) : null] }), _jsxs("label", { className: "cm-wide cm-check", children: [_jsx("input", { type: "checkbox", checked: efforts !== false, onChange: (event) => update((draft) => {
                                    draft.reasoningEfforts = event.target.checked ? {} : false;
                                    if (!event.target.checked)
                                        draft.defaultReasoningEffort = "";
                                }) }), t("reasoning")] }), efforts !== false ? _jsxs(_Fragment, { children: [_jsx("div", { className: "cm-wide cm-efforts", "aria-label": t("efforts"), children: EFFORTS.map((effort) => {
                                    const enabled = Object.hasOwn(efforts, effort);
                                    const error = message(".reasoningEfforts." + effort);
                                    return _jsxs(React.Fragment, { children: [_jsxs("label", { className: "cm-check", children: [_jsx("input", { type: "checkbox", checked: enabled, onChange: (event) => update((draft) => {
                                                            if (draft.reasoningEfforts === false)
                                                                return;
                                                            if (event.target.checked)
                                                                draft.reasoningEfforts[effort] = effort === "off" ? null : "";
                                                            else {
                                                                delete draft.reasoningEfforts[effort];
                                                                if (draft.defaultReasoningEffort === effort)
                                                                    draft.defaultReasoningEffort = "";
                                                            }
                                                        }) }), effort] }), _jsxs("div", { children: [_jsx(Input, { "aria-label": effort + " " + t("wireValue"), disabled: !enabled, placeholder: effort === "off" ? t("offOmit") : t("wireValue"), value: efforts[effort] ?? "", onChange: (event) => update((draft) => {
                                                            if (draft.reasoningEfforts === false)
                                                                return;
                                                            draft.reasoningEfforts[effort] = effort === "off" && event.target.value === ""
                                                                ? null
                                                                : event.target.value;
                                                        }) }), error ? _jsx("span", { className: "cm-error", children: error }) : null] })] }, effort);
                                }) }), message(".reasoningEfforts") ? _jsx("p", { className: "cm-wide cm-error", children: message(".reasoningEfforts") }) : null, _jsx(Field, { label: t("defaultEffort"), error: message(".defaultReasoningEffort"), children: _jsxs("select", { value: model.defaultReasoningEffort, onChange: (event) => update((draft) => {
                                        draft.defaultReasoningEffort = event.target.value;
                                    }), children: [_jsx("option", { value: "", children: t("inherit") }), EFFORTS.filter((effort) => Object.hasOwn(efforts, effort)).map((effort) => _jsx("option", { value: effort, children: effort }, effort))] }) })] }) : null, api === "openai-completions" ? _jsxs(_Fragment, { children: [_jsx(Field, { label: t("thinkingFormat"), children: _jsxs("select", { value: model.compat.thinkingFormat, onChange: (event) => update((draft) => {
                                        draft.compat.thinkingFormat = event.target.value;
                                    }), children: [_jsx("option", { value: "", children: t("inherit") }), THINKING_FORMATS.map((format) => _jsx("option", { value: format, children: format }, format))] }) }), _jsx(Field, { label: t("supportsReasoningEffort"), children: _jsxs("select", { value: model.compat.supportsReasoningEffort, onChange: (event) => update((draft) => {
                                        draft.compat.supportsReasoningEffort = event.target.value;
                                    }), children: [_jsx("option", { value: "", children: t("inherit") }), _jsx("option", { value: "true", children: "true" }), _jsx("option", { value: "false", children: "false" })] }) })] }) : null] })] });
}
//# sourceMappingURL=ModelEditor.js.map