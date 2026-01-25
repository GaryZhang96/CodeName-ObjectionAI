# Render 部署指南

## 🚀 部署步骤

### 1. 获取 OpenRouter API Key
1. 访问 https://openrouter.ai/
2. 注册/登录账号
3. 进入 "Keys" 页面
4. 创建新的 API Key
5. 复制 Key (格式类似: `sk-or-v1-...`)

### 2. 在 Render 配置环境变量

#### 步骤:
1. 登录 Render Dashboard: https://dashboard.render.com/
2. 选择你的项目
3. 点击左侧的 **"Environment"** 标签
4. 点击 **"Add Environment Variable"**
5. 添加以下配置:

```
Key: VITE_OPENROUTER_API_KEY
Value: sk-or-v1-your-actual-api-key-here
```

6. 点击 **"Save Changes"**

### 3. 重新部署

- **自动部署**: 保存环境变量后会自动触发
- **手动部署**: 点击右上角 **"Manual Deploy"** → **"Clear build cache & deploy"**

### 4. 验证部署

部署完成后:
1. 打开你的网站
2. 尝试进入庭审阶段
3. 输入任何问题与 AI 对话
4. 如果没有 "Connection error"，说明配置成功！

---

## 🔍 故障排查

### 问题: 仍然显示 "Connection error"

**检查项**:
1. ✅ 环境变量名称是否正确: `VITE_OPENROUTER_API_KEY`
2. ✅ API Key 是否有效（可以在 OpenRouter 网站测试）
3. ✅ 部署是否成功完成（查看 Render Logs）
4. ✅ 是否清除了构建缓存重新部署

### 问题: API Key 无效

**解决方法**:
1. 在 OpenRouter 检查 Key 是否启用
2. 检查账户余额（OpenRouter 需要充值或有免费额度）
3. 重新生成新的 API Key

### 问题: 构建失败

**常见原因**:
- TypeScript 编译错误（已修复 `settings` 变量问题）
- 依赖安装失败
- Node 版本不兼容

**查看构建日志**:
在 Render Dashboard 的 "Logs" 标签查看详细错误信息

---

## ⚠️ 安全注意事项

**重要**: 
- ❌ **不要**把 API Key 提交到 Git 仓库
- ❌ **不要**在前端代码中硬编码 API Key
- ✅ **务必**使用环境变量
- ✅ 建议为生产环境使用限额较低的测试 Key

---

## 💡 提示

Vite 环境变量规则:
- 必须以 `VITE_` 开头才能在前端代码中访问
- 在构建时会被内联到代码中
- 更改环境变量后必须重新构建

---

## 📞 需要帮助？

如果按照上述步骤仍然无法解决问题:
1. 检查 Render 的部署日志
2. 在浏览器控制台查看详细错误信息
3. 确认 OpenRouter 服务状态: https://status.openrouter.ai/
