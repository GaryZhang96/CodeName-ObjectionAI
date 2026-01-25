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
 * 性能监控工具
 */
interface PerformanceMetrics {
  totalCalls: number;
  totalTime: number;
  averageTime: number;
  slowestCall: number;
  fastestCall: number;
}

const performanceMetrics: PerformanceMetrics = {
  totalCalls: 0,
  totalTime: 0,
  averageTime: 0,
  slowestCall: 0,
  fastestCall: Infinity,
};

/**
 * 获取性能指标
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...performanceMetrics };
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

  // 性能监控 - 开始计时
  const startTime = performance.now();
  const callId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`[AI Call ${callId}] 开始调用`, {
    model,
    promptLength: systemPrompt.length + userPrompt.length,
    maxTokens,
  });

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

    // 性能监控 - 结束计时
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // 更新性能指标
    performanceMetrics.totalCalls++;
    performanceMetrics.totalTime += duration;
    performanceMetrics.averageTime = performanceMetrics.totalTime / performanceMetrics.totalCalls;
    performanceMetrics.slowestCall = Math.max(performanceMetrics.slowestCall, duration);
    performanceMetrics.fastestCall = Math.min(performanceMetrics.fastestCall, duration);
    
    console.log(`[AI Call ${callId}] 完成`, {
      duration: `${duration.toFixed(0)}ms`,
      tokens: completion.usage?.total_tokens || 'N/A',
      avgTime: `${performanceMetrics.averageTime.toFixed(0)}ms`,
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
  } catch (error: unknown) {
    // 性能监控 - 记录失败
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.error(`[AI Call ${callId}] 失败`, {
      duration: `${duration.toFixed(0)}ms`,
      error,
    });
    
    // 提供更详细的错误信息
    const err = error as Error & { status?: number; code?: string };
    console.error('AI 调用失败:', {
      message: err.message,
      status: err.status,
      code: err.code,
    });
    
    // 根据错误类型提供友好提示
    if (err.status === 401) {
      throw new Error('API Key 无效或已过期，请检查配置');
    } else if (err.status === 429) {
      throw new Error('请求过于频繁，请稍后再试');
    } else if (err.status === 400) {
      throw new Error('请求格式错误，可能是模型不支持当前请求');
    } else if (err.message?.includes('model')) {
      throw new Error(`模型不可用: ${model}，请检查模型名称`);
    }
    
    throw new Error(`AI 服务错误: ${err.message || '未知错误'}`);
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

