/**
 * 像素风面板组件
 */

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'highlight';
  animate?: boolean;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant = 'default', animate = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-court-secondary border-pixel-gold',
      dark: 'bg-pixel-dark border-pixel-gray',
      highlight: 'bg-court-accent border-pixel-gold gold-pulse',
    };

    if (animate) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'border-4 shadow-pixel-lg p-4',
            variants[variant],
            className
          )}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'border-4 shadow-pixel-lg p-4',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Panel.displayName = 'Panel';
