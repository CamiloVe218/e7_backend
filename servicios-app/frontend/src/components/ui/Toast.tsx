'use client';

import { cn } from '@/lib/utils';

export type ToastType = 'default' | 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
}

const toastStyles: Record<ToastType, string> = {
  default: 'bg-white border-gray-200 text-gray-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') {
    return (
      <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (type === 'warning') {
    return (
      <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function Toast({ message, type = 'default', onClose }: ToastProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-dropdown w-full',
        'toast-enter',
        toastStyles[type],
      )}
      role="alert"
    >
      <ToastIcon type={type} />
      <p className="text-sm leading-snug flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="shrink-0 opacity-40 hover:opacity-100 transition-opacity -mt-0.5 -mr-0.5 p-0.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Positioned container — drops into any page
export function ToastContainer({
  message,
  type,
  onClose,
}: {
  message: string | null;
  type?: ToastType;
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto">
      <Toast message={message} type={type} onClose={onClose} />
    </div>
  );
}
