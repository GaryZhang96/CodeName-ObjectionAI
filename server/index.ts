/**
 * Express 服务器
 *
 * 职责：
 * 1. 代理 OpenRouter 调用：玩家浏览器 → 本服务器 → OpenRouter
 *    （API Key 仅存在于服务器环境变量，绝不下发到前端）
 * 2. 健康检查、模型测试等运维接口
 * 3. 生产模式下同时 serve Vite 构建产物 dist/
 *
 * 开发模式：tsx watch server/index.ts （由 concurrently 配合 vite 启动）
 * 生产模式：tsx server/index.ts        （读取已构建的 dist/）
 */

import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  callChat,
  testModel,
  hasServerAPIKey,
  SERVER_AI_CONFIG,
  type NormalizedError,
} from './openrouter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(express.json({ limit: '1mb' }));

// 简单请求日志
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// ============== API ROUTES ==============

/**
 * 健康检查：前端用来判断 AI 服务是否在线
 * 不暴露任何敏感信息（只说有没有 Key、有几个模型）
 */
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'lex-machina-server',
    timestamp: Date.now(),
    ai: {
      configured: hasServerAPIKey(),
      defaultModel: SERVER_AI_CONFIG.defaultModel,
      reasoningModel: SERVER_AI_CONFIG.reasoningModel,
      fallbackModelCount: SERVER_AI_CONFIG.fallbackModels.length,
      fallbackModels: SERVER_AI_CONFIG.fallbackModels,
    },
  });
});

/**
 * AI 对话调用入口（核心）
 *
 * Request body: ChatPayload
 * Response: { content, model, durationMs, tokens } 或 { error: NormalizedError }
 */
app.post('/api/ai/chat', async (req, res) => {
  if (!hasServerAPIKey()) {
    return res.status(503).json({
      error: {
        kind: 'no_api_key',
        message:
          '服务端未配置 OPENROUTER_API_KEY。请联系站长在后台设置环境变量。',
        retryable: false,
      },
    });
  }

  try {
    const {
      systemPrompt,
      userPrompt,
      model,
      temperature,
      maxTokens,
      responseFormat,
      disableFallback,
    } = req.body ?? {};

    if (
      typeof systemPrompt !== 'string' ||
      typeof userPrompt !== 'string' ||
      systemPrompt.length === 0 ||
      userPrompt.length === 0
    ) {
      return res.status(400).json({
        error: {
          kind: 'bad_request',
          message: 'systemPrompt 和 userPrompt 都不能为空',
          retryable: false,
        },
      });
    }

    const result = await callChat({
      systemPrompt,
      userPrompt,
      model: typeof model === 'string' ? model : undefined,
      temperature: typeof temperature === 'number' ? temperature : undefined,
      maxTokens: typeof maxTokens === 'number' ? maxTokens : undefined,
      responseFormat: responseFormat === 'text' ? 'text' : 'json',
      disableFallback: Boolean(disableFallback),
    });

    res.json(result);
  } catch (error) {
    const normalized = error as NormalizedError;
    const status =
      normalized.kind === 'auth_invalid'
        ? 401
        : normalized.kind === 'insufficient_quota'
          ? 402
          : normalized.kind === 'bad_request'
            ? 400
            : normalized.kind === 'rate_limited'
              ? 429
              : normalized.kind === 'model_not_found'
                ? 404
                : 500;

    console.error(`[/api/ai/chat] failed:`, normalized);
    res.status(status).json({ error: normalized });
  }
});

/**
 * 单模型连通性测试（不带 fallback）
 * 用于 AIDiagnostics 面板
 */
app.post('/api/ai/test-model', async (req, res) => {
  if (!hasServerAPIKey()) {
    return res.status(503).json({
      ok: false,
      error: {
        kind: 'no_api_key',
        message: '服务端未配置 OPENROUTER_API_KEY',
        retryable: false,
      },
    });
  }

  const { model } = req.body ?? {};
  if (typeof model !== 'string' || model.length === 0) {
    return res.status(400).json({
      ok: false,
      error: {
        kind: 'bad_request',
        message: 'model 字段必填',
      },
    });
  }

  const result = await testModel(model);
  res.json(result);
});

// ============== STATIC (生产模式) ==============

if (NODE_ENV === 'production') {
  const distDir = path.join(ROOT, 'dist');
  app.use(express.static(distDir));

  // SPA fallback：所有非 /api/* 的 GET 请求都返回 index.html
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// ============== STARTUP ==============

app.listen(PORT, () => {
  console.log('━'.repeat(60));
  console.log(`🎮  Lex Machina Server`);
  console.log(`   Mode      : ${NODE_ENV}`);
  console.log(`   Port      : ${PORT}`);
  console.log(`   API Key   : ${hasServerAPIKey() ? '✓ configured' : '✗ MISSING'}`);
  console.log(`   Default   : ${SERVER_AI_CONFIG.defaultModel}`);
  console.log(
    `   Fallbacks : ${SERVER_AI_CONFIG.fallbackModels.length - 1} model(s)`
  );
  if (NODE_ENV === 'production') {
    console.log(`   Static    : dist/`);
  }
  console.log('━'.repeat(60));

  if (!hasServerAPIKey()) {
    console.warn(
      '\n⚠  OPENROUTER_API_KEY not set. AI calls will fail with 503.'
    );
    console.warn('   Set it in .env (dev) or Render env vars (prod).\n');
  }
});
