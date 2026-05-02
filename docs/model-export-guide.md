# 闪耀暖暖模型导出方法

## 方法一： 使用 Unity Studio 导出

### 步骤

1. **下载 Unity Studio**
   - 宄耀暖暖是基于 Unity 引擎开发的
   - 下载 Unity Studio: https://unity.com/download

2. **定位游戏资源文件**
   - Windows: `C:\Users\[用户名]\AppData\Local\Packages\com.netease.shiningnikki\`
   - Android: `/storage/emulated/0/Android/data/com.netease.shiningnikki/`
   - iOS: 通过 iMazing 或类似工具导出

3. **提取 AssetBundle**
   - 使用 AssetStudio 或 UABE 工具
   - 查找 `.unity3d` 或 `.assetbundle` 文件

4. **导出模型**
   - 在 Unity Studio 中打开资源文件
   - 选择模型文件，右键 Export
   - 选择导出格式为 FBX 或 OBJ

## 方法二: 使用 Ninja Ripper

### 步骤

1. **下载 Ninja Ripper**
   - 这是一个专门用于提取 Unity 游戏资源的工具

2. **运行 Ninja Ripper**
   ```
   NinjaRipper.exe [游戏路径]
   ```

3. **提取模型**
   - 找到角色模型文件
   - 导出为 FBX 格式

## 方法三: 使用 AssetStudio

   - 这是一个 Unity 资源提取工具

2. **打开游戏资源**
   - 加载游戏的 `.assets` 或 `.resS` 文件

3. **浏览并导出模型**
   - 找到角色模型
   - 右键 Export Selection

## 导出后的处理

### 转换为 GLTF 格式

1. **使用 Blender**
   - 导入 FBX 文件
   - 清理材质和骨骼
   - 导出为 GLTF/GLB 格式

2. **使用 Unity**
   - 创建新项目
   - 导入 FBX 文件
   - 使用 UnityGLTF 包导出

### 优化模型

1. **减少多边形数量**
   - 桌宠应用不需要高精度模型
   - 使用 Blender 的 Decimate 修改器

2. **合并材质**
   - 减少材质数量
   - 合并相似材质

3. **优化骨骼**
   - 简化骨骼结构
   - 移除不必要的骨骼

## 在本应用中使用

### 攋置模型文件

将导出的 GLTF/GLB 文件放到:
```
src/renderer/public/models/
```

### 修改代码

```typescript
// 在 PetGLTFCanvas.tsx 中使用
<PetGLTFCanvas
  modelUrl="/models/your-model.glb"
  scale={0.5}
  action={state.action}
  onClick={handlePetClick}
/>
```

## 注意事项

1. **版权问题**
   - 请确保您有权使用这些模型
   - 仅用于个人学习和研究

2. **性能优化**
   - 模型文件大小建议控制在 5MB 以内
   - 使用 Draco 压缩库进一步优化

3. **动画兼容**
   - 确保模型有完整的骨骼动画
   - 动画命名需要与代码中的 action 对应
