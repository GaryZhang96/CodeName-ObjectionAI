/**
 * 「异议！」全屏冲击效果
 *
 * 触发时：
 * 1. 全屏暗红覆盖 + 高斯模糊
 * 2. 中央巨型像素字「异议！」从远处冲来（缩放 + 旋转）
 * 3. 周围辐射状像素线条
 * 4. 短暂震屏（由父组件触发）
 */

import { motion, AnimatePresence } from 'framer-motion';

export type ObjectionKind = 'objection' | 'hold-it' | 'take-that' | 'breakthrough';

const KIND_CONFIG: Record<
  ObjectionKind,
  { text: string; color: string; bg: string; en: string }
> = {
  objection: {
    text: '异议！',
    en: 'OBJECTION!',
    color: 'text-game-red',
    bg: 'bg-game-red/30',
  },
  'hold-it': {
    text: '等等！',
    en: 'HOLD IT!',
    color: 'text-brand-gold',
    bg: 'bg-brand-gold/25',
  },
  'take-that': {
    text: '接招！',
    en: 'TAKE THAT!',
    color: 'text-game-blue',
    bg: 'bg-game-blue/30',
  },
  breakthrough: {
    text: '突破！',
    en: 'BREAKTHROUGH!',
    color: 'text-game-green',
    bg: 'bg-game-green/30',
  },
};

interface ObjectionEffectProps {
  isVisible: boolean;
  kind?: ObjectionKind;
}

export function ObjectionEffect({
  isVisible,
  kind = 'objection',
}: ObjectionEffectProps) {
  const config = KIND_CONFIG[kind];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className={`fixed inset-0 z-[60] pointer-events-none flex items-center justify-center ${config.bg} backdrop-blur-[3px]`}
        >
          {/* 辐射线条 */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30) % 360;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 3, opacity: [0, 0.4, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.02 }}
                  className="absolute top-1/2 left-1/2 origin-left h-1 bg-current"
                  style={{
                    width: '50vw',
                    transform: `rotate(${angle}deg) translateX(0)`,
                    color: 'currentColor',
                  }}
                />
              );
            })}
          </div>

          {/* 中央文字 */}
          <motion.div
            initial={{ scale: 0.2, rotate: -8, opacity: 0 }}
            animate={{
              scale: [0.2, 1.4, 1.1, 1.2],
              rotate: [-8, 4, -2, 0],
              opacity: [0, 1, 1, 1],
            }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{
              duration: 0.5,
              times: [0, 0.4, 0.7, 1],
              ease: 'easeOut',
            }}
            className="relative text-center"
          >
            <div
              className={`font-pixel-title ${config.color} leading-none`}
              style={{
                fontSize: 'clamp(48px, 12vw, 160px)',
                textShadow:
                  '4px 4px 0 #0e0820, 8px 8px 0 rgba(14,8,32,0.6), 0 0 40px currentColor',
                WebkitTextStroke: '2px #0e0820',
              }}
            >
              {config.text}
            </div>
            <div
              className={`font-pixel-title ${config.color} mt-2 opacity-80`}
              style={{
                fontSize: 'clamp(12px, 2.5vw, 24px)',
                textShadow: '2px 2px 0 #0e0820',
                letterSpacing: '0.2em',
              }}
            >
              {config.en}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
