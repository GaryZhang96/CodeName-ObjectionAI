/**
 * 卡通风格面板组件
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
      default: 'bg-court-secondary border-court-accent/20 shadow-soft-lg',
      dark: 'bg-white border-pixel-gray/20 shadow-soft',
      highlight: 'bg-court-highlight/10 border-court-highlight/30 shadow-soft-lg',
    };

    if (animate) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'border-2 rounded-cartoon p-4',
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
          'border-2 rounded-cartoon p-4',
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
