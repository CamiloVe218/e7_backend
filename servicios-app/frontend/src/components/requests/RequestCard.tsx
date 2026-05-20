'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

const PAYMENT_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
};

// ── Cancel confirmation modal ───────────────────────────────────────────────

function CancelModal({
  paymentMethod,
  onConfirm,
  onDismiss,
}: {
  paymentMethod: string;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const isCard = paymentMethod === 'TARJETA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onDismiss}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-7 pt-7 pb-6">
          {/* Warning icon */}
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-5">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 className="font-tight text-lg font-bold text-gray-900 mb-1.5">
            ¿Cancelar solicitud?
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed">
            Esta solicitud será cancelada.
          </p>

          {/* Payment-specific charge notice */}
          <div className={`mt-4 px-4 py-3.5 rounded-xl border text-sm leading-relaxed ${isCard ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
            {isCard ? (
              <>
                <span className="font-semibold">Cargo por cancelación:</span> Se realizará un cargo de{' '}
                <span className="font-semibold">$100 MXN</span> a tu método de pago registrado.
              </>
            ) : (
              <>
                <span className="font-semibold">Cargo por cancelación:</span> Se agregará un cargo adicional de{' '}
                <span className="font-semibold">$100 MXN</span> en tu próximo pedido realizado en efectivo.
              </>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        <div className="px-7 py-5 flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 h-10 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Volver
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Sí, cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Completion modal ────────────────────────────────────────────────────────

function CompletionModal({
  onContinue,
  onExit,
}: {
  onContinue: () => void;
  onExit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onContinue}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-7 pt-7 pb-6">
          {/* Check icon */}
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="font-tight text-lg font-bold text-gray-900 mb-1.5">
            Servicio finalizado
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            ¿Qué deseas hacer a continuación?
          </p>
        </div>

        <div className="h-px bg-gray-100" />

        <div className="px-7 py-5 flex flex-col gap-2.5">
          <button
            onClick={onContinue}
            className="w-full h-11 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Continuar aceptando servicios
          </button>
          <button
            onClick={onExit}
            className="w-full h-11 text-sm font-bold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors"
          >
            Salir al menú principal
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Thank you screen ────────────────────────────────────────────────────────

function ThankYouScreen({ onReturn }: { onReturn: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white px-8">
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Large logo */}
        <div className="w-24 h-24 rounded-3xl bg-gray-900 flex items-center justify-center mb-8 shadow-xl">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-12 h-12 text-white">
            <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
            <rect x="1" y="9" width="3" height="2" rx="0.5" />
          </svg>
        </div>

        <h1 className="font-tight text-4xl font-black text-gray-900 tracking-tighter mb-3">
          Harambal
        </h1>

        <p className="font-tight text-2xl font-bold text-gray-800 mb-4 leading-snug">
          ¡Gracias por usar Harambal!
        </p>

        <p className="text-sm text-gray-500 leading-relaxed mb-12">
          Tu servicio ha sido completado exitosamente.<br />
          Esperamos verte pronto.
        </p>

        <button
          onClick={onReturn}
          className="h-12 px-10 text-sm font-bold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function RequestCard({ request, role, onAccept, onUpdateStatus, loading }: RequestCardProps) {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const canAccept  = role === 'PROVEEDOR' && request.status === 'PENDIENTE' && onAccept;
  const canStart   = role === 'PROVEEDOR' && request.status === 'ACEPTADA'  && onUpdateStatus;
  const canFinish  = role === 'PROVEEDOR' && request.status === 'EN_PROCESO' && onUpdateStatus;
  const canCancel  =
    role === 'CLIENTE' &&
    ['PENDIENTE', 'ACEPTADA', 'EN_PROCESO'].includes(request.status) &&
    onUpdateStatus;
  const hasActions = canAccept || canStart || canFinish || canCancel;

  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    setActionLoading(true);
    try {
      await onUpdateStatus!(request.id, 'CANCELADA');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalize = () => {
    setShowCompletionModal(true);
  };

  const handleCompletionContinue = async () => {
    setShowCompletionModal(false);
    setActionLoading(true);
    try {
      await onUpdateStatus!(request.id, 'FINALIZADA');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompletionExit = async () => {
    setShowCompletionModal(false);
    setActionLoading(true);
    try {
      await onUpdateStatus!(request.id, 'FINALIZADA');
    } finally {
      setActionLoading(false);
    }
    setShowThankYou(true);
  };

  const handleReturnHome = () => {
    setShowThankYou(false);
    router.push('/dashboard/provider');
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-150 overflow-hidden shadow-card group">
        {/* Status accent */}
        <div className={`h-0.5 w-full ${STATUS_DOT[request.status as keyof typeof STATUS_DOT]}`} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{request.service?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(request.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              {request.price && (
                <span className="text-sm font-bold text-gray-900">{formatCurrency(request.price)}</span>
              )}
              <StatusBadge status={request.status} />
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{request.description}</p>

          {/* Meta */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{request.address}</span>
            </div>

            {request.paymentMethod && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>{PAYMENT_LABEL[request.paymentMethod] || request.paymentMethod}</span>
              </div>
            )}

            {role === 'PROVEEDOR' && request.client && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{request.client.name}</span>
              </div>
            )}

            {(request.status === 'ACEPTADA' || request.status === 'EN_PROCESO') && request.provider && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{request.provider.user?.name}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          {hasActions && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              {canAccept && (
                <button
                  onClick={() => onAccept!(request.id)}
                  disabled={loading || actionLoading}
                  className="flex-1 h-8 text-xs font-semibold rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition-colors disabled:opacity-40"
                >
                  Aceptar
                </button>
              )}
              {canStart && (
                <button
                  onClick={() => onUpdateStatus!(request.id, 'EN_PROCESO')}
                  disabled={loading || actionLoading}
                  className="flex-1 h-8 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-40"
                >
                  Iniciar servicio
                </button>
              )}
              {canFinish && (
                <button
                  onClick={handleFinalize}
                  disabled={loading || actionLoading}
                  className="flex-1 h-8 text-xs font-semibold rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition-colors disabled:opacity-40"
                >
                  Finalizar
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={loading || actionLoading}
                  className="h-8 px-3 text-xs font-medium rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-40"
                >
                  Cancelar solicitud
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCancelModal && (
        <CancelModal
          paymentMethod={request.paymentMethod || 'EFECTIVO'}
          onConfirm={handleConfirmCancel}
          onDismiss={() => setShowCancelModal(false)}
        />
      )}

      {showCompletionModal && (
        <CompletionModal
          onContinue={handleCompletionContinue}
          onExit={handleCompletionExit}
        />
      )}

      {showThankYou && <ThankYouScreen onReturn={handleReturnHome} />}
    </>
  );
}
