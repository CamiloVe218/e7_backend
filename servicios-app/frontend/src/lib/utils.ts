import { RequestStatus } from '@/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDIENTE: 'Pendiente',
  ACEPTADA: 'Aceptada',
  EN_PROCESO: 'En proceso',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
};

export const STATUS_DOT: Record<RequestStatus, string> = {
  PENDIENTE: 'bg-amber-400',
  ACEPTADA: 'bg-blue-400',
  EN_PROCESO: 'bg-violet-400',
  FINALIZADA: 'bg-emerald-400',
  CANCELADA: 'bg-gray-500',
};

export const STATUS_TEXT: Record<RequestStatus, string> = {
  PENDIENTE: 'text-amber-400',
  ACEPTADA: 'text-blue-400',
  EN_PROCESO: 'text-violet-400',
  FINALIZADA: 'text-emerald-400',
  CANCELADA: 'text-gray-500',
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDIENTE: 'bg-amber-950/40 text-amber-400 border-amber-900/60',
  ACEPTADA: 'bg-blue-950/40 text-blue-400 border-blue-900/60',
  EN_PROCESO: 'bg-violet-950/40 text-violet-400 border-violet-900/60',
  FINALIZADA: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60',
  CANCELADA: 'bg-gray-800/40 text-gray-500 border-gray-700/60',
};

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
