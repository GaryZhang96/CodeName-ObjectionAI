/**
 * 卡通风格按钮组件
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'default' | 'danger' | 'success' | 'ghost' | 'highlight';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      default: 'bg-court-accent text-white border-court-accent/30 hover:bg-court-accent/90 shadow-soft hover:shadow-soft-lg',
      danger: 'bg-pixel-red text-white border-pixel-red/30 hover:bg-pixel-red/90 shadow-soft hover:shadow-soft-lg',
      success: 'bg-pixel-green text-white border-pixel-green/30 hover:bg-pixel-green/90 shadow-soft hover:shadow-soft-lg',
      ghost: 'bg-transparent text-court-accent border-court-accent/30 hover:bg-court-accent/5 shadow-none hover:shadow-soft',
      highlight: 'bg-court-highlight text-white border-court-highlight/30 hover:bg-court-highlight/90 shadow-soft hover:shadow-soft-lg',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-6 py-3 text-sm rounded-cartoon',
      lg: 'px-8 py-4 text-base rounded-cartoon-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
        whileTap={{ scale: disabled ? 1 : 0.98, y: disabled ? 0 : 0 }}
        className={cn(
          'font-pixel-body font-medium',
          'border-2',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          isLoading && 'animate-pulse',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⚙</span>
            加载中...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
