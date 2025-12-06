/**
 * OpenRouter API 客户端
 * 封装与 AI 服务的通信
 */

import OpenAI from 'openai';
import { AI_CONFIG, getAPIKey } from './config';

let clientInstance: OpenAI | null = null;

/**
 * 获取 OpenAI 客户端实例（单例模式）
 */
export function getClient(): OpenAI {
  if (!clientInstance) {
    clientInstance = new OpenAI({
      baseURL: AI_CONFIG.baseURL,
      apiKey: getAPIKey(),
      dangerouslyAllowBrowser: true, // 允许在浏览器中使用
      defaultHeaders: {
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Lex Machina - 律政先锋',
      },
    });
  }
  return clientInstance;
}

/**
 * 通用的 AI 调用函数
 */
export async function callAI<T>(options: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
}): Promise<T> {
  const client = getClient();
  
  const {
    systemPrompt,
    userPrompt,
    model = AI_CONFIG.defaultModel,
    temperature = 0.7,
    maxTokens = 2000,
    responseFormat = 'json',
  } = options;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('AI 返回了空响应');
    }

    if (responseFormat === 'json') {
      try {
        return JSON.parse(content) as T;
      } catch {
        // 尝试提取 JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as T;
        }
        throw new Error('无法解析 AI 返回的 JSON');
      }
    }

    return content as T;
  } catch (error) {
    console.error('AI 调用失败:', error);
    throw error;
  }
}

/**
 * 带重试的 AI 调用
 */
export async function callAIWithRetry<T>(
  options: Parameters<typeof callAI>[0],
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callAI<T>(options);
    } catch (error) {
      lastError = error as Error;
      console.warn(`AI 调用失败，重试 ${i + 1}/${maxRetries}:`, error);
      
      // 等待一段时间再重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw lastError || new Error('AI 调用失败');
}

