# 📘 Render 部署配置 - 详细步骤

## 🎯 目标
在 Render 上为你的游戏项目添加 OpenRouter API Key 环境变量，让 AI 功能正常工作。

---

## 📋 准备工作

### 1. 获取 OpenRouter API Key（如果还没有）

#### 步骤 A：注册/登录 OpenRouter
1. 打开浏览器，访问：**https://openrouter.ai/**
2. 点击右上角 **"Sign In"** 或 **"Get Started"**
3. 使用 Google/GitHub 账号登录（推荐）或邮箱注册

#### 步骤 B：创建 API Key
1. 登录后，点击右上角的 **"API Keys"** 或访问：https://openrouter.ai/keys
2. 点击 **"Create Key"** 按钮
3. 输入 Key 名称（比如：`CodeName-ObjectionAI`）
4. （可选）设置每月消费限额（建议设置 $5-10 防止意外花费）
5. 点击 **"Create"** 按钮
6. **⚠️ 重要：** 立即复制显示的 API Key（格式类似：`sk-or-v1-abc123def456...`）
   - 这个 Key 只显示一次！请保存到安全的地方
   - 如果忘记了，需要重新创建一个新的

#### 步骤 C：充值（可选但推荐）
OpenRouter 支持多种付费方式：
- 方式 1：直接在 https://openrouter.ai/credits 充值
- 方式 2：使用免费额度（新用户可能有少量免费试用）
- **推荐**：先充值 $2-5 美元测试，Gemini Flash 模型很便宜

---

## 🚀 Render 配置步骤（核心操作）

### 第一步：登录 Render Dashboard

1. 打开浏览器，访问：**https://dashboard.render.com/**
2. 使用 GitHub 账号登录（如果还没有账号，需要先注册）

---

### 第二步：找到你的项目

1. 登录后，你会看到 Dashboard 主页
2. 在左侧或中间区域，找到 **"CodeName-ObjectionAI"** 项目
   - 如果看不到，点击顶部的 **"Web Services"** 标签
3. **点击项目名称**，进入项目详情页面

---

### 第三步：进入环境变量设置（Environment）

在项目详情页面：

1. **看左侧导航栏**，你会看到这些选项：
   ```
   ├─ Settings
   ├─ Environment      ← 点击这个！
   ├─ Logs
   ├─ Shell
   ├─ Metrics
   └─ ...
   ```

2. **点击 "Environment"** 标签

3. 页面会显示：
   - 标题：**"Environment Variables"**
   - 一个输入区域（可能是空的，或者有一些默认变量）
   - 底部有 **"Add Environment Variable"** 或 **"+ Add Variable"** 按钮

---

### 第四步：添加 API Key 环境变量（最关键！）

#### 方法一：使用表单添加（推荐）

1. 点击 **"Add Environment Variable"** 按钮

2. 会出现两个输入框：

   **第一个框（Key / Name）：**
   ```
   VITE_OPENROUTER_API_KEY
   ```
   ⚠️ **必须完全一致！注意大小写和下划线！**

   **第二个框（Value）：**
   ```
   sk-or-v1-你的实际API Key
   ```
   ⚠️ **粘贴你在 OpenRouter 获取的完整 Key**

3. 检查确认：
   - Key 名称：`VITE_OPENROUTER_API_KEY`（26个字符）
   - Value 开头：`sk-or-v1-`
   - Value 长度：通常有 50-100 个字符

4. 点击 **"Save"** 或 **"Add"** 按钮

#### 方法二：使用 Secret File（不推荐，但可用）

如果你的 Render 界面略有不同：

1. 找到 **"Secret Files"** 或 **"Environment Variables"** 区域
2. 点击 **"Add from .env"** 按钮
3. 输入：
   ```
   VITE_OPENROUTER_API_KEY=sk-or-v1-你的实际Key
   ```
4. 保存

---

### 第五步：保存并触发重新部署

1. 添加变量后，页面顶部或底部会出现：
   ```
   ⚠️ Changes detected. Save to redeploy.
   ```

2. **点击 "Save Changes"** 按钮（绿色按钮）

3. Render 会自动开始重新部署：
   - 你会看到页面跳转到 **"Logs"** 标签
   - 实时显示部署日志
   - 状态从 "Building..." → "Deploying..." → "Live"

4. **等待 2-5 分钟**，直到看到：
   ```
   ✅ Build successful
   ✅ Deploy live at https://你的项目.onrender.com
   ```

---

### 第六步：验证配置是否成功

#### A. 检查环境变量是否保存

1. 回到 **"Environment"** 标签
2. 确认能看到：
   ```
   VITE_OPENROUTER_API_KEY = sk-or-v1-********（后面打码）
   ```
3. 如果看不到或显示为空，说明没保存成功，重复第四步

#### B. 在网站上测试 AI 连接

1. **打开你的游戏网站**：https://你的项目.onrender.com

2. **进入主菜单**（如果还在加载页面，等待加载完成）

3. **找到 AI 诊断按钮**：
   - 位置：主菜单底部
   - 图标：WiFi 信号图标（第一个图标）
   - 文字：可能没有，只有图标

