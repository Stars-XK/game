# 桌宠项目技术文档

## 1. 技术架构

### 1.1 架构概述

本项目采用 **Electron 单体架构**，将所有功能打包成一个可执行文件：

```
桌宠应用（单个可执行文件）
├── 主进程（Main Process）- Node.js 环境
│   ├── 系统集成（窗口、托盘、自启、通知）
│   ├── 硬件控制（键盘鼠标、屏幕捕获、音频）
│   ├── 数据存储（SQLite、文件、配置）
│   └── 网络服务（AI API、数据同步）
├── 渲染进程（Renderer Process）- 浏览器环境
│   ├── UI 界面（React）
│   ├── 动画系统
│   └── 交互逻辑
└── 资源文件（模型、服装、音效、配置）
```

### 1.2 主进程技术栈

主进程运行在 Node.js 环境，负责系统级功能：

- **运行环境**：Node.js（Electron 内置）
- **UI 框架**：Electron API
- **数据库**：better-sqlite3（SQLite）
- **屏幕捕获**：electron-desktop-capturer / robotjs
- **键盘鼠标控制**：robotjs / nut.js
- **音频处理**：node-speaker / lamejs
- **网络请求**：axios / node-fetch

### 1.3 渲染进程技术栈

渲染进程运行在 Chromium 环境，负责 UI 显示：

- **核心技术**：HTML5, CSS3, TypeScript
- **UI 框架**：React 18
- **构建工具**：Vite
- **样式方案**：TailwindCSS
- **动画效果**：CSS 动画 + Lottie + Framer Motion
- **状态管理**：Zustand / Jotai
- **渲染引擎**：
  - 2D：Canvas / SVG
  - 3D：Three.js / PixiJS

### 1.4 进程通信

主进程与渲染进程通过 IPC（Inter-Process Communication）通信：

```
渲染进程 <--IPC--> 主进程
    │                    │
    │                    ├── 系统操作
    │                    ├── 数据库操作
    │                    ├── 硬件控制
    │                    └── 网络请求
    │
    └── UI 渲染
```

### 1.5 AI 集成

- **API 服务**：OpenAI API / 其他 LLM API
- **本地模型**：可选集成本地 LLM（如 Ollama）
- **语音识别**：Web Speech API / Whisper API
- **语音合成**：Web Speech API / 第三方 TTS

### 1.6 屏幕分析

- **屏幕捕获**：Electron desktopCapturer API
- **计算机视觉**：OpenCV.js / TensorFlow.js
- **OCR**：Tesseract.js
- **活动识别**：基于规则的场景判断

## 2. 系统架构

### 2.1 模块划分

```
src/
├── main/                    # 主进程模块
│   ├── index.ts            # 入口文件
│   ├── ipc/                # IPC 通信处理
│   │   ├── handlers/       # 各类 IPC 处理器
│   │   └── channels.ts     # 通道定义
│   ├── database/           # 数据库模块
│   │   ├── index.ts        # 数据库连接
│   │   ├── migrations/     # 数据库迁移
│   │   └── repositories/   # 数据仓库
│   ├── hardware/           # 硬件控制
│   │   ├── keyboard.ts     # 键盘控制
│   │   ├── mouse.ts        # 鼠标控制
│   │   ├── screen.ts       # 屏幕捕获
│   │   └── audio.ts        # 音频处理
│   ├── services/           # 服务层
│   │   ├── ai.ts           # AI 服务
│   │   ├── sync.ts         # 数据同步服务
│   │   └── update.ts       # 自动更新服务
│   ├── system/             # 系统集成
│   │   ├── tray.ts         # 托盘图标
│   │   ├── window.ts       # 窗口管理
│   │   └── autostart.ts    # 开机自启
│   └── utils/              # 工具函数
├── renderer/               # 渲染进程模块
│   ├── index.html          # 入口 HTML
│   ├── main.tsx            # React 入口
│   ├── App.tsx             # 根组件
│   ├── components/         # 组件
│   │   ├── Pet/            # 桌宠组件
│   │   ├── Chat/           # 聊天组件
│   │   ├── DressUp/        # 换装组件
│   │   ├── Game/           # 游戏组件
│   │   └── Settings/       # 设置组件
│   ├── pages/              # 页面
│   ├── hooks/              # 自定义 Hooks
│   ├── stores/             # 状态管理
│   ├── services/           # 前端服务
│   └── styles/             # 样式文件
└── shared/                 # 共享代码
    ├── types/              # 类型定义
    ├── constants/          # 常量
    └── utils/              # 工具函数
```

### 2.2 核心模块

1. **桌宠渲染引擎**
   - 2D/3D 角色渲染
   - 动画状态机
   - 表情系统
   - 场景管理

2. **互动系统**
   - 事件驱动机制
   - 行为决策树
   - 场景触发器
   - 定时任务

3. **AI 聊天系统**
   - 对话上下文管理
   - 情感分析
   - 个性化记忆
   - 多轮对话

4. **换装系统**
   - 资源加载管理
   - 部件组合渲染
   - 收藏管理
   - 自定义上传

5. **游戏系统**
   - 游戏逻辑引擎
   - 成就系统
   - 排行榜

### 2.3 数据流

```
用户操作
    │
    ▼
渲染进程（React）
    │
    │ IPC 调用
    ▼
主进程处理
    │
    ├──▶ 本地 SQLite 数据库
    │
    └──▶ 远程服务器（可选）
         └── 数据同步服务
```

### 2.4 安全架构

