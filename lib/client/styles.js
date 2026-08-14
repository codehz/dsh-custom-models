export const styles = `
.cm-root {
  box-sizing: border-box;
  width: 100%;
  max-width: 860px;
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family);
}
.cm-root h2 { margin: 0; font-size: 18px; font-weight: 600; }
.cm-root h3 { margin: 22px 0 10px; font-size: 15px; font-weight: 600; }
.cm-head, .cm-actions, .cm-action-group, .cm-row, .cm-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}
.cm-head { align-items: flex-start; }
.cm-sub { color: var(--dsw-alias-label-tertiary); margin: 4px 0 20px; font-size: 13px; line-height: 20px; }
.cm-layout { display: grid; grid-template-columns: minmax(180px, 230px) minmax(0, 1fr); gap: 16px; }
.cm-list, .cm-editor, .cm-card {
  box-sizing: border-box;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-2);
}
.cm-list { height: max-content; max-height: 66vh; padding: 6px; overflow-y: auto; }
.cm-provider {
  width: 100%;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 8px;
  padding: 9px 10px;
}
.cm-provider:hover, .cm-provider[aria-current=true] { background: var(--dsw-alias-interactive-bg-hover); }
.cm-provider:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: -2px; }
.cm-badge { color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 18px; }
.cm-editor { min-width: 0; margin: 0; padding: 18px; }
.cm-editor:disabled { opacity: .72; }
.cm-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.cm-field { display: flex; min-width: 0; flex-direction: column; gap: 5px; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.cm-field select, .cm-field textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 36px;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  background: var(--dsw-alias-bg-module-platform);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  padding: 7px 10px;
}
.cm-field textarea { min-height: 84px; resize: vertical; }
.cm-field select:focus-visible, .cm-field textarea:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 1px; }
.cm-wide { grid-column: 1 / -1; }
.cm-card { min-width: 0; margin: 12px 0; padding: 12px; background: var(--dsw-alias-bg-layer-3); }
.cm-card legend { color: var(--dsw-alias-label-secondary); padding: 0 5px; font-size: 12px; }
.cm-card-head { margin-bottom: 10px; }
.cm-error { color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 18px; }
.cm-status { display: flex; align-items: center; gap: 8px; margin: 10px 0; padding: 9px 10px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-module-platform); border-radius: 8px; font-size: 12px; }
.cm-efforts { display: grid; grid-template-columns: minmax(86px, auto) minmax(0, 1fr); align-items: start; gap: 7px 10px; }
.cm-check { display: inline-flex; align-items: center; gap: 6px; min-height: 28px; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.cm-actions { margin-top: 20px; flex-wrap: wrap; }
.cm-action-group { justify-content: flex-start; }
@media (max-width: 760px) {
  .cm-layout, .cm-grid { grid-template-columns: 1fr; }
  .cm-wide { grid-column: auto; }
  .cm-list { max-height: 220px; }
  .cm-head { flex-wrap: wrap; }
}
`;
//# sourceMappingURL=styles.js.map