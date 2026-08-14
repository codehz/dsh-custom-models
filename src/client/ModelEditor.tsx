import React from "react";
import { Button, Input } from "@deepseek-ai/dsh-client-ui-primitives";
import type { TranslateNS } from "@deepseek-ai/dsh-client-locale/client";
import { validationKey } from "./locales.js";
import {
  EFFORTS,
  THINKING_FORMATS,
  type ApiKind,
  type Effort,
  type ModelDraft,
} from "./types.js";

interface Props {
  model: ModelDraft;
  index: number;
  api: ApiKind;
  disabled: boolean;
  errors: Record<string, string>;
  t: TranslateNS<"settings.custom-models">;
  onChange: (model: ModelDraft) => void;
  onRemove: () => void;
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

export function ModelEditor({
  model, index, api, disabled, errors, t, onChange, onRemove,
}: Props) {
  const path = "models." + index;
  const message = (suffix: string) => {
    const key = validationKey(errors[path + suffix]);
    return key === undefined ? undefined : t(key);
  };
  const update = (change: (draft: ModelDraft) => void) => {
    const next = structuredClone(model);
    change(next);
    onChange(next);
  };
  const efforts = model.reasoningEfforts;
  return <fieldset className="cm-card" disabled={disabled}>
    <legend>{t("models")} {index + 1}</legend>
    <div className="cm-card-head">
      <strong>{model.id || "—"}</strong>
      <Button size="sm" disabled={disabled} onClick={onRemove}>{t("removeModel")}</Button>
    </div>
    <div className="cm-grid">
      <Field label={t("modelId")} error={message(".id")}>
        <Input value={model.id} onChange={(event) => update((draft) => { draft.id = event.target.value; })}/>
      </Field>
      <Field label={t("modelName")}>
        <Input value={model.name} onChange={(event) => update((draft) => { draft.name = event.target.value; })}/>
      </Field>
      <Field label={t("contextWindow")} error={message(".contextWindow")}>
        <Input inputMode="numeric" value={model.contextWindow} onChange={(event) => update((draft) => { draft.contextWindow = event.target.value; })}/>
      </Field>
      <Field label={t("maxTokens")} error={message(".maxTokens")}>
        <Input inputMode="numeric" value={model.maxTokens} onChange={(event) => update((draft) => { draft.maxTokens = event.target.value; })}/>
      </Field>
      <div className="cm-wide cm-row">
        <label className="cm-check"><input type="checkbox" checked={model.input.text} onChange={(event) => update((draft) => { draft.input.text = event.target.checked; })}/>{t("text")}</label>
        <label className="cm-check"><input type="checkbox" checked={model.input.image} onChange={(event) => update((draft) => { draft.input.image = event.target.checked; })}/>{t("image")}</label>
        {message(".input") ? <span className="cm-error">{message(".input")}</span> : null}
      </div>
      <label className="cm-wide cm-check">
        <input type="checkbox" checked={efforts !== false} onChange={(event) => update((draft) => {
          draft.reasoningEfforts = event.target.checked ? {} : false;
          if (!event.target.checked) draft.defaultReasoningEffort = "";
        })}/>{t("reasoning")}
      </label>
      {efforts !== false ? <>
        <div className="cm-wide cm-efforts" aria-label={t("efforts")}>
          {EFFORTS.map((effort) => {
            const enabled = Object.hasOwn(efforts, effort);
            const error = message(".reasoningEfforts." + effort);
            return <React.Fragment key={effort}>
              <label className="cm-check">
                <input type="checkbox" checked={enabled} onChange={(event) => update((draft) => {
                  if (draft.reasoningEfforts === false) return;
                  if (event.target.checked) draft.reasoningEfforts[effort] = effort === "off" ? null : "";
                  else {
                    delete draft.reasoningEfforts[effort];
                    if (draft.defaultReasoningEffort === effort) draft.defaultReasoningEffort = "";
                  }
                })}/>{effort}
              </label>
              <div>
                <Input
                  aria-label={effort + " " + t("wireValue")}
                  disabled={!enabled}
                  placeholder={effort === "off" ? t("offOmit") : t("wireValue")}
                  value={efforts[effort] ?? ""}
                  onChange={(event) => update((draft) => {
                    if (draft.reasoningEfforts === false) return;
                    draft.reasoningEfforts[effort] = effort === "off" && event.target.value === ""
                      ? null
                      : event.target.value;
                  })}
                />
                {error ? <span className="cm-error">{error}</span> : null}
              </div>
            </React.Fragment>;
          })}
        </div>
        {message(".reasoningEfforts") ? <p className="cm-wide cm-error">{message(".reasoningEfforts")}</p> : null}
        <Field label={t("defaultEffort")} error={message(".defaultReasoningEffort")}>
          <select value={model.defaultReasoningEffort} onChange={(event) => update((draft) => {
            draft.defaultReasoningEffort = event.target.value as Effort | "";
          })}>
            <option value="">{t("inherit")}</option>
            {EFFORTS.filter((effort) => Object.hasOwn(efforts, effort)).map((effort) =>
              <option key={effort} value={effort}>{effort}</option>)}
          </select>
        </Field>
      </> : null}
      {api === "openai-completions" ? <>
        <Field label={t("thinkingFormat")}>
          <select value={model.compat.thinkingFormat} onChange={(event) => update((draft) => {
            draft.compat.thinkingFormat = event.target.value as ModelDraft["compat"]["thinkingFormat"];
          })}>
            <option value="">{t("inherit")}</option>
            {THINKING_FORMATS.map((format) => <option key={format} value={format}>{format}</option>)}
          </select>
        </Field>
        <Field label={t("supportsReasoningEffort")}>
          <select value={model.compat.supportsReasoningEffort} onChange={(event) => update((draft) => {
            draft.compat.supportsReasoningEffort = event.target.value as ModelDraft["compat"]["supportsReasoningEffort"];
          })}>
            <option value="">{t("inherit")}</option><option value="true">true</option><option value="false">false</option>
          </select>
        </Field>
      </> : null}
    </div>
  </fieldset>;
}
