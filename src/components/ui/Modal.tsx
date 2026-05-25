/**
 * 像素风模态框
 *
 * 设计：
 * - 桌面端居中 + 像素硬投影，移动端从底部滑入（drawer 风格）
 * - 关闭按钮放在右上，但 ≥40px 触摸友好
 * - 标题用金色像素字，外加底部金色双线分隔
 */

import { type ReactNode, useId, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** 标题左侧的图标（可选） */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  /** 弹窗最大宽度，默认 max-w-lg */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const SIZE_CLASSES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
  full: 'sm:max-w-[90vw]',
};

export function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  className,
  showCloseButton = true,
  size = 'lg',
}: ModalProps) {
  const titleId = useId();
  const contentId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={contentId}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-surface-base/85 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            initial={{
              y: '100%',
              opacity: 0,
              scale: typeof window !== 'undefined' && window.innerWidth >= 640 ? 0.95 : 1,
            }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              'relative z-10 w-full',
              SIZE_CLASSES[size],
              'bg-surface-raised border-[3px] border-brand-gold shadow-pixel-xl',
              'max-h-[88vh] sm:max-h-[85vh] flex flex-col',
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b-[3px] border-brand-gold shrink-0 bg-surface-overlay">
                {title ? (
                  <h2
                    id={titleId}
                    className="font-pixel-title text-brand-gold text-xs sm:text-sm flex items-center gap-2 truncate"
                  >
                    {icon}
                    {title}
                  </h2>
                ) : (
                  <span />
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    aria-label="关闭弹窗"
                    className={cn(
                      'shrink-0 inline-flex items-center justify-center',
                      'w-10 h-10 min-w-[40px] min-h-[40px]',
                      'border-[3px] border-ink-line bg-surface-sunken',
                      'text-ink-secondary hover:text-ink-primary',
                      'hover:bg-game-red hover:border-game-red-deep',
                      'transition-colors duration-100',
                      'focus-visible:outline-none focus-visible:border-brand-gold'
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div
              id={contentId}
              className="font-pixel-body text-ink-primary overflow-y-auto touch-scroll flex-1 px-4 sm:px-5 py-4 sm:py-5"
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
