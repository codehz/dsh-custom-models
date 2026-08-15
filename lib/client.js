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
			edit: "编辑",
			editProvider: "编辑 {provider}",
			save: "保存",
			saving: "保存中…",
			create: "创建提供商",
			creating: "创建中…",
			cancel: "取消",
			delete: "删除",
			reset: "重置覆盖",
			route: "路由",
			routeHint: "以小写字母开头，仅含小写字母、数字和连字符；同时用于派生凭据名。",
			displayName: "显示名称",
			apiKeyEnv: "凭据引用",
			apiKey: "API 密钥",
			keyPlaceholder: "输入 API 密钥",
			keyStored: "已配置——输入新值可替换",
			keyEnvLocked: "由启动环境提供（只读）",
			api: "API 协议",
			baseURL: "API 地址",
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
			customized: "自定义设置",
			advanced: "高级设置",
			models: "模型目录",
			modelsCustomized: "已自定义模型目录",
			modelsEmpty: "尚未添加模型。未列出的 ID 仍可直接发送。",
			addModel: "添加模型",
			modelId: "模型 ID",
			modelName: "显示名称",
			modelNamePlaceholder: "留空时使用模型 ID",
			contextWindow: "上下文窗口",
			maxTokens: "最大输出 token",
			modelAdvanced: "容量与推理",
			text: "文本",
			image: "图像",
			reasoning: "启用推理等级",
			efforts: "推理等级",
			effortHint: "点选该模型支持的等级即可，默认按同名发送。",
			wireValue: "供应商取值",
			offOmit: "留空表示 off 时不发送推理参数",
			overrideWires: "覆盖供应商取值",
			overrideHint: "默认按等级同名发送。只有供应商用不同拼写时才需要改这里。",
			overrideCount: "已覆盖 {count} 项",
			customWireHint: "{effort} 将发送为 {value}",
			offWire: "off 的发送值",
			wireFor: "{effort} 的发送值",
			defaultEffort: "默认强度",
			modelCompat: "模型兼容选项",
			active: "已启用",
			inactive: "未启用",
			base: "基础层",
			user: "用户层",
			customTag: "自定义",
			configured: "已配置",
			notConfigured: "未配置",
			credentialConfigured: "API 密钥已配置",
			credentialMissing: "API 密钥缺失",
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
			removeModel: "删除模型",
			close: "关闭",
			confirmDelete: "确定删除此提供商吗？",
			savedProvider: "已保存 {provider}。",
			validationRequired: "必填",
			validationRoute: "请使用小写字母开头，并仅包含小写字母、数字和连字符",
			validationUrl: "请输入 http 或 https URL",
			validationPositive: "请输入正整数",
			validationCapacity: "请输入正整数，或带 K/M 后缀的容量，例如 256K、1M",
			validationNonNegative: "请输入非负数",
			validationRatio: "请输入 0 到 1 之间的数值",
			validationBackoffOrder: "最大退避必须不小于初始退避",
			validationDuplicate: "不可重复",
			validationModality: "至少选择一种输入模态",
			validationEffort: "至少启用一个 off 之外的推理等级",
			validationWire: "需要非空取值",
			validationDefault: "默认等级必须是已启用等级",
			validationCredential: "凭据引用必须是合法环境变量名"
		};
		const en = {
			section: "Custom models",
			title: "Custom models",
			subtitle: "Manage OpenAI-compatible providers, models, reasoning, and credentials.",
			add: "Add provider",
			edit: "Edit",
			editProvider: "Edit {provider}",
			save: "Save",
			saving: "Saving…",
			create: "Create provider",
			creating: "Creating…",
			cancel: "Cancel",
			delete: "Delete",
			reset: "Reset override",
			route: "Route",
			routeHint: "Lowercase identifier starting with a letter; also used to derive the credential name.",
			displayName: "Display name",
			apiKeyEnv: "Credential reference",
			apiKey: "API key",
			keyPlaceholder: "Enter an API key",
			keyStored: "Configured — enter a new value to replace",
			keyEnvLocked: "Provided by the launch environment (read-only)",
			api: "API protocol",
			baseURL: "API address",
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
			customized: "Customized settings",
			advanced: "Advanced settings",
			models: "Models",
			modelsCustomized: "Customized model catalog",
			modelsEmpty: "No models yet. Unlisted IDs can still be sent directly.",
			addModel: "Add model",
			modelId: "Model ID",
			modelName: "Display name",
			modelNamePlaceholder: "Uses the model ID when empty",
			contextWindow: "Context window",
			maxTokens: "Max output tokens",
			modelAdvanced: "Capacities and reasoning",
			text: "Text",
			image: "Image",
			reasoning: "Enable reasoning efforts",
			efforts: "Reasoning efforts",
			effortHint: "Select the levels this model supports. They are sent with the same name by default.",
			wireValue: "Provider value",
			offOmit: "Leave blank to omit the reasoning parameter for off",
			overrideWires: "Override provider values",
			overrideHint: "Selected efforts are sent with the same name. Override only when the provider uses a different spelling.",
			overrideCount: "{count} overridden",
			customWireHint: "{effort} will be sent as {value}",
			offWire: "Value sent for off",
			wireFor: "Value sent for {effort}",
			defaultEffort: "Default effort",
			modelCompat: "Model compatibility",
			active: "Active",
			inactive: "Inactive",
			base: "Base layer",
			user: "User layer",
			customTag: "Custom",
			configured: "Configured",
			notConfigured: "Not configured",
			credentialConfigured: "API key configured",
			credentialMissing: "API key missing",
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
			removeModel: "Delete model",
			close: "Close",
			confirmDelete: "Delete this provider?",
			savedProvider: "Saved {provider}.",
			validationRequired: "Required",
			validationRoute: "Start with a lowercase letter and use only lowercase letters, digits, and hyphens",
			validationUrl: "Enter an http or https URL",
			validationPositive: "Enter a positive integer",
			validationCapacity: "Enter a positive integer, optionally suffixed with K or M, such as 256K or 1M",
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
			capacity: "validationCapacity",
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
		//#region src/client/reasoning.ts
		function defaultWire(effort) {
			return effort === "off" ? null : effort;
		}
		function isCustomWire(effort, value) {
			if (value === void 0) return false;
			if (effort === "off") return value !== null && value !== "";
			return value !== effort && value !== "" && value !== null;
		}
		function parseWireInput(effort, value) {
			const trimmed = value.trim();
			if (effort === "off") return trimmed === "" ? null : trimmed;
			return trimmed === "" ? effort : trimmed;
		}
		function enableEffort(map, effort) {
			return {
				...map,
				[effort]: defaultWire(effort)
			};
		}
		function disableEffort(map, effort) {
			const next = { ...map };
			delete next[effort];
			return next;
		}
		function setEffortWire(map, effort, value) {
			return {
				...map,
				[effort]: effort === "off" && value === "" ? null : value
			};
		}
		function normalizeEffortMap(map) {
			const next = {};
			for (const [effort, value] of Object.entries(map)) {
				if (value === void 0) continue;
				next[effort] = parseWireInput(effort, value ?? "");
			}
			return next;
		}
		function customEffortCount(map) {
			return Object.entries(map).filter(([effort, value]) => isCustomWire(effort, value)).length;
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
		function Field$1({ label, error, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "cm-model-field",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "cm-model-field-label",
						children: label
					}),
					children,
					error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "cm-error",
						children: error
					}) : null
				]
			});
		}
		function IconChevron({ open }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true,
				style: {
					transform: open ? "rotate(90deg)" : void 0,
					transition: "transform 120ms ease"
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M6 3.5L10.5 8L6 12.5",
					stroke: "currentColor",
					strokeWidth: "1.5",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function IconTrash() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M2.5 4h11M6.5 4V2.5h3V4M4 4l.7 9a1 1 0 001 .9h4.6a1 1 0 001-.9L12 4M6.5 6.8v4.4M9.5 6.8v4.4",
					stroke: "currentColor",
					strokeWidth: "1.3",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function ModelEditor({ model, index, api, disabled, expanded, errors, t, onChange, onToggle, onRemove }) {
			const path = "models." + index;
			const hasErrors = Object.keys(errors).some((key) => key === path || key.startsWith(path + "."));
			(0, react.useEffect)(() => {
				if (hasErrors && !expanded) onToggle();
			}, [hasErrors]);
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
			const overrideErrors = efforts === false ? [] : EFFORTS.filter((effort) => message(".reasoningEfforts." + effort) !== void 0);
			const overrideCount = efforts === false ? 0 : customEffortCount(efforts);
			const [overrideOpen, setOverrideOpen] = (0, react.useState)(overrideCount > 0);
			const showOverrides = overrideOpen || overrideErrors.length > 0;
			(0, react.useEffect)(() => {
				if (overrideErrors.length > 0) setOverrideOpen(true);
			}, [overrideErrors.length]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "cm-model-entry",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "cm-model-row",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "cm-input",
							value: model.id,
							placeholder: t("modelId"),
							"aria-label": t("modelId") + " " + (index + 1),
							disabled,
							onChange: (event) => update((draft) => {
								draft.id = event.target.value;
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "cm-input",
							value: model.name,
							placeholder: t("modelNamePlaceholder"),
							"aria-label": t("modelName") + " " + (index + 1),
							disabled,
							onChange: (event) => update((draft) => {
								draft.name = event.target.value;
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "cm-icon",
							"aria-label": t("modelAdvanced") + " " + (index + 1),
							"aria-expanded": expanded,
							title: t("modelAdvanced"),
							onClick: onToggle,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevron, { open: expanded })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "cm-icon cm-icon-danger",
							"aria-label": t("removeModel") + " " + (index + 1),
							title: t("removeModel"),
							disabled,
							onClick: onRemove,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconTrash, {})
						})
					]
				}), expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "cm-model-advanced",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
							label: t("contextWindow"),
							error: message(".contextWindow"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "cm-input",
								inputMode: "numeric",
								value: model.contextWindow,
								placeholder: "256K",
								"aria-label": t("contextWindow") + " " + (index + 1),
								disabled,
								onChange: (event) => update((draft) => {
									draft.contextWindow = event.target.value;
								})
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
							label: t("maxTokens"),
							error: message(".maxTokens"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "cm-input",
								inputMode: "numeric",
								value: model.maxTokens,
								placeholder: "32K",
								"aria-label": t("maxTokens") + " " + (index + 1),
								disabled,
								onChange: (event) => update((draft) => {
									draft.maxTokens = event.target.value;
								})
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "cm-model-extra cm-row-checks",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "cm-check",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: model.input.text,
										disabled,
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
										disabled,
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
							className: "cm-model-extra cm-check",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: efforts !== false,
								disabled,
								onChange: (event) => update((draft) => {
									draft.reasoningEfforts = event.target.checked ? {} : false;
									if (!event.target.checked) draft.defaultReasoningEffort = "";
								})
							}), t("reasoning")]
						}),
						efforts !== false ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "cm-model-extra cm-effort-block",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "cm-effort-label",
										children: t("efforts")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "cm-effort-pills",
										role: "group",
										"aria-label": t("efforts"),
										children: EFFORTS.map((effort) => {
											const enabled = Object.hasOwn(efforts, effort);
											const custom = enabled && isCustomWire(effort, efforts[effort]);
											return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
												type: "button",
												active: enabled,
												disabled,
												"aria-pressed": enabled,
												className: custom ? "cm-effort-custom" : void 0,
												title: custom ? t("customWireHint").replace("{effort}", effort).replace("{value}", String(efforts[effort])) : void 0,
												onClick: () => update((draft) => {
													if (draft.reasoningEfforts === false) return;
													if (Object.hasOwn(draft.reasoningEfforts, effort)) {
														draft.reasoningEfforts = disableEffort(draft.reasoningEfforts, effort);
														if (draft.defaultReasoningEffort === effort) draft.defaultReasoningEffort = "";
													} else draft.reasoningEfforts = enableEffort(draft.reasoningEfforts, effort);
												}),
												children: [effort, custom ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: "cm-effort-wire",
													children: ["→ ", String(efforts[effort])]
												}) : null]
											}, effort);
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "cm-effort-hint",
										children: t("effortHint")
									}),
									message(".reasoningEfforts") ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "cm-error",
										children: message(".reasoningEfforts")
									}) : null
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
								label: t("defaultEffort"),
								error: message(".defaultReasoningEffort"),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									className: "cm-input cm-select",
									value: model.defaultReasoningEffort,
									disabled,
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
							}),
							Object.keys(efforts).length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "cm-model-extra cm-override",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "cm-override-toggle",
									"aria-expanded": showOverrides,
									disabled,
									onClick: () => setOverrideOpen((value) => !value),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevron, { open: showOverrides }),
										t("overrideWires"),
										overrideCount > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "cm-override-count",
											children: t("overrideCount").replace("{count}", String(overrideCount))
										}) : null
									]
								}), showOverrides ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "cm-override-list",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "cm-override-hint",
										children: t("overrideHint")
									}), EFFORTS.filter((effort) => Object.hasOwn(efforts, effort)).map((effort) => {
										const error = message(".reasoningEfforts." + effort);
										const value = efforts[effort];
										return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
											label: effort === "off" ? t("offWire") : t("wireFor").replace("{effort}", effort),
											error,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												className: "cm-input",
												"aria-label": effort + " " + t("wireValue"),
												placeholder: effort === "off" ? t("offOmit") : String(defaultWire(effort)),
												value: value ?? "",
												disabled,
												onChange: (event) => update((draft) => {
													if (draft.reasoningEfforts === false) return;
													draft.reasoningEfforts = setEffortWire(draft.reasoningEfforts, effort, event.target.value);
												})
											})
										}, effort);
									})]
								}) : null]
							}) : null
						] }) : null,
						api === "openai-completions" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
							label: t("thinkingFormat"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
								className: "cm-input cm-select",
								value: model.compat.thinkingFormat,
								disabled,
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
								className: "cm-input cm-select",
								value: model.compat.supportsReasoningEffort,
								disabled,
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
				}) : null]
			});
		}
		//#endregion
		//#region src/client/capacity.ts
		const CAPACITY_PATTERN = /^(\d+(?:\.\d+)?)([km])?$/i;
		const CAPACITY_SCALE = {
			k: 1e3,
			m: 1e6
		};
		function parseCapacity(text) {
			const trimmed = text.trim();
			if (trimmed.length === 0) return void 0;
			const match = CAPACITY_PATTERN.exec(trimmed);
			if (match === null) return NaN;
			const suffix = match[2]?.toLowerCase();
			const scale = suffix === "k" || suffix === "m" ? CAPACITY_SCALE[suffix] : 1;
			const scaled = Number(match[1]) * scale;
			const rounded = Math.round(scaled);
			return Math.abs(scaled - rounded) < 1e-6 ? rounded : scaled;
		}
		function formatCapacity(value) {
			if (!Number.isInteger(value) || value <= 0) return String(value);
			if (value % CAPACITY_SCALE.m === 0) return String(value / CAPACITY_SCALE.m) + "M";
			if (value % CAPACITY_SCALE.k === 0) return String(value / CAPACITY_SCALE.k) + "K";
			return String(value);
		}
		function capacityText(value) {
			return typeof value === "number" && Number.isFinite(value) ? formatCapacity(value) : "";
		}
		function isPositiveCapacity(value) {
			const parsed = parseCapacity(value);
			if (parsed === void 0) return value.trim() === "";
			return Number.isInteger(parsed) && parsed > 0 && Number.isSafeInteger(parsed);
		}
		function numericCapacity(value) {
			const parsed = parseCapacity(value);
			return parsed !== void 0 && Number.isFinite(parsed) && parsed > 0 ? parsed : void 0;
		}
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
				if (!isPositiveCapacity(model.contextWindow)) errors[path + ".contextWindow"] = "capacity";
				if (!isPositiveCapacity(model.maxTokens)) errors[path + ".maxTokens"] = "capacity";
				if (!model.input.text && !model.input.image) errors[path + ".input"] = "modality";
				if (model.reasoningEfforts !== false) {
					const thinking = Object.keys(model.reasoningEfforts).filter((effort) => effort !== "off");
					if (thinking.length === 0) errors[path + ".reasoningEfforts"] = "effortRequired";
					const normalized = normalizeEffortMap(model.reasoningEfforts);
					for (const effort of thinking) {
						const wire = normalized[effort];
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
		//#region src/client/ProviderEditor.tsx
		function Field({ label, error, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "cm-field",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "cm-field-label",
						children: label
					}),
					children,
					error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "cm-error",
						children: error
					}) : null
				]
			});
		}
		function ProviderEditor(props) {
			const { draft, mode, t, disabled, busy, validation, routeCollision } = props;
			const validationMessage = (code) => {
				const key = validationKey(code);
				return key === void 0 ? void 0 : t(key);
			};
			const errorKeys = Object.keys(validation?.errors ?? {});
			const hasCustomErrors = validation !== void 0 && (validation.errors.baseURL !== void 0 || validation.errors.models !== void 0 || errorKeys.some((path) => path.startsWith("models.")));
			const hasAdvancedErrors = validation !== void 0 && (validation.errors.apiKeyEnv !== void 0 || validation.errors.streamIdleTimeoutMs !== void 0 || errorKeys.some((path) => path.startsWith("headers.") || path.startsWith("retryPolicy.")));
			const [customOpen, setCustomOpen] = (0, react.useState)(false);
			const [advancedOpen, setAdvancedOpen] = (0, react.useState)(false);
			const [expandedModels, setExpandedModels] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const toggleModel = (index) => {
				setExpandedModels((current) => {
					const next = new Set(current);
					if (!next.delete(index)) next.add(index);
					return next;
				});
			};
			const removeModel = (index) => {
				props.onChange((value) => {
					value.models.splice(index, 1);
				});
				setExpandedModels((current) => {
					const next = /* @__PURE__ */ new Set();
					for (const at of current) if (at < index) next.add(at);
					else if (at > index) next.add(at - 1);
					return next;
				});
			};
			(0, react.useEffect)(() => {
				if (hasCustomErrors) setCustomOpen(true);
			}, [hasCustomErrors]);
			(0, react.useEffect)(() => {
				if (hasAdvancedErrors) setAdvancedOpen(true);
			}, [hasAdvancedErrors]);
			const identity = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				mode === "create" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
					label: t("route"),
					error: routeCollision ? t("routeExists") : validationMessage(validation?.errors.route),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: "cm-input",
						value: draft.route,
						placeholder: "acme-gateway",
						"aria-label": t("route"),
						disabled,
						onChange: (event) => props.onChange((value) => {
							value.route = event.target.value;
						})
					})
				}) : null,
				mode === "create" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "cm-hint",
					children: t("routeHint")
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
					label: t("displayName"),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: "cm-input",
						value: draft.displayName,
						placeholder: draft.route || t("displayName"),
						"aria-label": t("displayName"),
						disabled,
						onChange: (event) => props.onChange((value) => {
							value.displayName = event.target.value;
						})
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
					label: t("baseURL"),
					error: validationMessage(validation?.errors.baseURL),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: "cm-input",
						value: draft.baseURL,
						placeholder: "https://gateway.example/v1",
						"aria-label": t("baseURL"),
						disabled,
						onChange: (event) => props.onChange((value) => {
							value.baseURL = event.target.value;
						})
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
					label: t("api"),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
						className: "cm-input cm-select",
						value: draft.api,
						"aria-label": t("api"),
						disabled,
						onChange: (event) => props.onChange((value) => {
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
				})
			] });
			const keyField = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Field, {
				label: t("apiKey"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					className: "cm-input",
					type: "password",
					autoComplete: "off",
					value: props.secret,
					placeholder: props.credential?.writable === false ? t("keyEnvLocked") : props.credential?.configured === true ? t("keyStored") : t("keyPlaceholder"),
					"aria-label": t("apiKey"),
					disabled: disabled || props.credential?.writable === false,
					onChange: (event) => props.onSecretChange(event.target.value)
				}), mode === "edit" && props.credential?.configured === true && props.credential.writable && props.onUnsetKey ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "cm-link",
					disabled,
					onClick: props.onUnsetKey,
					children: t("unsetCredential")
				}) : null]
			});
			const models = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "cm-model-catalog",
				"aria-label": t("models"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "cm-model-list-head",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "cm-model-catalog-heading",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "cm-model-catalog-title",
								children: t("models")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "cm-model-catalog-meta",
								children: t("modelsCustomized")
							})]
						})
					}),
					draft.models.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "cm-model-empty",
						children: t("modelsEmpty")
					}) : null,
					draft.models.map((model, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelEditor, {
						model,
						index,
						api: draft.api,
						disabled,
						expanded: expandedModels.has(index),
						errors: validation?.errors ?? {},
						t,
						onChange: (next) => props.onChange((value) => {
							value.models[index] = next;
						}),
						onToggle: () => toggleModel(index),
						onRemove: () => removeModel(index)
					}, (mode === "create" ? "new" : draft.route) + ":" + index)),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "cm-add-model",
						disabled,
						onClick: () => props.onChange((value) => {
							value.models.push(emptyModel());
						}),
						children: t("addModel")
					}),
					validation?.errors.models !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "cm-error",
						children: validationMessage(validation.errors.models)
					}) : null
				]
			});
			const headerError = Object.entries(validation?.errors ?? {}).find(([path]) => path.startsWith("headers."));
			const advanced = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
				className: "cm-customized",
				open: advancedOpen,
				onToggle: (event) => setAdvancedOpen(event.currentTarget.open),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", {
					className: "cm-customized-summary",
					children: t("advanced")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "cm-customized-body",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
							label: t("apiKeyEnv"),
							error: validationMessage(validation?.errors.apiKeyEnv),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "cm-input",
								value: draft.apiKeyEnv,
								placeholder: deriveKeyRef(draft.route),
								"aria-label": t("apiKeyEnv"),
								disabled,
								onChange: (event) => props.onChange((value) => {
									value.apiKeyEnv = event.target.value;
								})
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
							label: t("headers"),
							error: validationMessage(headerError?.[1]),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								className: "cm-input",
								rows: 4,
								value: draft.headers.map(({ key, value }) => key + ": " + value).join("\n"),
								"aria-label": t("headers"),
								disabled,
								onChange: (event) => props.onChange((value) => {
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
								className: "cm-input cm-select",
								value: draft.compat.thinkingFormat,
								"aria-label": t("thinkingFormat"),
								disabled,
								onChange: (event) => props.onChange((value) => {
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
								className: "cm-input cm-select",
								value: draft.compat.supportsReasoningEffort,
								"aria-label": t("supportsReasoningEffort"),
								disabled,
								onChange: (event) => props.onChange((value) => {
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
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "cm-input",
								inputMode: "numeric",
								value: draft.streamIdleTimeoutMs,
								"aria-label": t("streamIdleTimeoutMs"),
								disabled,
								onChange: (event) => props.onChange((value) => {
									value.streamIdleTimeoutMs = event.target.value;
								})
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
							label: t("retryMode"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
								className: "cm-input cm-select",
								value: draft.retryPolicy.mode,
								"aria-label": t("retryMode"),
								disabled,
								onChange: (event) => props.onChange((value) => {
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
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "cm-input",
								inputMode: "numeric",
								value: draft.retryPolicy.maxRetries,
								"aria-label": t("maxRetries"),
								disabled,
								onChange: (event) => props.onChange((value) => {
									value.retryPolicy.maxRetries = event.target.value;
								})
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
							label: t("retryableCodes"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "cm-input",
								value: draft.retryPolicy.retryableCodes,
								"aria-label": t("retryableCodes"),
								disabled,
								onChange: (event) => props.onChange((value) => {
									value.retryPolicy.retryableCodes = event.target.value;
								})
							})
						})] }) : null,
						draft.retryPolicy.mode !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
								label: t("initialDelayMs"),
								error: validationMessage(validation?.errors["retryPolicy.initialDelayMs"]),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									className: "cm-input",
									inputMode: "numeric",
									value: draft.retryPolicy.initialDelayMs,
									"aria-label": t("initialDelayMs"),
									disabled,
									onChange: (event) => props.onChange((value) => {
										value.retryPolicy.initialDelayMs = event.target.value;
									})
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
								label: t("maxDelayMs"),
								error: validationMessage(validation?.errors["retryPolicy.maxDelayMs"]),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									className: "cm-input",
									inputMode: "numeric",
									value: draft.retryPolicy.maxDelayMs,
									"aria-label": t("maxDelayMs"),
									disabled,
									onChange: (event) => props.onChange((value) => {
										value.retryPolicy.maxDelayMs = event.target.value;
									})
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
								label: t("jitterRatio"),
								error: validationMessage(validation?.errors["retryPolicy.jitterRatio"]),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									className: "cm-input",
									inputMode: "decimal",
									value: draft.retryPolicy.jitterRatio,
									"aria-label": t("jitterRatio"),
									disabled,
									onChange: (event) => props.onChange((value) => {
										value.retryPolicy.jitterRatio = event.target.value;
									})
								})
							})
						] }) : null
					]
				})]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "cm-editor",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "cm-editor-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "cm-editor-title",
							children: mode === "create" ? t("add") : draft.displayName || draft.route || t("add")
						}), mode === "edit" && draft.route !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "cm-editor-route",
							children: draft.route
						}) : null]
					}),
					mode === "edit" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [keyField, /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
						className: "cm-customized",
						open: customOpen,
						onToggle: (event) => setCustomOpen(event.currentTarget.open),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", {
							className: "cm-customized-summary",
							children: t("customized")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "cm-customized-body",
							children: [
								identity,
								models,
								advanced
							]
						})]
					})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						identity,
						keyField,
						models,
						advanced
					] }),
					props.message !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "cm-error",
						role: "alert",
						children: props.message
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "cm-editor-actions",
						children: [
							props.onReset ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "cm-secondary cm-reset",
								disabled,
								onClick: props.onReset,
								children: t("reset")
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "cm-secondary",
								disabled: busy,
								onClick: props.onCancel,
								children: t("cancel")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "cm-primary",
								disabled: disabled || validation?.valid !== true || routeCollision,
								onClick: props.onSave,
								children: busy ? mode === "create" ? t("creating") : t("saving") : mode === "create" ? t("create") : t("save")
							})
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
				contextWindow: capacityText(source.contextWindow),
				maxTokens: capacityText(source.maxTokens),
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
			const contextWindow = numericCapacity(model.contextWindow);
			const maxTokens = numericCapacity(model.maxTokens);
			const compat = compatToValue(model.compat);
			return {
				id: model.id.trim(),
				...model.name.trim() === "" ? {} : { name: model.name.trim() },
				...contextWindow === void 0 ? {} : { contextWindow },
				...maxTokens === void 0 ? {} : { maxTokens },
				input: [...model.input.text ? ["text"] : [], ...model.input.image ? ["image"] : []],
				reasoningEfforts: model.reasoningEfforts === false ? false : normalizeEffortMap(model.reasoningEfforts),
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
		//#region src/client/SettingsSection.tsx
		function nameOf(value, route) {
			if (value !== null && typeof value === "object" && !Array.isArray(value)) {
				const name = value.displayName;
				if (typeof name === "string" && name !== "") return name;
			}
			return route;
		}
		function IconPlus() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M8 3v10M3 8h10",
					stroke: "currentColor",
					strokeWidth: "1.5",
					strokeLinecap: "round"
				})
			});
		}
		const useSettings = (0, _deepseek_ai_dsh_client_web_react.bindSnapshotSelector)(settingsStore);
		function SettingsSection({ api, t }) {
			const snapshot = useSettings((state) => state);
			const [editing, setEditing] = (0, react.useState)();
			const [draft, setDraft] = (0, react.useState)();
			const [secret, setSecret] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [message, setMessage] = (0, react.useState)("");
			const [pageError, setPageError] = (0, react.useState)("");
			const [confirmDelete, setConfirmDelete] = (0, react.useState)();
			const [saved, setSaved] = (0, react.useState)();
			(0, react.useEffect)(() => mount(api), [api]);
			const layers = (0, react.useMemo)(() => ({
				resolved: providersOf(snapshot.namespace?.value),
				base: providersOf(snapshot.namespace?.base),
				user: providersOf(snapshot.namespace?.user)
			}), [snapshot.namespace]);
			const routes = (0, react.useMemo)(() => Object.keys(layers.resolved).sort(), [layers.resolved]);
			(0, react.useEffect)(() => {
				if (editing === void 0 || editing === "new") return;
				if (!Object.hasOwn(layers.resolved, editing)) {
					setEditing(void 0);
					setDraft(void 0);
				}
			}, [editing, layers.resolved]);
			const validation = draft === void 0 ? void 0 : validateProviderDraft(draft);
			const keyRef = draft === void 0 ? "" : deriveKeyRef(draft.route, draft.apiKeyEnv);
			const credential = draft === void 0 ? void 0 : snapshot.credentials[keyRef];
			const routeCollision = editing === "new" && draft !== void 0 && Object.hasOwn(layers.resolved, draft.route);
			const disabled = busy || !snapshot.writable;
			const selectedRoute = editing === void 0 || editing === "new" ? void 0 : editing;
			const selectedIsBase = selectedRoute !== void 0 && Object.hasOwn(layers.base, selectedRoute);
			const selectedHasUserOverride = selectedRoute !== void 0 && Object.hasOwn(layers.user, selectedRoute);
			const edit = (change) => {
				setDraft((current) => {
					if (current === void 0) return current;
					const next = structuredClone(current);
					change(next);
					return next;
				});
			};
			const open = (route) => {
				setEditing(route);
				setDraft(providerFromValue(route, layers.resolved[route]));
				setSecret("");
				setMessage("");
				setPageError("");
				setSaved(void 0);
			};
			const startNew = () => {
				setEditing("new");
				setDraft(emptyProvider());
				setSecret("");
				setMessage("");
				setPageError("");
				setSaved(void 0);
			};
			const closeEditor = () => {
				setEditing(void 0);
				setDraft(void 0);
				setSecret("");
				setMessage("");
			};
			const toggle = (route) => {
				if (editing === route) closeEditor();
				else open(route);
			};
			const labelOf = (route) => nameOf(layers.resolved[route], route);
			const removable = (route) => Object.hasOwn(layers.user, route) && !Object.hasOwn(layers.base, route);
			const tagOf = (route) => {
				if (Object.hasOwn(layers.user, route) && !Object.hasOwn(layers.base, route)) return t("customTag");
				if (Object.hasOwn(layers.user, route)) return t("user");
				return t("base");
			};
			const credentialOf = (route) => {
				const profile = layers.resolved[route];
				const named = profile !== null && typeof profile === "object" && !Array.isArray(profile) ? profile.apiKeyEnv : void 0;
				const ref = deriveKeyRef(route, typeof named === "string" ? named : void 0);
				return snapshot.credentials[ref];
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
					await reload(api);
					setSaved(draft.displayName || draft.route);
					closeEditor();
				} catch (error) {
					const detail = describeError(error);
					if (profileSaved) setMessage(t("credentialPartial") + " " + detail);
					else if (detail.toLowerCase().includes("conflict")) setMessage(t("conflict"));
					else setMessage(detail);
				} finally {
					setBusy(false);
				}
			}
			async function remove(route) {
				if (snapshot.namespace === void 0 || !snapshot.writable) return;
				setBusy(true);
				setPageError("");
				try {
					responseValue(await api.settings.mutate({
						ns: "custom-models",
						ops: [{
							op: "unset",
							path: ["providers", route]
						}],
						expectedRevision: snapshot.namespace.revision
					}));
					await reload(api);
					if (editing === route) closeEditor();
					setConfirmDelete(void 0);
					setSaved(void 0);
				} catch (error) {
					setPageError(describeError(error));
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
			const editor = draft === void 0 || editing === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProviderEditor, {
				draft,
				mode: editing === "new" ? "create" : "edit",
				credential,
				secret,
				onSecretChange: setSecret,
				onUnsetKey: () => {
					unsetKey();
				},
				disabled,
				busy,
				validation,
				routeCollision,
				message,
				t,
				onChange: edit,
				onSave: () => {
					save();
				},
				onCancel: closeEditor,
				onReset: selectedIsBase && selectedHasUserOverride ? () => {
					remove(draft.route);
				} : void 0
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "cm-root",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						className: "cm-title",
						children: t("title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "cm-sub",
						children: t("subtitle")
					}),
					!snapshot.writable && snapshot.namespace !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "cm-notice",
						role: "status",
						children: t("readOnly")
					}) : null,
					saved !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "cm-saved",
						role: "status",
						children: t("savedProvider").replace("{provider}", saved)
					}) : null,
					pageError !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "cm-error",
						role: "alert",
						children: pageError
					}) : null,
					snapshot.error !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "cm-status cm-error",
						role: "alert",
						children: [snapshot.error, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "cm-secondary",
							onClick: () => {
								reload(api);
							},
							children: t("retry")
						})]
					}) : null,
					snapshot.loading && snapshot.namespace === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("loading") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [routes.length === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: "cm-rows",
						"aria-label": t("title"),
						children: routes.map((route) => {
							const openEditor = editing === route;
							const configured = credentialOf(route)?.configured === true;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
								className: "cm-row-card",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "cm-row-head",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "cm-row-identity",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "cm-row-name",
												children: labelOf(route)
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "cm-row-tag",
												children: tagOf(route)
											}),
											!snapshot.active.has(route) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "cm-row-tag",
												children: t("inactive")
											}) : null,
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "cm-dot " + (configured ? "cm-dot-ok" : "cm-dot-miss"),
												role: "img",
												"aria-label": configured ? t("credentialConfigured") : t("credentialMissing"),
												title: configured ? t("credentialConfigured") : t("credentialMissing")
											})
										]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "cm-row-actions",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "cm-secondary",
											"aria-expanded": openEditor,
											"aria-label": t("editProvider").replace("{provider}", labelOf(route)),
											onClick: () => toggle(route),
											children: t("edit")
										}), removable(route) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "cm-danger",
											"aria-label": t("delete") + " " + labelOf(route),
											disabled: !snapshot.writable,
											onClick: () => {
												setSaved(void 0);
												setConfirmDelete(route);
											},
											children: t("delete")
										}) : null]
									})]
								}), openEditor ? editor : null]
							}, route);
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "cm-add-block",
						children: editing === "new" && editor !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "cm-add-card",
							children: editor
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "cm-add-button",
							disabled: !snapshot.writable,
							onClick: startNew,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlus, {}), t("add")]
						})
					})] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: confirmDelete !== void 0,
						onClose: () => setConfirmDelete(void 0),
						title: t("confirmDelete"),
						closeLabel: t("close"),
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							type: "button",
							onClick: () => setConfirmDelete(void 0),
							children: t("cancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							type: "button",
							variant: "primary",
							disabled: busy,
							onClick: () => {
								if (confirmDelete !== void 0) remove(confirmDelete);
							},
							children: t("delete")
						})] }),
						children: pageError !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "cm-error",
							children: pageError
						}) : null
					})
				]
			});
		}
		//#endregion
		//#region src/client/styles.ts
		const styles = `
.cm-root {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 720px;
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family);
}
.cm-root *, .cm-root *::before, .cm-root *::after { box-sizing: border-box; }
.cm-root h2, .cm-title {
  margin: 0;
  color: var(--dsw-alias-label-primary);
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}
.cm-sub, .cm-intro {
  margin: 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 14px;
  line-height: 22px;
}
.cm-notice {
  margin: 0;
  color: var(--dsw-alias-state-warn-label);
  font-size: 12px;
  line-height: 18px;
}
.cm-saved {
  margin: 0;
  color: var(--dsw-alias-state-success-primary);
  font-size: 12px;
  line-height: 18px;
}
.cm-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}
.cm-row-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  padding: 12px 14px;
}
.cm-row-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cm-row-identity {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}
.cm-row-name {
  overflow-wrap: anywhere;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}
.cm-row-tag {
  flex: none;
  border: 1px solid var(--dsw-alias-border-l3);
  border-radius: 4px;
  padding: 1px 6px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
}
.cm-dot {
  display: inline-block;
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.cm-dot-ok { background: var(--dsw-alias-state-success-primary); }
.cm-dot-miss { background: var(--dsw-alias-state-error-primary); }
.cm-row-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
.cm-primary, .cm-secondary, .cm-add-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 18px;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;
}
.cm-primary {
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground);
}
.cm-primary:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.cm-secondary, .cm-add-button {
  border: 1px solid var(--dsw-alias-border-l2);
  background: transparent;
  color: var(--dsw-alias-label-primary);
}
.cm-secondary:hover:not(:disabled),
.cm-add-button:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
}
.cm-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: 18px;
  background: transparent;
  color: var(--dsw-alias-state-error-primary);
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;
}
.cm-danger:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover-danger); }
.cm-row-actions .cm-secondary,
.cm-row-actions .cm-danger {
  height: 28px;
  padding: 0 10px;
  border-radius: 14px;
  font-size: 12px;
  line-height: 18px;
}
.cm-primary:disabled, .cm-secondary:disabled, .cm-danger:disabled,
.cm-add-button:disabled, .cm-link:disabled, .cm-add-model:disabled {
  opacity: .4;
  cursor: default;
}
.cm-primary:focus-visible, .cm-secondary:focus-visible, .cm-danger:focus-visible,
.cm-add-button:focus-visible, .cm-link:focus-visible, .cm-add-model:focus-visible,
.cm-icon:focus-visible, .cm-customized-summary:focus-visible, .cm-input:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--dsw-alias-border-l3);
}
.cm-editor {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-module-platform);
  padding: 14px 16px;
}
.cm-editor-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.cm-editor-title {
  overflow-wrap: anywhere;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}
.cm-editor-route {
  overflow-wrap: anywhere;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
.cm-field { display: flex; min-width: 0; flex-direction: column; gap: 6px; }
.cm-field-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
}
.cm-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 14px;
  line-height: 22px;
}
.cm-input:focus { outline: none; border-color: var(--dsw-alias-brand-primary); }
.cm-input::placeholder { color: var(--dsw-alias-label-dimmed); }
.cm-input:disabled { opacity: .6; cursor: default; }
select.cm-input { max-width: 240px; cursor: pointer; }
.cm-select {
  appearance: none;
  padding-right: 32px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px 12px;
}
textarea.cm-input {
  height: auto;
  min-height: 84px;
  padding: 7px 10px;
  resize: vertical;
}
.cm-hint {
  margin: 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
.cm-link {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  height: 28px;
  margin: 0;
  padding: 0 10px;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
}
.cm-link:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
}
.cm-editor-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
.cm-reset { margin-right: auto; }
.cm-add-block { display: flex; flex-direction: column; gap: 12px; }
.cm-add-button {
  gap: 6px;
  height: 44px;
  border: 1px dashed var(--dsw-alias-border-l3);
  border-radius: 12px;
}
.cm-add-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-module-platform);
  padding: 14px 16px;
}
.cm-add-card .cm-editor { background: none; padding: 0; }
.cm-customized {
  border-top: 1px solid var(--dsw-alias-border-l2);
  padding-top: 10px;
}
.cm-customized-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  margin-left: -4px;
  border-radius: 6px;
  padding: 2px 4px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  cursor: pointer;
  list-style: none;
}
.cm-customized-summary::-webkit-details-marker { display: none; }
.cm-customized-summary::before {
  content: "";
  width: 5px;
  height: 5px;
  border-right: 1.5px solid currentcolor;
  border-bottom: 1.5px solid currentcolor;
  transform: rotate(-45deg) translate(-1px, -1px);
  transition: transform 120ms ease;
}
.cm-customized[open] > .cm-customized-summary::before {
  transform: rotate(45deg) translate(-1px, -1px);
}
.cm-customized-summary:hover { color: var(--dsw-alias-label-primary); }
.cm-customized-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
}
.cm-model-catalog {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid var(--dsw-alias-border-l2);
  padding-top: 12px;
}
.cm-model-list-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.cm-model-catalog-heading { display: flex; flex-direction: column; gap: 2px; }
.cm-model-catalog-title {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
}
.cm-model-catalog-meta, .cm-model-empty {
  margin: 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
.cm-model-empty {
  border: 1px dashed var(--dsw-alias-border-l3);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}
.cm-model-entry {
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  padding: 6px;
}
.cm-model-row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 6px;
}
.cm-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
}
.cm-icon:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.cm-icon:disabled { opacity: .4; cursor: default; }
.cm-icon-danger:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-danger);
  color: var(--dsw-alias-state-error-primary);
}
.cm-model-advanced {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
  padding: 8px 4px 2px;
}
.cm-model-field { display: flex; min-width: 0; flex-direction: column; gap: 4px; }
.cm-model-field-label {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 18px;
}
.cm-model-extra { grid-column: 1 / -1; }
.cm-add-model {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 14px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
}
.cm-add-model:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.cm-error {
  margin: 0;
  color: var(--dsw-alias-state-error-primary);
  font-size: 12px;
  line-height: 18px;
}
.cm-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  padding: 9px 10px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}
.cm-effort-block, .cm-override { display: flex; min-width: 0; flex-direction: column; gap: 8px; }
.cm-effort-label, .cm-effort-hint, .cm-override-hint {
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
}
.cm-effort-hint { margin: 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.cm-effort-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.cm-effort-custom { box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l3); }
.cm-effort-wire { margin-left: 4px; color: var(--dsw-alias-label-tertiary); font-weight: 400; font-size: 12px; }
.cm-override-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
}
.cm-override-toggle svg { flex: none; }
.cm-override-toggle:hover { color: var(--dsw-alias-label-primary); }
.cm-override-toggle:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 2px; }
.cm-override-count { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.cm-override-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-module-platform);
  padding: 12px;
}
.cm-override-list .cm-override-hint { grid-column: 1 / -1; }
.cm-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
}
.cm-row-checks { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.cm-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
  padding: 0;
}
@media (max-width: 640px) {
  .cm-model-row { grid-template-columns: minmax(0, 1fr) auto auto; }
  .cm-model-row .cm-input:nth-child(2) { grid-column: 1 / -1; grid-row: 2; }
  .cm-override-list { grid-template-columns: 1fr; }
  .cm-override-list .cm-field { grid-column: auto; }
  .cm-row-head { flex-wrap: wrap; }
}
@media (prefers-reduced-motion: reduce) {
  .cm-customized-summary::before { transition: none; }
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