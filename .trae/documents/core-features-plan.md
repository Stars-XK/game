# 桌宠项目核心功能开发计划

## 阶段：核心功能开发（第3-8周）

## 目标

开发桌宠的核心功能，包括渲染引擎、AI聊天、互动系统和换装系统。

## 实施步骤

### 步骤 1：完善主进程基础功能

#### 1.1 窗口管理优化
- 创建 `src/main/system/window.ts`
- 实现窗口拖拽功能
- 实现窗口置顶切换
- 实现窗口显示/隐藏

#### 1.2 托盘图标
- 创建 `src/main/system/tray.ts`
- 创建托盘图标
- 实现托盘菜单（显示/隐藏、设置、退出）
- 实现点击托盘显示窗口

#### 1.3 IPC 通信完善
- 创建 `src/main/ipc/channels.ts` - 定义通信通道
- 创建 `src/main/ipc/handlers/` - 各类处理器
- 实现配置读写 IPC
- 实现窗口控制 IPC

### 步骤 2：桌宠渲染引擎开发

#### 2.1 角色渲染组件
- 创建 `src/renderer/src/components/Pet/PetCanvas.tsx`
- 使用 Canvas 2D 渲染角色
- 实现角色精灵图加载

#### 2.2 动画系统
- 创建 `src/renderer/src/components/Pet/useAnimation.ts`
- 实现动画状态机（idle, walk, sit, sleep 等）
- 实现动画帧切换
- 实现动画过渡

#### 2.3 表情系统
- 创建 `src/renderer/src/components/Pet/Expression.tsx`
- 实现表情切换（开心、难过、生气、惊讶等）
- 实现表情与动画联动

#### 2.4 角色资源
- 创建 `resources/characters/default/` 目录
- 添加默认角色精灵图
- 创建角色配置文件

### 步骤 3：AI 聊天系统集成

#### 3.1 AI 服务模块
- 创建 `src/main/services/ai.ts`
- 实现 OpenAI API 调用
- 实现流式响应处理
- 实现错误处理和重试

#### 3.2 对话管理
- 创建 `src/main/services/conversation.ts`
- 实现对话历史存储
- 实现上下文窗口管理
- 实现对话摘要

#### 3.3 聊天界面
- 创建 `src/renderer/src/components/Chat/ChatWindow.tsx`
- 创建 `src/renderer/src/components/Chat/ChatInput.tsx`
- 创建 `src/renderer/src/components/Chat/ChatMessage.tsx`
- 实现消息列表显示
- 实现消息输入和发送

#### 3.4 IPC 通信
- 创建 AI 相关 IPC 通道
- 实现渲染进程调用 AI 服务

### 步骤 4：基础互动功能

#### 4.1 点击互动
- 实现点击角色触发反应
- 实现不同区域点击不同反应
- 实现点击计数和连续点击检测

#### 4.2 行为系统
- 创建 `src/renderer/src/stores/petStore.ts`
- 实现行为状态管理
- 实现随机行为触发
- 实现基于时间的自动行为

#### 4.3 场景互动
- 实现基于时间的问候（早上好、晚安等）
- 实现空闲提醒
- 实现简单的心情系统

### 步骤 5：基础换装系统

#### 5.1 服装数据结构
- 创建 `src/shared/types/clothes.ts`
- 定义服装类型和接口
- 定义服装配置结构

#### 5.2 服装资源管理
- 创建 `resources/clothes/` 目录结构
- 添加默认服装资源
- 创建服装配置文件

#### 5.3 换装界面
- 创建 `src/renderer/src/components/DressUp/DressUpPanel.tsx`
- 创建 `src/renderer/src/components/DressUp/ClothesItem.tsx`
- 实现服装选择和预览
- 实现服装组合保存

#### 5.4 服装渲染
- 实现服装图层叠加
- 实现服装与动画同步

### 步骤 6：配置管理

#### 6.1 配置存储
- 创建 `src/main/database/config.ts`
- 实现配置读写
- 实现配置默认值

#### 6.2 设置界面
- 创建 `src/renderer/src/components/Settings/SettingsPanel.tsx`
- 实现基本设置（名字、API Key 等）
- 实现设置保存和加载

## 文件结构

```
src/
├── main/
│   ├── ipc/
│   │   ├── channels.ts
│   │   └── handlers/
│   │       ├── config.ts
│   │       ├── ai.ts
│   │       └── window.ts
│   ├── services/
│   │   ├── ai.ts
│   │   └── conversation.ts
│   ├── system/
│   │   ├── window.ts
│   │   └── tray.ts
│   └── database/
│       └── config.ts
├── renderer/
│   └── src/
│       ├── components/
│       │   ├── Pet/
│       │   │   ├── PetCanvas.tsx
│       │   │   ├── Expression.tsx
│       │   │   └── useAnimation.ts
│       │   ├── Chat/
│       │   │   ├── ChatWindow.tsx
│       │   │   ├── ChatInput.tsx
│       │   │   └── ChatMessage.tsx
│       │   ├── DressUp/
│       │   │   ├── DressUpPanel.tsx
│       │   │   └── ClothesItem.tsx
│       │   └── Settings/
│       │       └── SettingsPanel.tsx
│       └── stores/
│           └── petStore.ts
└── shared/
    └── types/
        ├── clothes.ts
        ├── chat.ts
        └── pet.ts
```

## 验收标准

1. 桌宠可正常显示和动画
2. AI 聊天功能可正常使用
3. 基础互动功能实现（点击反应、自动行为）
4. 简单换装系统完成
5. 配置管理正常工作
6. 托盘图标和菜单正常工作

## 预计时间

- 步骤 1：主进程基础功能 - 1 周
- 步骤 2：渲染引擎 - 1.5 周
- 步骤 3：AI 聊天 - 1.5 周
- 步骤 4：互动功能 - 1 周
- 步骤 5：换装系统 - 1 周
- 步骤 6：配置管理 - 0.5 周
- **总计：约 6.5 周**
