/// <reference types="vite/client" />

/**
 * 注意：前端代码不再读取任何 OpenRouter Key。
 * Key 在 server/openrouter.ts 里由 process.env.OPENROUTER_API_KEY 提供。
 *
 * 这里如有 VITE_ 开头的变量，将自动注入前端代码，请仅用于非敏感的开关型配置。
 */

interface ImportMetaEnv {
  /** dev 模式下覆盖 /api 代理目标，默认 http://localhost:3000 */
  readonly VITE_DEV_API_PROXY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
