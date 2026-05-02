# Desktop Immersion v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让桌宠在桌面上真正可拖拽移动，默认不挡桌面鼠标；仅命中角色/交互 UI 时拦截鼠标；托盘可一键打开设置；启动时应用置顶/位置配置并持久化。

**Architecture:** 主进程提供窗口位置/鼠标穿透/事件派发的 IPC 能力；渲染进程实现“命中检测 + 穿透状态机 + 拖拽手势”，通过 preload 暴露的安全 API 调用主进程。

**Tech Stack:** Electron 30, React 18, TypeScript, Vite

---

## File Map（将要修改/新增的文件）

**Modify**
- `/workspace/src/main/ipc/channels.ts`
- `/workspace/src/main/ipc/handlers/window.ts`
- `/workspace/src/main/preload.ts`
- `/workspace/src/main/system/window.ts`
- `/workspace/src/main/system/tray.ts`
- `/workspace/src/shared/types/config.ts`
- `/workspace/src/renderer/src/types/electron.d.ts`
- `/workspace/src/renderer/src/App.tsx`
- `/workspace/src/renderer/src/components/Pet/VRMCanvas.tsx`

**Create**
- `/workspace/src/main/config/store.ts`
- `/workspace/src/renderer/src/hooks/useMousePassthrough.ts`

---

### Task 1: 抽离主进程配置读取模块（供 window 创建期使用）

**Files:**
- Create: `/workspace/src/main/config/store.ts`
- Modify: `/workspace/src/main/ipc/handlers/config.ts`
- Modify: `/workspace/src/main/services/ai.ts`（替换 getConfig import）
- Modify: `/workspace/src/main/system/window.ts`（替换 getConfig import）

- [ ] **Step 1: 新建配置 store 模块**

创建 `/workspace/src/main/config/store.ts`：

```ts
import Store from 'electron-store'
import { AppConfig, DEFAULT_CONFIG } from '@shared/types/config'
import { setAutoStart } from '../system/autostart'

const store = new Store<{ config: AppConfig }>()

export function getConfig(): AppConfig {
  return store.get('config', DEFAULT_CONFIG)
}

export async function setConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  const currentConfig = getConfig()
  const newConfig = { ...currentConfig, ...config }
  store.set('config', newConfig)

  if (currentConfig.autoStart !== newConfig.autoStart) {
    try {
      await setAutoStart(newConfig.autoStart)
    } catch (error) {
      console.error('Failed to set auto start:', error)
    }
  }

  return newConfig
}

export function resetConfig(): AppConfig {
  store.set('config', DEFAULT_CONFIG)
  return DEFAULT_CONFIG
}
```

- [ ] **Step 2: 改造 config IPC handler 使用新模块**

将 `/workspace/src/main/ipc/handlers/config.ts` 的实现改为导入 `src/main/config/store.ts`：

```ts
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../channels'
import { getConfig, setConfig, resetConfig } from '../../config/store'
import { AppConfig } from '@shared/types/config'

export { getConfig }

export function registerConfigHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CONFIG.GET, () => getConfig())

  ipcMain.handle(IPC_CHANNELS.CONFIG.SET, async (_event, config: Partial<AppConfig>) => {
    return await setConfig(config)
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG.RESET, () => resetConfig())
}
```

- [ ] **Step 3: 更新 AI 服务对 getConfig 的引用**

在 `/workspace/src/main/services/ai.ts` 将：

```ts
import { getConfig } from '../ipc/handlers/config'
```

替换为：

```ts
import { getConfig } from '../config/store'
```

- [ ] **Step 4: 运行类型检查**

Run:

```bash
npm run typecheck
```

Expected: Exit code 0

---

### Task 2: 扩展窗口 IPC（getPosition + setMousePassthrough）

**Files:**
- Modify: `/workspace/src/main/ipc/channels.ts`
- Modify: `/workspace/src/main/ipc/handlers/window.ts`
- Modify: `/workspace/src/main/system/window.ts`
- Modify: `/workspace/src/main/preload.ts`
- Modify: `/workspace/src/renderer/src/types/electron.d.ts`

- [ ] **Step 1: 扩展 IPC_CHANNELS.WINDOW**

在 `/workspace/src/main/ipc/channels.ts` 的 WINDOW 下新增：

```ts
  WINDOW: {
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
    CLOSE: 'window:close',
    SHOW: 'window:show',
    HIDE: 'window:hide',
    SET_ALWAYS_ON_TOP: 'window:set-always-on-top',
    SET_POSITION: 'window:set-position',
    GET_POSITION: 'window:get-position',
    SET_MOUSE_PASSTHROUGH: 'window:set-mouse-passthrough',
  },
```

