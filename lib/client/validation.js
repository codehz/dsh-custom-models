import { isPositiveCapacity } from "./capacity.js";
import { normalizeEffortMap } from "./reasoning.js";
export function deriveKeyRef(route, explicit) {
    const value = explicit?.trim();
    return value || route.trim().toUpperCase().replace(/-/g, "_") + "_API_KEY";
}
function positiveInteger(value) {
    return value === "" || (/^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)));
}
function naturalNumber(value) {
    return value === "" || (/^\d+$/.test(value) && Number.isSafeInteger(Number(value)));
}
function nonNegativeNumber(value) {
    return value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0);
}
export function validateProviderDraft(draft) {
    const errors = {};
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(draft.route)) {
        errors.route = "invalidRoute";
    }
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(deriveKeyRef(draft.route, draft.apiKeyEnv))) {
        errors.apiKeyEnv = "invalidCredentialRef";
    }
    if (!draft.baseURL.trim()) {
        errors.baseURL = "required";
    }
    else {
        try {
            const url = new URL(draft.baseURL);
            if (url.protocol !== "http:" && url.protocol !== "https:")
                errors.baseURL = "invalidUrl";
        }
        catch {
            errors.baseURL = "invalidUrl";
        }
    }
    if (draft.models.length === 0)
        errors.models = "modelRequired";
    const ids = new Set();
    draft.models.forEach((model, index) => {
        const path = "models." + index;
        const id = model.id.trim();
        if (id === "")
            errors[path + ".id"] = "required";
        else if (ids.has(id))
            errors[path + ".id"] = "duplicate";
        else
            ids.add(id);
        if (!isPositiveCapacity(model.contextWindow))
            errors[path + ".contextWindow"] = "capacity";
        if (!isPositiveCapacity(model.maxTokens))
            errors[path + ".maxTokens"] = "capacity";
        if (!model.input.text && !model.input.image)
            errors[path + ".input"] = "modality";
        if (model.reasoningEfforts !== false) {
            const enabled = Object.keys(model.reasoningEfforts);
            const thinking = enabled.filter((effort) => effort !== "off");
            if (thinking.length === 0)
                errors[path + ".reasoningEfforts"] = "effortRequired";
            const normalized = normalizeEffortMap(model.reasoningEfforts);
            for (const effort of thinking) {
                const wire = normalized[effort];
                if (typeof wire !== "string" || wire.trim() === "") {
                    errors[path + ".reasoningEfforts." + effort] = "wireRequired";
                }
            }
            if (model.defaultReasoningEffort !== "" &&
                !Object.hasOwn(model.reasoningEfforts, model.defaultReasoningEffort)) {
                errors[path + ".defaultReasoningEffort"] = "defaultInvalid";
            }
        }
    });
    if (!positiveInteger(draft.streamIdleTimeoutMs))
        errors.streamIdleTimeoutMs = "positive";
    if (draft.retryPolicy.mode === "normal" && !naturalNumber(draft.retryPolicy.maxRetries)) {
        errors["retryPolicy.maxRetries"] = "positive";
    }
    if (!positiveInteger(draft.retryPolicy.initialDelayMs)) {
        errors["retryPolicy.initialDelayMs"] = "positive";
    }
    if (!positiveInteger(draft.retryPolicy.maxDelayMs)) {
        errors["retryPolicy.maxDelayMs"] = "positive";
    }
    if (!nonNegativeNumber(draft.retryPolicy.jitterRatio) || Number(draft.retryPolicy.jitterRatio) > 1) {
        errors["retryPolicy.jitterRatio"] = "ratio";
    }
    if (draft.retryPolicy.initialDelayMs !== "" &&
        draft.retryPolicy.maxDelayMs !== "" &&
        Number(draft.retryPolicy.initialDelayMs) > Number(draft.retryPolicy.maxDelayMs)) {
        errors["retryPolicy.maxDelayMs"] = "backoffOrder";
    }
    const headers = new Set();
    for (const [index, header] of draft.headers.entries()) {
        const key = header.key.trim().toLowerCase();
        if (key !== "" && headers.has(key))
            errors["headers." + index] = "duplicateHeader";
        headers.add(key);
    }
    return { valid: Object.keys(errors).length === 0, errors };
}
//# sourceMappingURL=validation.js.map