1. **权限管理**
   - 用户配置权限级别
   - 敏感操作需确认
   - 权限请求机制

2. **数据保护**
   - 本地数据加密存储
   - 敏感配置加密
   - 安全的 IPC 通信

3. **隐私保护**
   - 屏幕分析范围可控
   - 数据收集透明
   - 用户可关闭分析功能

## 3. 技术实现细节

### 3.1 桌宠渲染

- **渲染方式**：
  - 2D：Canvas 2D API + Spine 动画
  - 3D：Three.js + GLTF 模型
- **动画系统**：
  - 状态机驱动
  - 过渡动画
  - 表情切换
- **性能优化**：
  - requestAnimationFrame
  - 离屏渲染
  - 资源预加载

### 3.2 互动系统

- **事件系统**：
  - 全局事件总线
  - 用户行为监听
  - 定时触发器
- **行为决策**：
  - 行为树模式
  - 优先级队列
  - 状态转换
- **场景识别**：
  - 屏幕内容分析
  - 时间段判断
  - 用户活动推断

### 3.3 AI 聊天

- **对话管理**：
  - 上下文窗口管理
  - 历史记录存储
  - 对话摘要
- **情感分析**：
  - 用户情绪识别
  - 响应策略调整
- **个性化**：
  - 用户偏好学习
  - 记忆系统
  - 关系发展

### 3.4 换装系统

- **资源管理**：
  - 本地资源加载
  - 远程资源下载
  - 资源缓存
- **模型系统**：
  - 2D 精灵图
  - 3D GLTF 模型
  - 部件分层
- **换装逻辑**：
  - 部件组合
  - 实时预览
  - 保存/加载

### 3.5 数据存储

- **本地存储**：
  - SQLite：结构化数据
  - 文件系统：资源文件
  - electron-store：配置数据
- **数据同步**（可选）：
  - 增量同步
  - 冲突解决
  - 离线支持

### 3.6 硬件控制

- **键盘鼠标**：
  - robotjs 模拟输入
  - 权限申请
  - 安全限制
- **屏幕捕获**：
  - desktopCapturer API
  - 定时截图
  - 区域捕获
- **音频处理**：
  - Web Audio API（渲染进程）
  - node-speaker（主进程）

## 4. 技术挑战与解决方案

### 4.1 性能优化

| 挑战 | 解决方案 |
|------|----------|
| 渲染性能 | requestAnimationFrame、离屏渲染、资源预加载 |
| 内存占用 | 资源懒加载、内存池、定时清理 |
| AI 响应慢 | 本地缓存、流式响应、预加载常见回复 |
| 屏幕分析耗时 | 降低分析频率、区域分析、异步处理 |

### 4.2 跨平台兼容

| 平台 | 注意事项 |
|------|----------|
| Windows | 管理员权限、开机自启注册表 |
| macOS | 应用签名、权限申请、沙盒限制 |
| Linux | 桌面环境适配、包管理 |

### 4.3 安全与隐私

| 挑战 | 解决方案 |
|------|----------|
| 硬件控制风险 | 用户授权、操作确认、日志记录 |
| 屏幕内容隐私 | 范围限制、本地处理、用户可控 |
| 数据安全 | 本地加密、安全传输、敏感信息保护 |

## 5. 技术选型理由

### 5.1 为什么选择 Electron

| 优势 | 说明 |
|------|------|
| 成熟稳定 | 大量成功案例，社区活跃 |
| 跨平台 | 一套代码支持 Windows、macOS、Linux |
| 开发效率 | 使用 Web 技术，开发快速 |
| 生态丰富 | npm 生态，大量现成解决方案 |
| 打包简单 | electron-builder 一键打包 |

### 5.2 为什么使用 React

| 优势 | 说明 |
|------|------|
| 组件化 | UI 组件复用，维护方便 |
| 生态丰富 | 大量 UI 库和工具 |
| TypeScript 支持 | 类型安全，开发体验好 |
| 状态管理 | 多种状态管理方案可选 |
| 社区活跃 | 问题容易找到解决方案 |

### 5.3 为什么使用 SQLite

| 优势 | 说明 |
|------|------|
| 轻量级 | 无需安装，单文件数据库 |
| 性能好 | 本地访问速度快 |
| 可靠性 | 事务支持，数据安全 |
| 跨平台 | 支持所有主流操作系统 |
| 易备份 | 单文件，复制即备份 |

## 6. 部署与发布

### 6.1 打包配置

使用 electron-builder 进行打包：

```yaml
# electron-builder.yml
appId: com.desktop-pet.app
productName: 桌宠
directories:
  output: release
files:
  - dist/**/*
  - resources/**/*
extraResources:
  - resources/**
```

### 6.2 发布渠道

| 平台 | 格式 | 发布方式 |
|------|------|----------|
| Windows | NSIS 安装包 / 便携版 | GitHub Releases |
| macOS | DMG / ZIP | GitHub Releases |
| Linux | AppImage / deb / rpm | GitHub Releases |

### 6.3 自动更新

- 使用 electron-updater
- 支持增量更新
- 后台下载，提示安装

## 7. 开发规范

### 7.1 代码规范

- **语言**：TypeScript
- **风格**：ESLint + Prettier
- **提交**：Conventional Commits
- **分支**：Git Flow

### 7.2 测试规范

- **单元测试**：Vitest
- **E2E 测试**：Playwright
- **覆盖率**：核心模块 > 80%

### 7.3 文档规范

- **代码注释**：JSDoc / TSDoc
- **API 文档**：自动生成
- **用户文档**：Markdown
