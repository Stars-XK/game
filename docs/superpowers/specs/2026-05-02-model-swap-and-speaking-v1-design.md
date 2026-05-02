## 桌宠项目：真实换装（C v1：整套模型切换）+ 说话口型动画 v1 设计说明

### 背景

当前“换装”仅在 UI 层选择服装条目，并未影响 VRM 渲染结果。现阶段优先以最低成本实现“看得见的换装”，因此采用整套 VRM 模型切换（方案 C）。同时把“说话像在说话”做出来：在 TTS 播放期间驱动口型（VRMExpressionPresetName.Aa）与轻微表情/动作。

本阶段还不接入 VRoid 用户自定义模型导入；先用内置两套 VRM 完成闭环，后续再接入 VRoid 导出 VRM 作为“自定义模型管理”功能。

### 目标（Goals）

- “换装是真的”：在 UI 里切换两套内置 VRM 模型，角色外观立刻变化
- 换装持久化：切换后的模型选择写入配置，重启保持
- 说话口型：TTS 播放期间触发口型动画，结束后恢复
- 低耦合：通过轻量事件总线（CustomEvent）联动，不把逻辑耦合进 ChatWindow

### 非目标（Non-goals）

- VRM 附件挂载（方案 B）与可组合服装系统
- 用户导入/上传 VRM（VRoid 模型接入放到后续阶段）
- 精确语音驱动口型（基于音频能量/音素对齐）；本阶段先做“伪口型”即可

### 数据与配置

#### 新增配置字段

在 `AppConfig` 增加：

- `petModelId: 'character' | 'xiaomeng'`

说明：

- 使用 `petModelId` 避免与 OpenAI 的 `model` 字段重名、混淆
- `DEFAULT_CONFIG.petModelId = 'character'`

#### 内置模型表

新增 shared 数据源（仅内置两套）：

```ts
export const PET_MODELS = [
  { id: 'character', name: '默认', url: '/models/character.vrm' },
  { id: 'xiaomeng', name: '小萌', url: '/models/小萌.vrm' },
] as const
```

并提供：

- `getPetModelUrl(petModelId)`：找不到时回退到默认

### UI 交互设计

#### DressUpPanel：新增“套装”选择区（路线1）

在换装面板顶部加入“套装/模型”区域，提供两张可点击卡片或两个按钮：

- 默认（character）
- 小萌（xiaomeng）

点击行为：

1) `electronAPI.config.set({ petModelId })`
2) 派发事件通知 App 立即更新渲染（无需重启/重新打开面板）

事件形式：

- `window.dispatchEvent(new CustomEvent('pet-model-changed', { detail: { petModelId } }))`

#### App：模型选择的加载与联动

App 启动时：

1) 从 config 读取 `petModelId`
2) 映射到 `modelUrl`
3) 传给 `VRMCanvas` 渲染

App 监听 `pet-model-changed`：

- 更新 `petModelId/modelUrl` 的 state
- 保证切换立刻生效

### 说话动画设计（TTS 驱动）

#### 事件协议

`useTTS` 在以下时机派发：

- onstart：`tts-speaking`，detail: `{ speaking: true }`
- onend/onerror/stop：`tts-speaking`，detail: `{ speaking: false }`

形式：

- `window.dispatchEvent(new CustomEvent('tts-speaking', { detail: { speaking } }))`

#### App：聚合 speaking 状态

App 订阅 `tts-speaking`：

- `isSpeaking` state = true/false
- 传入 `VRMCanvas speaking={isSpeaking}`

#### VRMCanvas：口型实现（伪口型）

在 `VRMModel` 的 `useFrame` 中叠加 speaking layer：

- 若 `speaking === true`：
  - `Aa = 0.35 + 0.25 * sin(time * 18)`（可调频率与幅度）
  - 可选叠加 `Happy` 很轻的权重（例如 0.1），避免面无表情
- 若 `speaking === false`：
  - `Aa` 逐渐衰减到 0（避免瞬间闭嘴的跳变）

依赖检查：

- 当前工程已使用 `VRMExpressionPresetName` 且包含 `Aa`（已验证）

### 错误处理与回退

- config 中 petModelId 不存在：回退到 `character`
- VRM 加载失败：继续走当前 VRMCanvas fallback 模型渲染（已有）
- 不支持 speechSynthesis：不派发 speaking 事件，VRM 口型不启用

### 验收标准

1) 打开换装面板，点击“默认/小萌”可见角色立即切换为不同 VRM 外观
2) 关闭并重启应用，角色保持上次选择
3) AI 回复并触发 TTS 播放时，角色嘴巴会动；停止/播放结束后恢复

