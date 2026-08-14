import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal } from "@deepseek-ai/dsh-client-ui-primitives";
import { bindSnapshotSelector } from "@deepseek-ai/dsh-client-web-react";
import type { CredentialView, IApiClient } from "@deepseek-ai/dsh-api-remotes/client";
import type { TranslateNS } from "@deepseek-ai/dsh-client-locale/client";
import { ModelEditor } from "./ModelEditor.js";
import { providerFromValue, providersOf, providerToValue } from "./model-utils.js";
import { validationKey } from "./locales.js";
import {
  describeError,
  mount,
  reload,
  responseValue,
  settingsStore,
} from "./store.js";
import { deriveKeyRef, validateProviderDraft } from "./validation.js";
import {
  THINKING_FORMATS,
  emptyCompat,
  emptyModel,
  emptyProvider,
  type ProviderDraft,
} from "./types.js";

interface Props {
  api: IApiClient;
  t: TranslateNS<"settings.custom-models">;
}
function Field({
  label, error, children, wide,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return <label className={"cm-field" + (wide ? " cm-wide" : "")}>
    <span>{label}</span>{children}{error ? <span className="cm-error">{error}</span> : null}
  </label>;
}
function nameOf(value: unknown, route: string): string {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const name = (value as Record<string, unknown>).displayName;
    if (typeof name === "string" && name !== "") return name;
  }
  return route;
}

const useSettings = bindSnapshotSelector(settingsStore);

