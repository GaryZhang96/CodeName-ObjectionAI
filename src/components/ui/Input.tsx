/**
 * 像素风输入框组件
 */

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 font-pixel-body text-lg',
          'bg-pixel-dark text-pixel-light',
          'border-4 border-pixel-gray',
          'focus:border-pixel-gold focus:outline-none',
          'placeholder:text-pixel-gray',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-3 font-pixel-body text-lg',
          'bg-pixel-dark text-pixel-light',
          'border-4 border-pixel-gray',
          'focus:border-pixel-gold focus:outline-none',
          'placeholder:text-pixel-gray',
          'resize-none',
          className
        )}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

