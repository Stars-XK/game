## 桌宠项目：桌面沉浸 v1 设计说明

### 背景

当前桌宠以 Electron 透明置顶窗口承载渲染层（React + three-vrm）。现阶段交互更像“应用小窗”，而不是“桌面常驻桌宠”。本阶段聚焦把体验拉到“像桌宠”：可在桌面任意位置移动、默认不阻挡桌面鼠标操作、托盘可直接打开设置。

### 目标（Goals）

- 桌宠可在桌面任意位置拖拽移动，移动的是系统窗口（BrowserWindow）而不是仅前端状态
- 默认点击穿透：不打开面板时，桌宠不挡桌面；只有命中角色/气泡/交互按钮时才拦截鼠标
- 打开任意面板（聊天/设置/换装/游戏/成就/状态/喂食）时，面板区域正常接收鼠标并可操作
- 托盘菜单“设置”可直接打开设置面板
- 启动时应用配置：alwaysOnTop、初始位置等
- 位置持久化：重启后保持上次位置

### 非目标（Non-goals）

- 全屏透明覆盖层窗口（后续版本可选）
- 屏幕内容理解/OCR（后续版本）
- 键盘鼠标自动操作（后续版本）
- 真实换装接入 VRM mesh/material/附件系统（后续版本）

### 用户体验定义（UX）

#### 交互状态

- 轻量桌宠态（无面板）
  - 默认鼠标穿透
  - 当鼠标悬浮到角色模型或“桌宠泡泡/悬浮按钮”上时：临时关闭穿透，允许点击、右键、双击、滚轮缩放、拖拽移动
  - 鼠标移出可交互区域：恢复穿透
- 面板态（任意面板打开）
  - 关闭穿透，保证 UI 可交互
  - 关闭面板后回到轻量桌宠态的穿透策略

#### 拖拽规则

- 鼠标左键按下并拖动角色：移动系统窗口
- 窗口移动采用“屏幕坐标 delta”计算，支持跨 DPI/多屏后续扩展
- 可选：按住拖拽时暂时关闭穿透，释放后按当前状态恢复

### 技术设计

#### 模块边界

- 主进程负责
  - BrowserWindow 创建、置顶、窗口移动、鼠标穿透开关
  - 托盘发出“打开设置”事件到渲染进程
  - 读取/应用配置（electron-store）
- 渲染进程负责
  - 命中检测：判断鼠标是否在角色模型/交互 UI 上
  - 拖拽手势：发起窗口移动（调用 IPC）
  - 面板开关与穿透策略协调

#### IPC API（新增/调整）

现有：window.setPosition(x, y)、window.setAlwaysOnTop(value)、window.show/hide 等

新增：

- window.getPosition(): Promise<{ x: number; y: number } | null>
- window.setMousePassthrough(enabled: boolean): Promise<void>
- events.onOpenSettings(callback: () => void): () => void

主进程实现要点：

- setMousePassthrough(true) => BrowserWindow.setIgnoreMouseEvents(true, { forward: true })
- setMousePassthrough(false) => BrowserWindow.setIgnoreMouseEvents(false)
- getPosition => BrowserWindow.getPosition()

渲染进程实现要点：

- 维护一个“期望是否穿透”的状态机：
  - 面板打开 => 期望不穿透
  - 面板关闭且 hover 不在可交互区域 => 期望穿透
  - 面板关闭且 hover 在可交互区域 => 期望不穿透
- 去抖/只在状态变化时发送 IPC，避免高频切换

#### 命中检测策略

优先使用 VRMCanvas 内部已有 raycaster 逻辑：

- mousemove 时判断 raycaster 是否与 VRM scene 相交
- 相交 => hover=true，非相交 => hover=false
- 将 hover 状态通过回调上报给 App 层，用于切换穿透

UI 命中：

- 泡泡、悬浮按钮、面板容器本身都属于可交互区域
- 这些区域可通过 onMouseEnter/onMouseLeave 显式控制 hover 标记，减少对 3D 命中的依赖

#### 配置应用

- 启动时从配置读取 alwaysOnTop 并应用到窗口
- 位置持久化：
  - 存储位置以“窗口坐标”为准，持久化到配置（优先）或 localStorage（可兼容迁移）
  - 初版可以继续用 localStorage，但需改为写入 window position

#### 托盘打开设置

- 主进程：tray 菜单点击发送 open-settings 事件到 webContents
- 渲染进程：通过 preload 暴露的 events.onOpenSettings 订阅该事件，并设置 showSettings=true

### 安全与隐私

- 鼠标穿透开关仅作用于应用自身窗口，不引入任何全局注入
- 不引入键鼠自动控制能力
- 不采集屏幕内容

### 兼容性与边界

- Windows/macOS/Linux 均支持 BrowserWindow.setIgnoreMouseEvents，但透明窗口与输入穿透在不同平台可能表现略有差异
- 多屏与 DPI：
  - 初版以 screenX/screenY + window position 做增量移动
  - 后续可结合 electron screen API 做边界约束与更精确处理

### 测试与验收

#### 手工验收用例

- 启动后默认穿透：点击桌面任意位置不被挡住
- 鼠标移入角色：可点击（单击/双击/右键）并可拖拽移动窗口
- 鼠标移出角色：恢复穿透
- 打开任意面板：面板可操作且不穿透；关闭面板后恢复默认策略
- 拖动到任意位置后重启：位置保持
- 托盘点击“设置”：打开设置面板

#### 自动化（可选）

- IPC handler 单元测试（若后续引入测试框架）
- 基础集成测试：窗口 API 可调用且不抛错

### 里程碑拆分（本阶段）

1. IPC：补齐 getPosition / setMousePassthrough / events.onOpenSettings
2. 渲染：窗口拖拽移动改造（移动 BrowserWindow）
3. 渲染：命中检测与穿透状态机
4. 主进程：启动应用配置与位置持久化应用
5. 联调验收：托盘设置打开、面板交互、穿透行为一致

