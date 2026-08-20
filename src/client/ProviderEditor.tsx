import React, { useEffect, useState } from "react";
import { Button, Modal } from "@deepseek-ai/dsh-client-ui-primitives";
import type { CredentialView, DiscoveredModelView, IApiClient } from "@deepseek-ai/dsh-api-remotes/client";
import type { TranslateNS } from "@deepseek-ai/dsh-client-locale/client";
import { ModelEditor } from "./ModelEditor.js";
import { adoptDiscoveredModels } from "./model-utils.js";
import { validationKey } from "./locales.js";
import { describeError } from "./store.js";
import { deriveKeyRef } from "./validation.js";
import { parseHeaders, serializeHeaders } from "./form-utils.js";
import {
  THINKING_FORMATS,
  emptyCompat,
  emptyModel,
  type ProviderDraft,
  type ValidationResult,
} from "./types.js";

const SETTINGS_NS = "custom-models";

export interface ProviderEditorProps {
  api: IApiClient;
  draft: ProviderDraft;
  mode: "create" | "edit";
  credential?: CredentialView | undefined;
  secret: string;
  onSecretChange: (value: string) => void;
  onUnsetKey?: (() => void) | undefined;
  disabled: boolean;
  busy: boolean;
  validation?: ValidationResult | undefined;
  routeCollision: boolean;
  message: string;
  t: TranslateNS<"settings.custom-models">;
  onChange: (change: (value: ProviderDraft) => void) => void;
  onSave: () => void;
  onCancel: () => void;
  onReset?: (() => void) | undefined;
}

