/**
 * 像素逆转裁判风按钮
 *
 * 设计意图：
 * - 硬偏移投影模仿 16-bit 时代按钮的"立体感"，不用任何模糊阴影
 * - 按下时投影变小、按钮内陷，仿真物理反馈
 * - 触摸设备禁用 hover 缩放，改用 active 的位移反馈
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'default' // 主操作（金色）
  | 'danger' // 危险/异议（红色）
  | 'success' // 确认/胜利（绿色）
  | 'info' // 信息/证据（蓝色）
  | 'ghost' // 次要操作（描边）
  | 'subtle'; // 极轻量（无边框，仅文字）

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  /** 完全填满父容器宽度 */
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  default:
    'bg-brand-gold text-brand-ink border-brand-gold-deep shadow-pixel hover:shadow-pixel-lg',
  danger:
    'bg-game-red text-ink-primary border-game-red-deep shadow-pixel hover:shadow-pixel-lg',
  success:
    'bg-game-green text-ink-primary border-game-green-deep shadow-pixel hover:shadow-pixel-lg',
  info:
    'bg-game-blue text-ink-primary border-game-blue-deep shadow-pixel hover:shadow-pixel-lg',
  ghost:
    'bg-transparent text-brand-gold border-brand-gold hover:bg-brand-gold/15',
  subtle:
    'bg-transparent text-ink-secondary border-transparent hover:text-ink-primary hover:bg-ink-line/30',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 min-h-[28px] text-[10px] gap-1 border-2',
  sm: 'px-3 py-2 min-h-[36px] text-[11px] gap-1.5 border-[3px]',
  md: 'px-5 py-3 min-h-[44px] text-xs gap-2 border-[3px]',
  lg: 'px-7 py-4 min-h-[52px] text-sm gap-2.5 border-[3px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      isLoading,
      fullWidth,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const isShadowVariant = variant !== 'ghost' && variant !== 'subtle';

    return (
      <motion.button
        ref={ref}
        // 按下偏移 - 用 motion 控制以避免 tailwind active 与 hover 互相干扰
        whileTap={
          isDisabled
            ? undefined
            : { x: 2, y: 2, transition: { duration: 0.04 } }
        }
        className={cn(
          // 基础
          'relative inline-flex items-center justify-center',
          'font-pixel-title uppercase tracking-wider whitespace-nowrap',
          'transition-[box-shadow,background-color,color,border-color,transform] duration-100',
          // 焦点环（键盘可访问）
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-soft focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
          // 禁用
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // hover 微抬升（仅有投影的变体）
          !isDisabled && isShadowVariant &&
            'hover:-translate-x-[1px] hover:-translate-y-[1px]',
          // 按下时投影消失
          !isDisabled && isShadowVariant &&
            'active:shadow-pixel-sm',
          fullWidth && 'w-full',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        <span className="inline-flex items-center gap-1.5">
          {children as React.ReactNode}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
