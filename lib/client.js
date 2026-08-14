window.__ModuleLoader__.load({
	id: "dsh-custom-models",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_web_react = require("@deepseek-ai/dsh-client-web-react");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region src/client/locales.ts
		const NS = "settings.custom-models";
		const zh = {
			section: "自定义模型",
			title: "自定义模型",
			subtitle: "管理兼容 OpenAI 的提供商、模型、推理能力与凭据。",
			add: "添加提供商",
			save: "保存",
			cancel: "取消",
			delete: "删除",
			reset: "重置覆盖",
			route: "路由",
			displayName: "显示名称",
			apiKeyEnv: "凭据引用",
			apiKey: "API 密钥（只写）",
			api: "API 类型",
			baseURL: "基础 URL",
			headers: "请求头（每行 key: value）",
			thinkingFormat: "思考格式",
			supportsReasoningEffort: "推理强度兼容标志",
			inherit: "继承 / 不设置",
			streamIdleTimeoutMs: "流空闲超时 (ms)",
			retryMode: "重试模式",
			normal: "有限重试",
			always: "始终重试",
			maxRetries: "最大重试次数",
			retryableCodes: "可重试代码（逗号分隔）",
			initialDelayMs: "初始退避 (ms)",
			maxDelayMs: "最大退避 (ms)",
			jitterRatio: "抖动比例",
			models: "模型",
			addModel: "添加模型",
			modelId: "模型 ID",
			modelName: "模型名称",
			contextWindow: "上下文窗口",
			maxTokens: "最大输出",
			text: "文本",
			image: "图像",
			reasoning: "启用推理等级",
			efforts: "推理强度映射",
			wireValue: "供应商 wire 值",
			offOmit: "留空表示 off 时不发送 reasoning_effort",
			defaultEffort: "默认强度",
			modelCompat: "模型兼容选项",
			active: "已启用",
			inactive: "未启用",
			base: "基础层",
			user: "用户层",
			configured: "已配置",
			notConfigured: "未配置",
			source: "来源",
			unsetCredential: "清除凭据",
			loading: "正在加载…",
			empty: "尚无提供商。",
			error: "操作失败",
			conflict: "设置已在其他位置更改；草稿已保留，请刷新后重试。",
			credentialPartial: "配置已保存，但 API 密钥写入失败；密钥仍保留在输入框中，可再次保存重试。",
			readOnly: "当前设置文档为只读，无法保存修改。",
			routeExists: "该路由已存在，请编辑现有提供商或使用其他路由。",
			retry: "重试",
			removeModel: "移除模型",
			close: "关闭",
			confirmDelete: "确定删除此提供商吗？",
			validationRequired: "必填",
			validationRoute: "请使用小写字母开头，并仅包含小写字母、数字和连字符",
			validationUrl: "请输入 http 或 https URL",
			validationPositive: "请输入正整数",
			validationNonNegative: "请输入非负数",
			validationRatio: "请输入 0 到 1 之间的数值",
			validationBackoffOrder: "最大退避必须不小于初始退避",
			validationDuplicate: "不可重复",
			validationModality: "至少选择一种输入模态",
			validationEffort: "至少启用一个 off 之外的推理等级",
			validationWire: "需要非空 wire 值",
			validationDefault: "默认等级必须是已启用等级",
			validationCredential: "凭据引用必须是合法环境变量名"
		};
		const en = {
			section: "Custom models",
			title: "Custom models",
			subtitle: "Manage OpenAI-compatible providers, models, reasoning, and credentials.",
			add: "Add provider",
			save: "Save",
			cancel: "Cancel",
			delete: "Delete",
			reset: "Reset override",
			route: "Route",
			displayName: "Display name",
			apiKeyEnv: "Credential reference",
			apiKey: "API key (write only)",
			api: "API type",
			baseURL: "Base URL",
			headers: "Headers (one key: value per line)",
			thinkingFormat: "Thinking format",
			supportsReasoningEffort: "Reasoning effort compatibility",
			inherit: "Inherit / unset",
			streamIdleTimeoutMs: "Stream idle timeout (ms)",
			retryMode: "Retry mode",
			normal: "Bounded retry",
			always: "Always retry",
			maxRetries: "Maximum retries",
			retryableCodes: "Retryable codes (comma-separated)",
			initialDelayMs: "Initial backoff (ms)",
			maxDelayMs: "Maximum backoff (ms)",
			jitterRatio: "Jitter ratio",
			models: "Models",
			addModel: "Add model",
			modelId: "Model ID",
			modelName: "Model name",
			contextWindow: "Context window",
			maxTokens: "Max output tokens",
			text: "Text",
			image: "Image",
			reasoning: "Enable reasoning efforts",
			efforts: "Reasoning effort map",
			wireValue: "Provider wire value",
			offOmit: "Leave blank to omit reasoning_effort for off",
			defaultEffort: "Default effort",
			modelCompat: "Model compatibility",
			active: "Active",
			inactive: "Inactive",
			base: "Base layer",
			user: "User layer",
			configured: "Configured",
			notConfigured: "Not configured",
			source: "Source",
			unsetCredential: "Unset credential",
			loading: "Loading…",
			empty: "No providers yet.",
			error: "Operation failed",
			conflict: "Settings changed elsewhere; your draft is preserved. Refresh and try again.",
			credentialPartial: "The profile was saved, but writing the API key failed. The key remains in the input so you can save again.",
			readOnly: "The settings document is read-only; changes cannot be saved.",
			routeExists: "That route already exists. Edit it or choose a different route.",
			retry: "Retry",
			removeModel: "Remove model",
			close: "Close",
			confirmDelete: "Delete this provider?",
			validationRequired: "Required",
			validationRoute: "Start with a lowercase letter and use only lowercase letters, digits, and hyphens",
			validationUrl: "Enter an http or https URL",
			validationPositive: "Enter a positive integer",
			validationNonNegative: "Enter a non-negative number",
			validationRatio: "Enter a number from 0 to 1",
			validationBackoffOrder: "Maximum backoff must be at least the initial backoff",
			validationDuplicate: "Must be unique",
			validationModality: "Select at least one input modality",
			validationEffort: "Enable at least one reasoning effort beyond off",
			validationWire: "A non-empty wire value is required",
			validationDefault: "The default must be one of the enabled efforts",
			validationCredential: "Credential reference must be a valid environment variable name"
		};
		const validationKeys = {
			required: "validationRequired",
			modelRequired: "validationRequired",
			invalidRoute: "validationRoute",
			invalidUrl: "validationUrl",
			positive: "validationPositive",
			nonNegative: "validationNonNegative",
			ratio: "validationRatio",
			backoffOrder: "validationBackoffOrder",
			duplicate: "validationDuplicate",
			duplicateHeader: "validationDuplicate",
			modality: "validationModality",
			effortRequired: "validationEffort",
			wireRequired: "validationWire",
			defaultInvalid: "validationDefault",
			invalidCredentialRef: "validationCredential"
		};
		function validationKey(code) {
			return code === void 0 ? void 0 : validationKeys[code];
		}
		//#endregion
		//#region src/client/types.ts
		const EFFORTS = [
			"off",
			"minimal",
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		];
		const THINKING_FORMATS = [
			"openai",
			"deepseek",
			"openrouter",
			"together",
			"zai",
			"qwen",
			"string-thinking",
			"ant-ling"
		];
		function emptyCompat() {
			return {
				thinkingFormat: "",
				supportsReasoningEffort: ""
			};
		}
		function emptyModel() {
			return {
				id: "",
				name: "",
				contextWindow: "",
				maxTokens: "",
				input: {
					text: true,
					image: false
				},
				reasoningEfforts: false,
				defaultReasoningEffort: "",
				compat: emptyCompat()
			};
		}
		function emptyProvider() {
			return {
				route: "",
				displayName: "",
				apiKeyEnv: "",
				api: "openai-completions",
				baseURL: "",
				headers: [],
				compat: emptyCompat(),
				streamIdleTimeoutMs: "",
				retryPolicy: {
					mode: "",
					maxRetries: "",
					retryableCodes: "",
					initialDelayMs: "",
					maxDelayMs: "",
					jitterRatio: ""
				},
				models: [emptyModel()]
			};
		}
		//#endregion
		//#region src/client/ModelEditor.tsx
		function Field$1({ label, error, children, wide }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "cm-field" + (wide ? " cm-wide" : ""),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }),
					children,
					error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "cm-error",
						children: error
					}) : null
				]
			});
		}
		function ModelEditor({ model, index, api, disabled, errors, t, onChange, onRemove }) {
			const path = "models." + index;
			const message = (suffix) => {
				const key = validationKey(errors[path + suffix]);
				return key === void 0 ? void 0 : t(key);
			};
			const update = (change) => {
				const next = structuredClone(model);
				change(next);
				onChange(next);
			};
			const efforts = model.reasoningEfforts;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
				className: "cm-card",
				disabled,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("legend", { children: [
						t("models"),
						" ",
						index + 1
					] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "cm-card-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: model.id || "—" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							disabled,
							onClick: onRemove,
							children: t("removeModel")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "cm-grid",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
								label: t("modelId"),
								error: message(".id"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
									value: model.id,
									onChange: (event) => update((draft) => {
										draft.id = event.target.value;
									})
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
								label: t("modelName"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
									value: model.name,
									onChange: (event) => update((draft) => {
										draft.name = event.target.value;
									})
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
								label: t("contextWindow"),
								error: message(".contextWindow"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
									inputMode: "numeric",
									value: model.contextWindow,
									onChange: (event) => update((draft) => {
										draft.contextWindow = event.target.value;
									})
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
								label: t("maxTokens"),
								error: message(".maxTokens"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
									inputMode: "numeric",
									value: model.maxTokens,
									onChange: (event) => update((draft) => {
										draft.maxTokens = event.target.value;
									})
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "cm-wide cm-row",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: "cm-check",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: model.input.text,
											onChange: (event) => update((draft) => {
												draft.input.text = event.target.checked;
											})
										}), t("text")]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: "cm-check",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: model.input.image,
											onChange: (event) => update((draft) => {
												draft.input.image = event.target.checked;
											})
										}), t("image")]
									}),
									message(".input") ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "cm-error",
										children: message(".input")
									}) : null
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "cm-wide cm-check",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: efforts !== false,
									onChange: (event) => update((draft) => {
										draft.reasoningEfforts = event.target.checked ? {} : false;
										if (!event.target.checked) draft.defaultReasoningEffort = "";
									})
								}), t("reasoning")]
							}),
							efforts !== false ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "cm-wide cm-efforts",
									"aria-label": t("efforts"),
									children: EFFORTS.map((effort) => {
										const enabled = Object.hasOwn(efforts, effort);
										const error = message(".reasoningEfforts." + effort);
										return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.default.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
											className: "cm-check",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: enabled,
												onChange: (event) => update((draft) => {
													if (draft.reasoningEfforts === false) return;
													if (event.target.checked) draft.reasoningEfforts[effort] = effort === "off" ? null : "";
													else {
														delete draft.reasoningEfforts[effort];
														if (draft.defaultReasoningEffort === effort) draft.defaultReasoningEffort = "";
													}
												})
											}), effort]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
											"aria-label": effort + " " + t("wireValue"),
											disabled: !enabled,
											placeholder: effort === "off" ? t("offOmit") : t("wireValue"),
											value: efforts[effort] ?? "",
											onChange: (event) => update((draft) => {
												if (draft.reasoningEfforts === false) return;
												draft.reasoningEfforts[effort] = effort === "off" && event.target.value === "" ? null : event.target.value;
											})
										}), error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "cm-error",
											children: error
										}) : null] })] }, effort);
									})
								}),
								message(".reasoningEfforts") ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "cm-wide cm-error",
									children: message(".reasoningEfforts")
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
									label: t("defaultEffort"),
									error: message(".defaultReasoningEffort"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: model.defaultReasoningEffort,
										onChange: (event) => update((draft) => {
											draft.defaultReasoningEffort = event.target.value;
										}),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "",
											children: t("inherit")
										}), EFFORTS.filter((effort) => Object.hasOwn(efforts, effort)).map((effort) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: effort,
											children: effort
										}, effort))]
									})
								})
							] }) : null,
							api === "openai-completions" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
								label: t("thinkingFormat"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									value: model.compat.thinkingFormat,
									onChange: (event) => update((draft) => {
										draft.compat.thinkingFormat = event.target.value;
									}),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: "",
										children: t("inherit")
									}), THINKING_FORMATS.map((format) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: format,
										children: format
									}, format))]
								})
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
								label: t("supportsReasoningEffort"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									value: model.compat.supportsReasoningEffort,
									onChange: (event) => update((draft) => {
										draft.compat.supportsReasoningEffort = event.target.value;
									}),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "",
											children: t("inherit")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "true",
											children: "true"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "false",
											children: "false"
										})
									]
								})
							})] }) : null
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/model-utils.ts
		function record(value) {
			return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
		}
		function text(value) {
			return typeof value === "string" ? value : "";
		}
		function numericText(value) {
			return typeof value === "number" ? String(value) : "";
		}
		function numeric(value) {
			return value === "" ? void 0 : Number(value);
		}
		function compatFromValue(value) {
			const source = record(value);
			const thinking = text(source.thinkingFormat);
			return {
				thinkingFormat: THINKING_FORMATS.includes(thinking) ? thinking : "",
				supportsReasoningEffort: typeof source.supportsReasoningEffort === "boolean" ? String(source.supportsReasoningEffort) : ""
			};
		}
		function compatToValue(value) {
			const result = {};
			if (value.thinkingFormat !== "") result.thinkingFormat = value.thinkingFormat;
			if (value.supportsReasoningEffort !== "") result.supportsReasoningEffort = value.supportsReasoningEffort === "true";
			return Object.keys(result).length === 0 ? void 0 : result;
		}
		function providersOf(layer) {
			return record(record(layer).providers);
		}
		function reasoningFromValue(value) {
			if (value === false || value === void 0) return false;
			const source = record(value);
			const result = {};
			for (const effort of EFFORTS) {
				const wire = source[effort];
				if (wire === null || typeof wire === "string") result[effort] = wire;
			}
			return Object.keys(result).length === 0 ? false : result;
		}
		function modelFromValue(value) {
			const source = record(value);
			const input = Array.isArray(source.input) ? source.input : [];
			const defaultEffort = text(source.defaultReasoningEffort);
			return {
				id: text(source.id),
				name: text(source.name),
				contextWindow: numericText(source.contextWindow),
				maxTokens: numericText(source.maxTokens),
				input: {
					text: input.length === 0 || input.includes("text"),
					image: input.includes("image")
				},
				reasoningEfforts: reasoningFromValue(source.reasoningEfforts),
				defaultReasoningEffort: EFFORTS.includes(defaultEffort) ? defaultEffort : "",
				compat: compatFromValue(source.compat)
			};
		}
		function providerFromValue(route, value) {
			const source = record(value);
			const retry = record(source.retryPolicy);
			const backoff = record(retry.backoff);
			const rawModels = Array.isArray(source.models) ? source.models : [];
			const retryMode = retry.mode === "normal" || retry.mode === "always" ? retry.mode : "";
			return {
				route,
				displayName: text(source.displayName),
				apiKeyEnv: text(source.apiKeyEnv),
				api: source.api === "openai-responses" ? "openai-responses" : "openai-completions",
				baseURL: text(source.baseURL),
				headers: Object.entries(record(source.headers)).map(([key, header]) => ({
					key,
					value: text(header)
				})),
				compat: compatFromValue(source.compat),
				streamIdleTimeoutMs: numericText(source.streamIdleTimeoutMs),
				retryPolicy: {
					mode: retryMode,
					maxRetries: numericText(retry.maxRetries),
					retryableCodes: Array.isArray(retry.retryableCodes) ? retry.retryableCodes.map(String).join(", ") : "",
					initialDelayMs: numericText(backoff.initialDelayMs),
					maxDelayMs: numericText(backoff.maxDelayMs),
					jitterRatio: numericText(backoff.jitterRatio)
				},
				models: rawModels.map(modelFromValue)
			};
		}
		function modelToValue(model) {
			const contextWindow = numeric(model.contextWindow);
			const maxTokens = numeric(model.maxTokens);
			const compat = compatToValue(model.compat);
			return {
				id: model.id.trim(),
				...model.name.trim() === "" ? {} : { name: model.name.trim() },
				...contextWindow === void 0 ? {} : { contextWindow },
				...maxTokens === void 0 ? {} : { maxTokens },
				input: [...model.input.text ? ["text"] : [], ...model.input.image ? ["image"] : []],
				reasoningEfforts: model.reasoningEfforts,
				...model.defaultReasoningEffort === "" ? {} : { defaultReasoningEffort: model.defaultReasoningEffort },
				...compat === void 0 ? {} : { compat }
			};
		}
		function providerToValue(draft) {
			const idle = numeric(draft.streamIdleTimeoutMs);
			const retries = numeric(draft.retryPolicy.maxRetries);
			const initialDelayMs = numeric(draft.retryPolicy.initialDelayMs);
			const maxDelayMs = numeric(draft.retryPolicy.maxDelayMs);
			const jitterRatio = draft.retryPolicy.jitterRatio === "" ? void 0 : Number(draft.retryPolicy.jitterRatio);
			const backoff = {
				...initialDelayMs === void 0 ? {} : { initialDelayMs },
				...maxDelayMs === void 0 ? {} : { maxDelayMs },
				...jitterRatio === void 0 ? {} : { jitterRatio }
			};
			const retryPolicy = draft.retryPolicy.mode === "" ? void 0 : {
				mode: draft.retryPolicy.mode,
				...draft.retryPolicy.mode === "normal" && retries !== void 0 ? { maxRetries: retries } : {},
				...draft.retryPolicy.mode === "normal" && draft.retryPolicy.retryableCodes.trim() !== "" ? { retryableCodes: draft.retryPolicy.retryableCodes.split(",").map((value) => value.trim()).filter(Boolean) } : {},
				...Object.keys(backoff).length === 0 ? {} : { backoff }
			};
			const compat = compatToValue(draft.compat);
			return {
				...draft.displayName.trim() === "" ? {} : { displayName: draft.displayName.trim() },
				apiKeyEnv: draft.apiKeyEnv,
				api: draft.api,
				baseURL: draft.baseURL.trim(),
				headers: Object.fromEntries(draft.headers.filter(({ key }) => key.trim() !== "").map(({ key, value }) => [key.trim(), value])),
				...compat === void 0 ? {} : { compat },
				...idle === void 0 ? {} : { streamIdleTimeoutMs: idle },
				...retryPolicy === void 0 ? {} : { retryPolicy },
				models: draft.models.map(modelToValue)
			};
		}
		//#endregion
		//#region src/client/store.ts
		const settingsStore = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)({
			mounted: false,
			loading: false,
			writable: false,
			error: "",
			credentials: {},
			active: /* @__PURE__ */ new Set()
		});
		function describeError(error) {
			if (error instanceof Error) return error.message;
			if (error !== null && typeof error === "object" && "message" in error) return String(error.message);
			return String(error);
		}
		function valueOf(response) {
			if (!response.result.ok) throw new Error(describeError(response.result.error));
			return response.result.value;
		}
		let loadVersion = 0;
		async function reload(api) {
			if (!settingsStore.getSnapshot().mounted) return;
			const version = ++loadVersion;
			settingsStore.update((state) => {
				state.loading = true;
				state.error = "";
			});
			try {
				const [settingsResponse, providersResponse] = await Promise.all([api.settings.describe({}), api.llm.providers({})]);
				const described = valueOf(settingsResponse);
				const namespace = described.namespaces.find(({ ns }) => ns === "custom-models");
				if (namespace === void 0) throw new Error("custom-models settings namespace is unavailable");
				const active = new Set(valueOf(providersResponse).providers.filter(({ active: isActive }) => isActive).map(({ provider }) => provider));
				const refs = /* @__PURE__ */ new Set();
				for (const layer of [
					namespace.value,
					namespace.base,
					namespace.user
				]) {
					const providers = layer?.providers;
					if (providers === void 0) continue;
					for (const profile of Object.values(providers)) if (profile.apiKeyEnv !== void 0) refs.add(profile.apiKeyEnv);
				}
				const credentials = refs.size === 0 ? {} : valueOf(await api.credentials.describe({ refs: [...refs] })).credentials;
				if (version !== loadVersion) return;
				settingsStore.set({
					mounted: true,
					loading: false,
					writable: described.writable,
					error: "",
					namespace,
					credentials,
					active
				});
			} catch (error) {
				if (version !== loadVersion) return;
				settingsStore.update((state) => {
					state.loading = false;
					state.error = describeError(error);
				});
			}
		}
		function mount(api) {
			if (settingsStore.getSnapshot().mounted) return;
			settingsStore.update((state) => {
				state.mounted = true;
			});
			reload(api);
		}
		const responseValue = valueOf;
		//#endregion
		//#region src/client/validation.ts
		function deriveKeyRef(route, explicit) {
			return explicit?.trim() || route.trim().toUpperCase().replace(/-/g, "_") + "_API_KEY";
		}
		function positiveInteger(value) {
			return value === "" || /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
		}
		function naturalNumber(value) {
			return value === "" || /^\d+$/.test(value) && Number.isSafeInteger(Number(value));
		}
		function nonNegativeNumber(value) {
			return value === "" || Number.isFinite(Number(value)) && Number(value) >= 0;
		}
		function validateProviderDraft(draft) {
			const errors = {};
			if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(draft.route)) errors.route = "invalidRoute";
			if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(deriveKeyRef(draft.route, draft.apiKeyEnv))) errors.apiKeyEnv = "invalidCredentialRef";
			if (!draft.baseURL.trim()) errors.baseURL = "required";
			else try {
				const url = new URL(draft.baseURL);
				if (url.protocol !== "http:" && url.protocol !== "https:") errors.baseURL = "invalidUrl";
			} catch {
				errors.baseURL = "invalidUrl";
			}
			if (draft.models.length === 0) errors.models = "modelRequired";
			const ids = /* @__PURE__ */ new Set();
			draft.models.forEach((model, index) => {
				const path = "models." + index;
				const id = model.id.trim();
				if (id === "") errors[path + ".id"] = "required";
				else if (ids.has(id)) errors[path + ".id"] = "duplicate";
				else ids.add(id);
				if (!positiveInteger(model.contextWindow)) errors[path + ".contextWindow"] = "positive";
				if (!positiveInteger(model.maxTokens)) errors[path + ".maxTokens"] = "positive";
				if (!model.input.text && !model.input.image) errors[path + ".input"] = "modality";
				if (model.reasoningEfforts !== false) {
					const thinking = Object.keys(model.reasoningEfforts).filter((effort) => effort !== "off");
					if (thinking.length === 0) errors[path + ".reasoningEfforts"] = "effortRequired";
					for (const effort of thinking) {
						const wire = model.reasoningEfforts[effort];
						if (typeof wire !== "string" || wire.trim() === "") errors[path + ".reasoningEfforts." + effort] = "wireRequired";
					}
					if (model.defaultReasoningEffort !== "" && !Object.hasOwn(model.reasoningEfforts, model.defaultReasoningEffort)) errors[path + ".defaultReasoningEffort"] = "defaultInvalid";
				}
			});
			if (!positiveInteger(draft.streamIdleTimeoutMs)) errors.streamIdleTimeoutMs = "positive";
			if (draft.retryPolicy.mode === "normal" && !naturalNumber(draft.retryPolicy.maxRetries)) errors["retryPolicy.maxRetries"] = "positive";
			if (!positiveInteger(draft.retryPolicy.initialDelayMs)) errors["retryPolicy.initialDelayMs"] = "positive";
			if (!positiveInteger(draft.retryPolicy.maxDelayMs)) errors["retryPolicy.maxDelayMs"] = "positive";
			if (!nonNegativeNumber(draft.retryPolicy.jitterRatio) || Number(draft.retryPolicy.jitterRatio) > 1) errors["retryPolicy.jitterRatio"] = "ratio";
			if (draft.retryPolicy.initialDelayMs !== "" && draft.retryPolicy.maxDelayMs !== "" && Number(draft.retryPolicy.initialDelayMs) > Number(draft.retryPolicy.maxDelayMs)) errors["retryPolicy.maxDelayMs"] = "backoffOrder";
			const headers = /* @__PURE__ */ new Set();
			for (const [index, header] of draft.headers.entries()) {
				const key = header.key.trim().toLowerCase();
				if (key !== "" && headers.has(key)) errors["headers." + index] = "duplicateHeader";
				headers.add(key);
			}
			return {
				valid: Object.keys(errors).length === 0,
				errors
			};
		}
		//#endregion
		//#region src/client/SettingsSection.tsx
		function Field({ label, error, children, wide }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "cm-field" + (wide ? " cm-wide" : ""),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }),
					children,
					error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "cm-error",
						children: error
					}) : null
				]
			});
		}
		function nameOf(value, route) {
			if (value !== null && typeof value === "object" && !Array.isArray(value)) {
				const name = value.displayName;
				if (typeof name === "string" && name !== "") return name;
			}
			return route;
		}
		const useSettings = (0, _deepseek_ai_dsh_client_web_react.bindSnapshotSelector)(settingsStore);
		function SettingsSection({ api, t }) {
			const snapshot = useSettings((state) => state);
			const [selected, setSelected] = (0, react.useState)();
			const [draft, setDraft] = (0, react.useState)();
			const [secret, setSecret] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [message, setMessage] = (0, react.useState)("");
			const [confirmDelete, setConfirmDelete] = (0, react.useState)(false);
			(0, react.useEffect)(() => mount(api), [api]);
			const layers = (0, react.useMemo)(() => ({
				resolved: providersOf(snapshot.namespace?.value),
				base: providersOf(snapshot.namespace?.base),
				user: providersOf(snapshot.namespace?.user)
			}), [snapshot.namespace]);
			const routes = (0, react.useMemo)(() => Object.keys(layers.resolved).sort(), [layers.resolved]);
			(0, react.useEffect)(() => {
				if (draft !== void 0) return;
				const route = selected !== void 0 && layers.resolved[selected] !== void 0 ? selected : routes[0];
				if (route === void 0) return;
				setSelected(route);
				setDraft(providerFromValue(route, layers.resolved[route]));
			}, [
				draft,
				layers.resolved,
				routes,
				selected
			]);
			const validation = draft === void 0 ? void 0 : validateProviderDraft(draft);
			const keyRef = draft === void 0 ? "" : deriveKeyRef(draft.route, draft.apiKeyEnv);
			const credential = snapshot.credentials[keyRef];
			const routeCollision = draft !== void 0 && selected === void 0 && Object.hasOwn(layers.resolved, draft.route);
			const disabled = busy || !snapshot.writable;
			const validationMessage = (code) => {
				const key = validationKey(code);
				return key === void 0 ? void 0 : t(key);
			};
			const edit = (change) => {
				setDraft((current) => {
					if (current === void 0) return current;
					const next = structuredClone(current);
					change(next);
					return next;
				});
			};
			const choose = (route) => {
				setSelected(route);
				setDraft(providerFromValue(route, layers.resolved[route]));
				setSecret("");
				setMessage("");
			};
			const closeEditor = () => {
				setSelected(void 0);
				setDraft(void 0);
				setSecret("");
				setMessage("");
			};
			async function save() {
				if (draft === void 0 || validation?.valid !== true || snapshot.namespace === void 0 || !snapshot.writable || routeCollision) return;
				setBusy(true);
				setMessage("");
				let profileSaved = false;
				try {
					const response = await api.settings.mutate({
						ns: "custom-models",
						ops: [{
							op: "set",
							path: ["providers", draft.route],
							value: providerToValue({
								...draft,
								apiKeyEnv: keyRef
							})
						}],
						expectedRevision: snapshot.namespace.revision
					});
					settingsStore.update((state) => {
						state.namespace = responseValue(response);
					});
					profileSaved = true;
					if (secret !== "") {
						responseValue(await api.credentials.set({
							ref: keyRef,
							value: secret
						}));
						setSecret("");
					}
					setSelected(draft.route);
					await reload(api);
					setDraft(providerFromValue(draft.route, providersOf(settingsStore.getSnapshot().namespace?.value)[draft.route]));
				} catch (error) {
					const detail = describeError(error);
					if (profileSaved) setMessage(t("credentialPartial") + " " + detail);
					else if (detail.toLowerCase().includes("conflict")) setMessage(t("conflict"));
					else setMessage(detail);
				} finally {
					setBusy(false);
				}
			}
			async function remove() {
				if (draft === void 0 || snapshot.namespace === void 0 || !snapshot.writable) return;
				setBusy(true);
				setMessage("");
				try {
					responseValue(await api.settings.mutate({
						ns: "custom-models",
						ops: [{
							op: "unset",
							path: ["providers", draft.route]
						}],
						expectedRevision: snapshot.namespace.revision
					}));
					await reload(api);
					setSelected(void 0);
					setDraft(void 0);
					setConfirmDelete(false);
				} catch (error) {
					setMessage(describeError(error));
				} finally {
					setBusy(false);
				}
			}
			async function unsetKey() {
				if (credential?.writable !== true) return;
				setBusy(true);
				setMessage("");
				try {
					responseValue(await api.credentials.unset({ ref: keyRef }));
					await reload(api);
				} catch (error) {
					setMessage(describeError(error));
				} finally {
					setBusy(false);
				}
			}
			const selectedIsBase = selected !== void 0 && Object.hasOwn(layers.base, selected);
			const selectedHasUserOverride = selected !== void 0 && Object.hasOwn(layers.user, selected);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "cm-root",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "cm-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "cm-sub",
							children: t("subtitle")
						})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							type: "button",
							variant: "primary",
							disabled: !snapshot.writable,
							onClick: () => {
								setSelected(void 0);
								setDraft(emptyProvider());
								setSecret("");
								setMessage("");
							},
							children: t("add")
						})]
					}),
					!snapshot.writable && snapshot.namespace !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "cm-status",
						role: "status",
						children: t("readOnly")
					}) : null,
					snapshot.error !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "cm-status cm-error",
						role: "alert",
						children: [
							snapshot.error,
							" ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								type: "button",
								size: "sm",
								onClick: () => void reload(api),
								children: t("retry")
							})
						]
					}) : null,
					snapshot.loading && snapshot.namespace === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("loading") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "cm-layout",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
							className: "cm-list",
							"aria-label": t("title"),
							children: [routes.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "cm-empty",
								children: t("empty")
							}) : null, routes.map((route) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "cm-provider",
								"aria-current": selected === route,
								"aria-controls": "cm-provider-editor",
								onClick: () => choose(route),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "cm-provider-title",
									children: nameOf(layers.resolved[route], route)
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "cm-badge",
									children: [
										route,
										" · ",
										snapshot.active.has(route) ? t("active") : t("inactive"),
										" · ",
										Object.hasOwn(layers.user, route) ? t("user") : t("base")
									]
								})]
							}, route))]
						}), draft !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
							id: "cm-provider-editor",
							className: "cm-editor",
							disabled,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", {
									className: "cm-sr-only",
									children: draft.displayName || draft.route || t("add")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "cm-editor-head",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "cm-editor-identity",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
											className: "cm-editor-title",
											children: draft.displayName || draft.route || t("add")
										}), draft.route !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "cm-editor-route",
											children: draft.route
										}) : null]
									}), selected !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "cm-badge",
										children: [
											snapshot.active.has(selected) ? t("active") : t("inactive"),
											" · ",
											selectedHasUserOverride ? t("user") : t("base")
										]
									}) : null]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "cm-grid",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("route"),
											error: routeCollision ? t("routeExists") : validationMessage(validation?.errors.route),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
												value: draft.route,
												disabled: selected !== void 0 || disabled,
												onChange: (event) => edit((value) => {
													value.route = event.target.value;
												})
											})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("displayName"),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
												value: draft.displayName,
												onChange: (event) => edit((value) => {
													value.displayName = event.target.value;
												})
											})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("api"),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
												value: draft.api,
												onChange: (event) => edit((value) => {
													value.api = event.target.value;
													if (value.api === "openai-responses") for (const model of value.models) model.compat = emptyCompat();
												}),
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: "openai-completions",
													children: "openai-completions"
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: "openai-responses",
													children: "openai-responses"
												})]
											})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("baseURL"),
											error: validationMessage(validation?.errors.baseURL),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
												value: draft.baseURL,
												onChange: (event) => edit((value) => {
													value.baseURL = event.target.value;
												})
											})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("apiKeyEnv"),
											error: validationMessage(validation?.errors.apiKeyEnv),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
												value: draft.apiKeyEnv,
												placeholder: deriveKeyRef(draft.route),
												onChange: (event) => edit((value) => {
													value.apiKeyEnv = event.target.value;
												})
											})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("apiKey"),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
												type: "password",
												autoComplete: "new-password",
												value: secret,
												disabled: disabled || credential?.writable === false,
												onChange: (event) => setSecret(event.target.value)
											})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "cm-wide cm-status",
											children: [
												credential?.configured === true ? t("configured") : t("notConfigured"),
												credential?.source !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
													" · ",
													t("source"),
													": ",
													credential.source
												] }) : null,
												credential?.configured === true && credential.writable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													type: "button",
													size: "sm",
													disabled,
													onClick: () => void unsetKey(),
													children: t("unsetCredential")
												}) : null
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("headers"),
											error: validationMessage(Object.entries(validation?.errors ?? {}).find(([path]) => path.startsWith("headers."))?.[1]),
											wide: true,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
												rows: 4,
												value: draft.headers.map(({ key, value }) => key + ": " + value).join("\n"),
												onChange: (event) => edit((value) => {
													value.headers = event.target.value.split("\n").filter(Boolean).map((line) => {
														const separator = line.indexOf(":");
														return separator < 0 ? {
															key: line.trim(),
															value: ""
														} : {
															key: line.slice(0, separator).trim(),
															value: line.slice(separator + 1).trim()
														};
													});
												})
											})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("thinkingFormat"),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
												value: draft.compat.thinkingFormat,
												onChange: (event) => edit((value) => {
													value.compat.thinkingFormat = event.target.value;
												}),
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: "",
													children: t("inherit")
												}), THINKING_FORMATS.map((format) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
													value: format,
													children: format
												}, format))]
											})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("supportsReasoningEffort"),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
												value: draft.compat.supportsReasoningEffort,
												onChange: (event) => edit((value) => {
													value.compat.supportsReasoningEffort = event.target.value;
												}),
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
														value: "",
														children: t("inherit")
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
														value: "true",
														children: "true"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
														value: "false",
														children: "false"
													})
												]
											})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("streamIdleTimeoutMs"),
											error: validationMessage(validation?.errors.streamIdleTimeoutMs),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
												inputMode: "numeric",
												value: draft.streamIdleTimeoutMs,
												onChange: (event) => edit((value) => {
													value.streamIdleTimeoutMs = event.target.value;
												})
											})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("retryMode"),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
												value: draft.retryPolicy.mode,
												onChange: (event) => edit((value) => {
													value.retryPolicy.mode = event.target.value;
												}),
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
														value: "",
														children: t("inherit")
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
														value: "normal",
														children: t("normal")
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
														value: "always",
														children: t("always")
													})
												]
											})
										}),
										draft.retryPolicy.mode === "normal" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("maxRetries"),
											error: validationMessage(validation?.errors["retryPolicy.maxRetries"]),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
												inputMode: "numeric",
												value: draft.retryPolicy.maxRetries,
												onChange: (event) => edit((value) => {
													value.retryPolicy.maxRetries = event.target.value;
												})
											})
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
											label: t("retryableCodes"),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
												value: draft.retryPolicy.retryableCodes,
												onChange: (event) => edit((value) => {
													value.retryPolicy.retryableCodes = event.target.value;
												})
											})
										})] }) : null,
										draft.retryPolicy.mode !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
												label: t("initialDelayMs"),
												error: validationMessage(validation?.errors["retryPolicy.initialDelayMs"]),
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
													inputMode: "numeric",
													value: draft.retryPolicy.initialDelayMs,
													onChange: (event) => edit((value) => {
														value.retryPolicy.initialDelayMs = event.target.value;
													})
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
												label: t("maxDelayMs"),
												error: validationMessage(validation?.errors["retryPolicy.maxDelayMs"]),
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
													inputMode: "numeric",
													value: draft.retryPolicy.maxDelayMs,
													onChange: (event) => edit((value) => {
														value.retryPolicy.maxDelayMs = event.target.value;
													})
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
												label: t("jitterRatio"),
												error: validationMessage(validation?.errors["retryPolicy.jitterRatio"]),
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
													inputMode: "decimal",
													value: draft.retryPolicy.jitterRatio,
													onChange: (event) => edit((value) => {
														value.retryPolicy.jitterRatio = event.target.value;
													})
												})
											})
										] }) : null
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("models") }),
								draft.models.map((model, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelEditor, {
									model,
									index,
									api: draft.api,
									disabled,
									errors: validation?.errors ?? {},
									t,
									onChange: (next) => edit((value) => {
										value.models[index] = next;
									}),
									onRemove: () => edit((value) => {
										value.models.splice(index, 1);
									})
								}, index)),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									type: "button",
									disabled,
									onClick: () => edit((value) => {
										value.models.push(emptyModel());
									}),
									children: t("addModel")
								}),
								validation?.errors.models !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "cm-error",
									children: validationMessage(validation.errors.models)
								}) : null,
								message !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "cm-error",
									role: "alert",
									children: message
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "cm-actions",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "cm-action-group",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
												type: "button",
												disabled: busy,
												onClick: closeEditor,
												children: t("cancel")
											}),
											selectedIsBase && selectedHasUserOverride ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
												type: "button",
												disabled,
												onClick: () => void remove(),
												children: t("reset")
											}) : null,
											!selectedIsBase && selectedHasUserOverride ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
												type: "button",
												disabled,
												onClick: () => setConfirmDelete(true),
												children: t("delete")
											}) : null
										]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										type: "button",
										variant: "primary",
										disabled: disabled || validation?.valid !== true || routeCollision,
										onClick: () => void save(),
										children: t("save")
									})]
								})
							]
						}) : null]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: confirmDelete,
						onClose: () => setConfirmDelete(false),
						title: t("confirmDelete"),
						closeLabel: t("close"),
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							type: "button",
							onClick: () => setConfirmDelete(false),
							children: t("cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							type: "button",
							variant: "primary",
							disabled: busy,
							onClick: () => void remove(),
							children: t("delete")
						})] })
					})
				]
			});
		}
		//#endregion
		//#region src/client/styles.ts
		const styles = `
.cm-root {
  box-sizing: border-box;
  width: 100%;
  max-width: 720px;
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family);
}
.cm-root h2 { margin: 0; font-size: 16px; font-weight: 500; line-height: 24px; }
.cm-root h3 { margin: 24px 0 10px; font-size: 15px; font-weight: 600; }
.cm-head, .cm-actions, .cm-action-group, .cm-row, .cm-card-head, .cm-editor-head, .cm-editor-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}
.cm-head { align-items: flex-start; margin-bottom: 20px; }
.cm-sub { color: var(--dsw-alias-label-tertiary); margin: 2px 0 0; font-size: 14px; line-height: 22px; }
.cm-layout { display: flex; min-width: 0; flex-direction: column; gap: 12px; }
.cm-list { display: flex; min-width: 0; flex-direction: column; gap: 8px; margin: 0; padding: 0; }
.cm-empty {
  box-sizing: border-box;
  margin: 0;
  border: 1px dashed var(--dsw-alias-border-l3);
  border-radius: 12px;
  padding: 18px 14px;
  color: var(--dsw-alias-label-tertiary);
  text-align: center;
  font-size: 13px;
  line-height: 20px;
}
.cm-provider {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  padding: 11px 14px;
}
.cm-provider:hover { background: var(--dsw-alias-interactive-bg-hover); }
.cm-provider[aria-current=true] {
  border-color: var(--dsw-alias-border-l3);
  background: var(--dsw-alias-bg-module-platform);
}
.cm-provider:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 2px; }
.cm-provider-title { overflow-wrap: anywhere; font-size: 14px; font-weight: 500; line-height: 22px; }
.cm-badge { color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.cm-editor, .cm-card {
  box-sizing: border-box;
  min-width: 0;
  border: 0;
  border-radius: 12px;
  background: var(--dsw-alias-bg-module-platform);
}
.cm-editor { margin: 0; padding: 16px; }
.cm-editor:disabled { opacity: .72; }
.cm-editor-head { align-items: flex-start; margin-bottom: 16px; }
.cm-editor-identity { min-width: 0; justify-content: flex-start; flex-wrap: wrap; gap: 6px; }
.cm-editor-title { overflow-wrap: anywhere; font-size: 14px; font-weight: 500; line-height: 22px; }
.cm-editor-route { color: var(--dsw-alias-label-tertiary); overflow-wrap: anywhere; font-size: 12px; line-height: 18px; }
.cm-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.cm-field { display: flex; min-width: 0; flex-direction: column; gap: 5px; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.cm-field select, .cm-field textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 36px;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  padding: 7px 10px;
}
.cm-field textarea { min-height: 84px; resize: vertical; }
.cm-field select:focus-visible, .cm-field textarea:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 1px; }
.cm-wide { grid-column: 1 / -1; }
.cm-card { margin: 12px 0; padding: 12px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2); }
.cm-card legend { color: var(--dsw-alias-label-secondary); padding: 0 5px; font-size: 12px; }
.cm-card-head { margin-bottom: 10px; }
.cm-error { color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 18px; }
.cm-status { display: flex; align-items: center; gap: 8px; margin: 10px 0; padding: 9px 10px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-1); border-radius: 8px; font-size: 12px; }
.cm-efforts { display: grid; grid-template-columns: minmax(86px, auto) minmax(0, 1fr); align-items: start; gap: 7px 10px; }
.cm-check { display: inline-flex; align-items: center; gap: 6px; min-height: 28px; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.cm-actions { margin-top: 20px; flex-wrap: wrap; }
.cm-action-group { justify-content: flex-start; }
.cm-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 640px) {
  .cm-grid { grid-template-columns: 1fr; }
  .cm-wide { grid-column: auto; }
  .cm-head, .cm-editor-head { flex-wrap: wrap; }
}
`;
		//#endregion
		//#region src/client/index.ts
		const inject = [
			"slots",
			"locale",
			"connection",
			"remote"
		];
		function apply(ctx) {
			const style = document.createElement("style");
			style.dataset.dshCustomModels = "";
			style.textContent = styles;
			document.head.append(style);
			ctx.effect(() => () => style.remove());
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}));
			const api = ctx.connection.api;
			const refresh = () => {
				reload(api);
			};
			ctx.effect(() => {
				const disposers = [
					ctx.remote.$on("settings/document-updated", (ns) => {
						if (ns === "custom-models") refresh();
					}),
					ctx.remote.$on("credentials/updated", refresh),
					ctx.remote.$on("llm/adapters-updated", refresh),
					ctx.on("connection/reset", refresh)
				];
				return () => {
					for (const dispose of disposers) dispose();
				};
			}, "dsh-custom-models: pushed invalidations");
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "custom-models",
				order: 15,
				label: () => ctx.locale.getLocale().active === "zh" ? "自定义模型" : "Custom models",
				locale: NS,
				inject: () => ({ api })
			}, SettingsSection));
		}
		//#endregion
		exports.apply = apply;
		exports.deriveKeyRef = deriveKeyRef;
		exports.inject = inject;
		exports.validateProviderDraft = validateProviderDraft;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map