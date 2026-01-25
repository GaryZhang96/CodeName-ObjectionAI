/**
 * Lex Machina - 律政先锋
 * 主应用组件
 */

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { LoadingScreen, PerformanceMonitor } from '@/components/game';
import {
  MenuScreen,
  OfficeScreen,
  InvestigationScreen,
  CourtroomScreen,
  VerdictScreen,
  CollectionScreen,
  GMScreen,
  EditorScreen,
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
      case 'collection':
        return <CollectionScreen />;
      case 'gm':
        return <GMScreen />;
      case 'editor':
        return <EditorScreen />;
      default:
        return <MenuScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-court-primary text-pixel-dark overflow-hidden relative">
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

      {/* 性能监控 (开发模式) */}
      <PerformanceMonitor enabled={import.meta.env.DEV} />
    </div>
  );
}

export default App;