- [ ] **Step 2: 主进程窗口模块提供穿透与位置查询**

在 `/workspace/src/main/system/window.ts` 追加导出：

```ts
export function setMousePassthrough(enabled: boolean): void {
  if (mainWindow) {
    if (enabled) {
      mainWindow.setIgnoreMouseEvents(true, { forward: true })
    } else {
      mainWindow.setIgnoreMouseEvents(false)
    }
  }
}
```

并确保已有 `getWindowPosition()` 可用（目前已存在）。

- [ ] **Step 3: 注册 window IPC handlers**

在 `/workspace/src/main/ipc/handlers/window.ts`：

```ts
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../channels'
import {
  showWindow,
  hideWindow,
  setAlwaysOnTop,
  setWindowPosition,
  getWindowPosition,
  setMousePassthrough,
} from '../../system/window'

export function registerWindowHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.WINDOW.SHOW, () => showWindow())
  ipcMain.handle(IPC_CHANNELS.WINDOW.HIDE, () => hideWindow())
  ipcMain.handle(IPC_CHANNELS.WINDOW.SET_ALWAYS_ON_TOP, (_event, value: boolean) => setAlwaysOnTop(value))
  ipcMain.handle(IPC_CHANNELS.WINDOW.SET_POSITION, (_event, x: number, y: number) => setWindowPosition(x, y))
  ipcMain.handle(IPC_CHANNELS.WINDOW.GET_POSITION, () => getWindowPosition())
  ipcMain.handle(IPC_CHANNELS.WINDOW.SET_MOUSE_PASSTHROUGH, (_event, enabled: boolean) => {
    setMousePassthrough(enabled)
  })
}
```

- [ ] **Step 4: preload 暴露新 API**

在 `/workspace/src/main/preload.ts` 的 `electronAPI.window` 下加入：

```ts
    getPosition: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.GET_POSITION),
    setMousePassthrough: (enabled: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.WINDOW.SET_MOUSE_PASSTHROUGH, enabled),
```

- [ ] **Step 5: 更新渲染侧类型声明**

在 `/workspace/src/renderer/src/types/electron.d.ts` 的 window 部分增加：

```ts
    getPosition: () => Promise<{ x: number; y: number } | null>
    setMousePassthrough: (enabled: boolean) => Promise<void>
```

- [ ] **Step 6: 运行类型检查**

Run:

```bash
npm run typecheck
```

Expected: Exit code 0

---

### Task 3: 托盘打开设置事件（open-settings）贯通到渲染层

**Files:**
- Modify: `/workspace/src/main/preload.ts`
- Modify: `/workspace/src/renderer/src/types/electron.d.ts`
- Modify: `/workspace/src/renderer/src/App.tsx`

- [ ] **Step 1: preload 增加事件订阅 API**

在 `/workspace/src/main/preload.ts` 追加一个 events 命名空间：

```ts
  events: {
    onOpenSettings: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('open-settings', listener)
      return () => {
        ipcRenderer.removeListener('open-settings', listener)
      }
    },
  },
```

- [ ] **Step 2: 更新类型声明**

在 `/workspace/src/renderer/src/types/electron.d.ts` 为 ElectronAPI 增加：

```ts
  events: {
    onOpenSettings: (callback: () => void) => () => void
  }
```

- [ ] **Step 3: App.tsx 订阅 open-settings 并打开设置面板**

在 `/workspace/src/renderer/src/App.tsx` 的 `useEffect` 中注册并清理订阅：

```ts
  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI?.events?.onOpenSettings) return
    const off = window.electronAPI.events.onOpenSettings(() => {
      setShowSettings(true)
    })
    return () => off()
  }, [])
```

- [ ] **Step 4: 运行开发模式做一次手工验证**

Run:

```bash
npm run electron:dev
```

Expected: 点击托盘“设置”后设置面板打开

---

### Task 4: 配置扩展（windowPosition）与启动应用（置顶/位置）

**Files:**
- Modify: `/workspace/src/shared/types/config.ts`
- Modify: `/workspace/src/main/system/window.ts`

- [ ] **Step 1: AppConfig 增加 windowPosition**

在 `/workspace/src/shared/types/config.ts` 增加字段：

```ts
  windowPosition?: { x: number; y: number }
```

并在 `DEFAULT_CONFIG` 中补默认值（可不设，由代码兜底；但为了稳定建议设）：

