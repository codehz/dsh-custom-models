import React, { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pill } from "@deepseek-ai/dsh-client-ui-primitives";
import type { TranslateNS } from "@deepseek-ai/dsh-client-locale/client";
import { validationKey } from "./locales.js";
import { updateDraft } from "./form-utils.js";
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
  expanded: boolean;
  errors: Record<string, string>;
  t: TranslateNS<"settings.custom-models">;
  onChange: (model: ModelDraft) => void;
  onToggle: () => void;
  onRemove: () => void;
}

function Field({
  label, error, children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return <label className="cm-model-field">
    <span className="cm-model-field-label">{label}</span>
    {children}
    {error ? <span className="cm-error">{error}</span> : null}
  </label>;
}

function IconChevron({ open }: { open: boolean }) {
  return <svg
    width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden
    style={{ transform: open ? "rotate(90deg)" : undefined, transition: "transform 120ms ease" }}
  >
    <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

function IconTrash() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M2.5 4h11M6.5 4V2.5h3V4M4 4l.7 9a1 1 0 001 .9h4.6a1 1 0 001-.9L12 4M6.5 6.8v4.4M9.5 6.8v4.4"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>;
}

function IconGrip() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M5 3.5h.01M5 8h.01M5 12.5h.01M11 3.5h.01M11 8h.01M11 12.5h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>;
}

export function ModelEditor({
  model, index, api, disabled, expanded, errors, t, onChange, onToggle, onRemove,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: index });
  const path = "models." + index;
  const hasErrors = Object.keys(errors).some((key) => key === path || key.startsWith(path + "."));
  useEffect(() => {
    if (hasErrors && !expanded) onToggle();
  }, [hasErrors]);
  const message = (suffix: string) => {
    const key = validationKey(errors[path + suffix]);
    return key === undefined ? undefined : t(key);
  };
  const update = (change: (draft: ModelDraft) => void) => {
    const next = updateDraft(model, change);
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
  return <div
    ref={setNodeRef}
    className={"cm-model-entry" + (isDragging ? " cm-model-entry-dragging" : "")}
    style={{ transform: CSS.Transform.toString(transform), transition }}
  >
    <div className="cm-model-row">
      <button
        type="button"
        className="cm-icon cm-drag-handle"
        aria-label={t("reorderModel") + " " + (index + 1)}
        title={t("reorderModel")}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <IconGrip />
      </button>
      <input
        className="cm-input"
        value={model.id}
        placeholder={t("modelId")}
        aria-label={t("modelId") + " " + (index + 1)}
        disabled={disabled}
        onChange={(event) => update((draft) => { draft.id = event.target.value; })}
      />
      <input
        className="cm-input"
        value={model.name}
        placeholder={t("modelNamePlaceholder")}
        aria-label={t("modelName") + " " + (index + 1)}
        disabled={disabled}
        onChange={(event) => update((draft) => { draft.name = event.target.value; })}
      />
      <button
        type="button"
        className="cm-icon"
        aria-label={t("modelAdvanced") + " " + (index + 1)}
        aria-expanded={expanded}
        title={t("modelAdvanced")}
        onClick={onToggle}
      >
        <IconChevron open={expanded} />
      </button>
      <button
        type="button"
        className="cm-icon cm-icon-danger"
        aria-label={t("removeModel") + " " + (index + 1)}
        title={t("removeModel")}
        disabled={disabled}
        onClick={onRemove}
      >
        <IconTrash />
      </button>
    </div>
    {expanded ? <div className="cm-model-advanced">
      <Field label={t("contextWindow")} error={message(".contextWindow")}>
        <input
          className="cm-input"
          inputMode="numeric"
          value={model.contextWindow}
          placeholder="256K"
          aria-label={t("contextWindow") + " " + (index + 1)}
          disabled={disabled}
          onChange={(event) => update((draft) => { draft.contextWindow = event.target.value; })}
        />
      </Field>
      <Field label={t("maxTokens")} error={message(".maxTokens")}>
        <input
          className="cm-input"
          inputMode="numeric"
          value={model.maxTokens}
          placeholder="32K"
          aria-label={t("maxTokens") + " " + (index + 1)}
          disabled={disabled}
          onChange={(event) => update((draft) => { draft.maxTokens = event.target.value; })}
        />
      </Field>
      <div className="cm-model-extra cm-row-checks">
        <label className="cm-check">
          <input type="checkbox" checked={model.input.text} disabled={disabled} onChange={(event) => update((draft) => { draft.input.text = event.target.checked; })} />
          {t("text")}
        </label>
        <label className="cm-check">
          <input type="checkbox" checked={model.input.image} disabled={disabled} onChange={(event) => update((draft) => { draft.input.image = event.target.checked; })} />
          {t("image")}
        </label>
        {message(".input") ? <span className="cm-error">{message(".input")}</span> : null}
      </div>
      <label className="cm-model-extra cm-check">
        <input type="checkbox" checked={efforts !== false} disabled={disabled} onChange={(event) => update((draft) => {
          draft.reasoningEfforts = event.target.checked ? {} : false;
          if (!event.target.checked) draft.defaultReasoningEffort = "";
        })} />
        {t("reasoning")}
      </label>
      {efforts !== false ? <>
        <div className="cm-model-extra cm-effort-block">
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
          <select
            className="cm-input cm-select"
            value={model.defaultReasoningEffort}
            disabled={disabled}
            onChange={(event) => update((draft) => {
              draft.defaultReasoningEffort = event.target.value as Effort | "";
            })}
          >
            <option value="">{t("inherit")}</option>
            {EFFORTS.filter((effort) => Object.hasOwn(efforts, effort)).map((effort) =>
              <option key={effort} value={effort}>{effort}</option>)}
          </select>
        </Field>
        {Object.keys(efforts).length > 0 ? <div className="cm-model-extra cm-override">
          <button
            type="button"
            className="cm-override-toggle"
            aria-expanded={showOverrides}
            disabled={disabled}
            onClick={() => setOverrideOpen((value) => !value)}
          >
            <IconChevron open={showOverrides} />
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
                <input
                  className="cm-input"
                  aria-label={effort + " " + t("wireValue")}
                  placeholder={effort === "off" ? t("offOmit") : String(defaultWire(effort))}
                  value={value ?? ""}
                  disabled={disabled}
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
          <select
            className="cm-input cm-select"
            value={model.compat.thinkingFormat}
            disabled={disabled}
            onChange={(event) => update((draft) => {
              draft.compat.thinkingFormat = event.target.value as ModelDraft["compat"]["thinkingFormat"];
            })}
          >
            <option value="">{t("inherit")}</option>
            {THINKING_FORMATS.map((format) => <option key={format} value={format}>{format}</option>)}
          </select>
        </Field>
        <Field label={t("supportsReasoningEffort")}>
          <select
            className="cm-input cm-select"
            value={model.compat.supportsReasoningEffort}
            disabled={disabled}
            onChange={(event) => update((draft) => {
              draft.compat.supportsReasoningEffort = event.target.value as ModelDraft["compat"]["supportsReasoningEffort"];
            })}
          >
            <option value="">{t("inherit")}</option>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </Field>
      </> : null}
    </div> : null}
  </div>;
}
