import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type LocaleKey } from './locales.js';
export { deriveKeyRef, validateProviderDraft } from './validation.js';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'settings.custom-models': LocaleKey;
    }
}
export declare const inject: readonly ["slots", "locale", "connection", "remote"];
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map