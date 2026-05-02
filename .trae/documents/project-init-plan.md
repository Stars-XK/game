# 桌宠项目初始化计划

## 阶段：准备阶段（第1-2周）

## 目标

完成 Electron + React + TypeScript 项目初始化，搭建基础开发环境。

## 实施步骤

### 步骤 1：创建项目基础结构

创建以下目录结构：
```
d:\Project\game\
├── src/
│   ├── main/                 # 主进程
│   │   ├── index.ts          # 入口文件
│   │   ├── ipc/              # IPC 通信
│   │   ├── database/         # 数据库
│   │   ├── hardware/         # 硬件控制
│   │   ├── services/         # 服务层
│   │   └── system/           # 系统集成
│   ├── renderer/             # 渲染进程
│   │   ├── index.html
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── styles/
│   │   └── vite-env.d.ts
│   └── shared/               # 共享代码
│       ├── types/
│       └── utils/
├── resources/                # 资源文件
├── electron-builder.yml
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### 步骤 2：初始化 package.json

创建 package.json，配置：
- 项目基本信息
- 依赖包（electron, react, typescript, vite 等）
- 开发依赖（eslint, prettier 等）
- npm scripts

### 步骤 3：配置 TypeScript

创建：
- `tsconfig.json` - 主配置
- `tsconfig.node.json` - Node.js 环境配置（主进程）

### 步骤 4：配置 Vite

创建 `vite.config.ts`，配置：
- React 插件
- Electron 主进程和预加载脚本构建
- 路径别名

### 步骤 5：配置 ESLint 和 Prettier

创建：
- `.eslintrc.cjs` - ESLint 配置
- `.prettierrc` - Prettier 配置
- `.editorconfig` - 编辑器配置

### 步骤 6：创建主进程入口

创建 `src/main/index.ts`：
- 创建 BrowserWindow
- 配置窗口属性（透明、无边框、置顶）
- 加载渲染进程页面

### 步骤 7：创建渲染进程入口

创建：
- `src/renderer/index.html`
- `src/renderer/src/main.tsx`
- `src/renderer/src/App.tsx`
- 基础样式

### 步骤 8：配置 electron-builder

创建 `electron-builder.yml`，配置打包选项。

### 步骤 9：安装依赖

运行 `npm install` 安装所有依赖。

### 步骤 10：验证项目

运行 `npm run dev` 验证项目可正常启动。

## 依赖列表

### 生产依赖
- electron
- react
- react-dom
- better-sqlite3
- electron-store

### 开发依赖
- typescript
- vite
- @vitejs/plugin-react
- electron-builder
- eslint
- prettier
- @types/node
- @types/react
- @types/react-dom

## 验收标准

1. 项目目录结构创建完成
2. 所有配置文件创建完成
3. `npm install` 成功执行
4. `npm run dev` 可正常启动应用
5. 应用窗口正常显示

## 预计时间

- 目录结构创建：5 分钟
- 配置文件编写：15 分钟
- 依赖安装：10 分钟
- 验证测试：5 分钟
- **总计：约 35 分钟**