```ts
  windowPosition: undefined,
```

- [ ] **Step 2: createWindow 应用配置**

在 `/workspace/src/main/system/window.ts`：

1) import config：

```ts
import { getConfig } from '../config/store'
```

2) 创建 BrowserWindow 前读取 config，应用 alwaysOnTop 与初始位置（存在则用配置，否则用当前默认右下角）：

```ts
  const config = getConfig()
  const initialX = config.windowPosition?.x ?? width - 450
  const initialY = config.windowPosition?.y ?? height - 450

  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    x: initialX,
    y: initialY,
    transparent: true,
    frame: false,
    alwaysOnTop: config.alwaysOnTop ?? true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js'),
    },
  })
```

- [ ] **Step 3: 运行类型检查**

Run:

```bash
npm run typecheck
```

Expected: Exit code 0

---

### Task 5: 渲染侧穿透状态机（面板态/轻量态/命中态）

**Files:**
- Create: `/workspace/src/renderer/src/hooks/useMousePassthrough.ts`
- Modify: `/workspace/src/renderer/src/App.tsx`

- [ ] **Step 1: 新增 useMousePassthrough hook**

创建 `/workspace/src/renderer/src/hooks/useMousePassthrough.ts`：

```ts
import { useCallback, useEffect, useRef, useState } from 'react'

export function useMousePassthrough() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [interactiveHover, setInteractiveHover] = useState(false)
  const lastApplied = useRef<boolean | null>(null)
  const applyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const desiredPassthrough = !(panelOpen || interactiveHover)

  const apply = useCallback((value: boolean) => {
    if (typeof window === 'undefined') return
    if (!window.electronAPI?.window?.setMousePassthrough) return
    if (lastApplied.current === value) return
    lastApplied.current = value
    void window.electronAPI.window.setMousePassthrough(value)
  }, [])

  useEffect(() => {
    if (applyTimer.current) clearTimeout(applyTimer.current)
    applyTimer.current = setTimeout(() => apply(desiredPassthrough), 30)
    return () => {
      if (applyTimer.current) clearTimeout(applyTimer.current)
    }
  }, [apply, desiredPassthrough])

  return {
    panelOpen,
    setPanelOpen,
    interactiveHover,
    setInteractiveHover,
    desiredPassthrough,
  }
}
```

- [ ] **Step 2: App.tsx 接入 hook 并在面板开关时更新 panelOpen**

在 `/workspace/src/renderer/src/App.tsx`：

1) import：

```ts
import { useMousePassthrough } from './hooks/useMousePassthrough'
```

2) 初始化：

```ts
  const passthrough = useMousePassthrough()
```

3) 在渲染处根据面板状态设置：

```ts
  useEffect(() => {
    const open =
      showChat || showSettings || showDressUp || showGame || showAchievement || showStatus || showFeed
    passthrough.setPanelOpen(open)
  }, [showChat, showSettings, showDressUp, showGame, showAchievement, showStatus, showFeed, passthrough])
```

- [ ] **Step 3: 运行 electron:dev 做基础验证**

Run:

```bash
npm run electron:dev
```

Expected: 未打开面板时桌宠尽量不挡桌面；打开面板时面板可点击（不穿透）

---

### Task 6: VRM 角色命中检测（hover）上报，驱动穿透切换

**Files:**
- Modify: `/workspace/src/renderer/src/components/Pet/VRMCanvas.tsx`
- Modify: `/workspace/src/renderer/src/App.tsx`

- [ ] **Step 1: VRMCanvas 增加 onHoverChange 回调**

在 `/workspace/src/renderer/src/components/Pet/VRMCanvas.tsx`：

1) 扩展 VRMCanvasProps：

```ts
  onHoverChange?: (hovering: boolean) => void
```

2) 在 VRMCanvas 组件参数解构中接收它，并传给 VRMModel。

3) 在 VRMModel 内部增加 mousemove 监听，复用 checkIntersection 进行 hover 判断，并仅在状态变化时回调：

```ts
  const hoveringRef = useRef(false)

  useEffect(() => {
    if (!onHoverChange) return

    const handleMove = (event: MouseEvent) => {
      const hit = checkIntersection(event)
      if (hit !== hoveringRef.current) {
        hoveringRef.current = hit
        onHoverChange(hit)
      }
    }

    gl.domElement.addEventListener('mousemove', handleMove)
    return () => gl.domElement.removeEventListener('mousemove', handleMove)
  }, [checkIntersection, gl, onHoverChange])
```

