/**
 * 性能监控面板
 * 显示 AI 调用性能指标
 */

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { getPerformanceMetrics } from '@/services/ai/client';
import { Panel } from '@/components/ui';

interface PerformanceMonitorProps {
  enabled?: boolean;
}

export function PerformanceMonitor({ enabled = true }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setMetrics(getPerformanceMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <Panel variant="dark" className="w-64 text-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-pixel-title text-pixel-gold flex items-center gap-1">
              <Activity className="w-4 h-4" />
              AI 性能监控
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-pixel-gray hover:text-pixel-light"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1 text-pixel-light">
            <div className="flex justify-between">
              <span>总调用次数:</span>
              <span className="text-pixel-gold">{metrics.totalCalls}</span>
            </div>
            <div className="flex justify-between">
              <span>平均响应:</span>
              <span className={metrics.averageTime > 3000 ? 'text-pixel-red' : 'text-pixel-green'}>
                {metrics.averageTime > 0 ? `${metrics.averageTime.toFixed(0)}ms` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>最快响应:</span>
              <span className="text-pixel-green">
                {metrics.fastestCall < Infinity ? `${metrics.fastestCall.toFixed(0)}ms` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>最慢响应:</span>
              <span className="text-pixel-red">
                {metrics.slowestCall > 0 ? `${metrics.slowestCall.toFixed(0)}ms` : 'N/A'}
              </span>
            </div>
          </div>

          {metrics.averageTime > 3000 && (
            <div className="mt-2 pt-2 border-t border-pixel-gray/30">
              <p className="text-[10px] text-yellow-400">
                ⚠️ AI 响应较慢,可能是网络或 API 服务问题
              </p>
            </div>
          )}
        </Panel>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 bg-pixel-dark border-2 border-pixel-gray rounded hover:border-pixel-gold transition-colors"
          title="打开性能监控"
        >
          <Activity className="w-5 h-5 text-pixel-gold" />
          {metrics.totalCalls > 0 && (
            <span className="ml-1 text-xs text-pixel-light">
              {metrics.averageTime.toFixed(0)}ms
            </span>
          )}
        </button>
      )}
    </div>
  );
}
