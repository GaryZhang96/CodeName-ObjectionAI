/**
 * AI 服务配置
 * 使用 OpenRouter API 调用各种 AI 模型
 */

export const AI_CONFIG = {
  // OpenRouter API 端点
  baseURL: 'https://openrouter.ai/api/v1',
  
  // 默认模型（使用 Gemini 2.0 Flash 获得最快响应）
  // 可选模型: google/gemini-2.0-flash-exp, google/gemini-flash-1.5, anthropic/claude-3-haiku
  defaultModel: import.meta.env.VITE_AI_MODEL || 'google/gemini-2.0-flash-exp',
  
  // 用于复杂推理的模型
  reasoningModel: import.meta.env.VITE_AI_REASONING_MODEL || 'google/gemini-2.0-flash-exp',
  
  // 温度设置
  temperature: {
    caseGeneration: 0.8,  // 案件生成需要创意
    courtroom: 0.7,       // 庭审需要一些变化
    judgment: 0.3,        // 判决需要一致性
  },
  
  // 最大token数 - 优化后的数值(减少不必要的长响应)
  maxTokens: {
    caseGeneration: 3000,  // 从 4000 降至 3000
    courtroom: 800,        // 从 1500 降至 800 (庭审对话应简短有力)
    judgment: 1500,        // 从 2000 降至 1500
  },
};

/**
 * 获取 API Key
 */
export function getAPIKey(): string {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('❌ 未配置 OpenRouter API Key。\n\n请在 Render 的 Environment 设置中添加 VITE_OPENROUTER_API_KEY 环境变量。\n\n获取 API Key: https://openrouter.ai/');
  }
  return key;
}

/**
 * 检查 API 是否已配置
 */
export function isAPIConfigured(): boolean {
  return !!import.meta.env.VITE_OPENROUTER_API_KEY;
}

