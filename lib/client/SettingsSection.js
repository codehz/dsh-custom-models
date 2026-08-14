import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal } from "@deepseek-ai/dsh-client-ui-primitives";
import { bindSnapshotSelector } from "@deepseek-ai/dsh-client-web-react";
import { ModelEditor } from "./ModelEditor.js";
import { providerFromValue, providersOf, providerToValue } from "./model-utils.js";
import { validationKey } from "./locales.js";
import { describeError, mount, reload, responseValue, settingsStore, } from "./store.js";
import { deriveKeyRef, validateProviderDraft } from "./validation.js";
import { THINKING_FORMATS, emptyCompat, emptyModel, emptyProvider, } from "./types.js";
function Field({ label, error, children, wide, }) {
    return _jsxs("label", { className: "cm-field" + (wide ? " cm-wide" : ""), children: [_jsx("span", { children: label }), children, error ? _jsx("span", { className: "cm-error", children: error }) : null] });
}
function nameOf(value, route) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const name = value.displayName;
        if (typeof name === "string" && name !== "")
            return name;
    }
    return route;
}
const useSettings = bindSnapshotSelector(settingsStore);
export function SettingsSection({ api, t }) {
    const snapshot = useSettings((state) => state);
    const [selected, setSelected] = useState();
    const [draft, setDraft] = useState();
    const [secret, setSecret] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    useEffect(() => mount(api), [api]);
    const layers = useMemo(() => ({
        resolved: providersOf(snapshot.namespace?.value),
        base: providersOf(snapshot.namespace?.base),
        user: providersOf(snapshot.namespace?.user),
    }), [snapshot.namespace]);
    const routes = useMemo(() => Object.keys(layers.resolved).sort(), [layers.resolved]);
    useEffect(() => {
        if (draft !== undefined)
            return;
        const route = selected !== undefined && layers.resolved[selected] !== undefined
            ? selected
            : routes[0];
        if (route === undefined)
            return;
        setSelected(route);
        setDraft(providerFromValue(route, layers.resolved[route]));
    }, [draft, layers.resolved, routes, selected]);
    const validation = draft === undefined ? undefined : validateProviderDraft(draft);
    const keyRef = draft === undefined ? "" : deriveKeyRef(draft.route, draft.apiKeyEnv);
    const credential = snapshot.credentials[keyRef];
    const routeCollision = draft !== undefined && selected === undefined && Object.hasOwn(layers.resolved, draft.route);
    const disabled = busy || !snapshot.writable;
    const validationMessage = (code) => {
        const key = validationKey(code);
        return key === undefined ? undefined : t(key);
    };
    const edit = (change) => {
        setDraft((current) => {
            if (current === undefined)
                return current;
            const next = structuredClone(current);
            change(next);
            return next;
        });
    };
    const choose = (route) => {
        setSelected(route);
        setDraft(providerFromValue(route, layers.resolved[route]));
        setSecret("");
        setMessage("");
    };
    const closeEditor = () => {
        setSelected(undefined);
        setDraft(undefined);
        setSecret("");
        setMessage("");
    };
    async function save() {
        if (draft === undefined ||
            validation?.valid !== true ||
            snapshot.namespace === undefined ||
            !snapshot.writable ||
            routeCollision)
            return;
        setBusy(true);
        setMessage("");
        let profileSaved = false;
        try {
            const response = await api.settings.mutate({
                ns: "custom-models",
                ops: [{
                        op: "set",
                        path: ["providers", draft.route],
                        value: providerToValue({ ...draft, apiKeyEnv: keyRef }),
                    }],
                expectedRevision: snapshot.namespace.revision,
            });
            settingsStore.update((state) => {
                state.namespace = responseValue(response);
            });
            profileSaved = true;
            if (secret !== "") {
                responseValue(await api.credentials.set({ ref: keyRef, value: secret }));
                setSecret("");
            }
            setSelected(draft.route);
            await reload(api);
            setDraft(providerFromValue(draft.route, providersOf(settingsStore.getSnapshot().namespace?.value)[draft.route]));
        }
        catch (error) {
            const detail = describeError(error);
            if (profileSaved)
                setMessage(t("credentialPartial") + " " + detail);
            else if (detail.toLowerCase().includes("conflict"))
                setMessage(t("conflict"));
            else
                setMessage(detail);
        }
        finally {
            setBusy(false);
        }
    }
    async function remove() {
        if (draft === undefined || snapshot.namespace === undefined || !snapshot.writable)
            return;
        setBusy(true);
        setMessage("");
        try {
            responseValue(await api.settings.mutate({
                ns: "custom-models",
                ops: [{ op: "unset", path: ["providers", draft.route] }],
                expectedRevision: snapshot.namespace.revision,
            }));
            await reload(api);
            setSelected(undefined);
            setDraft(undefined);
            setConfirmDelete(false);
        }
        catch (error) {
            setMessage(describeError(error));
        }
        finally {
            setBusy(false);
        }
    }
    async function unsetKey() {
        if (credential?.writable !== true)
            return;
        setBusy(true);
        setMessage("");
        try {
            responseValue(await api.credentials.unset({ ref: keyRef }));
            await reload(api);
        }
        catch (error) {
            setMessage(describeError(error));
        }
        finally {
            setBusy(false);
        }
    }
    const selectedIsBase = selected !== undefined && Object.hasOwn(layers.base, selected);
    const selectedHasUserOverride = selected !== undefined && Object.hasOwn(layers.user, selected);
    return _jsxs("section", { className: "cm-root", children: [_jsxs("header", { className: "cm-head", children: [_jsxs("div", { children: [_jsx("h2", { children: t("title") }), _jsx("p", { className: "cm-sub", children: t("subtitle") })] }), _jsx(Button, { type: "button", variant: "primary", disabled: !snapshot.writable, onClick: () => {
                            setSelected(undefined);
                            setDraft(emptyProvider());
                            setSecret("");
                            setMessage("");
                        }, children: t("add") })] }), !snapshot.writable && snapshot.namespace !== undefined
                ? _jsx("p", { className: "cm-status", role: "status", children: t("readOnly") })
                : null, snapshot.error !== "" ? _jsxs("div", { className: "cm-status cm-error", role: "alert", children: [snapshot.error, " ", _jsx(Button, { type: "button", size: "sm", onClick: () => void reload(api), children: t("retry") })] }) : null, snapshot.loading && snapshot.namespace === undefined ? _jsx("p", { children: t("loading") }) : _jsxs("div", { className: "cm-layout", children: [_jsxs("nav", { className: "cm-list", "aria-label": t("title"), children: [routes.length === 0 ? _jsx("p", { className: "cm-sub", children: t("empty") }) : null, routes.map((route) => _jsxs("button", { type: "button", className: "cm-provider", "aria-current": selected === route, onClick: () => choose(route), children: [_jsx("strong", { children: nameOf(layers.resolved[route], route) }), _jsx("br", {}), _jsxs("span", { className: "cm-badge", children: [route, " \u00B7 ", snapshot.active.has(route) ? t("active") : t("inactive"), " \u00B7 ", Object.hasOwn(layers.user, route) ? t("user") : t("base")] })] }, route))] }), draft !== undefined ? _jsxs("fieldset", { className: "cm-editor", disabled: disabled, children: [_jsxs("div", { className: "cm-grid", children: [_jsx(Field, { label: t("route"), error: routeCollision ? t("routeExists") : validationMessage(validation?.errors.route), children: _jsx(Input, { value: draft.route, disabled: selected !== undefined || disabled, onChange: (event) => edit((value) => { value.route = event.target.value; }) }) }), _jsx(Field, { label: t("displayName"), children: _jsx(Input, { value: draft.displayName, onChange: (event) => edit((value) => { value.displayName = event.target.value; }) }) }), _jsx(Field, { label: t("api"), children: _jsxs("select", { value: draft.api, onChange: (event) => edit((value) => {
                                                value.api = event.target.value;
                                                if (value.api === "openai-responses") {
                                                    for (const model of value.models)
                                                        model.compat = emptyCompat();
                                                }
                                            }), children: [_jsx("option", { value: "openai-completions", children: "openai-completions" }), _jsx("option", { value: "openai-responses", children: "openai-responses" })] }) }), _jsx(Field, { label: t("baseURL"), error: validationMessage(validation?.errors.baseURL), children: _jsx(Input, { value: draft.baseURL, onChange: (event) => edit((value) => { value.baseURL = event.target.value; }) }) }), _jsx(Field, { label: t("apiKeyEnv"), error: validationMessage(validation?.errors.apiKeyEnv), children: _jsx(Input, { value: draft.apiKeyEnv, placeholder: deriveKeyRef(draft.route), onChange: (event) => edit((value) => { value.apiKeyEnv = event.target.value; }) }) }), _jsx(Field, { label: t("apiKey"), children: _jsx(Input, { type: "password", autoComplete: "new-password", value: secret, disabled: disabled || credential?.writable === false, onChange: (event) => setSecret(event.target.value) }) }), _jsxs("div", { className: "cm-wide cm-status", children: [credential?.configured === true ? t("configured") : t("notConfigured"), credential?.source !== undefined ? _jsxs(_Fragment, { children: [" \u00B7 ", t("source"), ": ", credential.source] }) : null, credential?.configured === true && credential.writable
                                                ? _jsx(Button, { type: "button", size: "sm", disabled: disabled, onClick: () => void unsetKey(), children: t("unsetCredential") })
                                                : null] }), _jsx(Field, { label: t("headers"), error: validationMessage(Object.entries(validation?.errors ?? {}).find(([path]) => path.startsWith("headers."))?.[1]), wide: true, children: _jsx("textarea", { rows: 4, value: draft.headers.map(({ key, value }) => key + ": " + value).join("\n"), onChange: (event) => edit((value) => {
                                                value.headers = event.target.value.split("\n").filter(Boolean).map((line) => {
                                                    const separator = line.indexOf(":");
                                                    return separator < 0
                                                        ? { key: line.trim(), value: "" }
                                                        : { key: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() };
                                                });
                                            }) }) }), _jsx(Field, { label: t("thinkingFormat"), children: _jsxs("select", { value: draft.compat.thinkingFormat, onChange: (event) => edit((value) => {
                                                value.compat.thinkingFormat = event.target.value;
                                            }), children: [_jsx("option", { value: "", children: t("inherit") }), THINKING_FORMATS.map((format) => _jsx("option", { value: format, children: format }, format))] }) }), _jsx(Field, { label: t("supportsReasoningEffort"), children: _jsxs("select", { value: draft.compat.supportsReasoningEffort, onChange: (event) => edit((value) => {
                                                value.compat.supportsReasoningEffort = event.target.value;
                                            }), children: [_jsx("option", { value: "", children: t("inherit") }), _jsx("option", { value: "true", children: "true" }), _jsx("option", { value: "false", children: "false" })] }) }), _jsx(Field, { label: t("streamIdleTimeoutMs"), error: validationMessage(validation?.errors.streamIdleTimeoutMs), children: _jsx(Input, { inputMode: "numeric", value: draft.streamIdleTimeoutMs, onChange: (event) => edit((value) => { value.streamIdleTimeoutMs = event.target.value; }) }) }), _jsx(Field, { label: t("retryMode"), children: _jsxs("select", { value: draft.retryPolicy.mode, onChange: (event) => edit((value) => {
                                                value.retryPolicy.mode = event.target.value;
                                            }), children: [_jsx("option", { value: "", children: t("inherit") }), _jsx("option", { value: "normal", children: t("normal") }), _jsx("option", { value: "always", children: t("always") })] }) }), draft.retryPolicy.mode === "normal" ? _jsxs(_Fragment, { children: [_jsx(Field, { label: t("maxRetries"), error: validationMessage(validation?.errors["retryPolicy.maxRetries"]), children: _jsx(Input, { inputMode: "numeric", value: draft.retryPolicy.maxRetries, onChange: (event) => edit((value) => { value.retryPolicy.maxRetries = event.target.value; }) }) }), _jsx(Field, { label: t("retryableCodes"), children: _jsx(Input, { value: draft.retryPolicy.retryableCodes, onChange: (event) => edit((value) => { value.retryPolicy.retryableCodes = event.target.value; }) }) })] }) : null, draft.retryPolicy.mode !== "" ? _jsxs(_Fragment, { children: [_jsx(Field, { label: t("initialDelayMs"), error: validationMessage(validation?.errors["retryPolicy.initialDelayMs"]), children: _jsx(Input, { inputMode: "numeric", value: draft.retryPolicy.initialDelayMs, onChange: (event) => edit((value) => { value.retryPolicy.initialDelayMs = event.target.value; }) }) }), _jsx(Field, { label: t("maxDelayMs"), error: validationMessage(validation?.errors["retryPolicy.maxDelayMs"]), children: _jsx(Input, { inputMode: "numeric", value: draft.retryPolicy.maxDelayMs, onChange: (event) => edit((value) => { value.retryPolicy.maxDelayMs = event.target.value; }) }) }), _jsx(Field, { label: t("jitterRatio"), error: validationMessage(validation?.errors["retryPolicy.jitterRatio"]), children: _jsx(Input, { inputMode: "decimal", value: draft.retryPolicy.jitterRatio, onChange: (event) => edit((value) => { value.retryPolicy.jitterRatio = event.target.value; }) }) })] }) : null] }), _jsx("h3", { children: t("models") }), draft.models.map((model, index) => _jsx(ModelEditor, { model: model, index: index, api: draft.api, disabled: disabled, errors: validation?.errors ?? {}, t: t, onChange: (next) => edit((value) => { value.models[index] = next; }), onRemove: () => edit((value) => { value.models.splice(index, 1); }) }, index)), _jsx(Button, { type: "button", disabled: disabled, onClick: () => edit((value) => { value.models.push(emptyModel()); }), children: t("addModel") }), validation?.errors.models !== undefined ? _jsx("p", { className: "cm-error", children: validationMessage(validation.errors.models) }) : null, message !== "" ? _jsx("p", { className: "cm-error", role: "alert", children: message }) : null, _jsxs("div", { className: "cm-actions", children: [_jsxs("div", { className: "cm-action-group", children: [_jsx(Button, { type: "button", disabled: busy, onClick: closeEditor, children: t("cancel") }), selectedIsBase && selectedHasUserOverride
                                                ? _jsx(Button, { type: "button", disabled: disabled, onClick: () => void remove(), children: t("reset") })
                                                : null, !selectedIsBase && selectedHasUserOverride
                                                ? _jsx(Button, { type: "button", disabled: disabled, onClick: () => setConfirmDelete(true), children: t("delete") })
                                                : null] }), _jsx(Button, { type: "button", variant: "primary", disabled: disabled || validation?.valid !== true || routeCollision, onClick: () => void save(), children: t("save") })] })] }) : null] }), _jsx(Modal, { open: confirmDelete, onClose: () => setConfirmDelete(false), title: t("confirmDelete"), closeLabel: t("close"), footer: _jsxs(_Fragment, { children: [_jsx(Button, { type: "button", onClick: () => setConfirmDelete(false), children: t("cancel") }), _jsx(Button, { type: "button", variant: "primary", disabled: busy, onClick: () => void remove(), children: t("delete") })] }) })] });
}
//# sourceMappingURL=SettingsSection.js.map