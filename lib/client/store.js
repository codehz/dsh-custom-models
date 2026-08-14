import { createSnapshotStore } from "@deepseek-ai/dsh-client-runtime/client";
export const settingsStore = createSnapshotStore({
    mounted: false,
    loading: false,
    writable: false,
    error: "",
    credentials: {},
    active: new Set(),
});
function describeError(error) {
    if (error instanceof Error)
        return error.message;
    if (error !== null && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    return String(error);
}
function valueOf(response) {
    if (!response.result.ok)
        throw new Error(describeError(response.result.error));
    return response.result.value;
}
let loadVersion = 0;
export async function reload(api) {
    if (!settingsStore.getSnapshot().mounted)
        return;
    const version = ++loadVersion;
    settingsStore.update((state) => {
        state.loading = true;
        state.error = "";
    });
    try {
        const [settingsResponse, providersResponse] = await Promise.all([
            api.settings.describe({}),
            api.llm.providers({}),
        ]);
        const described = valueOf(settingsResponse);
        const namespace = described.namespaces.find(({ ns }) => ns === "custom-models");
        if (namespace === undefined)
            throw new Error("custom-models settings namespace is unavailable");
        const active = new Set(valueOf(providersResponse).providers
            .filter(({ active: isActive }) => isActive)
            .map(({ provider }) => provider));
        const refs = new Set();
        for (const layer of [namespace.value, namespace.base, namespace.user]) {
            const providers = layer?.providers;
            if (providers === undefined)
                continue;
            for (const profile of Object.values(providers)) {
                if (profile.apiKeyEnv !== undefined)
                    refs.add(profile.apiKeyEnv);
            }
        }
        const credentials = refs.size === 0
            ? {}
            : valueOf(await api.credentials.describe({ refs: [...refs] })).credentials;
        if (version !== loadVersion)
            return;
        settingsStore.set({
            mounted: true,
            loading: false,
            writable: described.writable,
            error: "",
            namespace,
            credentials,
            active,
        });
    }
    catch (error) {
        if (version !== loadVersion)
            return;
        settingsStore.update((state) => {
            state.loading = false;
            state.error = describeError(error);
        });
    }
}
export function mount(api) {
    if (settingsStore.getSnapshot().mounted)
        return;
    settingsStore.update((state) => {
        state.mounted = true;
    });
    void reload(api);
}
export const responseValue = valueOf;
export { describeError };
//# sourceMappingURL=store.js.map