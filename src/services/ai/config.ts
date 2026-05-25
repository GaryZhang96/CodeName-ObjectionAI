/**
 * AI 服务前端配置（只暴露非敏感信息）
 *
 * ⚠ 重要：自从架构改为「前端 → 自家 Express → OpenRouter」之后，
 *    前端不再直接持有 API Key。所有 Key、模型名等敏感配置都在
 *    server/openrouter.ts 中维护，玩家在 DevTools 里也看不到。
 *
 *    这里保留的常量只是为了：
 *    1. 让 UI 显示"默认模型名"等公开信息
 *    2. 兼容旧的 service 调用签名（model / temperature / maxTokens）
 *    3. 通过 /api/health 同步真实的后端配置
 */

export const AI_CONFIG = {
  /**
   * 温度（与服务端保持一致，决定 UI 上场景的默认值）
   */
  temperature: {
    caseGeneration: 0.8,
    courtroom: 0.7,
    judgment: 0.3,
  },

  /**
   * 最大 token 数（庭审对话保持简短有力）
   */
  maxTokens: {
    caseGeneration: 3000,
    courtroom: 800,
    judgment: 1500,
  },
};

/**
 * 后端健康信息（由 /api/health 填充）
 */
export interface ServerHealth {
  ok: boolean;
  service?: string;
  timestamp?: number;
  ai?: {
    configured: boolean;
    defaultModel: string;
    reasoningModel: string;
    fallbackModelCount: number;
    fallbackModels: string[];
  };
}

let cachedHealth: ServerHealth | null = null;

/**
 * 拉取后端健康状态（带 3s 内缓存，避免高频请求）
 */
export async function fetchServerHealth(
  force: boolean = false
): Promise<ServerHealth> {
  if (
    !force &&
    cachedHealth &&
    cachedHealth.timestamp &&
    Date.now() - cachedHealth.timestamp < 3000
  ) {
    return cachedHealth;
  }
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      cachedHealth = { ok: false };
      return cachedHealth;
    }
    const data = (await res.json()) as ServerHealth;
    cachedHealth = data;
    return data;
  } catch {
    cachedHealth = { ok: false };
    return cachedHealth;
  }
}

/**
 * 同步检查（基于上一次拉取的结果），UI 第一次绘制用
 */
export function isAIServiceLikelyOnline(): boolean {
  return cachedHealth?.ok === true && cachedHealth?.ai?.configured === true;
}

export function clearHealthCache() {
  cachedHealth = null;
}
