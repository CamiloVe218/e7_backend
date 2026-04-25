'use client';

import { ServiceRequest } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDateShort, STATUS_DOT } from '@/lib/utils';

interface RequestCardProps {
  request: ServiceRequest;
  role: string;
  onAccept?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  loading?: boolean;
}

export function RequestCard({ request, role, onAccept, onUpdateStatus, loading }: RequestCardProps) {
  const canAccept = role === 'PROVEEDOR' && request.status === 'PENDIENTE' && onAccept;
  const canStart = role === 'PROVEEDOR' && request.status === 'ACEPTADA' && onUpdateStatus;
  const canFinish = role === 'PROVEEDOR' && request.status === 'EN_PROCESO' && onUpdateStatus;
  const canCancel = request.status === 'PENDIENTE' && role === 'CLIENTE' && onUpdateStatus;

  const hasActions = canAccept || canStart || canFinish || canCancel;

  const paymentLabel: Record<string, string> = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    TARJETA: 'Tarjeta',
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden group">
      <div className={`h-0.5 w-full ${STATUS_DOT[request.status as keyof typeof STATUS_DOT]}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{request.service?.name}</p>
            <p className="text-xs text-gray-600 mt-0.5">{formatDateShort(request.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {request.price && (
              <span className="text-sm font-semibold text-white">{formatCurrency(request.price)}</span>
            )}
            <StatusBadge status={request.status} />
          </div>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {request.description}
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{request.address}</span>
          </div>

          {request.paymentMethod && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>{paymentLabel[request.paymentMethod] || request.paymentMethod}</span>
            </div>
          )}

          {role === 'PROVEEDOR' && request.client && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{request.client.name}</span>
            </div>
          )}

          {(request.status === 'ACEPTADA' || request.status === 'EN_PROCESO') && request.provider && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{request.provider.user?.name}</span>
            </div>
          )}
        </div>

        {hasActions && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-800">
            {canAccept && (
              <button
                onClick={() => onAccept!(request.id)}
                disabled={loading}
                className="flex-1 h-8 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40"
              >
                Aceptar
              </button>
            )}
            {canStart && (
              <button
                onClick={() => onUpdateStatus!(request.id, 'EN_PROCESO')}
                disabled={loading}
                className="flex-1 h-8 text-xs font-medium rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-900/60 transition-colors disabled:opacity-40"
              >
                Iniciar servicio
              </button>
            )}
            {canFinish && (
              <button
                onClick={() => onUpdateStatus!(request.id, 'FINALIZADA')}
                disabled={loading}
                className="flex-1 h-8 text-xs font-medium rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-900/60 transition-colors disabled:opacity-40"
              >
                Finalizar
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => onUpdateStatus!(request.id, 'CANCELADA')}
                disabled={loading}
                className="h-8 px-3 text-xs font-medium rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 transition-colors disabled:opacity-40"
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
