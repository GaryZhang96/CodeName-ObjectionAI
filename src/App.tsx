/**
 * Lex Machina - 律政先锋
 * 主应用组件
 */

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { LoadingScreen } from '@/components/game';
import {
  MenuScreen,
  OfficeScreen,
  InvestigationScreen,
  CourtroomScreen,
  VerdictScreen,
} from '@/screens';

function App() {
  const { phase, isLoading, loadingMessage, settings, error, setError } = useGameStore();

  // 错误提示
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  // 渲染当前阶段的界面
  const renderPhase = () => {
    switch (phase) {
      case 'menu':
        return <MenuScreen />;
      case 'office':
        return <OfficeScreen />;
      case 'investigation':
        return <InvestigationScreen />;
      case 'courtroom':
        return <CourtroomScreen />;
      case 'verdict':
      case 'review':
        return <VerdictScreen />;
      default:
        return <MenuScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-court-primary text-pixel-light overflow-hidden relative">
      {/* 扫描线效果 */}
      {settings.scanlineEffect && (
        <div className="scanline-overlay pointer-events-none" />
      )}

      {/* CRT 效果边缘 */}
      <div className="fixed inset-0 pointer-events-none z-40">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, transparent 70%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      </div>

      {/* 主内容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          {renderPhase()}
        </motion.div>
      </AnimatePresence>

      {/* 全局加载遮罩 */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <LoadingScreen message={loadingMessage} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-pixel-red border-4 border-red-800 px-6 py-3 shadow-pixel">
              <p className="font-pixel-body text-white text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 版本水印 */}
      <div className="fixed bottom-2 right-2 z-30 opacity-30">
        <p className="font-pixel-body text-xs text-pixel-gray">
          Lex Machina v1.0
        </p>
      </div>
    </div>
  );
}

export default App;

