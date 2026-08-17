import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "@deepseek-ai/dsh-client-ui-primitives";
import { ModelEditor } from "./ModelEditor.js";
import { adoptDiscoveredModels } from "./model-utils.js";
import { validationKey } from "./locales.js";
import { describeError } from "./store.js";
import { deriveKeyRef } from "./validation.js";
import { THINKING_FORMATS, emptyCompat, emptyModel, } from "./types.js";
const SETTINGS_NS = "custom-models";
function Field({ label, error, children, }) {
    return _jsxs("div", { className: "cm-field", children: [_jsx("span", { className: "cm-field-label", children: label }), children, error ? _jsx("span", { className: "cm-error", children: error }) : null] });
}
export function ProviderEditor(props) {
    const { api, draft, mode, t, disabled, busy, validation, routeCollision, } = props;
    const [fetchBusy, setFetchBusy] = useState(false);
    const [fetchError, setFetchError] = useState("");
    const [candidates, setCandidates] = useState();
    const [picked, setPicked] = useState(() => new Set());
    const validationMessage = (code) => {
        const key = validationKey(code);
        return key === undefined ? undefined : t(key);
    };
    const errorKeys = Object.keys(validation?.errors ?? {});
    const hasCustomErrors = validation !== undefined && (validation.errors.baseURL !== undefined
        || validation.errors.models !== undefined
        || errorKeys.some((path) => path.startsWith("models.")));
    const hasAdvancedErrors = validation !== undefined && (validation.errors.apiKeyEnv !== undefined
        || validation.errors.streamIdleTimeoutMs !== undefined
        || errorKeys.some((path) => path.startsWith("headers.") || path.startsWith("retryPolicy.")));
    const [customOpen, setCustomOpen] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [expandedModels, setExpandedModels] = useState(() => new Set());
    const toggleModel = (index) => {
        setExpandedModels((current) => {
            const next = new Set(current);
            if (!next.delete(index))
                next.add(index);
            return next;
        });
    };
    const removeModel = (index) => {
        props.onChange((value) => { value.models.splice(index, 1); });
        setExpandedModels((current) => {
            const next = new Set();
            for (const at of current) {
                if (at < index)
                    next.add(at);
                else if (at > index)
                    next.add(at - 1);
            }
            return next;
        });
    };
    useEffect(() => {
        if (hasCustomErrors)
            setCustomOpen(true);
    }, [hasCustomErrors]);
    useEffect(() => {
        if (hasAdvancedErrors)
            setAdvancedOpen(true);
    }, [hasAdvancedErrors]);
    const identity = _jsxs(_Fragment, { children: [mode === "create" ? _jsx(Field, { label: t("route"), error: routeCollision ? t("routeExists") : validationMessage(validation?.errors.route), children: _jsx("input", { className: "cm-input", value: draft.route, placeholder: "acme-gateway", "aria-label": t("route"), disabled: disabled, onChange: (event) => props.onChange((value) => { value.route = event.target.value; }) }) }) : null, mode === "create" ? _jsx("p", { className: "cm-hint", children: t("routeHint") }) : null, _jsx(Field, { label: t("displayName"), children: _jsx("input", { className: "cm-input", value: draft.displayName, placeholder: draft.route || t("displayName"), "aria-label": t("displayName"), disabled: disabled, onChange: (event) => props.onChange((value) => { value.displayName = event.target.value; }) }) }), _jsx(Field, { label: t("baseURL"), error: validationMessage(validation?.errors.baseURL), children: _jsx("input", { className: "cm-input", value: draft.baseURL, placeholder: "https://gateway.example/v1", "aria-label": t("baseURL"), disabled: disabled, onChange: (event) => props.onChange((value) => { value.baseURL = event.target.value; }) }) }), _jsx(Field, { label: t("api"), children: _jsxs("select", { className: "cm-input cm-select", value: draft.api, "aria-label": t("api"), disabled: disabled, onChange: (event) => props.onChange((value) => {
                        value.api = event.target.value;
                        if (value.api === "openai-responses") {
                            for (const model of value.models)
                                model.compat = emptyCompat();
                        }
                    }), children: [_jsx("option", { value: "openai-completions", children: "openai-completions" }), _jsx("option", { value: "openai-responses", children: "openai-responses" })] }) })] });
    const keyField = _jsxs(Field, { label: t("apiKey"), children: [_jsx("input", { className: "cm-input", type: "password", autoComplete: "off", value: props.secret, placeholder: props.credential?.writable === false
                    ? t("keyEnvLocked")
                    : props.credential?.configured === true
                        ? t("keyStored")
                        : t("keyPlaceholder"), "aria-label": t("apiKey"), disabled: disabled || props.credential?.writable === false, onChange: (event) => props.onSecretChange(event.target.value) }), mode === "edit" && props.credential?.configured === true && props.credential.writable && props.onUnsetKey
                ? _jsx("button", { type: "button", className: "cm-link", disabled: disabled, onClick: props.onUnsetKey, children: t("unsetCredential") })
                : null] });
    const askable = draft.baseURL.trim() !== "";
    const fetchModels = async () => {
        setFetchBusy(true);
        setFetchError("");
        try {
            const typedKey = props.secret.trim();
            const response = await api.llm.discoverModels({
                settingsNs: SETTINGS_NS,
                ...(mode === "edit" && draft.route !== "" ? { provider: draft.route } : {}),
                ...(askable ? { baseURL: draft.baseURL.trim() } : {}),
                api: draft.api,
                ...(typedKey === "" ? {} : { apiKey: typedKey }),
            });
            if (!response.result.ok) {
                setFetchError(response.result.error.message);
                return;
            }
            const found = response.result.value.models;
            if (found.length === 0) {
                setFetchError(t("fetchEmpty"));
                return;
            }
            const known = new Set(draft.models.map((model) => model.id.trim()).filter(Boolean));
            setCandidates(found);
            setPicked(new Set(found.filter((model) => !known.has(model.id)).map((model) => model.id)));
        }
        catch (error) {
            setFetchError(describeError(error));
        }
        finally {
            setFetchBusy(false);
        }
    };
    const closePicker = () => {
        setCandidates(undefined);
        setPicked(new Set());
    };
    const adoptPicked = () => {
        if (candidates === undefined)
            return;
        props.onChange((value) => {
            value.models = adoptDiscoveredModels(value.models, candidates, picked);
        });
        closePicker();
    };
    const toggleCandidate = (id) => {
        setPicked((current) => {
            const next = new Set(current);
            if (!next.delete(id))
                next.add(id);
            return next;
        });
    };
    const models = _jsxs("section", { className: "cm-model-catalog", "aria-label": t("models"), children: [_jsxs("div", { className: "cm-model-list-head", children: [_jsxs("div", { className: "cm-model-catalog-heading", children: [_jsx("span", { className: "cm-model-catalog-title", children: t("models") }), _jsx("span", { className: "cm-model-catalog-meta", children: t("modelsCustomized") })] }), _jsx("button", { type: "button", className: "cm-link", disabled: disabled || fetchBusy || !askable, title: askable ? undefined : t("fetchNeedsBaseUrl"), onClick: () => { void fetchModels(); }, children: fetchBusy ? t("fetching") : t("fetchModels") })] }), draft.models.length === 0 ? _jsx("p", { className: "cm-model-empty", children: t("modelsEmpty") }) : null, draft.models.map((model, index) => _jsx(ModelEditor, { model: model, index: index, api: draft.api, disabled: disabled, expanded: expandedModels.has(index), errors: validation?.errors ?? {}, t: t, onChange: (next) => props.onChange((value) => { value.models[index] = next; }), onToggle: () => toggleModel(index), onRemove: () => removeModel(index) }, (mode === "create" ? "new" : draft.route) + ":" + index)), _jsx("button", { type: "button", className: "cm-add-model", disabled: disabled, onClick: () => props.onChange((value) => { value.models.push(emptyModel()); }), children: t("addModel") }), validation?.errors.models !== undefined
                ? _jsx("p", { className: "cm-error", children: validationMessage(validation.errors.models) })
                : null, fetchError !== "" ? _jsx("p", { className: "cm-error", role: "alert", children: fetchError }) : null, _jsx(Modal, { open: candidates !== undefined, onClose: closePicker, title: t("fetchTitle"), closeLabel: t("close"), description: t("fetchDescription"), footer: _jsxs(_Fragment, { children: [_jsx(Button, { type: "button", onClick: closePicker, children: t("cancel") }), _jsx(Button, { type: "button", variant: "primary", onClick: adoptPicked, children: t("fetchAdopt") })] }), children: _jsx("ul", { className: "cm-candidate-list", children: (candidates ?? []).map((candidate) => _jsx("li", { className: "cm-candidate", children: _jsxs("label", { className: "cm-candidate-label", children: [_jsx("input", { type: "checkbox", checked: picked.has(candidate.id), onChange: () => toggleCandidate(candidate.id) }), _jsx("span", { className: "cm-candidate-id", children: candidate.id })] }) }, candidate.id)) }) })] });
    const headerError = Object.entries(validation?.errors ?? {}).find(([path]) => path.startsWith("headers."));
    const advanced = _jsxs("details", { className: "cm-customized", open: advancedOpen, onToggle: (event) => setAdvancedOpen(event.currentTarget.open), children: [_jsx("summary", { className: "cm-customized-summary", children: t("advanced") }), _jsxs("div", { className: "cm-customized-body", children: [_jsx(Field, { label: t("apiKeyEnv"), error: validationMessage(validation?.errors.apiKeyEnv), children: _jsx("input", { className: "cm-input", value: draft.apiKeyEnv, placeholder: deriveKeyRef(draft.route), "aria-label": t("apiKeyEnv"), disabled: disabled, onChange: (event) => props.onChange((value) => { value.apiKeyEnv = event.target.value; }) }) }), _jsx(Field, { label: t("headers"), error: validationMessage(headerError?.[1]), children: _jsx("textarea", { className: "cm-input", rows: 4, value: draft.headers.map(({ key, value }) => key + ": " + value).join("\n"), "aria-label": t("headers"), disabled: disabled, onChange: (event) => props.onChange((value) => {
                                value.headers = event.target.value.split("\n").filter(Boolean).map((line) => {
                                    const separator = line.indexOf(":");
                                    return separator < 0
                                        ? { key: line.trim(), value: "" }
                                        : { key: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() };
                                });
                            }) }) }), _jsx(Field, { label: t("thinkingFormat"), children: _jsxs("select", { className: "cm-input cm-select", value: draft.compat.thinkingFormat, "aria-label": t("thinkingFormat"), disabled: disabled, onChange: (event) => props.onChange((value) => {
                                value.compat.thinkingFormat = event.target.value;
                            }), children: [_jsx("option", { value: "", children: t("inherit") }), THINKING_FORMATS.map((format) => _jsx("option", { value: format, children: format }, format))] }) }), _jsx(Field, { label: t("supportsReasoningEffort"), children: _jsxs("select", { className: "cm-input cm-select", value: draft.compat.supportsReasoningEffort, "aria-label": t("supportsReasoningEffort"), disabled: disabled, onChange: (event) => props.onChange((value) => {
                                value.compat.supportsReasoningEffort = event.target.value;
                            }), children: [_jsx("option", { value: "", children: t("inherit") }), _jsx("option", { value: "true", children: "true" }), _jsx("option", { value: "false", children: "false" })] }) }), _jsx(Field, { label: t("streamIdleTimeoutMs"), error: validationMessage(validation?.errors.streamIdleTimeoutMs), children: _jsx("input", { className: "cm-input", inputMode: "numeric", value: draft.streamIdleTimeoutMs, "aria-label": t("streamIdleTimeoutMs"), disabled: disabled, onChange: (event) => props.onChange((value) => { value.streamIdleTimeoutMs = event.target.value; }) }) }), _jsx(Field, { label: t("retryMode"), children: _jsxs("select", { className: "cm-input cm-select", value: draft.retryPolicy.mode, "aria-label": t("retryMode"), disabled: disabled, onChange: (event) => props.onChange((value) => {
                                value.retryPolicy.mode = event.target.value;
                            }), children: [_jsx("option", { value: "", children: t("inherit") }), _jsx("option", { value: "normal", children: t("normal") }), _jsx("option", { value: "always", children: t("always") })] }) }), draft.retryPolicy.mode === "normal" ? _jsxs(_Fragment, { children: [_jsx(Field, { label: t("maxRetries"), error: validationMessage(validation?.errors["retryPolicy.maxRetries"]), children: _jsx("input", { className: "cm-input", inputMode: "numeric", value: draft.retryPolicy.maxRetries, "aria-label": t("maxRetries"), disabled: disabled, onChange: (event) => props.onChange((value) => { value.retryPolicy.maxRetries = event.target.value; }) }) }), _jsx(Field, { label: t("retryableCodes"), children: _jsx("input", { className: "cm-input", value: draft.retryPolicy.retryableCodes, "aria-label": t("retryableCodes"), disabled: disabled, onChange: (event) => props.onChange((value) => { value.retryPolicy.retryableCodes = event.target.value; }) }) })] }) : null, draft.retryPolicy.mode !== "" ? _jsxs(_Fragment, { children: [_jsx(Field, { label: t("initialDelayMs"), error: validationMessage(validation?.errors["retryPolicy.initialDelayMs"]), children: _jsx("input", { className: "cm-input", inputMode: "numeric", value: draft.retryPolicy.initialDelayMs, "aria-label": t("initialDelayMs"), disabled: disabled, onChange: (event) => props.onChange((value) => { value.retryPolicy.initialDelayMs = event.target.value; }) }) }), _jsx(Field, { label: t("maxDelayMs"), error: validationMessage(validation?.errors["retryPolicy.maxDelayMs"]), children: _jsx("input", { className: "cm-input", inputMode: "numeric", value: draft.retryPolicy.maxDelayMs, "aria-label": t("maxDelayMs"), disabled: disabled, onChange: (event) => props.onChange((value) => { value.retryPolicy.maxDelayMs = event.target.value; }) }) }), _jsx(Field, { label: t("jitterRatio"), error: validationMessage(validation?.errors["retryPolicy.jitterRatio"]), children: _jsx("input", { className: "cm-input", inputMode: "decimal", value: draft.retryPolicy.jitterRatio, "aria-label": t("jitterRatio"), disabled: disabled, onChange: (event) => props.onChange((value) => { value.retryPolicy.jitterRatio = event.target.value; }) }) })] }) : null] })] });
    return _jsxs("div", { className: "cm-editor", children: [_jsxs("div", { className: "cm-editor-head", children: [_jsx("span", { className: "cm-editor-title", children: mode === "create" ? t("add") : (draft.displayName || draft.route || t("add")) }), mode === "edit" && draft.route !== "" ? _jsx("span", { className: "cm-editor-route", children: draft.route }) : null] }), mode === "edit" ? _jsxs(_Fragment, { children: [keyField, _jsxs("details", { className: "cm-customized", open: customOpen, onToggle: (event) => setCustomOpen(event.currentTarget.open), children: [_jsx("summary", { className: "cm-customized-summary", children: t("customized") }), _jsxs("div", { className: "cm-customized-body", children: [identity, models, advanced] })] })] }) : _jsxs(_Fragment, { children: [identity, keyField, models, advanced] }), props.message !== "" ? _jsx("p", { className: "cm-error", role: "alert", children: props.message }) : null, _jsxs("div", { className: "cm-editor-actions", children: [props.onReset
                        ? _jsx("button", { type: "button", className: "cm-secondary cm-reset", disabled: disabled, onClick: props.onReset, children: t("reset") })
                        : null, _jsx("button", { type: "button", className: "cm-secondary", disabled: busy, onClick: props.onCancel, children: t("cancel") }), _jsx("button", { type: "button", className: "cm-primary", disabled: disabled || validation?.valid !== true || routeCollision, onClick: props.onSave, children: busy
                            ? (mode === "create" ? t("creating") : t("saving"))
                            : (mode === "create" ? t("create") : t("save")) })] })] });
}
//# sourceMappingURL=ProviderEditor.js.map