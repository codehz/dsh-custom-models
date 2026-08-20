export const styles = `
.cm-root {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 720px;
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family);
}
.cm-root *, .cm-root *::before, .cm-root *::after { box-sizing: border-box; }
.cm-root h2, .cm-title {
  margin: 0;
  color: var(--dsw-alias-label-primary);
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}
.cm-sub, .cm-intro {
  margin: 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 14px;
  line-height: 22px;
}
.cm-notice {
  margin: 0;
  color: var(--dsw-alias-state-warn-label);
  font-size: 12px;
  line-height: 18px;
}
.cm-saved {
  margin: 0;
  color: var(--dsw-alias-state-success-primary);
  font-size: 12px;
  line-height: 18px;
}
.cm-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}
.cm-row-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  padding: 12px 14px;
}
.cm-row-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cm-row-identity {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}
.cm-row-name {
  overflow-wrap: anywhere;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}
.cm-row-tag {
  flex: none;
  border: 1px solid var(--dsw-alias-border-l3);
  border-radius: 4px;
  padding: 1px 6px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
}
.cm-dot {
  display: inline-block;
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.cm-dot-ok { background: var(--dsw-alias-state-success-primary); }
.cm-dot-miss { background: var(--dsw-alias-state-error-primary); }
.cm-row-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
.cm-primary, .cm-secondary, .cm-add-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 18px;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;
}
.cm-primary {
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground);
}
.cm-primary:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.cm-secondary, .cm-add-button {
  border: 1px solid var(--dsw-alias-border-l2);
  background: transparent;
  color: var(--dsw-alias-label-primary);
}
.cm-secondary:hover:not(:disabled),
.cm-add-button:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
}
.cm-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 18px;
  background: transparent;
  color: var(--dsw-alias-state-error-primary);
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;
}
.cm-danger:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover-danger); }
.cm-row-actions .cm-secondary,
.cm-row-actions .cm-danger {
  height: 28px;
  padding: 0 10px;
  border-radius: 14px;
  font-size: 12px;
  line-height: 18px;
}
.cm-primary:disabled, .cm-secondary:disabled, .cm-danger:disabled,
.cm-add-button:disabled, .cm-link:disabled, .cm-add-model:disabled {
  opacity: .4;
  cursor: default;
}
.cm-primary:focus-visible, .cm-secondary:focus-visible, .cm-danger:focus-visible,
.cm-add-button:focus-visible, .cm-link:focus-visible, .cm-add-model:focus-visible,
.cm-icon:focus-visible, .cm-customized-summary:focus-visible, .cm-input:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--dsw-alias-border-l3);
}
.cm-editor {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-module-platform);
  padding: 14px 16px;
}
.cm-editor-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.cm-editor-title {
  overflow-wrap: anywhere;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}
.cm-editor-route {
  overflow-wrap: anywhere;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
.cm-field { display: flex; min-width: 0; flex-direction: column; gap: 6px; }
.cm-field-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
}
.cm-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 14px;
  line-height: 22px;
}
.cm-input:focus { outline: none; border-color: var(--dsw-alias-brand-primary); }
.cm-input::placeholder { color: var(--dsw-alias-label-dimmed); }
.cm-input:disabled { opacity: .6; cursor: default; }
select.cm-input { max-width: 240px; cursor: pointer; }
.cm-select {
  appearance: none;
  padding-right: 32px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px 12px;
}
textarea.cm-input {
  height: auto;
  min-height: 84px;
  padding: 7px 10px;
  resize: vertical;
}
.cm-hint {
  margin: 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
.cm-link {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  height: 28px;
  margin: 0;
  padding: 0 10px;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
}
.cm-link:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
}
.cm-editor-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
.cm-reset { margin-right: auto; }
.cm-add-block { display: flex; flex-direction: column; gap: 12px; }
.cm-add-button {
  gap: 6px;
  height: 44px;
  border: 1px dashed var(--dsw-alias-border-l3);
  border-radius: 12px;
}
.cm-customized {
  border-top: 1px solid var(--dsw-alias-border-l2);
  padding-top: 10px;
}
.cm-customized-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  margin-left: -4px;
  border-radius: 6px;
  padding: 2px 4px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  cursor: pointer;
  list-style: none;
}
.cm-customized-summary::-webkit-details-marker { display: none; }
.cm-customized-summary::before {
  content: "";
  width: 5px;
  height: 5px;
  border-right: 1.5px solid currentcolor;
  border-bottom: 1.5px solid currentcolor;
  transform: rotate(-45deg) translate(-1px, -1px);
  transition: transform 120ms ease;
}
.cm-customized[open] > .cm-customized-summary::before {
  transform: rotate(45deg) translate(-1px, -1px);
}
.cm-customized-summary:hover { color: var(--dsw-alias-label-primary); }
.cm-customized-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
}
.cm-model-catalog {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid var(--dsw-alias-border-l2);
  padding-top: 12px;
}
.cm-model-list-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.cm-model-list-head .cm-link { flex: none; }
.cm-candidate-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 360px;
  margin: 0;
  overflow: auto;
  padding: 0;
  list-style: none;
}
.cm-candidate { margin: 0; }
.cm-candidate-label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  border-radius: 6px;
  padding: 0 4px;
  cursor: pointer;
}
.cm-candidate-label:hover { background: var(--dsw-alias-interactive-bg-hover); }
.cm-candidate-label.cm-candidate-disabled {
  color: var(--dsw-alias-label-tertiary);
  cursor: not-allowed;
  opacity: .55;
}
.cm-candidate-label.cm-candidate-disabled:hover { background: transparent; }
.cm-candidate-id {
  overflow-wrap: anywhere;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 20px;
}
.cm-model-catalog-heading { display: flex; flex-direction: column; gap: 2px; }
.cm-model-catalog-title {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
}
.cm-model-catalog-meta, .cm-model-empty {
  margin: 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
.cm-model-empty {
  border: 1px dashed var(--dsw-alias-border-l3);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}
.cm-model-entry {
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  padding: 6px;
}
.cm-model-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1.4fr) minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 6px;
}
.cm-model-entry-dragging {
  position: relative;
  z-index: 1;
  opacity: .75;
  box-shadow: 0 8px 20px rgb(0 0 0 / 14%);
}
.cm-drag-handle {
  cursor: grab;
}
.cm-drag-handle:active {
  cursor: grabbing;
}
.cm-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
}
.cm-icon:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.cm-icon:disabled { opacity: .4; cursor: default; }
.cm-icon-danger:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-danger);
  color: var(--dsw-alias-state-error-primary);
}
.cm-model-advanced {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
  padding: 8px 4px 2px;
}
.cm-model-field { display: flex; min-width: 0; flex-direction: column; gap: 4px; }
.cm-model-field-label {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
.cm-model-extra { grid-column: 1 / -1; }
.cm-add-model {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 14px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
}
.cm-add-model:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.cm-error {
  margin: 0;
  color: var(--dsw-alias-state-error-primary);
  font-size: 12px;
  line-height: 18px;
}
.cm-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  padding: 9px 10px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}
.cm-effort-block, .cm-override { display: flex; min-width: 0; flex-direction: column; gap: 8px; }
.cm-effort-label, .cm-effort-hint, .cm-override-hint {
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
}
.cm-effort-hint { margin: 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.cm-effort-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.cm-effort-custom { box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l3); }
.cm-effort-wire { margin-left: 4px; color: var(--dsw-alias-label-tertiary); font-weight: 400; font-size: 12px; }
.cm-override-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
}
.cm-override-toggle svg { flex: none; }
.cm-override-toggle:hover { color: var(--dsw-alias-label-primary); }
.cm-override-toggle:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 2px; }
.cm-override-count { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.cm-override-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-module-platform);
  padding: 12px;
}
.cm-override-list .cm-override-hint { grid-column: 1 / -1; }
.cm-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
}
.cm-row-checks { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.cm-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
  padding: 0;
}
@media (max-width: 640px) {
  .cm-model-row { grid-template-columns: auto minmax(0, 1fr) auto auto; }
  .cm-model-row .cm-input:nth-child(2) { grid-column: 2 / -1; grid-row: 2; }
  .cm-override-list { grid-template-columns: 1fr; }
  .cm-override-list .cm-field { grid-column: auto; }
  .cm-row-head { flex-wrap: wrap; }
}
@media (prefers-reduced-motion: reduce) {
  .cm-customized-summary::before { transition: none; }
}
`;
