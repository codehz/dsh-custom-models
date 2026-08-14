import React from "react";
import type { IApiClient } from "@deepseek-ai/dsh-api-remotes/client";
import type { TranslateNS } from "@deepseek-ai/dsh-client-locale/client";
interface Props {
    api: IApiClient;
    t: TranslateNS<"settings.custom-models">;
}
export declare function SettingsSection({ api, t }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=SettingsSection.d.ts.map