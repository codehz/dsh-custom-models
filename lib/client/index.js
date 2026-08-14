import React from 'react';
import { SettingsSection } from './SettingsSection.js';
import { en, NS, zh } from './locales.js';
import { reload } from './store.js';
import { styles } from './styles.js';
export { deriveKeyRef, validateProviderDraft } from './validation.js';
export const inject = ['slots', 'locale', 'connection', 'remote'];
export function apply(ctx) {
    const style = document.createElement('style');
    style.dataset.dshCustomModels = '';
    style.textContent = styles;
    document.head.append(style);
    ctx.effect(() => () => style.remove());
    ctx.effect(() => ctx.locale.register(NS, { zh, en }));
    const api = ctx.connection.api;
    const refresh = () => { void reload(api); };
    ctx.effect(() => {
        const disposers = [
            ctx.remote.$on('settings/document-updated', (ns) => { if (ns === 'custom-models')
                refresh(); }),
            ctx.remote.$on('credentials/updated', refresh),
            ctx.remote.$on('llm/adapters-updated', refresh),
            ctx.on('connection/reset', refresh),
        ];
        return () => { for (const dispose of disposers)
            dispose(); };
    }, 'dsh-custom-models: pushed invalidations');
    ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: 'custom-models', order: 15, label: () => ctx.locale.getLocale().active === 'zh' ? '自定义模型' : 'Custom models', locale: NS, inject: () => ({ api }) }, SettingsSection));
}
//# sourceMappingURL=index.js.map