export const styles = `
.cm-root {
  box-sizing: border-box;
  width: 100%;
  max-width: 720px;
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family);
}
.cm-root h2 { margin: 0; font-size: 16px; font-weight: 500; line-height: 24px; }
.cm-root h3 { margin: 24px 0 10px; font-size: 15px; font-weight: 600; }
.cm-head, .cm-actions, .cm-action-group, .cm-row, .cm-card-head, .cm-editor-head, .cm-editor-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}
.cm-head { align-items: flex-start; margin-bottom: 20px; }
.cm-sub { color: var(--dsw-alias-label-tertiary); margin: 2px 0 0; font-size: 14px; line-height: 22px; }
.cm-layout { display: flex; min-width: 0; flex-direction: column; gap: 12px; }
.cm-list { display: flex; min-width: 0; flex-direction: column; gap: 8px; margin: 0; padding: 0; }
.cm-empty {
  box-sizing: border-box;
  margin: 0;
  border: 1px dashed var(--dsw-alias-border-l3);
  border-radius: 12px;
  padding: 18px 14px;
  color: var(--dsw-alias-label-tertiary);
  text-align: center;
  font-size: 13px;
  line-height: 20px;
}
.cm-provider {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  padding: 11px 14px;
}
.cm-provider:hover { background: var(--dsw-alias-interactive-bg-hover); }
.cm-provider[aria-current=true] {
  border-color: var(--dsw-alias-border-l3);
  background: var(--dsw-alias-bg-module-platform);
}
.cm-provider:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 2px; }
.cm-provider-title { overflow-wrap: anywhere; font-size: 14px; font-weight: 500; line-height: 22px; }
.cm-badge { color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.cm-editor, .cm-card {
  box-sizing: border-box;
  min-width: 0;
  border: 0;
  border-radius: 12px;
  background: var(--dsw-alias-bg-module-platform);
}
.cm-editor { margin: 0; padding: 16px; }
.cm-editor:disabled { opacity: .72; }
.cm-editor-head { align-items: flex-start; margin-bottom: 16px; }
.cm-editor-identity { min-width: 0; justify-content: flex-start; flex-wrap: wrap; gap: 6px; }
.cm-editor-title { overflow-wrap: anywhere; font-size: 14px; font-weight: 500; line-height: 22px; }
.cm-editor-route { color: var(--dsw-alias-label-tertiary); overflow-wrap: anywhere; font-size: 12px; line-height: 18px; }
.cm-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.cm-field { display: flex; min-width: 0; flex-direction: column; gap: 5px; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.cm-field select, .cm-field textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 36px;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  padding: 7px 10px;
}
.cm-field textarea { min-height: 84px; resize: vertical; }
.cm-field select:focus-visible, .cm-field textarea:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 1px; }
.cm-wide { grid-column: 1 / -1; }
.cm-card { margin: 12px 0; padding: 12px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2); }
.cm-card legend { color: var(--dsw-alias-label-secondary); padding: 0 5px; font-size: 12px; }
.cm-card-head { margin-bottom: 10px; }
.cm-error { color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 18px; }
.cm-status { display: flex; align-items: center; gap: 8px; margin: 10px 0; padding: 9px 10px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-1); border-radius: 8px; font-size: 12px; }
.cm-efforts { display: grid; grid-template-columns: minmax(86px, auto) minmax(0, 1fr); align-items: start; gap: 7px 10px; }
.cm-check { display: inline-flex; align-items: center; gap: 6px; min-height: 28px; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.cm-actions { margin-top: 20px; flex-wrap: wrap; }
.cm-action-group { justify-content: flex-start; }
.cm-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 640px) {
  .cm-grid { grid-template-columns: 1fr; }
  .cm-wide { grid-column: auto; }
  .cm-head, .cm-editor-head { flex-wrap: wrap; }
}
`;
//# sourceMappingURL=styles.js.map