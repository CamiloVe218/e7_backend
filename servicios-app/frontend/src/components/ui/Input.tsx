'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const fieldBase   = 'flex flex-col gap-1.5';
const labelBase   = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';
const inputBase   = [
  'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-gray-900',
  'placeholder:text-gray-400 transition-colors duration-150',
  'focus:outline-none',
].join(' ');
const defaultBorder = 'border-gray-200 hover:border-gray-300 focus:border-gray-900';
const errorBorder   = 'border-red-300 focus:border-red-500';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={fieldBase}>
        {label && (
          <label htmlFor={inputId} className={labelBase}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(inputBase, error ? errorBorder : defaultBorder, className)}
          {...props}
        />
        {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-400 mt-0.5">{helperText}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={fieldBase}>
        {label && (
          <label htmlFor={inputId} className={labelBase}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(inputBase, 'resize-none', error ? errorBorder : defaultBorder, className)}
          {...props}
        />
        {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={fieldBase}>
        {label && (
          <label htmlFor={inputId} className={labelBase}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(inputBase, error ? errorBorder : defaultBorder, className)}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
