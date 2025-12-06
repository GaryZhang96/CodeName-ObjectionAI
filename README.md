# Lex Machina - 律政先锋 ⚖️

一款 AI 驱动的律政模拟游戏，玩家扮演辩护律师，在像素风格的法庭中揭露真相。

![Game Preview](./preview.png)

## ✨ 特性

- **AI 动态生成案件** - 每个案件都由 AI 实时生成，包含独特的证据、证人和逻辑谜题
- **深度逻辑博弈** - 发现证词中的矛盾，破解"逻辑锁"来揭露真相
- **沉浸式法庭体验** - 实时的证人情绪反馈和陪审团态度变化
- **复古像素美术风格** - 灵感来自《潜水员戴夫》的像素艺术风格
- **角色扮演 AI** - 检察官、证人、法官都由 AI 扮演，各有性格

## 🎮 游戏玩法

1. **选择案件** - 在事务所浏览 AI 生成的案件
2. **调查阶段** - 购买线索了解案件细节
3. **庭审阶段** - 询问证人、出示证据、发现矛盾
4. **判决阶段** - 根据你的表现获得判决和奖励

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 pnpm

### 安装

```bash
# 克隆项目
git clone <your-repo-url>
cd lex-machina

# 安装依赖
npm install

# 配置 API Key
cp .env.example .env.local
# 编辑 .env.local，填入你的 OpenRouter API Key
```

### 获取 API Key

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账号并创建 API Key
3. 将 Key 填入 `.env.local` 文件

```env
VITE_OPENROUTER_API_KEY=your_api_key_here
```

### 运行

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **动画**: Framer Motion
- **AI**: OpenRouter API (支持多种模型)
- **图标**: Lucide React

## 📁 项目结构

```
src/
├── components/          # UI 组件
│   ├── ui/             # 通用 UI 组件
│   └── game/           # 游戏专用组件
├── screens/            # 游戏界面
│   ├── MenuScreen      # 主菜单
│   ├── OfficeScreen    # 事务所（选案）
│   ├── InvestigationScreen  # 调查阶段
│   ├── CourtroomScreen # 庭审阶段
│   └── VerdictScreen   # 判决/复盘
├── services/           # 服务层
│   └── ai/            # AI 相关服务
│       ├── caseGenerator.ts    # 案件生成
│       ├── courtSimulator.ts   # 庭审模拟
│       └── prompts.ts          # 提示词工程
├── store/              # 状态管理
│   └── gameStore.ts    # Zustand store
├── types/              # TypeScript 类型定义
└── lib/               # 工具函数
```

## 🎯 核心机制

### 逻辑锁系统

每个案件包含多个"逻辑锁"——表面证据与隐藏真相之间的矛盾点：

- **时间矛盾** - 证词中的时间线不合理
- **位置矛盾** - 不可能同时出现在两个地方
- **物理矛盾** - 违反物理常识（如在黑暗中看清细节）
- **动机矛盾** - 行为与动机不符

玩家需要通过询问证人和分析证据来发现这些矛盾。

### 陪审团系统

12 名陪审团成员各有独立的"倾向值"：

- 正数倾向无罪
- 负数倾向有罪
- 你的每一句话都会影响他们的判断

### 法官耐心值

- 提出无关问题会降低法官耐心
- 耐心归零会导致流审
- 精彩的质询会提升耐心

## 🔮 开发路线图

- [x] **P1**: 核心游戏循环
- [ ] **P2**: 压迫感机制（时间限制、血条系统）
- [ ] **P3**: 多证人轮询机制
- [ ] **P4**: 后端接入、案件分享

## 📝 自定义 AI 模型

默认使用 `google/gemini-2.0-flash-001`，你可以在 `.env.local` 中修改：

```env
VITE_AI_MODEL=anthropic/claude-3-haiku
```

支持所有 OpenRouter 上可用的模型。

## 🎨 美术风格指南

- 像素风格渲染 (`image-rendering: pixelated`)
- 主色调：琥珀色 (#ffb000)、深蓝 (#1a1a2e)、金色 (#ffd700)
- 字体：Press Start 2P (标题)、VT323 (正文)
- 粗边框、高对比度配色

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

Made with ⚖️ and AI

