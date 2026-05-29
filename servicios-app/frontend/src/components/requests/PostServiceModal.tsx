'use client';

import { useState } from 'react';
import { ServiceRequest } from '@/types';
import { paymentsApi, ratingsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

type ModalStep = 'payment' | 'payment-processing' | 'payment-success' | 'payment-failed' | 'rating' | 'done';

interface PostServiceModalProps {
  request: ServiceRequest;
  onComplete: () => void; // refresh parent data
  onClose: () => void;
}

// ── Star selector ─────────────────────────────────────────────────────────────

function StarSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-1.5" role="group" aria-label="Calificación">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            aria-label={`${star} estrellas`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform duration-100 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            <svg
              className={`w-9 h-9 transition-colors duration-100 ${
                star <= active ? 'text-amber-400' : 'text-gray-200'
              }`}
              viewBox="0 0 24 24"
              fill={star <= active ? 'currentColor' : 'none'}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className="text-sm font-semibold text-amber-600">{LABELS[active]}</p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PostServiceModal({ request, onComplete, onClose }: PostServiceModalProps) {
  const alreadyPaid = request.payment?.status === 'COMPLETADO';
  const alreadyRated = !!request.rating;

  // Skip payment step if already paid
  const initialStep: ModalStep = alreadyPaid ? 'rating' : 'payment';
  const [step, setStep] = useState<ModalStep>(initialStep);

  // Payment state
  const [payError, setPayError] = useState('');

  // Rating state
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState('');

  // ── Payment simulation ────────────────────────────────────────────────────

  const handleProcessPayment = async () => {
    setStep('payment-processing');
    setPayError('');
    try {
      // Create payment record then simulate processing
      await paymentsApi.create(request.id);
      await paymentsApi.simulate(request.id);
      setStep('payment-success');
    } catch (err: any) {
      setPayError(err.message || 'No fue posible procesar el pago. Intenta de nuevo.');
      setStep('payment-failed');
    }
  };

  // ── Rating submission ─────────────────────────────────────────────────────

  const handleSubmitRating = async () => {
    if (score < 1) { setRatingError('Selecciona una calificación'); return; }
    setRatingLoading(true);
    setRatingError('');
    try {
      await ratingsApi.create({
        serviceRequestId: request.id,
        score,
        comment: comment.trim() || undefined,
      });
      setStep('done');
      onComplete(); // refresh parent lists
    } catch (err: any) {
      setRatingError(err.message || 'Error al enviar la calificación. Intenta de nuevo.');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleSkipRating = () => {
    setStep('done');
    onComplete();
  };

  // ── Shared backdrop + card shell ──────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={step === 'done' ? onClose : undefined}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl border border-gray-200 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >

        {/* ── PAYMENT STEP ── */}
        {step === 'payment' && (
          <>
            <div className="px-6 pt-6 pb-5">
              {/* Handle bar (mobile) */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

              <div className="w-11 h-11 rounded-xl bg-gray-900 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>

              <p className="text-xs font-bold tracking-[0.08em] uppercase text-gray-400 mb-1">Pago del servicio</p>
              <h3 className="font-tight text-xl font-bold text-gray-900 mb-1">
                Confirmar pago
              </h3>
              <p className="text-sm text-gray-500">
                {request.service?.name}
                {request.provider?.user?.name ? ` · ${request.provider.user.name}` : ''}
              </p>

              {/* Amount */}
              <div className="mt-5 px-4 py-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total del servicio</span>
                  <span className="text-xl font-bold text-gray-900 tabular-nums">
                    {request.price ? formatCurrency(request.price) : 'Acordado con el proveedor'}
                  </span>
                </div>
                {request.paymentMethod && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-400">Método</span>
                    <span className="text-xs font-medium text-gray-600">
                      {request.paymentMethod === 'EFECTIVO' ? 'Efectivo'
                        : request.paymentMethod === 'TARJETA' ? 'Tarjeta'
                        : 'Transferencia'}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-blue-50 border border-blue-100">
                <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Al confirmar, se registrará el pago del servicio y podrás calificar al proveedor.
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100" />
            <div className="px-6 py-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-11 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Después
              </button>
              <button
                onClick={handleProcessPayment}
                className="flex-1 h-11 text-sm font-bold rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white transition-all"
              >
                Confirmar pago
              </button>
            </div>
          </>
        )}

        {/* ── PAYMENT PROCESSING ── */}
        {step === 'payment-processing' && (
          <div className="px-6 py-14 flex flex-col items-center gap-6 text-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
              <div className="absolute inset-0 rounded-full border-4 border-gray-900 border-t-transparent animate-spin" />
            </div>
            <div>
              <h3 className="font-tight text-lg font-bold text-gray-900 mb-1">Procesando pago...</h3>
              <p className="text-sm text-gray-500">Por favor espera, no cierres esta ventana.</p>
            </div>
          </div>
        )}

        {/* ── PAYMENT SUCCESS ── */}
        {step === 'payment-success' && (
          <>
            <div className="px-6 pt-6 pb-5">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />
              <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-bold tracking-[0.08em] uppercase text-emerald-600 mb-1">Pago completado</p>
              <h3 className="font-tight text-xl font-bold text-gray-900 mb-1">¡Pago registrado!</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Tu pago fue procesado correctamente. ¿Cómo estuvo el servicio?
              </p>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="px-6 py-4 flex gap-3">
              <button
                onClick={handleSkipRating}
                className="flex-1 h-11 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Omitir
              </button>
              <button
                onClick={() => setStep('rating')}
                className="flex-1 h-11 text-sm font-bold rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white transition-all"
              >
                Calificar servicio
              </button>
            </div>
          </>
        )}

        {/* ── PAYMENT FAILED ── */}
        {step === 'payment-failed' && (
          <>
            <div className="px-6 pt-6 pb-5">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />
              <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="font-tight text-xl font-bold text-gray-900 mb-2">Error al procesar</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {payError || 'No fue posible procesar el pago. Intenta de nuevo.'}
              </p>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="px-6 py-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-11 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => { setStep('payment'); setPayError(''); }}
                className="flex-1 h-11 text-sm font-bold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors"
              >
                Reintentar
              </button>
            </div>
          </>
        )}

        {/* ── RATING STEP ── */}
        {step === 'rating' && (
          <>
            <div className="px-6 pt-6 pb-5">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>

              <h3 className="font-tight text-xl font-bold text-gray-900 mb-1">Califica el servicio</h3>
              <p className="text-sm text-gray-500 mb-6">
                {request.provider?.user?.name
                  ? `¿Cómo estuvo el trabajo de ${request.provider.user.name}?`
                  : '¿Cómo estuvo el servicio?'}
              </p>

              {/* Stars */}
              <StarSelector value={score} onChange={setScore} />

              {/* Comment */}
              <div className="mt-5">
                <label className="text-xs font-bold tracking-[0.07em] uppercase text-gray-400 block mb-2">
                  Comentario <span className="font-normal normal-case tracking-normal text-gray-400">(opcional)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={e => { setComment(e.target.value); setRatingError(''); }}
                  placeholder="Describe tu experiencia..."
                  rows={3}
                  maxLength={300}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(17,17,17,0.07)] transition-all"
                />
                <div className="flex items-center justify-between mt-1">
                  {ratingError
                    ? <p className="text-xs text-red-500">{ratingError}</p>
                    : <span />}
                  <p className="text-xs text-gray-400 tabular-nums">{comment.length}/300</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />
            <div className="px-6 py-4 flex gap-3">
              <button
                onClick={handleSkipRating}
                disabled={ratingLoading}
                className="flex-1 h-11 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Omitir
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={ratingLoading || score < 1}
                className="flex-1 h-11 text-sm font-bold rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {ratingLoading && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Enviar calificación
              </button>
            </div>
          </>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div className="px-6 py-10 flex flex-col items-center text-center gap-5">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1 sm:hidden" />
            <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-white">
                <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
                <rect x="1" y="9" width="3" height="2" rx="0.5" />
              </svg>
            </div>
            <div>
              <h3 className="font-tight text-xl font-bold text-gray-900 mb-1">¡Gracias!</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Tu servicio ha sido cerrado correctamente.<br />
                Esperamos verte pronto en Harambal.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full h-11 text-sm font-bold rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white transition-all"
            >
              Volver al inicio
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
