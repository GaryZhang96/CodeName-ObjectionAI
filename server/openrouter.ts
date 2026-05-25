/**
 * OpenRouter 客户端封装（服务端）
 *
 * 设计要点：
 * 1. API Key 仅存在于服务端环境变量，绝不下发到浏览器
 * 2. 多模型自动回退：DeepSeek V3（便宜）→ DeepSeek V3.1 → Claude Sonnet 4.5（最贵但稳）
 * 3. 精确错误分类：401 / 402 / 404 / 429 / 5xx / timeout 各自有清晰提示
 * 4. 单例 client：避免重复创建
 */

import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// ---------- 配置 ----------

export const SERVER_AI_CONFIG = {
  baseURL: 'https://openrouter.ai/api/v1',

  /**
   * 默认主模型：DeepSeek V3（性价比之王，$0.20 / $0.77 per 1M tokens）
   * 比 Claude Sonnet 4.5 便宜 ~15 倍，响应速度也很快
   */
  defaultModel: 'deepseek/deepseek-chat-v3-0324',

  /**
   * 推理模型：判决等需要更强稳定性时使用，仍优先 DeepSeek
   */
  reasoningModel: 'deepseek/deepseek-chat-v3-0324',

  /**
   * 主模型失败时按顺序回退
   *
   * 顺序逻辑（用户指定）：
   * 1. DeepSeek V3 0324  ← 默认，最便宜
   * 2. DeepSeek V3.1     ← 同家备胎，便宜
   * 3. Claude Sonnet 4.5 ← 出问题时的兜底，贵但稳
   * 4. Claude Sonnet 4   ← Sonnet 4.5 也挂了的最终兜底
   */
  fallbackModels: [
    'deepseek/deepseek-chat-v3-0324',
    'deepseek/deepseek-chat-v3.1',
    'anthropic/claude-sonnet-4.5',
    'anthropic/claude-sonnet-4',
  ],

  temperature: {
    caseGeneration: 0.8,
    courtroom: 0.7,
    judgment: 0.3,
  },

  maxTokens: {
    caseGeneration: 3000,
    courtroom: 800,
    judgment: 1500,
  },

  requestTimeoutMs: 60_000,
} as const;

// ---------- Key 管理 ----------

export function getServerAPIKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    throw new Error(
      '服务端未配置 OPENROUTER_API_KEY 环境变量。请在 .env 或 Render 后台添加。'
    );
  }
  return key.trim();
}

export function hasServerAPIKey(): boolean {
  const key = process.env.OPENROUTER_API_KEY;
  return typeof key === 'string' && key.trim().length > 0;
}

// ---------- 单例 client ----------

let clientInstance: OpenAI | null = null;

function getClient(): OpenAI {
  if (!clientInstance) {
    clientInstance = new OpenAI({
      baseURL: SERVER_AI_CONFIG.baseURL,
      apiKey: getServerAPIKey(),
      defaultHeaders: {
        'HTTP-Referer': process.env.PUBLIC_URL || 'http://localhost:5173',
        // HTTP header 值必须是 ASCII，不能含中文
        'X-Title': 'Lex Machina',
      },
    });
  }
  return clientInstance;
}

export function resetClient() {
  clientInstance = null;
}

// ---------- 错误分类 ----------

export type AIErrorKind =
  | 'no_api_key'
  | 'auth_invalid'
  | 'insufficient_quota'
  | 'model_not_found'
  | 'rate_limited'
  | 'bad_request'
  | 'server_error'
  | 'timeout'
  | 'unknown';

export interface NormalizedError {
  kind: AIErrorKind;
  message: string;
  status?: number;
  model?: string;
  retryable: boolean;
}

