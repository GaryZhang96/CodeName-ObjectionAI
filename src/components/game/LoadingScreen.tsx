/**
 * 加载界面组件
 */

import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = '加载中...' }: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-court-primary"
    >
      {/* 像素风加载动画 */}
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-8"
      >
        <Scale className="w-24 h-24 text-pixel-gold" strokeWidth={1.5} />
      </motion.div>

      {/* 加载文字 */}
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="font-pixel-title text-pixel-gold text-lg"
      >
        {message}
      </motion.p>

      {/* 进度条 */}
      <div className="w-64 h-4 mt-6 bg-pixel-dark border-4 border-pixel-gold overflow-hidden">
        <motion.div
          className="h-full bg-pixel-gold"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ width: '50%' }}
        />
      </div>

      {/* 提示文字 */}
      <p className="mt-8 font-pixel-body text-pixel-gray text-sm max-w-md text-center px-4">
        AI 正在构建案件世界，请稍候...
      </p>
    </motion.div>
  );
}

