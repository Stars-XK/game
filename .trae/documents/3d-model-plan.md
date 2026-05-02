# 桌宠应用 3D 模型适配计划

## 目标

为桌宠应用添加 3D 模型渲染支持，使用 Three.js 实现

## 技术方案

### 技术栈

* Three.js - 3D 渲染库

* @react-three/fiber - React Three.js 集成

* @react-three/drei - Three.js 辅助组件

### 实现步骤

## 1. 安装依赖

```bash
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three
```

## 2. 创建 3D 宠物组件

### 2.1 基础 3D 场景

* 创建 Pet3DCanvas 组件

* 设置场景、相机、灯光

* 添加 OrbitControls（可选）

### 2.2 宠物模型

* 使用基础几何体创建简单宠物模型

* 支持加载外部 GLTF/GLB 模型

* 添加动画支持

### 2.3 动画系统

* 支持空闲动画

* 支持行走动画

* 支持跳跃动画

* 支持吃东西动画

## 3. 模型加载器

### 3.1 内置模型

* 使用几何体组合创建默认宠物

* 支持自定义颜色

### 3.2 外部模型

* 支持 GLTF/GLB 格式

* 支持动画混合

## 4. 渲染模式切换

### 4.1 模式选择

* 2D 模式（Canvas）

* 3D 模式（Three.js）

### 4.2 配置保存

* 保存渲染模式偏好

## 5. 性能优化

### 5.1 渲染优化

* 使用 requestAnimationFrame

* 限制帧率

* 使用 InstancedMesh

### 5.2 内存优化

* 模型缓存

* 纹理压缩

## 文件结构

```
src/renderer/src/
├── components/
│   └── Pet/
│       ├── PetCanvas.tsx (2D)
│       ├── Pet3DCanvas.tsx (3D)
│       ├── PetModel.tsx (3D 模型)
│       └── PetAnimations.ts (动画)
├── hooks/
│   └── usePetRenderer.ts (渲染模式管理)
└── assets/
    └── models/ (3D 模型文件)
```

## 实施顺序

1. **第一阶段**: 安装依赖和基础配置
2. **第二阶段**: 创建 3D 场景和基础模型
3. **第三阶段**: 添加动画系统
4. **第四阶段**: 渲染模式切换
5. **第五阶段**: 性能优化

## 预期效果

* 支持 2D/3D 渲染模式切换

* 3D 模型动画流畅

* 性能良好

* 支持自定义模型加载

