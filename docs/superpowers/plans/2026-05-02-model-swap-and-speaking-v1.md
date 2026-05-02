# Model Swap (C v1) + Speaking Lip Sync v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现“整套 VRM 模型切换换装（仅两套内置模型）”与“说话口型动画（TTS 驱动）”，并持久化到本地配置，重启保持。

**Architecture:** 渲染进程通过配置字段 `petModelId` 选择 VRM 的 `modelUrl`；DressUpPanel 负责切换并写入配置，同时通过 CustomEvent 通知 App 即时更新；TTS hook 派发 speaking 事件，App 聚合并传递给 VRMCanvas，VRMCanvas 在 useFrame 里驱动 VRMExpressionPresetName.Aa 作为伪口型。

**Tech Stack:** Electron 30, React 18, TypeScript, three.js, @pixiv/three-vrm

---

## File Map（将要修改/新增的文件）

**Modify**
- `/workspace/src/main/config/store.ts`
- `/workspace/src/shared/types/config.ts`
- `/workspace/src/renderer/src/App.tsx`
- `/workspace/src/renderer/src/components/DressUp/DressUpPanel.tsx`
- `/workspace/src/renderer/src/hooks/useTTS.ts`
- `/workspace/src/renderer/src/components/Pet/VRMCanvas.tsx`

**Create**
- `/workspace/src/shared/data/petModels.ts`

---

### Task 1: 配置层补齐 petModelId，并确保 getConfig 对新字段兼容

**Files:**
- Modify: `/workspace/src/shared/types/config.ts`
- Modify: `/workspace/src/main/config/store.ts`

- [ ] **Step 1: AppConfig 增加 petModelId 并设置默认值**

在 `/workspace/src/shared/types/config.ts`：

1) 在 `AppConfig` 增加：

```ts
  petModelId: 'character' | 'xiaomeng'
```

2) 在 `DEFAULT_CONFIG` 增加：

```ts
  petModelId: 'character',
```

- [ ] **Step 2: 修复 getConfig 兼容旧配置（合并 DEFAULT_CONFIG）**

在 `/workspace/src/main/config/store.ts` 将 `getConfig` 改为合并默认值：

```ts
export function getConfig(): AppConfig {
  const stored = store.get('config')
  return { ...DEFAULT_CONFIG, ...(stored || {}) }
}
```

- [ ] **Step 3: 运行主进程 typecheck**

Run:

```bash
npm run typecheck
```

Expected: Exit code 0

---

### Task 2: 新增内置模型表（shared）并提供 URL 映射

**Files:**
- Create: `/workspace/src/shared/data/petModels.ts`

- [ ] **Step 1: 新建 petModels 数据源**

创建 `/workspace/src/shared/data/petModels.ts`：

```ts
export const PET_MODELS = [
  { id: 'character', name: '默认', url: '/models/character.vrm' },
  { id: 'xiaomeng', name: '小萌', url: '/models/小萌.vrm' },
] as const

export type PetModelId = typeof PET_MODELS[number]['id']

export function getPetModelUrl(id: string | undefined | null): string {
  const found = PET_MODELS.find((m) => m.id === id)
  return found?.url || PET_MODELS[0].url
}
```

- [ ] **Step 2: 主进程 typecheck**

Run:

```bash
npm run typecheck
```

Expected: Exit code 0

---

### Task 3: App 接入 petModelId（从 config 初始化 + 监听 pet-model-changed 即时更新）

**Files:**
- Modify: `/workspace/src/renderer/src/App.tsx`

- [ ] **Step 1: 引入模型映射并增加 state**

在 `/workspace/src/renderer/src/App.tsx`：

1) import：

```ts
import { getPetModelUrl } from '@shared/data/petModels'
```

2) 在组件 state 中新增：

```ts
  const [petModelId, setPetModelId] = useState<string>('character')
  const [petModelUrl, setPetModelUrl] = useState<string>(getPetModelUrl('character'))
```

- [ ] **Step 2: 启动时从 config 读取 petModelId**

新增 effect（早期执行即可）：

```ts
  useEffect(() => {
    const load = async () => {
      if (!window.electronAPI?.config?.get) return
      const config = await window.electronAPI.config.get()
      const id = (config.petModelId as string) || 'character'
      setPetModelId(id)
      setPetModelUrl(getPetModelUrl(id))
    }
    void load()
  }, [])
```

- [ ] **Step 3: 监听 pet-model-changed**

新增 effect：

```ts
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ petModelId?: string }>).detail
      const id = detail?.petModelId || 'character'
      setPetModelId(id)
      setPetModelUrl(getPetModelUrl(id))
    }
    window.addEventListener('pet-model-changed', handler as EventListener)
    return () => window.removeEventListener('pet-model-changed', handler as EventListener)
  }, [])
```

- [ ] **Step 4: VRMCanvas 使用 petModelUrl**

把原先固定的：

```tsx
modelUrl="/models/character.vrm"
```

替换为：

```tsx
modelUrl={petModelUrl}
```

- [ ] **Step 5: build:main + typecheck**

Run:

```bash
npm run build:main
npm run typecheck
```

Expected: Exit code 0

---

### Task 4: DressUpPanel 增加“套装/模型”选择区并写入配置

**Files:**
- Modify: `/workspace/src/renderer/src/components/DressUp/DressUpPanel.tsx`
- Modify: `/workspace/src/shared/data/petModels.ts`（若需要展示 name）

- [ ] **Step 1: 引入 PET_MODELS**

在 `/workspace/src/renderer/src/components/DressUp/DressUpPanel.tsx` 顶部新增：

```ts
import { PET_MODELS } from '@shared/data/petModels'
```

