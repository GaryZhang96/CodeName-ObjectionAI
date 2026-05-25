/**
 * 像素风面板组件
 *
 * 设计意图：
 * - 硬边框 + 偏移投影建立 elevation 层级，不用任何模糊阴影
 * - variants 对应 5 个语义场景：默认 / 高亮 / 深 / 警示 / 卷宗
 */

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type PanelVariant =
  | 'default' // 标准面板
  | 'highlight' // 重点提示（金色边）
  | 'dark' // 深色（信息密度高的区域）
  | 'danger' // 警示
  | 'folder' // 卷宗风（浅色）
  | 'overlay'; // 弹窗内层

export type PanelPadding = 'none' | 'sm' | 'md' | 'lg';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PanelVariant;
  padding?: PanelPadding;
  animate?: boolean;
  /** 是否带偏移投影 */
  elevated?: boolean;
}

const VARIANT_CLASSES: Record<PanelVariant, string> = {
  default: 'bg-surface-raised border-ink-line',
  highlight: 'bg-surface-raised border-brand-gold',
  dark: 'bg-surface-sunken border-ink-line',
  danger: 'bg-game-red/10 border-game-red',
  folder:
    'bg-surface-inverse text-ink-on-light border-brand-gold-deep pixel-paper-bg',
  overlay: 'bg-surface-overlay border-ink-line',
};

const PADDING_CLASSES: Record<PanelPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      animate = false,
      elevated = true,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      'relative border-[3px]',
      elevated &&
        (variant === 'highlight'
          ? 'shadow-pixel-gold'
          : variant === 'danger'
            ? 'shadow-pixel-red'
            : 'shadow-pixel'),
      VARIANT_CLASSES[variant],
      PADDING_CLASSES[padding],
      className
    );

    if (animate) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={classes}
          {...(props as React.ComponentProps<typeof motion.div>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Panel.displayName = 'Panel';