4. **点击 WiFi 图标**，会弹出诊断面板

5. **查看状态**：
   ```
   ✅ API Key 已配置
   ✅ 当前模型：google/gemini-2.0-flash-exp
   ✅ 环境：production
   ```

6. **点击 "测试 AI 连接" 按钮**

7. **等待 3-10 秒**，如果显示：
   ```
   ✅ AI 连接测试成功！
   响应内容：[AI 的回复]
   响应时间：X 毫秒
   ```
   **恭喜！配置成功！🎉**

#### C. 如果测试失败

**情况 1：显示 "❌ 未检测到 API Key"**
- 原因：环境变量未生效
- 解决：
  1. 确认 Render 上的 Key 名称是否正确（注意大小写）
  2. 确认已点击 "Save Changes"
  3. 等待部署完全完成（查看 Logs 标签）
  4. 强制刷新网站（Ctrl+Shift+R）

**情况 2：显示 "❌ AI 连接失败: 401 Unauthorized"**
- 原因：API Key 无效或余额不足
- 解决：
  1. 访问 https://openrouter.ai/keys 确认 Key 是否有效
  2. 检查 OpenRouter 账户余额
  3. 重新复制 Key，确保完整（不要多复制空格）

**情况 3：显示其他错误**
- 打开浏览器 **开发者工具**（F12）
- 点击 **"Console"** 标签
- 截图错误信息，然后告诉我具体内容

---

## 🎮 开始玩游戏！

如果 AI 测试成功：

1. **关闭诊断面板**
2. **点击 "新的案件"** 开始游戏
3. **进入庭审**，尝试与 AI 对话：
   - 输入："你好，证人"
   - 按发送按钮
   - 等待 AI 回复（首次可能需要 5-10 秒）
4. 如果 AI 正常回复，说明一切完美！🎉

---

## 📸 视觉参考（每一步的位置）

### Render Dashboard 布局示意：

```
┌─────────────────────────────────────────────────┐
│  Render                    [用户头像] ▼          │
├─────────────────────────────────────────────────┤
│  ◀ Dashboard                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Web Services                                   │
│  ┌───────────────────────────────────┐         │
│  │ 📦 CodeName-ObjectionAI           │  ← 点击  │
│  │ https://xxx.onrender.com          │         │
│  │ Status: Live ✅                    │         │
│  └───────────────────────────────────┘         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 项目详情页左侧导航：

```
┌──────────────┐
│ ⚙️ Settings   │
│ 🔐 Environment│ ← 点击这个！
│ 📜 Logs       │
│ 💻 Shell      │
│ 📊 Metrics    │
│ 🔔 Events     │
└──────────────┘
```

### Environment 页面添加变量：

```
┌─────────────────────────────────────────┐
│  Environment Variables                  │
├─────────────────────────────────────────┤
│                                         │
│  Key                Value               │
│  ┌────────────┐    ┌─────────────────┐ │
│  │ VITE_...   │    │ sk-or-v1-...    │ │
│  └────────────┘    └─────────────────┘ │
│                                         │
│  [+ Add Environment Variable]           │
│                                         │
│  [Save Changes] ← 最后点这个！           │
└─────────────────────────────────────────┘
```

---

## ⚠️ 常见错误

### ❌ 错误 1：Key 名称拼写错误
```
错误：VITE_OPENROUTER_APIKEY（缺少下划线）
正确：VITE_OPENROUTER_API_KEY
```

### ❌ 错误 2：复制 Key 时多了空格
```
错误：sk-or-v1-abc123 （末尾有空格）
正确：sk-or-v1-abc123
```

### ❌ 错误 3：没有等待部署完成就测试
- **症状**：网站还是显示 "未配置 API Key"
- **解决**：等待 Logs 显示 "Deploy live"，然后刷新网站

### ❌ 错误 4：浏览器缓存导致
- **症状**：配置了但网站看不到变化
- **解决**：硬刷新（Ctrl+Shift+R 或 Cmd+Shift+R）

---

## 🆘 需要帮助？

如果按照上述步骤操作后仍然无法成功：

1. **截图 Render 的 Environment 页面**（隐藏 Key 的后半部分）
2. **截图游戏的 AI 诊断面板**
3. **打开浏览器 Console（F12），截图错误信息**
4. 把这些截图发给我，我帮你排查！

---

## ✅ 配置完成检查表

- [ ] OpenRouter 账户已创建
- [ ] API Key 已获取并保存
- [ ] 已登录 Render Dashboard
- [ ] 找到了 CodeName-ObjectionAI 项目
- [ ] 点击了 Environment 标签
- [ ] 添加了 `VITE_OPENROUTER_API_KEY` 变量
- [ ] Value 填入了完整的 API Key
- [ ] 点击了 Save Changes
- [ ] 等待部署完成（2-5分钟）
- [ ] 网站上的 AI 诊断显示 "✅ 已配置"
- [ ] 测试连接按钮显示 "✅ 成功"
- [ ] 在游戏中测试了 AI 对话功能

**全部打勾 = 配置完美！开始享受游戏吧！🎮**
