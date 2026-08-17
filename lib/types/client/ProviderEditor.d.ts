import React from "react";
import type { CredentialView, IApiClient } from "@deepseek-ai/dsh-api-remotes/client";
import type { TranslateNS } from "@deepseek-ai/dsh-client-locale/client";
import { type ProviderDraft, type ValidationResult } from "./types.js";
export interface ProviderEditorProps {
    api: IApiClient;
    draft: ProviderDraft;
    mode: "create" | "edit";
    credential?: CredentialView | undefined;
    secret: string;
    onSecretChange: (value: string) => void;
    onUnsetKey?: (() => void) | undefined;
    disabled: boolean;
    busy: boolean;
    validation?: ValidationResult | undefined;
    routeCollision: boolean;
    message: string;
    t: TranslateNS<"settings.custom-models">;
    onChange: (change: (value: ProviderDraft) => void) => void;
    onSave: () => void;
    onCancel: () => void;
    onReset?: (() => void) | undefined;
}
export declare function ProviderEditor(props: ProviderEditorProps): React.JSX.Element;
//# sourceMappingURL=ProviderEditor.d.ts.map