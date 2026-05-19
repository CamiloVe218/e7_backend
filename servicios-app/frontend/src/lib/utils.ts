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
  ACEPTADA:  'Aceptada',
  EN_PROCESO: 'En proceso',
  FINALIZADA: 'Finalizada',
  CANCELADA:  'Cancelada',
};

export const STATUS_DOT: Record<RequestStatus, string> = {
  PENDIENTE:  'bg-amber-400',
  ACEPTADA:   'bg-blue-500',
  EN_PROCESO: 'bg-violet-500',
  FINALIZADA: 'bg-emerald-500',
  CANCELADA:  'bg-gray-300',
};

export const STATUS_TEXT: Record<RequestStatus, string> = {
  PENDIENTE:  'text-amber-700',
  ACEPTADA:   'text-blue-700',
  EN_PROCESO: 'text-violet-700',
  FINALIZADA: 'text-emerald-700',
  CANCELADA:  'text-gray-400',
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  PENDIENTE:  'bg-amber-50 text-amber-700 border-amber-200',
  ACEPTADA:   'bg-blue-50 text-blue-700 border-blue-200',
  EN_PROCESO: 'bg-violet-50 text-violet-700 border-violet-200',
  FINALIZADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELADA:  'bg-gray-100 text-gray-400 border-gray-200',
};

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
