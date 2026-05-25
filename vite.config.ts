import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    /**
     * 开发时把 /api/* 请求代理到本地 Express 后端（默认 3000）
     * 这样前端代码里写 fetch('/api/ai/chat') 即可同时适配 dev 与 prod
     * （prod 时 Express 同时托管静态资源和 /api，根本不存在跨域）
     */
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_PROXY || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
