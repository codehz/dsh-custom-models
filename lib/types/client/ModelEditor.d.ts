import React from "react";
import type { TranslateNS } from "@deepseek-ai/dsh-client-locale/client";
import { type ApiKind, type ModelDraft } from "./types.js";
interface Props {
    model: ModelDraft;
    index: number;
    api: ApiKind;
    disabled: boolean;
    expanded: boolean;
    errors: Record<string, string>;
    t: TranslateNS<"settings.custom-models">;
    onChange: (model: ModelDraft) => void;
    onToggle: () => void;
    onRemove: () => void;
}
export declare function ModelEditor({ model, index, api, disabled, expanded, errors, t, onChange, onToggle, onRemove, }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=ModelEditor.d.ts.map