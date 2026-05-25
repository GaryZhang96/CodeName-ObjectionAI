/**
 * 飘字组件 - RPG 风格的数值反馈
 *
 * 用法：陪审团 +5 / 法官耐心 -10 / "关键时刻!" 等事件时弹出
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type FloatingTextKind = 'positive' | 'negative' | 'critical' | 'info';

export interface FloatingTextItem {
  id: string;
  text: string;
  kind: FloatingTextKind;
  /** 相对父容器的位置（百分比） */
  x?: number;
  y?: number;
}

const KIND_CLASSES: Record<FloatingTextKind, string> = {
  positive: 'text-game-green',
  negative: 'text-game-red',
  critical: 'text-brand-gold',
  info: 'text-game-blue',
};

interface FloatingTextProps {
  items: FloatingTextItem[];
  onItemExpire?: (id: string) => void;
}

export function FloatingTextLayer({ items, onItemExpire }: FloatingTextProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible z-30">
      <AnimatePresence>
        {items.map((item) => (
          <FloatingTextNode
            key={item.id}
            item={item}
            onExpire={() => onItemExpire?.(item.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function FloatingTextNode({
  item,
  onExpire,
}: {
  item: FloatingTextItem;
  onExpire: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onExpire, 1500);
    return () => clearTimeout(t);
  }, [onExpire]);

  return (
    <motion.div
      initial={{ y: 0, opacity: 0, scale: 0.7 }}
      animate={{
        y: -80,
        opacity: [0, 1, 1, 0],
        scale: [0.7, 1.15, 1, 1.05],
      }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className={cn(
        'absolute font-pixel-title uppercase tracking-wider',
        'text-base sm:text-lg whitespace-nowrap',
        KIND_CLASSES[item.kind]
      )}
      style={{
        left: `${item.x ?? 50}%`,
        top: `${item.y ?? 50}%`,
        transform: 'translate(-50%, -50%)',
        textShadow:
          '2px 2px 0 rgba(14,8,32,0.95), 0 0 12px currentColor',
      }}
    >
      {item.text}
    </motion.div>
  );
}

/**
 * 简化版 hook：管理飘字队列
 *
 * 注：eslint-disable 是因为这是一个工具 hook 与组件共置，
 * 不影响 Fast Refresh，便于一个文件内消费。
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useFloatingTexts() {
  const [items, setItems] = useState<FloatingTextItem[]>([]);

  const push = (item: Omit<FloatingTextItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [...prev, { ...item, id }]);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return { items, push, remove };
}
