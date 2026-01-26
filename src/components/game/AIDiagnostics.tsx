/**
 * AI 配置诊断组件
 * 用于检查 API Key 和连接状态
 */

import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Panel, Button } from '@/components/ui';
import { isAPIConfigured } from '@/services/ai/config';
import { callAI } from '@/services/ai/client';

export function AIDiagnostics() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    status: 'success' | 'error' | 'idle';
    message: string;
  }>({ status: 'idle', message: '' });

  const hasAPIKey = isAPIConfigured();

  const testConnection = async () => {
    setTesting(true);
    setResult({ status: 'idle', message: '正在测试 AI 连接...' });

    try {
      const response = await callAI<{ test: string }>({
        systemPrompt: '你是一个测试助手。',
        userPrompt: '请回复: {"test": "连接成功"}',
        responseFormat: 'json',
        maxTokens: 50,
      });

      if (response.test === '连接成功') {
        setResult({
          status: 'success',
          message: '✅ AI 连接测试成功！',
        });
      } else {
        setResult({
          status: 'success',
          message: `✅ AI 响应成功: ${JSON.stringify(response)}`,
        });
      }
    } catch (error) {
      const err = error as Error;
      setResult({
        status: 'error',
        message: `❌ 连接失败: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Panel variant="dark" className="max-w-2xl mx-auto">
      <h2 className="text-lg font-pixel-title text-court-accent mb-4">
        AI 配置诊断
      </h2>

      <div className="space-y-4">
        {/* API Key 检查 */}
        <div className="flex items-start gap-3 p-3 bg-court-primary rounded-lg">
          {hasAPIKey ? (
            <CheckCircle className="w-5 h-5 text-pixel-green flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-pixel-red flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium text-sm">
              {hasAPIKey ? '✅ API Key 已配置' : '❌ 未检测到 API Key'}
            </p>
            {!hasAPIKey && (
              <div className="mt-2 text-xs text-pixel-gray space-y-1">
                <p>请在 Render Dashboard 添加环境变量:</p>
                <code className="block bg-pixel-dark/50 p-2 rounded">
                  Key: VITE_OPENROUTER_API_KEY<br />
                  Value: 你的 OpenRouter API Key
                </code>
                <p className="mt-2">
                  获取 API Key: <a href="https://openrouter.ai/" target="_blank" rel="noopener" className="text-court-accent underline">https://openrouter.ai/</a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 环境信息 */}
        <div className="p-3 bg-court-primary rounded-lg text-xs space-y-1">
          <p><strong>环境:</strong> {import.meta.env.MODE}</p>
          <p><strong>Base URL:</strong> {import.meta.env.BASE_URL}</p>
          <p><strong>API Key (前4位):</strong> {
            import.meta.env.VITE_OPENROUTER_API_KEY 
              ? import.meta.env.VITE_OPENROUTER_API_KEY.substring(0, 7) + '...'
              : '未配置'
          }</p>
        </div>

        {/* 连接测试 */}
        {hasAPIKey && (
          <div>
            <Button
              onClick={testConnection}
              disabled={testing}
              isLoading={testing}
              className="w-full"
            >
              {testing ? '测试中...' : '测试 AI 连接'}
            </Button>

            {result.status !== 'idle' && (
              <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                result.status === 'success' ? 'bg-pixel-green/10 border-2 border-pixel-green/30' : 'bg-pixel-red/10 border-2 border-pixel-red/30'
              }`}>
                {result.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-pixel-green flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-pixel-red flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm whitespace-pre-wrap">{result.message}</p>
              </div>
            )}
          </div>
        )}

        {/* 使用说明 */}
        <div className="text-xs text-pixel-gray border-t border-pixel-gray/20 pt-3">
          <p className="font-medium mb-2">如果测试失败，请检查:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Render 环境变量是否正确配置</li>
            <li>API Key 是否有效（未过期/有额度）</li>
            <li>OpenRouter 服务状态: <a href="https://status.openrouter.ai/" target="_blank" rel="noopener" className="text-court-accent underline">status.openrouter.ai</a></li>
            <li>是否在部署后清除了构建缓存</li>
          </ul>
        </div>
      </div>
    </Panel>
  );
}
