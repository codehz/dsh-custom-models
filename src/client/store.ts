import { createSnapshotStore } from "@deepseek-ai/dsh-client-runtime/client";
import type {
  CredentialView,
  IApiClient,
  SettingsNamespaceView,
} from "@deepseek-ai/dsh-api-remotes/client";

export interface State {
  mounted: boolean;
  loading: boolean;
  writable: boolean;
  error: string;
  namespace?: SettingsNamespaceView;
  credentials: Record<string, CredentialView>;
  active: Set<string>;
}

export const settingsStore = createSnapshotStore<State>({
  mounted: false,
  loading: false,
  writable: false,
  error: "",
  credentials: {},
  active: new Set(),
});

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error !== null && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}
function valueOf<T>(response: {
  result: { ok: true; value: T } | { ok: false; error: unknown };
}): T {
  if (!response.result.ok) throw new Error(describeError(response.result.error));
  return response.result.value;
}

let loadVersion = 0;
export async function reload(api: IApiClient): Promise<void> {
  if (!settingsStore.getSnapshot().mounted) return;
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
    if (namespace === undefined) throw new Error("custom-models settings namespace is unavailable");
    const active = new Set(
      valueOf(providersResponse).providers
        .filter(({ active: isActive }) => isActive)
        .map(({ provider }) => provider),
    );
    const refs = new Set<string>();
    for (const layer of [namespace.value, namespace.base, namespace.user]) {
      const providers = (layer as {
        providers?: Record<string, { apiKeyEnv?: string }>;
      } | undefined)?.providers;
      if (providers === undefined) continue;
      for (const profile of Object.values(providers)) {
        if (profile.apiKeyEnv !== undefined) refs.add(profile.apiKeyEnv);
      }
    }
    const credentials = refs.size === 0
      ? {}
      : valueOf(await api.credentials.describe({ refs: [...refs] })).credentials;
    if (version !== loadVersion) return;
    settingsStore.set({
      mounted: true,
      loading: false,
      writable: described.writable,
      error: "",
      namespace,
      credentials,
      active,
    });
  } catch (error) {
    if (version !== loadVersion) return;
    settingsStore.update((state) => {
      state.loading = false;
      state.error = describeError(error);
    });
  }
}

export function mount(api: IApiClient): void {
  if (settingsStore.getSnapshot().mounted) return;
  settingsStore.update((state) => {
    state.mounted = true;
  });
  void reload(api);
}

export const responseValue = valueOf;
export { describeError };
