/**
 * 加载界面 - 像素风
 *
 * 设计：法槌摆动 + 经典 16-bit 加载条 + 闪烁提示
 */

import { motion } from 'framer-motion';
import { Gavel } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
}

const TIPS = [
  '提示：抓住证人证词中的矛盾，是制胜关键',
  '提示：陪审团的情绪会影响最终判决',
  '提示：法官耐心耗尽，会强制结案',
  '提示：合伙人的提示永远值这个价',
  '提示：每一次"异议"都要有证据支撑',
  '提示：连胜可以解锁更高难度的案件',
];

export function LoadingScreen({ message = '加载中...' }: LoadingScreenProps) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center pixel-court-bg safe-x"
    >
      {/* 法槌 */}
      <motion.div
        animate={{
          rotate: [-20, 20, -20],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="mb-8"
        style={{ transformOrigin: '50% 80%' }}
      >
        <Gavel className="w-20 h-20 text-brand-gold drop-shadow-[4px_4px_0_rgba(14,8,32,0.85)]" />
      </motion.div>

      {/* 加载文字 */}
      <motion.h2
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="font-pixel-title text-brand-gold text-base sm:text-lg uppercase tracking-widest mb-6"
        style={{
          textShadow:
            '3px 3px 0 rgba(14,8,32,0.9), 0 0 16px rgba(255,182,39,0.4)',
        }}
      >
        {message}
      </motion.h2>

      {/* 像素加载条 */}
      <div className="w-64 h-5 bg-surface-sunken border-[3px] border-brand-gold-deep shadow-pixel relative overflow-hidden">
        <motion.div
          className="absolute top-0 bottom-0 w-1/3 bg-brand-gold"
          animate={{ x: ['-100%', '300%'] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* 滚动提示 */}
      <div className="mt-10 max-w-md px-4 h-12 flex items-center justify-center">
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="font-pixel-body text-ink-secondary text-base text-center"
        >
          {TIPS[tipIndex]}
        </motion.p>
      </div>
    </motion.div>
  );
}