- [ ] **Step 2: 读取当前 petModelId**

在组件内新增 state 与初始化：

```ts
  const [petModelId, setPetModelId] = useState<string>('character')

  useEffect(() => {
    const load = async () => {
      const config = await window.electronAPI.config.get()
      setPetModelId((config.petModelId as string) || 'character')
    }
    void load()
  }, [])
```

- [ ] **Step 3: 增加 UI 区块（放在 header 下方、content 之前）**

在 JSX 中加入一个模型选择区（最小实现：两个按钮）：

```tsx
        <div className="dressup-models">
          {PET_MODELS.map((m) => (
            <button
              key={m.id}
              className={`dressup-model-btn ${petModelId === m.id ? 'active' : ''}`}
              onClick={async () => {
                setPetModelId(m.id)
                await window.electronAPI.config.set({ petModelId: m.id })
                window.dispatchEvent(new CustomEvent('pet-model-changed', { detail: { petModelId: m.id } }))
              }}
            >
              {m.name}
            </button>
          ))}
        </div>
```

- [ ] **Step 4: 补最小样式**

在 `/workspace/src/renderer/src/components/DressUp/DressUpPanel.css` 末尾追加（不引入新组件）：

```css
.dressup-models {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
}

.dressup-model-btn {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  cursor: pointer;
}

.dressup-model-btn.active {
  border-color: rgba(255, 183, 197, 0.9);
  background: rgba(255, 183, 197, 0.25);
}
```

- [ ] **Step 5: build:main + typecheck**

Run:

```bash
npm run build:main
npm run typecheck
```

Expected: Exit code 0

---

### Task 5: useTTS 派发 tts-speaking 事件（onstart/onend/onerror/stop）

**Files:**
- Modify: `/workspace/src/renderer/src/hooks/useTTS.ts`

- [ ] **Step 1: 增加事件派发工具函数**

在 `useTTS` 内部添加：

```ts
  const emitSpeaking = useCallback((speaking: boolean) => {
    window.dispatchEvent(new CustomEvent('tts-speaking', { detail: { speaking } }))
  }, [])
```

- [ ] **Step 2: speak() 里绑定 onstart/onend/onerror**

在 `utterance.onstart/onend/onerror` 中：

```ts
      utterance.onstart = () => {
        setIsSpeaking(true)
        emitSpeaking(true)
      }
      utterance.onend = () => {
        setIsSpeaking(false)
        emitSpeaking(false)
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        emitSpeaking(false)
      }
```

- [ ] **Step 3: stop() 也派发 false**

```ts
  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    emitSpeaking(false)
  }, [emitSpeaking])
```

- [ ] **Step 4: build:renderer（可选）+ typecheck（主）**

Run:

```bash
npm run build:renderer
npm run typecheck
```

Expected: Exit code 0

---

### Task 6: App 聚合 speaking 状态并传入 VRMCanvas

**Files:**
- Modify: `/workspace/src/renderer/src/App.tsx`
- Modify: `/workspace/src/renderer/src/components/Pet/VRMCanvas.tsx`

- [ ] **Step 1: App 订阅 tts-speaking 并维护 isSpeaking**

在 `/workspace/src/renderer/src/App.tsx` 新增：

```ts
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ speaking?: boolean }>).detail
      setIsSpeaking(Boolean(detail?.speaking))
    }
    window.addEventListener('tts-speaking', handler as EventListener)
    return () => window.removeEventListener('tts-speaking', handler as EventListener)
  }, [])
```

- [ ] **Step 2: VRMCanvasProps 增加 speaking**

在 `/workspace/src/renderer/src/components/Pet/VRMCanvas.tsx`：

1) `VRMModelProps` 与 `VRMCanvasProps` 增加：

```ts
  speaking?: boolean
```

2) VRMCanvas 组件将 `speaking` 传给 VRMModel。

- [ ] **Step 3: App 传 speaking 给 VRMCanvas**

在 App 的 VRMCanvas 节点上加：

```tsx
speaking={isSpeaking}
```

- [ ] **Step 4: build:main + typecheck**

Run:

```bash
npm run build:main
npm run typecheck
```

Expected: Exit code 0

---

### Task 7: VRMCanvas 实现伪口型（Aa）并在 speaking=false 时回落

**Files:**
- Modify: `/workspace/src/renderer/src/components/Pet/VRMCanvas.tsx`

- [ ] **Step 1: 在 VRMModel useFrame 中叠加 speaking layer**

在 `useFrame` 内获取 `expressionManager`，并根据 speaking 设置 `Aa`：

```ts
    const expressionManager = vrmRef.current.expressionManager
    if (expressionManager) {
      const target = speaking ? 0.35 + 0.25 * Math.sin(time * 18) : 0
      const current = expressionManager.getValue(VRMExpressionPresetName.Aa) || 0
      const next = current + (target - current) * 0.35
      expressionManager.setValue(VRMExpressionPresetName.Aa, next)
    }
```

并确保 `speaking` 参与 VRMModel 的 props 解构与 useFrame 闭包依赖。

- [ ] **Step 2: build:renderer + typecheck**

Run:

```bash
npm run build:renderer
npm run typecheck
```

Expected: Exit code 0

---

### Task 8: 回归检查

**Files:** 无（只跑命令）

- [ ] **Step 1: lint + build**

Run:

```bash
npm run lint
npm run build
```

Expected: Exit code 0

---

## Spec Coverage Check

- 两套内置模型切换 + 持久化：Task 1 + Task 2 + Task 3 + Task 4
- TTS speaking 事件链路：Task 5 + Task 6
- 口型动画（Aa）：Task 7

