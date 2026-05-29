'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ── Single toast UI ───────────────────────────────────────────────────────────

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-white border-emerald-200 shadow-lg',
  error:   'bg-white border-red-200 shadow-lg',
  warning: 'bg-white border-amber-200 shadow-lg',
  info:    'bg-white border-blue-200 shadow-lg',
};

const ICON_STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-100 text-emerald-600',
  error:   'bg-red-100 text-red-500',
  warning: 'bg-amber-100 text-amber-600',
  info:    'bg-blue-100 text-blue-600',
};

const PROGRESS_STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-400',
  error:   'bg-red-400',
  warning: 'bg-amber-400',
  info:    'bg-blue-400',
};

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
  if (type === 'error') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  if (type === 'warning') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SingleToast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);

  // Animate progress bar
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    // Start full → shrink to 0 over toast.duration
    bar.style.transition = `width ${toast.duration}ms linear`;
    const frame = requestAnimationFrame(() => {
      bar.style.width = '0%';
    });
    return () => cancelAnimationFrame(frame);
  }, [toast.duration]);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 220);
  }, [onDismiss, toast.id]);

  // Auto-dismiss
  useEffect(() => {
    const t = setTimeout(dismiss, toast.duration);
    return () => clearTimeout(t);
  }, [dismiss, toast.duration]);

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 w-full px-4 py-3.5 rounded-xl border overflow-hidden',
        'cursor-pointer select-none',
        TOAST_STYLES[toast.type],
        leaving ? 'toast-exit' : 'toast-enter',
      )}
      onClick={dismiss}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', ICON_STYLES[toast.type])}>
        <ToastIcon type={toast.type} />
      </div>

      {/* Message */}
      <p className="text-sm text-gray-800 font-medium leading-snug flex-1 pt-0.5">
        {toast.message}
      </p>

      {/* Close */}
      <button
        onClick={dismiss}
        aria-label="Cerrar"
        className="shrink-0 opacity-30 hover:opacity-70 transition-opacity mt-0.5 -mr-0.5"
      >
        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-100">
        <div
          ref={barRef}
          className={cn('h-full rounded-full', PROGRESS_STYLES[toast.type])}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}

// ── Toast container (portal-like, fixed) ─────────────────────────────────────

function ToastStack({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  if (items.length === 0) return null;
  return (
    <div
      className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {items.map(t => (
        <SingleToast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

let _nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
    const id = String(_nextId++);
    setItems(prev => {
      // Max 4 visible at once — drop oldest if exceeded
      const next = [...prev, { id, message, type, duration }];
      return next.length > 4 ? next.slice(next.length - 4) : next;
    });
  }, []);

  const ctx: ToastContextType = {
    toast:   addToast,
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error', 6000),
    warning: (msg) => addToast(msg, 'warning'),
    info:    (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <ToastStack items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
