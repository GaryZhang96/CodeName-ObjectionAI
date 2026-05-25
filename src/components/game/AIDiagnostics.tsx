/**
 * AI 服务诊断面板（站长 / 调试用）
 *
 * 与旧版的本质区别：
 *   旧版要求玩家自己看 API Key 状态 → 体验割裂
 *   新版只显示后端服务状态、模型列表、连通性，玩家不需要管 Key
 *
 * 数据来源：
 *   GET  /api/health        ← 后端服务是否在线、Key 是否配置、模型列表
 *   POST /api/ai/test-model ← 单模型测试
 */

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  Server,
  RefreshCw,
} from 'lucide-react';
import { Panel, Button } from '@/components/ui';
import {
  fetchServerHealth,
  type ServerHealth,
} from '@/services/ai/config';
import { testModelConnectivity } from '@/services/ai/client';

type ModelTestState =
  | { status: 'idle' }
  | { status: 'testing' }
  | { status: 'ok'; durationMs: number }
  | { status: 'fail'; kind: string; message: string };

export function AIDiagnostics() {
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [quickTestState, setQuickTestState] = useState<ModelTestState>({
    status: 'idle',
  });
  const [batchResults, setBatchResults] = useState<
    Record<string, ModelTestState>
  >({});
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  const refreshHealth = async () => {
    setHealthLoading(true);
    const h = await fetchServerHealth(true);
    setHealth(h);
    setHealthLoading(false);
  };

  useEffect(() => {
    refreshHealth();
  }, []);

  const serverOnline = health?.ok === true;
  const keyConfigured = health?.ai?.configured === true;
  const defaultModel = health?.ai?.defaultModel;
  const reasoningModel = health?.ai?.reasoningModel;
  const fallbackModels = health?.ai?.fallbackModels ?? [];
  const candidateModels = defaultModel
    ? Array.from(new Set([defaultModel, ...fallbackModels]))
    : fallbackModels;

  const runQuickTest = async () => {
    if (!defaultModel) return;
    setQuickTestState({ status: 'testing' });
    const result = await testModelConnectivity(defaultModel);
    if (result.ok) {
      setQuickTestState({ status: 'ok', durationMs: result.durationMs });
    } else {
      setQuickTestState({
        status: 'fail',
        kind: result.error.kind,
        message: result.error.message,
      });
    }
  };

  const runBatchTest = async () => {
    setIsBatchRunning(true);
    setBatchResults({});
    for (const model of candidateModels) {
      setBatchResults((prev) => ({ ...prev, [model]: { status: 'testing' } }));
      const result = await testModelConnectivity(model);
      setBatchResults((prev) => ({
        ...prev,
        [model]: result.ok
          ? { status: 'ok', durationMs: result.durationMs }
          : {
              status: 'fail',
              kind: result.error.kind,
              message: result.error.message,
            },
      }));
      // 认证类错误（401）继续测也都是 401，直接停
      if (!result.ok && result.error.kind === 'auth_invalid') {
        break;
      }
    }
    setIsBatchRunning(false);
  };

  return (
    <div className="space-y-4">
      {/* ============== 后端服务状态 ============== */}
      <Panel variant="dark" className="!p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <Server className="w-5 h-5 text-ink-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-pixel-title text-xs text-ink-primary">
                后端服务
              </h3>
              {healthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-ink-secondary" />
              ) : serverOnline ? (
                <CheckCircle className="w-4 h-4 text-game-green" />
              ) : (
                <XCircle className="w-4 h-4 text-game-red" />
              )}
              <button
                onClick={refreshHealth}
                disabled={healthLoading}
                className="ml-auto text-ink-secondary hover:text-ink-primary"
                title="刷新"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`}
                />
              </button>
            </div>

            {healthLoading ? (
              <p className="font-pixel-body text-sm text-ink-secondary">
                检查中...
              </p>
            ) : serverOnline ? (
              <div className="space-y-1 font-pixel-body text-sm text-ink-secondary">
                <p className="text-game-green">
                  ✓ 在线（{health?.service || 'server'}）
                </p>
                {keyConfigured ? (
                  <p className="text-game-green text-xs">
                    ✓ API Key 已在后台配置，玩家无需操作
                  </p>
                ) : (
                  <p className="text-game-red text-xs">
                    ⚠ 服务端未配置 OPENROUTER_API_KEY，AI 调用会失败
                  </p>
                )}
              </div>
            ) : (
              <div className="font-pixel-body text-sm text-game-red space-y-1">
                <p>✗ 服务器无响应</p>
                <p className="text-xs text-ink-secondary">
                  开发模式请检查后端是否启动：
                  <code className="ml-1 px-1 bg-surface-sunken">npm run dev</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* ============== 模型配置 ============== */}
      {serverOnline && health?.ai && (
        <Panel variant="dark" className="!p-4">
          <h3 className="font-pixel-title text-xs text-ink-primary mb-2">
            模型配置（后端）
          </h3>
          <div className="space-y-1.5 font-pixel-body text-sm text-ink-secondary">
            <div className="flex justify-between gap-2">
              <span className="shrink-0">默认模型:</span>
              <code className="text-brand-gold text-xs text-right truncate">
                {defaultModel}
              </code>
            </div>
            <div className="flex justify-between gap-2">
              <span className="shrink-0">推理模型:</span>
              <code className="text-brand-gold text-xs text-right truncate">
                {reasoningModel}
              </code>
            </div>
            <div className="flex justify-between">
              <span>备用模型数:</span>
              <span className="text-ink-primary">
                {Math.max(0, fallbackModels.length - 1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>运行环境:</span>
              <span className="text-ink-primary">{import.meta.env.MODE}</span>
            </div>
          </div>
        </Panel>
      )}

      {/* ============== 连接测试 ============== */}
      {serverOnline && keyConfigured && (
        <Panel variant="dark" className="!p-4">
          <h3 className="font-pixel-title text-xs text-ink-primary mb-3">
            连接测试
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <Button
              onClick={runQuickTest}
              disabled={quickTestState.status === 'testing' || isBatchRunning}
              variant="default"
              size="sm"
              className="w-full"
            >
              {quickTestState.status === 'testing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  测试中
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-1" />
                  快速测试
                </>
              )}
            </Button>
            <Button
              onClick={runBatchTest}
              disabled={isBatchRunning || quickTestState.status === 'testing'}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              {isBatchRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  逐个测试
                </>
              ) : (
                <>逐模型测试</>
              )}
            </Button>
          </div>

          {quickTestState.status === 'ok' && (
            <ResultLine
              kind="ok"
              title={`默认模型连接成功（${defaultModel}）`}
              detail={`耗时 ${quickTestState.durationMs.toFixed(0)}ms`}
            />
          )}
          {quickTestState.status === 'fail' && (
            <ResultLine
              kind="fail"
              title={`默认模型失败 [${quickTestState.kind}]`}
              detail={quickTestState.message}
            />
          )}

          {Object.keys(batchResults).length > 0 && (
            <div className="mt-3 space-y-1.5">
              {candidateModels.map((model) => {
                const state = batchResults[model];
                if (!state) return null;
                return (
                  <ModelStatusRow key={model} model={model} state={state} />
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {/* ============== 错误码速查 ============== */}
      <Panel variant="dark" className="!p-4">
        <h3 className="font-pixel-title text-xs text-ink-primary mb-2">
          常见错误码
        </h3>
        <div className="space-y-1 font-pixel-body text-xs text-ink-secondary">
          <ErrCode code="401" label="API Key 无效">
            服务端 OPENROUTER_API_KEY 配错了或被禁用
          </ErrCode>
          <ErrCode code="402" label="余额不足">
            前往 openrouter.ai/credits 充值
          </ErrCode>
          <ErrCode code="404" label="模型不存在">
            模型可能下线，已自动回退至备用模型
          </ErrCode>
          <ErrCode code="429" label="触发限流">
            已自动回退至下一个备用模型
          </ErrCode>
          <ErrCode code="503" label="后端未配置 Key">
            服务端 .env 或 Render 环境变量缺 OPENROUTER_API_KEY
          </ErrCode>
        </div>
      </Panel>
    </div>
  );
}

function ResultLine({
  kind,
  title,
  detail,
}: {
  kind: 'ok' | 'fail';
  title: string;
  detail: string;
}) {
  return (
    <div
      className={`flex items-start gap-2 p-3 border-2 ${
        kind === 'ok'
          ? 'border-game-green/60 bg-game-green/10'
          : 'border-game-red/60 bg-game-red/10'
      }`}
    >
      {kind === 'ok' ? (
        <CheckCircle className="w-5 h-5 text-game-green shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 text-game-red shrink-0 mt-0.5" />
      )}
      <div className="font-pixel-body min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            kind === 'ok' ? 'text-game-green' : 'text-game-red'
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-ink-secondary mt-1 break-words">{detail}</p>
      </div>
    </div>
  );
}

function ModelStatusRow({
  model,
  state,
}: {
  model: string;
  state: ModelTestState;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-surface-sunken border-2 border-ink-line">
      <div className="shrink-0">
        {state.status === 'testing' && (
          <Loader2 className="w-4 h-4 animate-spin text-ink-secondary" />
        )}
        {state.status === 'ok' && (
          <CheckCircle className="w-4 h-4 text-game-green" />
        )}
        {state.status === 'fail' && (
          <XCircle className="w-4 h-4 text-game-red" />
        )}
        {state.status === 'idle' && (
          <div className="w-4 h-4 border-2 border-ink-line" />
        )}
      </div>
      <code className="font-pixel-body text-xs text-ink-primary flex-1 truncate">
        {model}
      </code>
      {state.status === 'ok' && (
        <span className="text-xs text-game-green font-pixel-body shrink-0">
          {state.durationMs.toFixed(0)}ms
        </span>
      )}
      {state.status === 'fail' && (
        <span
          className="text-xs text-game-red font-pixel-body shrink-0"
          title={state.message}
        >
          {state.kind}
        </span>
      )}
    </div>
  );
}

function ErrCode({
  code,
  label,
  children,
}: {
  code: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <code className="shrink-0 px-1.5 py-0.5 bg-ink-line/30 border border-ink-line text-ink-primary font-pixel-title text-[10px]">
        {code}
      </code>
      <div className="flex-1 min-w-0">
        <span className="text-ink-primary font-medium">{label}</span>
        <span className="text-ink-secondary"> — {children}</span>
      </div>
    </div>
  );
}
