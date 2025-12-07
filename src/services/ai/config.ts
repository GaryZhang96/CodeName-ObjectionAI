/**
 * AI 服务配置
 * 使用 OpenRouter API 调用各种 AI 模型
 */

export const AI_CONFIG = {
  // OpenRouter API 端点
  baseURL: 'https://openrouter.ai/api/v1',
  
  // 默认模型（使用 Gemini Flash 以获得快速响应）
  // 可选模型: google/gemini-flash-1.5, google/gemini-pro, anthropic/claude-3-haiku, openai/gpt-4o-mini
  defaultModel: import.meta.env.VITE_AI_MODEL || 'google/gemini-flash-1.5',
  
  // 用于复杂推理的模型
  reasoningModel: import.meta.env.VITE_AI_REASONING_MODEL || 'google/gemini-flash-1.5',
  
  // 温度设置
  temperature: {
    caseGeneration: 0.8,  // 案件生成需要创意
    courtroom: 0.7,       // 庭审需要一些变化
    judgment: 0.3,        // 判决需要一致性
  },
  
  // 最大token数
  maxTokens: {
    caseGeneration: 4000,
    courtroom: 1500,
    judgment: 2000,
  },
};

/**
 * 获取 API Key
 */
export function getAPIKey(): string {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('请在 .env.local 文件中设置 VITE_OPENROUTER_API_KEY');
  }
  return key;
}

/**
 * 检查 API 是否已配置
 */
export function isAPIConfigured(): boolean {
  return !!import.meta.env.VITE_OPENROUTER_API_KEY;
}

