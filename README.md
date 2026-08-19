# dsh-custom-models

一个基于 **@earendil-works/pi-ai** 的 DSH 模型供应商扩展。它在包内实现 DSH LLM adapter，不依赖或 patch **@deepseek-ai/dsh-llm-pi-ai**，并补充了**每个模型的默认推理努力**和自定义供应商 prompt cache key 适配。

## 解决的问题

DSH 的请求运行时会在调用前验证所选推理努力。第三方模型如果没有声明 **reasoningEfforts**，运行时不会显示或传递推理努力；供应商级 **reasoning** 又只能为整条 route 设置同一个默认值。

本扩展允许每个模型同时声明：

- **reasoningEfforts**：可选择的 DSH 推理等级及供应商实际接收的值；
- **defaultReasoningEffort**：该模型在调用方没有指定时使用的默认等级；
- **compat**：OpenAI completions 兼容端点的推理参数方言。

默认值由模型元数据暴露给 DSH，随后由 **llm.prepareCall()** 写入已解析请求，因此会经过正常的能力校验、会话记录和官方 pi-ai wire 映射；扩展不会在请求发送后偷偷篡改参数。

## 安装

要求 Node.js **>= 22.19.0**。在目标 profile 中安装本地目录或已发布的软件包；该命令会把本包的 bundle layer 加入 profile：

~~~bash
dsh plugin --profile web add /home/codehz/Projects/dsh-custom-models
~~~

安装并加载后，打开 Web GUI 的 **设置 → 自定义模型**。设置页按官方模型配置的卡片布局：每个提供商一行，点 **编辑** 就地展开，再点一次收起。设置页可以：

- 新增、编辑、删除 provider 与模型；
- 通过标准 `GET {baseURL}/models`（`llm.discoverModels`）拉取可用模型，失败时在表单内提示原因；
- 在展开的「自定义设置」里配置 endpoint、协议、容量、输入模态、兼容选项与重试策略；
- 模型目录为紧凑行，点开后编辑上下文窗口、最大输出与推理等级；
- 将 API Key 写入 DSH credentials。浏览器只读取“已配置/来源/可写”状态，永远不会回读或显示密钥值。

页面修改存放在 **$DSH_HOME/settings.yaml** 的 **custom-models** namespace，并实时应用到后续调用。插件 entry 中的 config 仍然作为 base 层：设置页只保存用户覆盖；对 base provider 执行“重置”会重新继承 entry 配置。

### 手工配置（可选）

也可以修改 **$DSH_HOME/profiles/web/cordis.patch.yml**。下面的 patch 通过 id 命中 bundle 已插入的 **custom-models** 条目；DSH 对条目的 **config** 做整值替换而不是递归合并，因此这里必须给出完整配置：

~~~yaml
- id: custom-models
  config:
    providers:
      acme:
        displayName: Acme Gateway
        apiKeyEnv: ACME_API_KEY
        api: openai-completions
        baseURL: https://gateway.acme.example/v1
        compat:
          # 常见 OpenAI 兼容接口发送 reasoning_effort
          supportsReasoningEffort: true
        models:
          - id: acme-chat
            name: Acme Chat
            contextWindow: 65536
            maxTokens: 8192
            reasoningEfforts: false

          - id: acme-think
            name: Acme Think
            contextWindow: 262144
            maxTokens: 32768
            reasoningEfforts:
              # null 表示选择 off 时不发送推理参数
              off: null
              low: low
              high: high
              # DSH 侧显示 max，供应商线上实际接收 ultra
              max: ultra
            defaultReasoningEffort: high
~~~

重启 profile 后，**acme/acme-think** 会提供 **off / low / high / max** 四个等级；未显式选择时默认使用 **high**。

## 配置说明

### reasoningEfforts

键是 DSH/pi-ai 的标准等级：**off、minimal、low、medium、high、xhigh、max**。

值是第三方供应商实际接收的字符串。设置页默认按等级同名发送（`high → "high"`）；只有供应商拼写不同时才需要覆盖。只有 **off** 可以为 **null**，代表不发送推理参数。非推理模型请设为 **false**。

### defaultReasoningEffort

默认值必须属于同一模型最终解析出的 **reasoningEfforts**。扩展会在插件启动时逐个验证；配置错误会直接阻止注册，而不是到首次真实请求时才产生静默降级。该默认值由 DSH 的 **llm.prepareCall() / resolveCallConfig()** 物化；绕过 DSH 运行时、直接调用 adapter.stream() 的第三方代码必须自行传入 reasoningEffort。

### API 范围

扩展目前支持第三方最常用的 **openai-completions**（默认）和 **openai-responses**。前者支持 **compat.thinkingFormat** 与 **compat.supportsReasoningEffort**；responses 协议直接使用其原生推理字段。

## 与内置自定义供应商的关系

本扩展注册自己的 provider route。DSH 不允许两个适配器同时拥有同名 route，因此：

- 不要同时在内置“模型”设置页和本扩展中配置同一个 provider key；或
- 为本扩展使用独立 route 名称，例如 **acme-reasoning**。

API Key 在每次请求时动态读取：优先使用当前可用的 DSH credentials 服务；该服务不可用时，使用 DSH 启动环境快照（包括导出的环境变量和启动层）。引用名和值都会走 DSH 官方校验。设置页修改 credential 引用时不会自动删除旧引用，避免误删被其他配置复用的密钥；只有用户明确执行移除时才调用 credentials unset。底层协议请求仍由公开的 **@earendil-works/pi-ai** 实现；本包内的 adapter 负责 DSH 消息、流事件、附件、重放状态和归因头转换。对于 `openai-completions`，只要 DSH 提供 `sessionId` 且 `cacheRetention` 不是 `none`，adapter 就会原样写入 `prompt_cache_key`，不再依赖 `api.openai.com` 的 URL 特判，也不会自行 hash 或拼接 key。

## 开发

`lib/` 是构建产物，不进 Git。本地安装或从源码加载前先打包；`pnpm pack` / `pnpm publish` 会通过 `prepack` 自动执行 `pnpm build`。

~~~bash
pnpm install
pnpm build
pnpm verify
~~~
