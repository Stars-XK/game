# 桌宠项目优化计划

## 目标
将桌宠应用优化到闪耀暖暖级别的品质，修复现有 bug，完善功能。

---

## 第一阶段：Bug 修复（高优先级）

### 1.1 修复 ClothesCategory 类型不一致
**问题**：`clothes.ts` 定义了 `dress` 类别，但 `petStore.ts` 和 `config.ts` 使用 `head` 而非 `hair`，且缺少 `dress`。

**修复方案**：
- 统一 `ClothesCategory` 类型定义
- 更新 `petStore.ts` 中的 `clothes` 类型
- 更新 `config.ts` 中的类型定义
- 确保换装系统能正确保存和显示所有类别

**涉及文件**：
- `src/shared/data/clothes.ts`
- `src/shared/types/config.ts`
- `src/renderer/src/stores/petStore.ts`

### 1.2 修复 ChatWindow AI 响应处理
**问题**：`response` 是 `AIResponse` 对象，但代码直接将其作为 `content` 使用。

**修复方案**：
```typescript
// 错误
content: response
// 正确
content: response.message || response.error || '抱歉，我无法回应'
```

**涉及文件**：
- `src/renderer/src/components/Chat/ChatWindow.tsx`

### 1.3 修复场景分析逻辑
**问题**：在 base64 图片数据中搜索文本关键词，逻辑完全错误。

**修复方案**：
- 方案A：使用窗口标题检测（推荐，简单高效）
- 方案B：集成 OCR（复杂，需要额外依赖）

**涉及文件**：
- `src/main/services/sceneAnalyzer.ts`

### 1.4 添加缺失的资源文件
**问题**：托盘图标引用 `icon.png`，但只有 `icon.svg`。

**修复方案**：
- 将 `icon.svg` 转换为 `icon.png`
- 或修改代码使用 `.svg` 格式

**涉及文件**：
- `resources/icon.png`（新建）
- `src/main/system/tray.ts`

---

## 第二阶段：功能完善（中优先级）

### 2.1 完善 3D 模型系统
**目标**：让 3D 模型能够根据换装系统更换服装。

**任务**：
- 扩展 `Pet3DCanvas.tsx` 支持服装渲染
- 根据当前穿着的服装 ID 渲染对应颜色/样式
- 添加服装切换动画

**涉及文件**：
- `src/renderer/src/components/Pet/Pet3DCanvas.tsx`
- `src/renderer/src/stores/petStore.ts`

### 2.2 完善语音系统
**目标**：实现完整的语音聊天功能。

**任务**：
- 完善语音识别（Web Speech API）
- 完善 TTS 语音合成
- 添加语音设置选项（语速、音调、音量）
- 添加多种语音选择

**涉及文件**：
- `src/renderer/src/hooks/useTTS.ts`
- `src/renderer/src/components/Chat/ChatWindow.tsx`

### 2.3 完善成就系统
**目标**：让成就系统与游戏、互动等功能联动。

**任务**：
- 游戏胜利解锁成就
- 换装解锁成就
- 互动次数解锁成就
- 成就通知动画

**涉及文件**：
- `src/main/ipc/handlers/achievement.ts`
- `src/renderer/src/components/Achievement/AchievementPanel.tsx`

### 2.4 实现开机自启功能
**目标**：用户可以设置开机自动启动桌宠。

**任务**：
- Windows：注册表操作
- macOS：LaunchAgent 配置
- Linux：Desktop Entry 配置

**涉及文件**：
- `src/main/system/autostart.ts`（新建）
- `src/main/ipc/handlers/config.ts`

---

## 第三阶段：UI 美化（闪耀暖暖风格）

### 3.1 粉色主题优化
**目标**：统一粉色少女风格。

**任务**：
- 优化配色方案（粉色渐变、金色点缀）
- 添加圆角卡片设计
- 添加阴影和光效
- 优化按钮和交互元素

### 3.2 添加粒子特效
**目标**：添加闪烁星星、花瓣飘落等特效。

**任务**：
- 创建粒子系统组件
- 在换装界面添加星星特效
- 在主界面添加花瓣飘落

### 3.3 添加动画效果
**目标**：丰富的过渡和交互动画。

**任务**：
- 面板打开/关闭动画
- 按钮点击反馈
- 服装切换动画
- 成就解锁动画

---

## 第四阶段：AI 女友系统

### 4.1 角色性格系统
**目标**：让 AI 具有独特的性格和说话风格。

**任务**：
- 定义角色性格参数（活泼/安静、温柔/傲娇等）
- 根据性格调整 AI 回复风格
- 添加角色背景故事

### 4.2 记忆系统
**目标**：AI 能记住用户的喜好和历史对话。

**任务**：
- 实现对话历史存储
- 实现用户偏好学习
- 在对话中引用历史信息

### 4.3 情感系统
**目标**：AI 能根据互动产生情感变化。

**任务**：
- 定义情感状态（开心、难过、害羞等）
- 根据用户行为调整情感
- 情感影响表情和动作

---

## 第五阶段：性能优化

### 5.1 代码优化
- 消除重复代码
- 拆分过长的组件
- 优化状态管理

### 5.2 渲染优化
- 使用 React.memo 减少重渲染
- 虚拟列表优化长列表
- 图片懒加载

### 5.3 内存优化
- 及时清理不用的资源
- 优化 Three.js 场景

---

## 执行顺序

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| 1.1 | 修复 ClothesCategory 类型 | 15分钟 |
| 1.2 | 修复 ChatWindow AI 响应 | 10分钟 |
| 1.3 | 修复场景分析逻辑 | 20分钟 |
| 1.4 | 添加缺失资源文件 | 10分钟 |
| 2.1 | 完善 3D 模型系统 | 30分钟 |
| 2.2 | 完善语音系统 | 20分钟 |
| 2.3 | 完善成就系统 | 25分钟 |
| 2.4 | 实现开机自启 | 20分钟 |
| 3.x | UI 美化 | 40分钟 |
| 4.x | AI 女友系统 | 60分钟 |
| 5.x | 性能优化 | 30分钟 |

**总计**：约 4-5 小时

---

## 验收标准

1. 所有 TypeScript 编译无错误
2. 换装系统所有类别正常工作
3. AI 聊天正常响应
4. 场景分析能正确识别活动
5. 托盘图标正常显示
6. UI 符合闪耀暖暖风格
7. 应用运行流畅，无内存泄漏
