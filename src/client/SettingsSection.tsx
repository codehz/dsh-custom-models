import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "@deepseek-ai/dsh-client-ui-primitives";
import { bindSnapshotSelector } from "@deepseek-ai/dsh-client-web-react";
import type { IApiClient } from "@deepseek-ai/dsh-api-remotes/client";
import type { TranslateNS } from "@deepseek-ai/dsh-client-locale/client";
import { ProviderEditor } from "./ProviderEditor.js";
import { providerFromValue, providersOf, providerToValue } from "./model-utils.js";
import {
  describeError,
  mount,
  reload,
  responseValue,
  settingsStore,
} from "./store.js";
import { deriveKeyRef, validateProviderDraft } from "./validation.js";
import { emptyProvider, type ProviderDraft } from "./types.js";

interface Props {
  api: IApiClient;
  t: TranslateNS<"settings.custom-models">;
}

function nameOf(value: unknown, route: string): string {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const name = (value as Record<string, unknown>).displayName;
    if (typeof name === "string" && name !== "") return name;
  }
  return route;
}

function IconPlus() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>;
}

const useSettings = bindSnapshotSelector(settingsStore);

export function SettingsSection({ api, t }: Props) {
  const snapshot = useSettings((state) => state);
  const [editing, setEditing] = useState<string | "new">();
  const [draft, setDraft] = useState<ProviderDraft>();
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pageError, setPageError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string>();
  const [saved, setSaved] = useState<string>();

  useEffect(() => mount(api), [api]);
  const layers = useMemo(() => ({
    resolved: providersOf(snapshot.namespace?.value),
    base: providersOf(snapshot.namespace?.base),
    user: providersOf(snapshot.namespace?.user),
  }), [snapshot.namespace]);
  const routes = useMemo(() => Object.keys(layers.resolved).sort(), [layers.resolved]);

  useEffect(() => {
    if (editing === undefined || editing === "new") return;
    if (!Object.hasOwn(layers.resolved, editing)) {
      setEditing(undefined);
      setDraft(undefined);
    }
  }, [editing, layers.resolved]);

  const validation = draft === undefined ? undefined : validateProviderDraft(draft);
  const keyRef = draft === undefined ? "" : deriveKeyRef(draft.route, draft.apiKeyEnv);
  const credential = draft === undefined ? undefined : snapshot.credentials[keyRef];
  const routeCollision = editing === "new" && draft !== undefined && Object.hasOwn(layers.resolved, draft.route);
  const disabled = busy || !snapshot.writable;
  const selectedRoute = editing === undefined || editing === "new" ? undefined : editing;
  const selectedIsBase = selectedRoute !== undefined && Object.hasOwn(layers.base, selectedRoute);
  const selectedHasUserOverride = selectedRoute !== undefined && Object.hasOwn(layers.user, selectedRoute);

  const edit = (change: (value: ProviderDraft) => void) => {
    setDraft((current) => {
      if (current === undefined) return current;
      const next = structuredClone(current);
      change(next);
      return next;
    });
  };
  const open = (route: string) => {
    setEditing(route);
    setDraft(providerFromValue(route, layers.resolved[route]));
    setSecret("");
    setMessage("");
    setPageError("");
    setSaved(undefined);
  };
  const startNew = () => {
    setEditing("new");
    setDraft(emptyProvider());
    setSecret("");
    setMessage("");
    setPageError("");
    setSaved(undefined);
  };
  const closeEditor = () => {
    setEditing(undefined);
    setDraft(undefined);
    setSecret("");
    setMessage("");
  };
  const toggle = (route: string) => {
    if (editing === route) closeEditor();
    else open(route);
  };
  const labelOf = (route: string) => nameOf(layers.resolved[route], route);
  const removable = (route: string) => Object.hasOwn(layers.user, route) && !Object.hasOwn(layers.base, route);
  const tagOf = (route: string) => {
    if (Object.hasOwn(layers.user, route) && !Object.hasOwn(layers.base, route)) return t("customTag");
    if (Object.hasOwn(layers.user, route)) return t("user");
    return t("base");
  };
  const credentialOf = (route: string) => {
    const profile = layers.resolved[route];
    const named = profile !== null && typeof profile === "object" && !Array.isArray(profile)
      ? (profile as { apiKeyEnv?: unknown }).apiKeyEnv
      : undefined;
    const ref = deriveKeyRef(route, typeof named === "string" ? named : undefined);
    return snapshot.credentials[ref];
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
      await reload(api);
      setSaved(draft.displayName || draft.route);
      closeEditor();
    } catch (error) {
      const detail = describeError(error);
      if (profileSaved) setMessage(t("credentialPartial") + " " + detail);
      else if (detail.toLowerCase().includes("conflict")) setMessage(t("conflict"));
      else setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  async function remove(route: string): Promise<void> {
    if (snapshot.namespace === undefined || !snapshot.writable) return;
    setBusy(true);
    setPageError("");
    try {
      responseValue(await api.settings.mutate({
        ns: "custom-models",
        ops: [{ op: "unset", path: ["providers", route] }],
        expectedRevision: snapshot.namespace.revision,
      }));
      await reload(api);
      if (editing === route) closeEditor();
      setConfirmDelete(undefined);
      setSaved(undefined);
    } catch (error) {
      setPageError(describeError(error));
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

  const editor = draft === undefined || editing === undefined ? null : <ProviderEditor
    draft={draft}
    mode={editing === "new" ? "create" : "edit"}
    credential={credential}
    secret={secret}
    onSecretChange={setSecret}
    onUnsetKey={() => { void unsetKey(); }}
    disabled={disabled}
    busy={busy}
    validation={validation}
    routeCollision={routeCollision}
    message={message}
    t={t}
    onChange={edit}
    onSave={() => { void save(); }}
    onCancel={closeEditor}
    onReset={selectedIsBase && selectedHasUserOverride ? () => { void remove(draft.route); } : undefined}
  />;

  return <section className="cm-root">
    <h2 className="cm-title">{t("title")}</h2>
    <p className="cm-sub">{t("subtitle")}</p>
    {!snapshot.writable && snapshot.namespace !== undefined
      ? <p className="cm-notice" role="status">{t("readOnly")}</p>
      : null}
    {saved !== undefined
      ? <p className="cm-saved" role="status">{t("savedProvider").replace("{provider}", saved)}</p>
      : null}
    {pageError !== "" ? <p className="cm-error" role="alert">{pageError}</p> : null}
    {snapshot.error !== "" ? <div className="cm-status cm-error" role="alert">
      {snapshot.error}
      <button type="button" className="cm-secondary" onClick={() => { void reload(api); }}>{t("retry")}</button>
    </div> : null}
    {snapshot.loading && snapshot.namespace === undefined ? <p>{t("loading")}</p> : <>
      {routes.length === 0 ? null : <ul className="cm-rows" aria-label={t("title")}>
        {routes.map((route) => {
          const openEditor = editing === route;
          const view = credentialOf(route);
          const configured = view?.configured === true;
          return <li key={route} className="cm-row-card">
            <div className="cm-row-head">
              <span className="cm-row-identity">
                <span className="cm-row-name">{labelOf(route)}</span>
                <span className="cm-row-tag">{tagOf(route)}</span>
                {!snapshot.active.has(route)
                  ? <span className="cm-row-tag">{t("inactive")}</span>
                  : null}
                <span
                  className={"cm-dot " + (configured ? "cm-dot-ok" : "cm-dot-miss")}
                  role="img"
                  aria-label={configured ? t("credentialConfigured") : t("credentialMissing")}
                  title={configured ? t("credentialConfigured") : t("credentialMissing")}
                />
              </span>
              <span className="cm-row-actions">
                <button
                  type="button"
                  className="cm-secondary"
                  aria-expanded={openEditor}
                  aria-label={t("editProvider").replace("{provider}", labelOf(route))}
                  onClick={() => toggle(route)}
                >
                  {t("edit")}
                </button>
                {removable(route)
                  ? <button
                    type="button"
                    className="cm-danger"
                    aria-label={t("delete") + " " + labelOf(route)}
                    disabled={!snapshot.writable}
                    onClick={() => {
                      setSaved(undefined);
                      setConfirmDelete(route);
                    }}
                  >
                    {t("delete")}
                  </button>
                  : null}
              </span>
            </div>
            {openEditor ? editor : null}
          </li>;
        })}
      </ul>}
      <div className="cm-add-block">
        {editing === "new" && editor !== null
          ? <div className="cm-add-card">{editor}</div>
          : <button
            type="button"
            className="cm-add-button"
            disabled={!snapshot.writable}
            onClick={startNew}
          >
            <IconPlus />
            {t("add")}
          </button>}
      </div>
    </>}
    <Modal
      open={confirmDelete !== undefined}
      onClose={() => setConfirmDelete(undefined)}
      title={t("confirmDelete")}
      closeLabel={t("close")}
      footer={<>
        <Button type="button" onClick={() => setConfirmDelete(undefined)}>{t("cancel")}</Button>
        <Button
          type="button"
          variant="primary"
          disabled={busy}
          onClick={() => { if (confirmDelete !== undefined) void remove(confirmDelete); }}
        >{t("delete")}</Button>
      </>}
    >
      {pageError !== "" ? <p className="cm-error">{pageError}</p> : null}
    </Modal>
  </section>;
}
