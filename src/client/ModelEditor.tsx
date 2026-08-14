import React, { useEffect, useState } from "react";
import { Button, Input, Pill } from "@deepseek-ai/dsh-client-ui-primitives";
import type { TranslateNS } from "@deepseek-ai/dsh-client-locale/client";
import { validationKey } from "./locales.js";
import {
  customEffortCount,
  defaultWire,
  disableEffort,
  enableEffort,
  isCustomWire,
  setEffortWire,
} from "./reasoning.js";
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
  const overrideErrors = efforts === false
    ? []
    : EFFORTS.filter((effort) => message(".reasoningEfforts." + effort) !== undefined);
  const overrideCount = efforts === false ? 0 : customEffortCount(efforts);
  const [overrideOpen, setOverrideOpen] = useState(overrideCount > 0);
  const showOverrides = overrideOpen || overrideErrors.length > 0;
  useEffect(() => {
    if (overrideErrors.length > 0) setOverrideOpen(true);
  }, [overrideErrors.length]);
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
        <div className="cm-wide cm-effort-block">
          <div className="cm-effort-label">{t("efforts")}</div>
          <div className="cm-effort-pills" role="group" aria-label={t("efforts")}>
            {EFFORTS.map((effort) => {
              const enabled = Object.hasOwn(efforts, effort);
              const custom = enabled && isCustomWire(effort, efforts[effort]);
              return <Pill
                key={effort}
                type="button"
                active={enabled}
                disabled={disabled}
                aria-pressed={enabled}
                className={custom ? "cm-effort-custom" : undefined}
                title={custom ? t("customWireHint").replace("{effort}", effort).replace("{value}", String(efforts[effort])) : undefined}
                onClick={() => update((draft) => {
                  if (draft.reasoningEfforts === false) return;
                  if (Object.hasOwn(draft.reasoningEfforts, effort)) {
                    draft.reasoningEfforts = disableEffort(draft.reasoningEfforts, effort);
                    if (draft.defaultReasoningEffort === effort) draft.defaultReasoningEffort = "";
                  } else {
                    draft.reasoningEfforts = enableEffort(draft.reasoningEfforts, effort);
                  }
                })}
              >
                {effort}
                {custom ? <span className="cm-effort-wire">→ {String(efforts[effort])}</span> : null}
              </Pill>;
            })}
          </div>
          <p className="cm-effort-hint">{t("effortHint")}</p>
          {message(".reasoningEfforts") ? <p className="cm-error">{message(".reasoningEfforts")}</p> : null}
        </div>
        <Field label={t("defaultEffort")} error={message(".defaultReasoningEffort")}>
          <select value={model.defaultReasoningEffort} onChange={(event) => update((draft) => {
            draft.defaultReasoningEffort = event.target.value as Effort | "";
          })}>
            <option value="">{t("inherit")}</option>
            {EFFORTS.filter((effort) => Object.hasOwn(efforts, effort)).map((effort) =>
              <option key={effort} value={effort}>{effort}</option>)}
          </select>
        </Field>
        {Object.keys(efforts).length > 0 ? <div className="cm-wide cm-override">
          <button
            type="button"
            className="cm-override-toggle"
            aria-expanded={showOverrides}
            disabled={disabled}
            onClick={() => setOverrideOpen((open) => !open)}
          >
            <span aria-hidden="true">{showOverrides ? "▾" : "▸"}</span>
            {t("overrideWires")}
            {overrideCount > 0 ? <span className="cm-override-count">{t("overrideCount").replace("{count}", String(overrideCount))}</span> : null}
          </button>
          {showOverrides ? <div className="cm-override-list">
            <p className="cm-override-hint">{t("overrideHint")}</p>
            {EFFORTS.filter((effort) => Object.hasOwn(efforts, effort)).map((effort) => {
              const error = message(".reasoningEfforts." + effort);
              const value = efforts[effort];
              return <Field
                key={effort}
                label={effort === "off" ? t("offWire") : t("wireFor").replace("{effort}", effort)}
                error={error}
              >
                <Input
                  aria-label={effort + " " + t("wireValue")}
                  placeholder={effort === "off" ? t("offOmit") : String(defaultWire(effort))}
                  value={value ?? ""}
                  onChange={(event) => update((draft) => {
                    if (draft.reasoningEfforts === false) return;
                    draft.reasoningEfforts = setEffortWire(draft.reasoningEfforts, effort, event.target.value);
                  })}
                />
              </Field>;
            })}
          </div> : null}
        </div> : null}
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