function normalizeError(error: unknown, model: string): NormalizedError {
  const err = error as Error & {
    status?: number;
    code?: string;
    error?: { message?: string };
  };
  const status = err.status;
  const remoteMsg = err.error?.message || err.message || '未知错误';

  if (status === 401) {
    return {
      kind: 'auth_invalid',
      message: 'API Key 无效或已失效（401）。请检查服务端 OPENROUTER_API_KEY。',
      status,
      model,
      retryable: false,
    };
  }
  if (status === 402) {
    return {
      kind: 'insufficient_quota',
      message:
        'OpenRouter 账户余额不足（402）。请前往 openrouter.ai/credits 充值。',
      status,
      model,
      retryable: false,
    };
  }
  if (status === 404) {
    return {
      kind: 'model_not_found',
      message: `模型 "${model}" 不存在或已下线（404）。即将尝试备用模型。`,
      status,
      model,
      retryable: true,
    };
  }
  if (status === 429) {
    return {
      kind: 'rate_limited',
      message: `模型 "${model}" 触发限流（429）。即将尝试备用模型。`,
      status,
      model,
      retryable: true,
    };
  }
  if (status === 400) {
    return {
      kind: 'bad_request',
      message: `请求格式错误（400）：${remoteMsg}`,
      status,
      model,
      retryable: false,
    };
  }
  if (status && status >= 500) {
    return {
      kind: 'server_error',
      message: `OpenRouter 服务暂时不可用（${status}）。即将尝试备用模型。`,
      status,
      model,
      retryable: true,
    };
  }
  if (/timeout|aborted/i.test(remoteMsg)) {
    return {
      kind: 'timeout',
      message: `请求超时。模型 "${model}" 响应过慢，将尝试备用模型。`,
      model,
      retryable: true,
    };
  }
  return {
    kind: 'unknown',
    message: remoteMsg,
    status,
    model,
    retryable: true,
  };
}

// ---------- 调用核心 ----------

export interface ChatPayload {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
  /** 调试用：禁用模型回退 */
  disableFallback?: boolean;
}

export interface ChatResult {
  content: string;
  model: string;
  durationMs: number;
  tokens?: number;
}

async function callOnce(
  model: string,
  payload: Omit<ChatPayload, 'model' | 'disableFallback'>
): Promise<ChatResult> {
  const client = getClient();
  const {
    systemPrompt,
    userPrompt,
    temperature = 0.7,
    maxTokens = 2000,
    responseFormat = 'json',
  } = payload;

  const callId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const startTime = performance.now();

  console.log(`[AI ${callId}] → ${model}`, {
    promptLen: systemPrompt.length + userPrompt.length,
    maxTokens,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    SERVER_AI_CONFIG.requestTimeoutMs
  );

  try {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const completion = await client.chat.completions.create(
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format:
          responseFormat === 'json' ? { type: 'json_object' } : undefined,
      },
      { signal: controller.signal }
    );

    const duration = performance.now() - startTime;
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw {
        status: 502,
        message: `模型 "${model}" 返回了空响应`,
      };
    }

    console.log(`[AI ${callId}] ✓ ${model}`, {
      duration: `${duration.toFixed(0)}ms`,
      tokens: completion.usage?.total_tokens ?? 'N/A',
    });

    return {
      content,
      model,
      durationMs: duration,
      tokens: completion.usage?.total_tokens,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 带 fallback 的聊天调用
 *
 * 1. 先尝试 payload.model（或默认）
 * 2. 失败若 retryable，按 fallbackModels 依次尝试
 * 3. 全部失败抛出最后一个错误
 * 4. 不可重试的错误（如 401）立即抛出
 */
export async function callChat(payload: ChatPayload): Promise<ChatResult> {
  const primary = payload.model || SERVER_AI_CONFIG.defaultModel;
  const candidates = payload.disableFallback
    ? [primary]
    : Array.from(new Set([primary, ...SERVER_AI_CONFIG.fallbackModels]));

  let lastError: NormalizedError | null = null;

  for (const model of candidates) {
    try {
      return await callOnce(model, payload);
      } catch (error) {
      const normalized = normalizeError(error, model);
      lastError = normalized;

      console.warn(`[AI] ✗ ${model}`, {
        kind: normalized.kind,
        status: normalized.status,
        msg: normalized.message,
      });

      if (!normalized.retryable) {
        throw normalized;
      }
    }
  }

  throw (
    lastError ?? {
      kind: 'unknown' as const,
      message: '所有候选模型都失败了',
      retryable: false,
    }
  );
}

/**
 * 单模型连通性测试（不带 fallback）
 */
export async function testModel(model: string): Promise<
  | { ok: true; durationMs: number }
  | { ok: false; error: NormalizedError }
> {
  try {
    const start = performance.now();
    await callOnce(model, {
      systemPrompt: '你是一个测试助手。只输出 JSON。',
      userPrompt: '请回复：{"ok": true}',
      responseFormat: 'json',
      maxTokens: 30,
    });
    return { ok: true, durationMs: performance.now() - start };
  } catch (error) {
    return { ok: false, error: normalizeError(error, model) };
  }
}