- [ ] **Step 2: App.tsx 将 hover 映射为 interactiveHover**

在 `/workspace/src/renderer/src/App.tsx` 的 VRMCanvas 上增加：

```tsx
        <VRMCanvas
          ...
          onHoverChange={(hovering) => passthrough.setInteractiveHover(hovering)}
        />
```

- [ ] **Step 3: 手工验收 hover 行为**

Run:

```bash
npm run electron:dev
```

Expected:
- 鼠标不在角色上：点击桌面能穿透
- 鼠标移到角色上：可点击/右键/双击触发桌宠行为

---

### Task 7: 窗口拖拽移动（移动 BrowserWindow）与位置持久化

**Files:**
- Modify: `/workspace/src/renderer/src/App.tsx`
- Modify: `/workspace/src/main/system/window.ts`（如需兜底）

- [ ] **Step 1: App.tsx 增加拖拽移动窗口逻辑**

在 `/workspace/src/renderer/src/App.tsx` 增加 refs：

```ts
  const draggingRef = useRef<{
    dragging: boolean
    startScreenX: number
    startScreenY: number
    startWinX: number
    startWinY: number
  } | null>(null)
```

新增用于开始拖拽的方法（在角色被按下时调用）：

```ts
  const startWindowDrag = useCallback(async (screenX: number, screenY: number) => {
    if (!window.electronAPI?.window?.getPosition) return
    const pos = await window.electronAPI.window.getPosition()
    if (!pos) return
    draggingRef.current = {
      dragging: true,
      startScreenX: screenX,
      startScreenY: screenY,
      startWinX: pos.x,
      startWinY: pos.y,
    }
  }, [])
```

注册全局 mousemove/mouseup（组件挂载时）：

```ts
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const s = draggingRef.current
      if (!s?.dragging) return
      const dx = e.screenX - s.startScreenX
      const dy = e.screenY - s.startScreenY
      const x = s.startWinX + dx
      const y = s.startWinY + dy
      void window.electronAPI?.window?.setPosition(x, y)
    }

    const onUp = async () => {
      const s = draggingRef.current
      if (!s?.dragging) return
      draggingRef.current = { ...s, dragging: false }
      const pos = await window.electronAPI?.window?.getPosition?.()
      if (pos && window.electronAPI?.config?.set) {
        await window.electronAPI.config.set({ windowPosition: pos })
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])
```

然后在 VRMCanvas 的交互上，新增一个“按下开始拖拽”的触发（实现方式二选一）：

**实现方式 1（推荐）：在 VRMCanvas 内新增 onPointerDown 命中回调**
- 扩展 VRMCanvasProps：`onModelPointerDown?: (event: MouseEvent) => void`
- 在 VRMModel 内对 `gl.domElement` 监听 `mousedown`，命中后触发回调

回调实现：

```ts
  onModelPointerDown={(e) => startWindowDrag(e.screenX, e.screenY)}
```

- [ ] **Step 2: 更新渲染侧类型声明（如 electronAPI.config.set 返回值不同步，顺手修正）**

把 `/workspace/src/renderer/src/types/electron.d.ts` 中 config.set 的返回类型改为：

```ts
set: (config: Record<string, unknown>) => Promise<Record<string, unknown>>
```

并将 ai.chat 的返回类型修正为实际结构（最少包含 success/message/error）：

```ts
chat: (messages: Array<{ role: string; content: string }>) => Promise<{ success: boolean; message?: string; error?: string }>
```

- [ ] **Step 3: 手工验收拖拽与重启持久化**

Run:

```bash
npm run electron:dev
```

Expected:
- 拖拽角色时窗口跟随移动
- 松手后重启应用，窗口在上次位置出现

---

### Task 8: 回归检查与交付验证

**Files:** 无（只跑命令与手工验收）

- [ ] **Step 1: 静态检查**

Run:

```bash
npm run lint
npm run typecheck
```

Expected: Exit code 0

- [ ] **Step 2: 关键路径回归**

Run:

```bash
npm run electron:dev
```

Expected:
- 聊天/设置/换装/游戏/成就等面板可正常打开关闭
- 关闭面板后穿透逻辑恢复
- 托盘显示/隐藏/设置/退出正常

---

## Spec Coverage Check

- 鼠标穿透与“只点到角色才拦截”：Task 2 + Task 5 + Task 6
- 窗口拖拽移动与位置持久化：Task 2 + Task 4 + Task 7
- 托盘打开设置：Task 3
- 启动应用配置（置顶/位置）：Task 4

