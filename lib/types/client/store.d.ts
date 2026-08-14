import type { CredentialView, IApiClient, SettingsNamespaceView } from "@deepseek-ai/dsh-api-remotes/client";
export interface State {
    mounted: boolean;
    loading: boolean;
    writable: boolean;
    error: string;
    namespace?: SettingsNamespaceView;
    credentials: Record<string, CredentialView>;
    active: Set<string>;
}
export declare const settingsStore: import("@deepseek-ai/dsh-client-runtime/client").SnapshotStore<State>;
declare function describeError(error: unknown): string;
declare function valueOf<T>(response: {
    result: {
        ok: true;
        value: T;
    } | {
        ok: false;
        error: unknown;
    };
}): T;
export declare function reload(api: IApiClient): Promise<void>;
export declare function mount(api: IApiClient): void;
export declare const responseValue: typeof valueOf;
export { describeError };
//# sourceMappingURL=store.d.ts.map