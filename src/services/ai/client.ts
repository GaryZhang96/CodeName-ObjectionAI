/**
 * AI 客户端（前端版）
 *
 * 架构：前端 → 自家 Express 后端 → OpenRouter
 *
 * 设计要点：
 * 1. 完全不持有 API Key，所有调用走 fetch('/api/ai/chat')
 * 2. 后端已实现多模型 fallback，这里只处理网络层、JSON 解析、性能监控
 * 3. 错误分类与后端的 NormalizedError 对齐
 * 4. 提供 callAIWithRetry：网络瞬断的额外重试
 */

import { AI_CONFIG } from './config';

/** 与服务端 NormalizedError 一致 */
export type AICallErrorKind =
  | 'no_api_key'
  | 'auth_invalid'
  | 'insufficient_quota'
  | 'model_not_found'
  | 'rate_limited'
  | 'bad_request'
  | 'server_error'
  | 'timeout'
  | 'invalid_json'
  | 'network'
  | 'unknown';

export class AICallError extends Error {
  kind: AICallErrorKind;
  status?: number;
  model?: string;
  retryable: boolean;

  constructor(opts: {
    kind: AICallErrorKind;
    message: string;
    status?: number;
    model?: string;
    retryable?: boolean;
  }) {
    super(opts.message);
    this.name = 'AICallError';
    this.kind = opts.kind;
    this.status = opts.status;
    this.model = opts.model;
    this.retryable = opts.retryable ?? false;
  }
}

// ---------- 性能监控 ----------

interface PerformanceMetrics {
  totalCalls: number;
  totalTime: number;
  averageTime: number;
  slowestCall: number;
  fastestCall: number;
  lastModel?: string;
}

const performanceMetrics: PerformanceMetrics = {
  totalCalls: 0,
  totalTime: 0,
  averageTime: 0,
  slowestCall: 0,
  fastestCall: Infinity,
};

export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...performanceMetrics };
}

// ---------- 调用 ----------

interface ChatBackendResponse {
  content: string;
  model: string;
  durationMs: number;
  tokens?: number;
}

interface ChatBackendError {
  error: {
    kind: AICallErrorKind;
    message: string;
    status?: number;
    model?: string;
    retryable?: boolean;
  };
}

/**
 * 调用后端 /api/ai/chat
 *
 * payload 与服务端 ChatPayload 对齐
 */
export async function callAI<T>(options: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
  /** 调试用：禁用 fallback */
  disableFallback?: boolean;
}): Promise<T> {
  const {
    systemPrompt,
    userPrompt,
    model,
    temperature = 0.7,
    maxTokens = 2000,
    responseFormat = 'json',
    disableFallback,
  } = options;

  const callId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const startTime = performance.now();

  console.log(`[AI ${callId}] → server`, {
    model: model || 'default',
    promptLength: systemPrompt.length + userPrompt.length,
    maxTokens,
  });

  let response: Response;
  try {
    response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        model,
        temperature,
        maxTokens,
        responseFormat,
        disableFallback,
      }),
    });
  } catch (error) {
    throw new AICallError({
      kind: 'network',
      message: `无法连接到游戏服务器：${(error as Error).message}。请检查网络或刷新页面。`,
      retryable: true,
    });
  }

  // ---- 服务端返回的错误 ----
  if (!response.ok) {
    let body: ChatBackendError | null = null;
    try {
      body = (await response.json()) as ChatBackendError;
    } catch {
      // 无法解析 → 用 HTTP 状态合成
    }
    const err = body?.error;
    throw new AICallError({
      kind: err?.kind || 'unknown',
      message:
        err?.message ||
        `服务器返回 ${response.status}：${response.statusText || '未知错误'}`,
      status: err?.status ?? response.status,
      model: err?.model,
      retryable: err?.retryable ?? response.status >= 500,
    });
  }

  // ---- 正常返回 ----
  const data = (await response.json()) as ChatBackendResponse;
  const duration = performance.now() - startTime;

  performanceMetrics.totalCalls++;
  performanceMetrics.totalTime += duration;
  performanceMetrics.averageTime =
    performanceMetrics.totalTime / performanceMetrics.totalCalls;
  performanceMetrics.slowestCall = Math.max(
    performanceMetrics.slowestCall,
    duration
  );
  performanceMetrics.fastestCall = Math.min(
    performanceMetrics.fastestCall,
    duration
  );
  performanceMetrics.lastModel = data.model;

  console.log(`[AI ${callId}] ✓ ${data.model}`, {
    duration: `${duration.toFixed(0)}ms`,
    tokens: data.tokens ?? 'N/A',
  });

  // ---- JSON 解析 ----
  if (responseFormat === 'json') {
    try {
      return JSON.parse(data.content) as T;
    } catch {
      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]) as T;
        } catch {
          /* fallthrough */
        }
      }
      throw new AICallError({
        kind: 'invalid_json',
        message: `模型 "${data.model}" 返回了无法解析的 JSON。`,
        model: data.model,
        retryable: true,
      });
    }
  }

  return data.content as T;
}

/**
 * 在 callAI 之上加一层指数退避
 *
 * 服务端已经做了模型级 fallback，这里只是为了应对前端网络抖动 / 短暂 5xx
 */
export async function callAIWithRetry<T>(
  options: Parameters<typeof callAI>[0],
  maxRetries: number = 2
): Promise<T> {
  let lastError: AICallError | null = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await callAI<T>(options);
    } catch (error) {
      const aiErr =
        error instanceof AICallError
          ? error
          : new AICallError({
              kind: 'unknown',
              message: (error as Error).message || '未知错误',
              retryable: true,
            });
      lastError = aiErr;

      if (!aiErr.retryable || i === maxRetries) {
        throw aiErr;
      }

      const wait = 800 * (i + 1);
      console.warn(`[AI] 整体重试 ${i + 1}/${maxRetries}，等待 ${wait}ms`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }

  throw (
    lastError ??
    new AICallError({ kind: 'unknown', message: 'AI 调用失败' })
  );
}

/**
 * 单模型连通性测试（用于 AIDiagnostics 面板）
 */
export async function testModelConnectivity(
  model: string
): Promise<
  { ok: true; durationMs: number } | { ok: false; error: AICallError }
> {
  try {
    const res = await fetch('/api/ai/test-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model }),
    });
    const data = await res.json();
    if (data.ok) {
      return { ok: true, durationMs: data.durationMs };
    }
    return {
      ok: false,
      error: new AICallError({
        kind: data.error?.kind || 'unknown',
        message: data.error?.message || '测试失败',
        status: data.error?.status,
        model,
        retryable: data.error?.retryable,
      }),
    };
  } catch (error) {
    return {
      ok: false,
      error: new AICallError({
        kind: 'network',
        message: `无法连接到游戏服务器：${(error as Error).message}`,
        model,
        retryable: true,
      }),
    };
  }
}

// ---------- 兼容旧接口 ----------

/**
 * 旧代码可能调用 resetClient（OpenAI SDK 时代）
 * 现在前端没有任何持久 client，保留空函数防止编译错误
 */
export function resetClient() {
  // no-op：架构已改为后端代理
}

// 重新导出 AI_CONFIG 给老代码使用（仅 temperature/maxTokens 还有意义）
export { AI_CONFIG };
