/**
 * 像素风输入框 / 文本域
 *
 * 设计：
 * - 深色嵌入（surface-sunken）+ 内阴影暗示"输入"
 * - 聚焦时金色边框，类似 RPG 命令窗口选中态
 * - 字号固定 16px，避免 iOS Safari 自动放大
 */

import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 错误状态：边框变红 */
  error?: boolean;
}

const INPUT_BASE = cn(
  'w-full px-4 py-3 min-h-[44px]',
  'font-pixel-body text-base text-ink-primary',
  'bg-surface-sunken',
  'border-[3px] border-ink-line',
  'shadow-pixel-inset',
  'transition-colors duration-100',
  'placeholder:text-ink-muted',
  'focus:outline-none focus:border-brand-gold',
  'disabled:opacity-50 disabled:cursor-not-allowed'
);

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, style, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          INPUT_BASE,
          error && 'border-game-red focus:border-game-red',
          className
        )}
        style={{ fontSize: '16px', ...style }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error, style, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          INPUT_BASE,
          'resize-none leading-relaxed',
          error && 'border-game-red focus:border-game-red',
          className
        )}
        style={{ fontSize: '16px', ...style }}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';