function Field({
  label, error, children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return <div className="cm-field">
    <span className="cm-field-label">{label}</span>
    {children}
    {error ? <span className="cm-error">{error}</span> : null}
  </div>;
}

export function ProviderEditor(props: ProviderEditorProps) {
  const {
    api, draft, mode, t, disabled, busy, validation, routeCollision,
  } = props;
  const [fetchBusy, setFetchBusy] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [candidates, setCandidates] = useState<DiscoveredModelView[]>();
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set());
  const validationMessage = (code: string | undefined) => {
    const key = validationKey(code);
    return key === undefined ? undefined : t(key);
  };
  const errorKeys = Object.keys(validation?.errors ?? {});
  const hasCustomErrors = routeCollision || (validation !== undefined && (
    validation.errors.route !== undefined
    || validation.errors.baseURL !== undefined
    || validation.errors.models !== undefined
    || errorKeys.some((path) => path.startsWith("models."))
  ));
  const hasAdvancedErrors = validation !== undefined && (
    validation.errors.apiKeyEnv !== undefined
    || validation.errors.streamIdleTimeoutMs !== undefined
    || errorKeys.some((path) => path.startsWith("headers.") || path.startsWith("retryPolicy."))
  );
  const [customOpen, setCustomOpen] = useState(mode === "create");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [expandedModels, setExpandedModels] = useState<ReadonlySet<number>>(() => new Set());
  const toggleModel = (index: number) => {
    setExpandedModels((current) => {
      const next = new Set(current);
      if (!next.delete(index)) next.add(index);
      return next;
    });
  };
  const removeModel = (index: number) => {
    props.onChange((value) => { value.models.splice(index, 1); });
    setExpandedModels((current) => {
      const next = new Set<number>();
      for (const at of current) {
        if (at < index) next.add(at);
        else if (at > index) next.add(at - 1);
      }
      return next;
    });
  };
  useEffect(() => {
    if (hasCustomErrors) setCustomOpen(true);
  }, [hasCustomErrors]);
  useEffect(() => {
    if (hasAdvancedErrors) setAdvancedOpen(true);
  }, [hasAdvancedErrors]);

  const identity = <>
    {mode === "create" ? <Field
      label={t("route")}
      error={routeCollision ? t("routeExists") : validationMessage(validation?.errors.route)}
    >
      <input
        className="cm-input"
        value={draft.route}
        placeholder="acme-gateway"
        aria-label={t("route")}
        disabled={disabled}
        onChange={(event) => props.onChange((value) => { value.route = event.target.value; })}
      />
    </Field> : null}
    {mode === "create" ? <p className="cm-hint">{t("routeHint")}</p> : null}
    <Field label={t("displayName")}>
      <input
        className="cm-input"
        value={draft.displayName}
        placeholder={draft.route || t("displayName")}
        aria-label={t("displayName")}
        disabled={disabled}
        onChange={(event) => props.onChange((value) => { value.displayName = event.target.value; })}
      />
    </Field>
    <Field label={t("baseURL")} error={validationMessage(validation?.errors.baseURL)}>
      <input
        className="cm-input"
        value={draft.baseURL}
        placeholder="https://gateway.example/v1"
        aria-label={t("baseURL")}
        disabled={disabled}
        onChange={(event) => props.onChange((value) => { value.baseURL = event.target.value; })}
      />
    </Field>
    <Field label={t("api")}>
      <select
        className="cm-input cm-select"
        value={draft.api}
        aria-label={t("api")}
        disabled={disabled}
        onChange={(event) => props.onChange((value) => {
          value.api = event.target.value as ProviderDraft["api"];
          if (value.api === "openai-responses") {
            for (const model of value.models) model.compat = emptyCompat();
          }
        })}
      >
        <option value="openai-completions">openai-completions</option>
        <option value="openai-responses">openai-responses</option>
      </select>
    </Field>
  </>;

  const keyField = <Field label={t("apiKey")}>
    <input
      className="cm-input"
      type="password"
      autoComplete="off"
      value={props.secret}
      placeholder={
        props.credential?.writable === false
          ? t("keyEnvLocked")
          : props.credential?.configured === true
            ? t("keyStored")
            : t("keyPlaceholder")
      }
      aria-label={t("apiKey")}
      disabled={disabled || props.credential?.writable === false}
      onChange={(event) => props.onSecretChange(event.target.value)}
    />
    {mode === "edit" && props.credential?.configured === true && props.credential.writable && props.onUnsetKey
      ? <button type="button" className="cm-link" disabled={disabled} onClick={props.onUnsetKey}>
        {t("unsetCredential")}
      </button>
      : null}
  </Field>;

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
    } catch (error) {
      setFetchError(describeError(error));
    } finally {
      setFetchBusy(false);
    }
  };
  const closePicker = () => {
    setCandidates(undefined);
    setPicked(new Set());
  };
  const adoptPicked = () => {
    if (candidates === undefined) return;
    props.onChange((value) => {
      value.models = adoptDiscoveredModels(value.models, candidates, picked);
    });
    closePicker();
  };
  const toggleCandidate = (id: string) => {
    setPicked((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  };

  const models = <section className="cm-model-catalog" aria-label={t("models")}>
    <div className="cm-model-list-head">
      <div className="cm-model-catalog-heading">
        <span className="cm-model-catalog-title">{t("models")}</span>
        <span className="cm-model-catalog-meta">{t("modelsCustomized")}</span>
      </div>
      <button
        type="button"
        className="cm-link"
        disabled={disabled || fetchBusy || !askable}
        title={askable ? undefined : t("fetchNeedsBaseUrl")}
        onClick={() => { void fetchModels(); }}
      >
        {fetchBusy ? t("fetching") : t("fetchModels")}
      </button>
    </div>
    {draft.models.length === 0 ? <p className="cm-model-empty">{t("modelsEmpty")}</p> : null}
    {draft.models.map((model, index) => <ModelEditor
      key={(mode === "create" ? "new" : draft.route) + ":" + index}
      model={model}
      index={index}
      api={draft.api}
      disabled={disabled}
      expanded={expandedModels.has(index)}
      errors={validation?.errors ?? {}}
      t={t}
      onChange={(next) => props.onChange((value) => { value.models[index] = next; })}
      onToggle={() => toggleModel(index)}
      onRemove={() => removeModel(index)}
    />)}
    <button
      type="button"
      className="cm-add-model"
      disabled={disabled}
      onClick={() => props.onChange((value) => { value.models.push(emptyModel()); })}
    >
      {t("addModel")}
    </button>
    {validation?.errors.models !== undefined
      ? <p className="cm-error">{validationMessage(validation.errors.models)}</p>
      : null}
    {fetchError !== "" ? <p className="cm-error" role="alert">{fetchError}</p> : null}
    <Modal
      open={candidates !== undefined}
      onClose={closePicker}
      title={t("fetchTitle")}
      closeLabel={t("close")}
      description={t("fetchDescription")}
      footer={<>
        <Button type="button" onClick={closePicker}>{t("cancel")}</Button>
        <Button type="button" variant="primary" onClick={adoptPicked}>{t("fetchAdopt")}</Button>
      </>}
    >
      <ul className="cm-candidate-list">
        {(candidates ?? []).map((candidate) => <li key={candidate.id} className="cm-candidate">
          <label className="cm-candidate-label">
            <input
              type="checkbox"
              checked={picked.has(candidate.id)}
              onChange={() => toggleCandidate(candidate.id)}
            />
            <span className="cm-candidate-id">{candidate.id}</span>
          </label>
        </li>)}
      </ul>
    </Modal>
  </section>;

  const headerError = Object.entries(validation?.errors ?? {}).find(([path]) => path.startsWith("headers."));
  const advanced = <details
    className="cm-customized"
    open={advancedOpen}
    onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}
  >
    <summary className="cm-customized-summary">{t("advanced")}</summary>
    <div className="cm-customized-body">
      <Field label={t("apiKeyEnv")} error={validationMessage(validation?.errors.apiKeyEnv)}>
        <input
          className="cm-input"
          value={draft.apiKeyEnv}
          placeholder={deriveKeyRef(draft.route)}
          aria-label={t("apiKeyEnv")}
          disabled={disabled}
          onChange={(event) => props.onChange((value) => { value.apiKeyEnv = event.target.value; })}
        />
      </Field>
      <Field label={t("headers")} error={validationMessage(headerError?.[1])}>
        <textarea
          className="cm-input"
          rows={4}
          value={serializeHeaders(draft.headers)}
          aria-label={t("headers")}
          disabled={disabled}
          onChange={(event) => props.onChange((value) => {
            value.headers = parseHeaders(event.target.value);
          })}
        />
      </Field>
      <Field label={t("thinkingFormat")}>
        <select
          className="cm-input cm-select"
          value={draft.compat.thinkingFormat}
          aria-label={t("thinkingFormat")}
          disabled={disabled}
          onChange={(event) => props.onChange((value) => {
            value.compat.thinkingFormat = event.target.value as ProviderDraft["compat"]["thinkingFormat"];
          })}
        >
          <option value="">{t("inherit")}</option>
          {THINKING_FORMATS.map((format) => <option key={format} value={format}>{format}</option>)}
        </select>
      </Field>
      <Field label={t("supportsReasoningEffort")}>
        <select
          className="cm-input cm-select"
          value={draft.compat.supportsReasoningEffort}
          aria-label={t("supportsReasoningEffort")}
          disabled={disabled}
          onChange={(event) => props.onChange((value) => {
            value.compat.supportsReasoningEffort = event.target.value as ProviderDraft["compat"]["supportsReasoningEffort"];
          })}
        >
          <option value="">{t("inherit")}</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      </Field>
      <Field label={t("streamIdleTimeoutMs")} error={validationMessage(validation?.errors.streamIdleTimeoutMs)}>
        <input
          className="cm-input"
          inputMode="numeric"
          value={draft.streamIdleTimeoutMs}
          aria-label={t("streamIdleTimeoutMs")}
          disabled={disabled}
          onChange={(event) => props.onChange((value) => { value.streamIdleTimeoutMs = event.target.value; })}
        />
      </Field>
      <Field label={t("retryMode")}>
        <select
          className="cm-input cm-select"
          value={draft.retryPolicy.mode}
          aria-label={t("retryMode")}
          disabled={disabled}
          onChange={(event) => props.onChange((value) => {
            value.retryPolicy.mode = event.target.value as ProviderDraft["retryPolicy"]["mode"];
          })}
        >
          <option value="">{t("inherit")}</option>
          <option value="normal">{t("normal")}</option>
          <option value="always">{t("always")}</option>
        </select>
      </Field>
      {draft.retryPolicy.mode === "normal" ? <>
        <Field label={t("maxRetries")} error={validationMessage(validation?.errors["retryPolicy.maxRetries"])}>
          <input
            className="cm-input"
            inputMode="numeric"
            value={draft.retryPolicy.maxRetries}
            aria-label={t("maxRetries")}
            disabled={disabled}
            onChange={(event) => props.onChange((value) => { value.retryPolicy.maxRetries = event.target.value; })}
          />
        </Field>
        <Field label={t("retryableCodes")}>
          <input
            className="cm-input"
            value={draft.retryPolicy.retryableCodes}
            aria-label={t("retryableCodes")}
            disabled={disabled}
            onChange={(event) => props.onChange((value) => { value.retryPolicy.retryableCodes = event.target.value; })}
          />
        </Field>
      </> : null}
      {draft.retryPolicy.mode !== "" ? <>
        <Field label={t("initialDelayMs")} error={validationMessage(validation?.errors["retryPolicy.initialDelayMs"])}>
          <input
            className="cm-input"
            inputMode="numeric"
            value={draft.retryPolicy.initialDelayMs}
            aria-label={t("initialDelayMs")}
            disabled={disabled}
            onChange={(event) => props.onChange((value) => { value.retryPolicy.initialDelayMs = event.target.value; })}
          />
        </Field>
        <Field label={t("maxDelayMs")} error={validationMessage(validation?.errors["retryPolicy.maxDelayMs"])}>
          <input
            className="cm-input"
            inputMode="numeric"
            value={draft.retryPolicy.maxDelayMs}
            aria-label={t("maxDelayMs")}
            disabled={disabled}
            onChange={(event) => props.onChange((value) => { value.retryPolicy.maxDelayMs = event.target.value; })}
          />
        </Field>
        <Field label={t("jitterRatio")} error={validationMessage(validation?.errors["retryPolicy.jitterRatio"])}>
          <input
            className="cm-input"
            inputMode="decimal"
            value={draft.retryPolicy.jitterRatio}
            aria-label={t("jitterRatio")}
            disabled={disabled}
            onChange={(event) => props.onChange((value) => { value.retryPolicy.jitterRatio = event.target.value; })}
          />
        </Field>
      </> : null}
    </div>
  </details>;

  return <div className="cm-editor">
    <div className="cm-editor-head">
      <span className="cm-editor-title">
        {mode === "create" ? t("add") : (draft.displayName || draft.route || t("add"))}
      </span>
      {mode === "edit" && draft.route !== "" ? <span className="cm-editor-route">{draft.route}</span> : null}
    </div>
    {keyField}
    <details
      className="cm-customized"
      open={customOpen}
      onToggle={(event) => setCustomOpen(event.currentTarget.open)}
    >
      <summary className="cm-customized-summary">{t("customized")}</summary>
      <div className="cm-customized-body">
        {identity}
        {models}
        {advanced}
      </div>
    </details>
    {props.message !== "" ? <p className="cm-error" role="alert">{props.message}</p> : null}
    <div className="cm-editor-actions">
      {props.onReset
        ? <button type="button" className="cm-secondary cm-reset" disabled={disabled} onClick={props.onReset}>
          {t("reset")}
        </button>
        : null}
      <button type="button" className="cm-secondary" disabled={busy} onClick={props.onCancel}>
        {t("cancel")}
      </button>
      <button
        type="button"
        className="cm-primary"
        disabled={disabled || validation?.valid !== true || routeCollision}
        onClick={props.onSave}
      >
        {busy
          ? (mode === "create" ? t("creating") : t("saving"))
          : (mode === "create" ? t("create") : t("save"))}
      </button>
    </div>
  </div>;
}