export function SettingsSection({ api, t }: Props) {
  const snapshot = useSettings((state) => state);
  const [selected, setSelected] = useState<string>();
  const [draft, setDraft] = useState<ProviderDraft>();
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
    if (draft !== undefined) return;
    const route = selected !== undefined && layers.resolved[selected] !== undefined
      ? selected
      : routes[0];
    if (route === undefined) return;
    setSelected(route);
    setDraft(providerFromValue(route, layers.resolved[route]));
  }, [draft, layers.resolved, routes, selected]);

  const validation = draft === undefined ? undefined : validateProviderDraft(draft);
  const keyRef = draft === undefined ? "" : deriveKeyRef(draft.route, draft.apiKeyEnv);
  const credential: CredentialView | undefined = snapshot.credentials[keyRef];
  const routeCollision = draft !== undefined && selected === undefined && Object.hasOwn(layers.resolved, draft.route);
  const disabled = busy || !snapshot.writable;

  const validationMessage = (code: string | undefined) => {
    const key = validationKey(code);
    return key === undefined ? undefined : t(key);
  };
  const edit = (change: (value: ProviderDraft) => void) => {
    setDraft((current) => {
      if (current === undefined) return current;
      const next = structuredClone(current);
      change(next);
      return next;
    });
  };
  const choose = (route: string) => {
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

  async function save(): Promise<void> {
    if (
      draft === undefined ||
      validation?.valid !== true ||
      snapshot.namespace === undefined ||
      !snapshot.writable ||
      routeCollision
    ) return;
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
    } catch (error) {
      const detail = describeError(error);
      if (profileSaved) setMessage(t("credentialPartial") + " " + detail);
      else if (detail.toLowerCase().includes("conflict")) setMessage(t("conflict"));
      else setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  async function remove(): Promise<void> {
    if (draft === undefined || snapshot.namespace === undefined || !snapshot.writable) return;
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
    } catch (error) {
      setMessage(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  async function unsetKey(): Promise<void> {
    if (credential?.writable !== true) return;
    setBusy(true);
    setMessage("");
    try {
      responseValue(await api.credentials.unset({ ref: keyRef }));
      await reload(api);
    } catch (error) {
      setMessage(describeError(error));
    } finally {
      setBusy(false);
    }
  }

  const selectedIsBase = selected !== undefined && Object.hasOwn(layers.base, selected);
  const selectedHasUserOverride = selected !== undefined && Object.hasOwn(layers.user, selected);
  return <section className="cm-root">
    <header className="cm-head">
      <div><h2>{t("title")}</h2><p className="cm-sub">{t("subtitle")}</p></div>
      <Button type="button" variant="primary" disabled={!snapshot.writable} onClick={() => {
        setSelected(undefined); setDraft(emptyProvider()); setSecret(""); setMessage("");
      }}>{t("add")}</Button>
    </header>
    {!snapshot.writable && snapshot.namespace !== undefined
      ? <p className="cm-status" role="status">{t("readOnly")}</p>
      : null}
    {snapshot.error !== "" ? <div className="cm-status cm-error" role="alert">
      {snapshot.error} <Button type="button" size="sm" onClick={() => void reload(api)}>{t("retry")}</Button>
    </div> : null}
    {snapshot.loading && snapshot.namespace === undefined ? <p>{t("loading")}</p> : <div className="cm-layout">
      <nav className="cm-list" aria-label={t("title")}>
        {routes.length === 0 ? <p className="cm-empty">{t("empty")}</p> : null}
        {routes.map((route) => <button
          type="button"
          className="cm-provider"
          aria-current={selected === route}
          aria-controls="cm-provider-editor"
          key={route}
          onClick={() => choose(route)}
        >
          <span className="cm-provider-title">{nameOf(layers.resolved[route], route)}</span>
          <span className="cm-badge">
            {route} · {snapshot.active.has(route) ? t("active") : t("inactive")} · {Object.hasOwn(layers.user, route) ? t("user") : t("base")}
          </span>
        </button>)}
      </nav>
      {draft !== undefined ? <fieldset id="cm-provider-editor" className="cm-editor" disabled={disabled}>
        <legend className="cm-sr-only">{draft.displayName || draft.route || t("add")}</legend>
        <div className="cm-editor-head">
          <div className="cm-editor-identity">
            <strong className="cm-editor-title">{draft.displayName || draft.route || t("add")}</strong>
            {draft.route !== "" ? <span className="cm-editor-route">{draft.route}</span> : null}
          </div>
          {selected !== undefined ? <span className="cm-badge">
            {snapshot.active.has(selected) ? t("active") : t("inactive")} · {selectedHasUserOverride ? t("user") : t("base")}
          </span> : null}
        </div>
        <div className="cm-grid">
          <Field label={t("route")} error={routeCollision ? t("routeExists") : validationMessage(validation?.errors.route)}>
            <Input value={draft.route} disabled={selected !== undefined || disabled} onChange={(event) => edit((value) => { value.route = event.target.value; })}/>
          </Field>
          <Field label={t("displayName")}>
            <Input value={draft.displayName} onChange={(event) => edit((value) => { value.displayName = event.target.value; })}/>
          </Field>
          <Field label={t("api")}>
            <select value={draft.api} onChange={(event) => edit((value) => {
              value.api = event.target.value as ProviderDraft["api"];
              if (value.api === "openai-responses") {
                for (const model of value.models) model.compat = emptyCompat();
              }
            })}>
              <option value="openai-completions">openai-completions</option>
              <option value="openai-responses">openai-responses</option>
            </select>
          </Field>
          <Field label={t("baseURL")} error={validationMessage(validation?.errors.baseURL)}>
            <Input value={draft.baseURL} onChange={(event) => edit((value) => { value.baseURL = event.target.value; })}/>
          </Field>
          <Field label={t("apiKeyEnv")} error={validationMessage(validation?.errors.apiKeyEnv)}>
            <Input value={draft.apiKeyEnv} placeholder={deriveKeyRef(draft.route)} onChange={(event) => edit((value) => { value.apiKeyEnv = event.target.value; })}/>
          </Field>
          <Field label={t("apiKey")}>
            <Input
              type="password"
              autoComplete="new-password"
              value={secret}
              disabled={disabled || credential?.writable === false}
              onChange={(event) => setSecret(event.target.value)}
            />
          </Field>
          <div className="cm-wide cm-status">
            {credential?.configured === true ? t("configured") : t("notConfigured")}
            {credential?.source !== undefined ? <> · {t("source")}: {credential.source}</> : null}
            {credential?.configured === true && credential.writable
              ? <Button type="button" size="sm" disabled={disabled} onClick={() => void unsetKey()}>{t("unsetCredential")}</Button>
              : null}
          </div>
          <Field label={t("headers")} error={validationMessage(Object.entries(validation?.errors ?? {}).find(([path]) => path.startsWith("headers."))?.[1])} wide>
            <textarea rows={4} value={draft.headers.map(({ key, value }) => key + ": " + value).join("\n")} onChange={(event) => edit((value) => {
              value.headers = event.target.value.split("\n").filter(Boolean).map((line) => {
                const separator = line.indexOf(":");
                return separator < 0
                  ? { key: line.trim(), value: "" }
                  : { key: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() };
              });
            })}/>
          </Field>
          <Field label={t("thinkingFormat")}>
            <select value={draft.compat.thinkingFormat} onChange={(event) => edit((value) => {
              value.compat.thinkingFormat = event.target.value as ProviderDraft["compat"]["thinkingFormat"];
            })}>
              <option value="">{t("inherit")}</option>
              {THINKING_FORMATS.map((format) => <option key={format} value={format}>{format}</option>)}
            </select>
          </Field>
          <Field label={t("supportsReasoningEffort")}>
            <select value={draft.compat.supportsReasoningEffort} onChange={(event) => edit((value) => {
              value.compat.supportsReasoningEffort = event.target.value as ProviderDraft["compat"]["supportsReasoningEffort"];
            })}>
              <option value="">{t("inherit")}</option><option value="true">true</option><option value="false">false</option>
            </select>
          </Field>
          <Field label={t("streamIdleTimeoutMs")} error={validationMessage(validation?.errors.streamIdleTimeoutMs)}>
            <Input inputMode="numeric" value={draft.streamIdleTimeoutMs} onChange={(event) => edit((value) => { value.streamIdleTimeoutMs = event.target.value; })}/>
          </Field>
          <Field label={t("retryMode")}>
            <select value={draft.retryPolicy.mode} onChange={(event) => edit((value) => {
              value.retryPolicy.mode = event.target.value as ProviderDraft["retryPolicy"]["mode"];
            })}>
              <option value="">{t("inherit")}</option><option value="normal">{t("normal")}</option><option value="always">{t("always")}</option>
            </select>
          </Field>
          {draft.retryPolicy.mode === "normal" ? <>
            <Field label={t("maxRetries")} error={validationMessage(validation?.errors["retryPolicy.maxRetries"])}>
              <Input inputMode="numeric" value={draft.retryPolicy.maxRetries} onChange={(event) => edit((value) => { value.retryPolicy.maxRetries = event.target.value; })}/>
            </Field>
            <Field label={t("retryableCodes")}>
              <Input value={draft.retryPolicy.retryableCodes} onChange={(event) => edit((value) => { value.retryPolicy.retryableCodes = event.target.value; })}/>
            </Field>
          </> : null}
          {draft.retryPolicy.mode !== "" ? <>
            <Field label={t("initialDelayMs")} error={validationMessage(validation?.errors["retryPolicy.initialDelayMs"])}>
              <Input inputMode="numeric" value={draft.retryPolicy.initialDelayMs} onChange={(event) => edit((value) => { value.retryPolicy.initialDelayMs = event.target.value; })}/>
            </Field>
            <Field label={t("maxDelayMs")} error={validationMessage(validation?.errors["retryPolicy.maxDelayMs"])}>
              <Input inputMode="numeric" value={draft.retryPolicy.maxDelayMs} onChange={(event) => edit((value) => { value.retryPolicy.maxDelayMs = event.target.value; })}/>
            </Field>
            <Field label={t("jitterRatio")} error={validationMessage(validation?.errors["retryPolicy.jitterRatio"])}>
              <Input inputMode="decimal" value={draft.retryPolicy.jitterRatio} onChange={(event) => edit((value) => { value.retryPolicy.jitterRatio = event.target.value; })}/>
            </Field>
          </> : null}
        </div>
        <h3>{t("models")}</h3>
        {draft.models.map((model, index) => <ModelEditor
          key={(selected ?? "new") + ":" + index}
          model={model}
          index={index}
          api={draft.api}
          disabled={disabled}
          errors={validation?.errors ?? {}}
          t={t}
          onChange={(next) => edit((value) => { value.models[index] = next; })}
          onRemove={() => edit((value) => { value.models.splice(index, 1); })}
        />)}
        <Button type="button" disabled={disabled} onClick={() => edit((value) => { value.models.push(emptyModel()); })}>{t("addModel")}</Button>
        {validation?.errors.models !== undefined ? <p className="cm-error">{validationMessage(validation.errors.models)}</p> : null}
        {message !== "" ? <p className="cm-error" role="alert">{message}</p> : null}
        <div className="cm-actions">
          <div className="cm-action-group">
            <Button type="button" disabled={busy} onClick={closeEditor}>{t("cancel")}</Button>
            {selectedIsBase && selectedHasUserOverride
              ? <Button type="button" disabled={disabled} onClick={() => void remove()}>{t("reset")}</Button>
              : null}
            {!selectedIsBase && selectedHasUserOverride
              ? <Button type="button" disabled={disabled} onClick={() => setConfirmDelete(true)}>{t("delete")}</Button>
              : null}
          </div>
          <Button
            type="button"
            variant="primary"
            disabled={disabled || validation?.valid !== true || routeCollision}
            onClick={() => void save()}
          >{t("save")}</Button>
        </div>
      </fieldset> : null}
    </div>}
    <Modal
      open={confirmDelete}
      onClose={() => setConfirmDelete(false)}
      title={t("confirmDelete")}
      closeLabel={t("close")}
      footer={<>
        <Button type="button" onClick={() => setConfirmDelete(false)}>{t("cancel")}</Button>
        <Button type="button" variant="primary" disabled={busy} onClick={() => void remove()}>{t("delete")}</Button>
      </>}
    />
  </section>;
}
