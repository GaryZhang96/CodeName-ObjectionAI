/**
 * 像素风模态框组件
 */

import { type ReactNode, useId, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Panel } from './Panel';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  showCloseButton = true,
}: ModalProps) {
  const titleId = useId();
  const contentId = useId();

  // 处理 ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // 打开时禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
            className="absolute inset-0 bg-black/80"
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Modal Content - 移动端从底部滑入 */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative z-10 w-full max-w-lg',
              'sm:rounded-lg',
              className
            )}
          >
            <Panel variant="default" className="relative rounded-t-2xl sm:rounded-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col">
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b-2 border-pixel-gold/30 shrink-0">
                  {title && (
                    <h2 
                      id={titleId}
                      className="font-pixel-title text-pixel-gold text-base sm:text-lg"
                    >
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="!p-2 !border-2 !min-w-[40px] !min-h-[40px]"
                      aria-label="关闭弹窗"
                    >
                      <X size={18} />
                    </Button>
                  )}
                </div>
              )}
              
              {/* Body */}
              <div 
                id={contentId} 
                className="font-pixel-body text-pixel-light overflow-y-auto touch-scroll flex-1"
              >
                {children}
              </div>
            </Panel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

