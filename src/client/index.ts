import React from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { IApiClient } from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-connection/client'
import { SettingsSection } from './SettingsSection.js'
import { en, NS, zh, type LocaleKey } from './locales.js'
import { reload } from './store.js'
import { styles } from './styles.js'
export { deriveKeyRef, validateProviderDraft } from './validation.js'
declare module '@deepseek-ai/dsh-client-ui-slots' { interface LocaleNamespaceMap { 'settings.custom-models': LocaleKey } }
export const inject=['slots','locale','connection','remote'] as const
export function apply(ctx:ClientContext):void{
 const style=document.createElement('style');style.dataset.dshCustomModels='';style.textContent=styles;document.head.append(style);ctx.effect(()=>()=>style.remove());
 ctx.effect(()=>ctx.locale.register(NS,{zh,en}));
 const api=(ctx as ClientContext & {connection:{api:IApiClient}}).connection.api;const refresh=()=>{void reload(api)};
 ctx.effect(() => {
  const disposers = [
   ctx.remote.$on('settings/document-updated', (ns) => { if (ns === 'custom-models') refresh() }),
   ctx.remote.$on('credentials/updated', refresh),
   ctx.remote.$on('llm/adapters-updated', refresh),
   ctx.on('connection/reset', refresh),
  ];
  return () => { for (const dispose of disposers) dispose() };
 }, 'dsh-custom-models: pushed invalidations');
 ctx.slots.inject('settings.section',()=>ctx.slots.register({name:'settings.section',id:'custom-models',order:15,label:()=>ctx.locale.getLocale().active==='zh'?'自定义模型':'Custom models',locale:NS,inject:()=>({api})},SettingsSection));
}
