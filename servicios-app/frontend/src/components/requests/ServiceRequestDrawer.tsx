'use client';

import { useState, useEffect, useCallback } from 'react';
import { Service } from '@/types';
import { requestsApi } from '@/lib/api';
import {
  CATALOG,
  CATEGORY_LABELS,
  SERVICE_LABELS,
  CatalogItem,
  getCatalogForService,
  getQuantityConfig,
} from '@/lib/catalog';
import { formatCurrency } from '@/lib/utils';

const ADDRESS_KEY = 'harambal_user_address';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  services: Service[];
  preselectedServiceId?: string;
}

type Step = 1 | 2 | 3 | 4;
type Phase = 'form' | 'verifying' | 'payment-success' | 'success' | 'rejected' | 'thankyou';

const PAYMENT_METHODS = [
  { value: 'EFECTIVO',      label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA',       label: 'Tarjeta' },
];

interface CardForm {
  number: string;
  name: string;
  cvv: string;
  expiry: string;
}

interface Selection {
  serviceId: string;
  serviceKey: string;
  serviceName: string;
  category: string;
  itemIndex: number | null;
  quantity: number;
  multiQty: Record<string, number>;
  paymentMethod: string;
}

const INIT: Selection = {
  serviceId: '',
  serviceKey: '',
  serviceName: '',
  category: '',
  itemIndex: null,
  quantity: 1,
  multiQty: {},
  paymentMethod: 'EFECTIVO',
};

const CARD_INIT: CardForm = { number: '', name: '', cvv: '', expiry: '' };

// ── Card utilities ──────────────────────────────────────────────────────────

function getCardBrand(number: string): 'visa' | 'mastercard' | 'amex' | null {
  const n = number.replace(/\s/g, '');
  if (!n) return null;
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return null;
}

function formatCardNumber(value: string, brand: string | null): string {
  const digits = value.replace(/\D/g, '');
  const maxLen = brand === 'amex' ? 15 : 16;
  const trimmed = digits.slice(0, maxLen);
  if (brand === 'amex') {
    return trimmed.replace(/^(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(' '),
    );
  }
  return trimmed.replace(/(.{4})/g, '$1 ').trim();
}

function validateCard(card: CardForm): Record<keyof CardForm, string> {
  const errs: Record<keyof CardForm, string> = { number: '', name: '', cvv: '', expiry: '' };
  const digits = card.number.replace(/\s/g, '');
  const brand = getCardBrand(card.number);
  const minLen = brand === 'amex' ? 15 : 16;
  if (digits.length < minLen) errs.number = `Número inválido (${minLen} dígitos)`;
  if (!card.name.trim()) errs.name = 'Nombre requerido';
  const cvvLen = brand === 'amex' ? 4 : 3;
  if (!new RegExp(`^\\d{${cvvLen}}$`).test(card.cvv)) errs.cvv = `${cvvLen} dígitos`;
  if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
    errs.expiry = 'Formato MM/YY';
  } else {
    const [mm, yy] = card.expiry.split('/').map(Number);
    if (mm < 1 || mm > 12) {
      errs.expiry = 'Mes inválido';
    } else {
      const now = new Date();
      const exp = new Date(2000 + yy, mm - 1, 1);
      if (exp < new Date(now.getFullYear(), now.getMonth(), 1)) errs.expiry = 'Tarjeta expirada';
    }
  }
  return errs;
}

function CardBrandBadge({ brand }: { brand: 'visa' | 'mastercard' | 'amex' | null }) {
  if (!brand) return null;
  const labels = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX' };
  const colors = {
    visa: 'text-blue-700 bg-blue-50 border-blue-200',
    mastercard: 'text-red-700 bg-red-50 border-red-200',
    amex: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border tracking-wider ${colors[brand]}`}>
      {labels[brand]}
    </span>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Stepper({ step }: { step: Step }) {
  const labels = ['Servicio', 'Categoría', 'Tipo', 'Detalles'];
  return (
    <div className="flex items-center gap-0 px-6 py-3.5 border-b border-gray-200 bg-white">
      {labels.map((label, i) => {
        const s = (i + 1) as Step;
        const done = s < step;
        const active = s === step;
        return (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-1.5 transition-opacity duration-200 ${active ? 'opacity-100' : done ? 'opacity-70' : 'opacity-30'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${done || active ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {done ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? 'text-gray-900' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < 3 && <div className={`w-8 h-px mx-2 transition-colors ${done ? 'bg-gray-900/30' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

function Counter({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center text-base leading-none select-none">−</button>
      <span className="w-10 text-center text-sm font-bold text-gray-900 tabular-nums">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center text-base leading-none select-none">+</button>
    </div>
  );
}

const OVERLINE = 'text-[10px] font-bold tracking-[0.1em] uppercase text-gray-400';

// ── Card form component ─────────────────────────────────────────────────────

function CardFormSection({
  card,
  errors,
  onChange,
}: {
  card: CardForm;
  errors: Record<keyof CardForm, string>;
  onChange: (field: keyof CardForm, value: string) => void;
}) {
  const brand = getCardBrand(card.number);
  const inputBase = 'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors duration-150 font-mono tracking-wider';
  const inputCls = (f: keyof CardForm) =>
    `${inputBase} ${errors[f] ? 'border-red-300 focus:border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300 focus:border-gray-900'}`;

  return (
    <div className="space-y-3.5 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Card number */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={OVERLINE}>Número de tarjeta</label>
          <CardBrandBadge brand={brand} />
        </div>
        <input
          value={card.number}
          onChange={e => {
            const formatted = formatCardNumber(e.target.value, brand);
            onChange('number', formatted);
          }}
          placeholder="0000 0000 0000 0000"
          inputMode="numeric"
          className={inputCls('number')}
        />
        {errors.number && <p className="text-[10px] text-red-500">{errors.number}</p>}
      </div>

      {/* Cardholder name */}
      <div className="space-y-1.5">
        <label className={OVERLINE}>Nombre del titular</label>
        <input
          value={card.name}
          onChange={e => onChange('name', e.target.value.toUpperCase())}
          placeholder="TAL COMO APARECE EN LA TARJETA"
          className={`${inputCls('name')} font-sans tracking-normal`}
        />
        {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
      </div>

      {/* CVV + Expiry */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className={OVERLINE}>CVV</label>
          <input
            value={card.cvv}
            onChange={e => {
              if (/^\d{0,4}$/.test(e.target.value)) onChange('cvv', e.target.value);
            }}
            placeholder="•••"
            inputMode="numeric"
            maxLength={4}
            className={inputCls('cvv')}
          />
          {errors.cvv && <p className="text-[10px] text-red-500">{errors.cvv}</p>}
        </div>
        <div className="space-y-1.5">
          <label className={OVERLINE}>Vencimiento</label>
          <input
            value={card.expiry}
            onChange={e => {
              let v = e.target.value.replace(/\D/g, '').slice(0, 4);
              if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
              onChange('expiry', v);
            }}
            placeholder="MM/YY"
            inputMode="numeric"
            maxLength={5}
            className={inputCls('expiry')}
          />
          {errors.expiry && <p className="text-[10px] text-red-500">{errors.expiry}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function ServiceRequestDrawer({ isOpen, onClose, onSuccess, services, preselectedServiceId }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [sel, setSel] = useState<Selection>(INIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [card, setCard] = useState<CardForm>(CARD_INIT);
  const [cardErrors, setCardErrors] = useState<Record<keyof CardForm, string>>({ number: '', name: '', cvv: '', expiry: '' });
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const storedAddress = typeof window !== 'undefined'
    ? localStorage.getItem(ADDRESS_KEY) || 'Domicilio registrado'
    : 'Domicilio registrado';

  const reset = useCallback(() => {
    if (preselectedServiceId) {
      const svc = services.find(s => s.id === preselectedServiceId);
      if (svc) {
        const { key } = getCatalogForService(svc.name);
        setSel({ ...INIT, serviceId: svc.id, serviceKey: key, serviceName: svc.name });
        setStep(2);
        return;
      }
    }
    setSel(INIT);
    setStep(1);
  }, [preselectedServiceId, services]);

  useEffect(() => {
    if (isOpen) { reset(); setError(''); setPhase('form'); setCard(CARD_INIT); setCardErrors({ number: '', name: '', cvv: '', expiry: '' }); setShowPaymentOptions(false); }
  }, [isOpen, reset]);

  const catalog    = sel.serviceKey ? CATALOG[sel.serviceKey] || null : null;
  const categories = catalog ? Object.keys(catalog) : [];
  const items: CatalogItem[] = catalog && sel.category ? catalog[sel.category] || [] : [];
  const item: CatalogItem | null = sel.itemIndex !== null ? items[sel.itemIndex] ?? null : null;
  const qtyConfig  = sel.serviceKey ? getQuantityConfig(sel.serviceKey) : null;

  const totalQty = qtyConfig?.multiFields
    ? Object.values(sel.multiQty).reduce((a, b) => a + b, 0)
    : sel.quantity;

  const subtotal = item ? item.precio * (totalQty || 1) : 0;

  const multiOk = qtyConfig?.multiFields
    ? Object.values(sel.multiQty).reduce((a, b) => a + b, 0) > 0
    : true;

  const quantityOk = qtyConfig?.multiFields ? multiOk : sel.quantity >= 1;
  const step4Valid = quantityOk;

  const autoDesc = item
    ? (() => {
        const qPart = qtyConfig?.multiFields
          ? qtyConfig.multiFields.filter(f => (sel.multiQty[f.key] || 0) > 0).map(f => `${sel.multiQty[f.key]} ${f.label.toLowerCase()}`).join(', ')
          : `${sel.quantity} ${qtyConfig?.unit || 'unidades'}`;
        return `${sel.serviceName} - ${CATEGORY_LABELS[sel.category] || sel.category}: ${item.nombre} (${qPart})`;
      })()
    : '';

  const handleService  = (svc: Service) => {
    const { key } = getCatalogForService(svc.name);
    setSel({ ...INIT, serviceId: svc.id, serviceKey: key, serviceName: svc.name });
    setStep(2);
  };

  const handleCategory = (cat: string) => {
    setSel(p => ({ ...p, category: cat, itemIndex: null, quantity: 1, multiQty: {} }));
    setStep(3);
  };

  const handleItem = (idx: number) => {
    setSel(p => ({ ...p, itemIndex: idx, quantity: 1, multiQty: {} }));
    setStep(4);
  };

  const handleBack = () => {
    if (step === 2) { setSel(INIT); setStep(1); }
    else if (step === 3) { setSel(p => ({ ...p, category: '', itemIndex: null })); setStep(2); }
    else if (step === 4) { setSel(p => ({ ...p, itemIndex: null, quantity: 1, multiQty: {} })); setStep(3); }
  };

  const handleCardChange = (field: keyof CardForm, value: string) => {
    setCard(p => ({ ...p, [field]: value }));
    setCardErrors(p => ({ ...p, [field]: '' }));
  };

  const handleSubmit = async () => {
    if (!quantityOk) { setError('Ingresa al menos una cantidad'); return; }

    // Card validation path
    if (sel.paymentMethod === 'TARJETA') {
      const errs = validateCard(card);
      const hasErr = Object.values(errs).some(Boolean);
      if (hasErr) { setCardErrors(errs); return; }

      setPhase('verifying');
      const apiCall = requestsApi.create({
        serviceId: sel.serviceId,
        description: autoDesc,
        address: storedAddress,
        lat: 19.4326,
        lng: -99.1332,
        price: subtotal || undefined,
        paymentMethod: sel.paymentMethod,
      });
      const timer = new Promise<void>(r => setTimeout(r, 5000));

      try {
        await Promise.all([apiCall, timer]);
        setPhase('payment-success');
        onSuccess();
        setTimeout(() => setShowPaymentOptions(true), 2000);
      } catch {
        await timer;
        setPhase('rejected');
      }
      return;
    }

    // Direct path (EFECTIVO / TRANSFERENCIA)
    setLoading(true);
    setError('');
    try {
      await requestsApi.create({
        serviceId: sel.serviceId,
        description: autoDesc,
        address: storedAddress,
        lat: 19.4326,
        lng: -99.1332,
        price: subtotal || undefined,
        paymentMethod: sel.paymentMethod,
      });
      setPhase('success');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const payLabel = PAYMENT_METHODS.find(p => p.value === sel.paymentMethod)?.label || sel.paymentMethod;

  // ── Verifying screen ───────────────────────────────────────────────────────
  if (phase === 'verifying') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-6">
        <div className="flex flex-col items-center gap-8 text-center max-w-sm">
          {/* Animated spinner */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            <div className="absolute inset-0 rounded-full border-4 border-gray-900 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="font-tight text-2xl font-bold text-gray-900 mb-2">Verificando pago...</h2>
            <p className="text-sm text-gray-500 leading-relaxed">Estamos procesando tu tarjeta de forma segura. Por favor espera.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Rejected screen ────────────────────────────────────────────────────────
  if (phase === 'rejected') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-6">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <svg className="w-9 h-9 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h2 className="font-tight text-2xl font-bold text-gray-900 mb-2">Pago rechazado</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              No pudimos procesar tu tarjeta.<br />Intenta nuevamente más tarde o usa otro método de pago.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => { setPhase('form'); setCard(CARD_INIT); setCardErrors({ number: '', name: '', cvv: '', expiry: '' }); }} className="flex-1 h-11 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
              Reintentar
            </button>
            <button onClick={onClose} className="flex-1 h-11 text-sm font-semibold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment success screen ─────────────────────────────────────────────────
  if (phase === 'payment-success') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-6">
        <div className="flex flex-col items-center gap-8 text-center max-w-sm">
          {/* Animated checkmark */}
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-emerald-50 border-2 border-emerald-100" />
            <div className="absolute inset-2 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-emerald-500 mb-2">Pago procesado</p>
            <h2 className="font-tight text-3xl font-black text-gray-900 tracking-tight mb-3">Pago realizado<br />con éxito</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Tu pago fue aprobado.<br />Un trabajador aceptará tu solicitud pronto.
            </p>
          </div>
        </div>

        {/* Options modal */}
        {showPaymentOptions && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="px-7 pt-7 pb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-tight text-lg font-bold text-gray-900 mb-1">¿Qué deseas hacer?</h3>
                <p className="text-sm text-gray-500">Tu solicitud está en camino.</p>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="px-7 py-5 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setShowPaymentOptions(false);
                    setPhase('form');
                    setSel(INIT);
                    setStep(1);
                    setCard(CARD_INIT);
                    setCardErrors({ number: '', name: '', cvv: '', expiry: '' });
                  }}
                  className="w-full h-11 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  Continuar solicitando servicios
                </button>
                <button
                  onClick={() => { setShowPaymentOptions(false); setPhase('thankyou'); }}
                  className="w-full h-11 text-sm font-bold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                >
                  Volver al menú principal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Thank you screen ───────────────────────────────────────────────────────
  if (phase === 'thankyou') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-8">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-24 h-24 rounded-3xl bg-gray-900 flex items-center justify-center mb-8 shadow-xl">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-12 h-12 text-white">
              <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
              <rect x="1" y="9" width="3" height="2" rx="0.5" />
            </svg>
          </div>
          <h1 className="font-tight text-4xl font-black text-gray-900 tracking-tighter mb-3">Harambal</h1>
          <p className="font-tight text-2xl font-bold text-gray-800 mb-4 leading-snug">¡Gracias por tu preferencia!</p>
          <p className="text-sm text-gray-500 leading-relaxed mb-12">
            Tu solicitud está en camino.<br />Esperamos verte pronto.
          </p>
          <button
            onClick={onClose}
            className="h-12 px-10 text-sm font-bold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-gray-200 shrink-0 bg-white">
        {step > 1 && phase === 'form' && (
          <button onClick={handleBack} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
              <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
              <rect x="1" y="9" width="3" height="2" rx="0.5" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 truncate">
            {phase === 'success' ? 'Solicitud registrada' : sel.serviceName || 'Nueva solicitud'}
          </h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Stepper */}
      {phase === 'form' && <Stepper step={step} />}

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">

        {/* ── Success screen ── */}
        {phase === 'success' ? (
          <div className="flex flex-col items-center justify-center min-h-full px-6 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-tight text-xl font-bold text-gray-900 mb-2">Solicitud enviada</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
              En espera de que un trabajador acepte el servicio.
            </p>

            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl overflow-hidden mb-8 text-left shadow-card">
              {[
                { label: 'Servicio',       value: sel.serviceName },
                { label: 'Categoría',      value: CATEGORY_LABELS[sel.category] || sel.category },
                { label: 'Trabajo',        value: item?.nombre },
                qtyConfig?.multiFields ? null : { label: 'Cantidad', value: `${sel.quantity} ${qtyConfig?.unit}` },
                { label: 'Método de pago', value: payLabel },
                { label: 'Ubicación',      value: storedAddress },
              ].filter(Boolean).map((row, i) => row && (
                <div key={i} className="flex items-start justify-between px-4 py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-xs text-gray-400 shrink-0 w-28">{row.label}</span>
                  <span className="text-xs text-gray-800 font-medium text-right">{row.value}</span>
                </div>
              ))}
              {qtyConfig?.multiFields && qtyConfig.multiFields.filter(f => (sel.multiQty[f.key] || 0) > 0).map(f => (
                <div key={f.key} className="flex justify-between px-4 py-2.5 border-b border-gray-100">
                  <span className="text-xs text-gray-400">{f.label}</span>
                  <span className="text-xs text-gray-800 font-medium">{sel.multiQty[f.key]}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total estimado</span>
                <span className="text-base font-bold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <div className="flex gap-3 w-full max-w-sm">
              <button
                onClick={() => { setPhase('form'); setSel(INIT); setStep(1); setError(''); setCard(CARD_INIT); }}
                className="flex-1 h-10 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Pedir más
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-10 text-sm font-semibold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>

        ) : step === 1 ? (
          /* ── Step 1: Selecciona servicio ── */
          <div className="max-w-2xl mx-auto px-6 py-8">
            <p className={`${OVERLINE} mb-5`}>Selecciona un servicio</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {services.map(svc => {
                const { key } = getCatalogForService(svc.name);
                return (
                  <button key={svc.id} onClick={() => handleService(svc)} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-900 hover:shadow-sm text-left transition-all duration-150 group">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{SERVICE_LABELS[key] || svc.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

        ) : step === 2 ? (
          /* ── Step 2: Categoría ── */
          <div className="max-w-lg mx-auto px-6 py-8">
            <p className={`${OVERLINE} mb-1`}>{sel.serviceName}</p>
            <p className="text-sm text-gray-500 mb-6">Selecciona la categoría del trabajo</p>
            <div className="space-y-2">
              {categories.map(cat => {
                const catItems = catalog![cat];
                const min = Math.min(...catItems.map(i => i.precio));
                const max = Math.max(...catItems.map(i => i.precio));
                return (
                  <button key={cat} onClick={() => handleCategory(cat)} className="w-full flex items-center justify-between px-4 py-4 rounded-xl border border-gray-200 bg-white hover:border-gray-900 hover:shadow-sm transition-all duration-150 text-left group">
                    <span className="text-sm font-semibold text-gray-900">{CATEGORY_LABELS[cat] || cat}</span>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-gray-400">{formatCurrency(min)} – {formatCurrency(max)}</span>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        ) : step === 3 ? (
          /* ── Step 3: Tipo de trabajo ── */
          <div className="max-w-lg mx-auto px-6 py-8">
            <p className={`${OVERLINE} mb-1`}>{sel.serviceName} · {CATEGORY_LABELS[sel.category] || sel.category}</p>
            <p className="text-sm text-gray-500 mb-6">Selecciona el tipo de trabajo</p>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <button key={idx} onClick={() => handleItem(idx)} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 bg-white hover:border-gray-900 hover:shadow-sm transition-all duration-150 text-left group">
                  <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">{it.nombre}</span>
                  <span className="text-sm font-bold text-gray-900 tabular-nums ml-4 shrink-0">
                    {formatCurrency(it.precio)}
                    {['jardineria', 'pintura'].includes(sel.serviceKey) && <span className="text-xs font-normal text-gray-400"> /m²</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>

        ) : (
          /* ── Step 4: Detalles ── */
          <div className="max-w-lg mx-auto px-6 py-8 space-y-6">

            {/* Summary */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-card">
              <p className={`${OVERLINE} px-4 pt-3.5 pb-2.5`}>Resumen de selección</p>
              {[
                { label: 'Servicio',        value: sel.serviceName },
                { label: 'Categoría',       value: CATEGORY_LABELS[sel.category] || sel.category },
                { label: 'Trabajo',         value: item?.nombre },
                { label: 'Precio unitario', value: `${formatCurrency(item?.precio ?? 0)}${['jardineria', 'pintura'].includes(sel.serviceKey) ? ' /m²' : ''}` },
              ].map((row, i) => (
                <div key={i} className="flex justify-between px-4 py-2.5 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{row.label}</span>
                  <span className="text-xs text-gray-800 font-semibold">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div>
              <p className={`${OVERLINE} mb-4`}>{qtyConfig?.label || 'Cantidad'}</p>
              {qtyConfig?.multiFields ? (
                <div className="space-y-3">
                  {qtyConfig.multiFields.map(f => (
                    <div key={f.key} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700">{f.label}</span>
                      <Counter value={sel.multiQty[f.key] || 0} onChange={v => setSel(p => ({ ...p, multiQty: { ...p.multiQty, [f.key]: v } }))} min={0} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Counter value={sel.quantity} onChange={v => setSel(p => ({ ...p, quantity: v }))} min={qtyConfig?.min ?? 1} />
                  <span className="text-sm text-gray-500">{qtyConfig?.unit}</span>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div>
              <p className={`${OVERLINE} mb-3`}>Método de pago</p>
              <div className="flex gap-2 mb-4">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => { setSel(p => ({ ...p, paymentMethod: pm.value })); setCardErrors({ number: '', name: '', cvv: '', expiry: '' }); }}
                    className={`flex-1 h-9 rounded-xl border text-sm font-semibold transition-all duration-150 ${
                      sel.paymentMethod === pm.value
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-800'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>

              {/* Efectivo info */}
              {sel.paymentMethod === 'EFECTIVO' && (
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-100">
                  <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    El pago deberá realizarse directamente al trabajador una vez finalizado el servicio.
                  </p>
                </div>
              )}

              {/* Transferencia info */}
              {sel.paymentMethod === 'TRANSFERENCIA' && (
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-blue-50 border border-blue-100">
                  <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Recibirás los datos de transferencia una vez que el trabajador acepte el servicio.
                  </p>
                </div>
              )}

              {/* Tarjeta form */}
              {sel.paymentMethod === 'TARJETA' && (
                <CardFormSection card={card} errors={cardErrors} onChange={handleCardChange} />
              )}
            </div>

            {/* Address indicator (read-only) */}
            <div>
              <p className={`${OVERLINE} mb-2`}>Dirección del servicio</p>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-600">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{storedAddress}</span>
              </div>
            </div>

            {/* Auto-description */}
            {autoDesc && (
              <div>
                <p className={`${OVERLINE} mb-2`}>Descripción generada</p>
                <p className="text-xs text-gray-500 leading-relaxed bg-white border border-gray-200 rounded-xl px-3.5 py-2.5">{autoDesc}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer — step 4 only */}
      {phase === 'form' && step === 4 && (
        <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-gray-800">{sel.serviceName}</p>
              <p className="text-xs text-gray-400">{CATEGORY_LABELS[sel.category] || sel.category} · {item?.nombre}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide font-semibold">Total estimado</p>
              <p className="text-xl font-bold text-gray-900 tabular-nums">{formatCurrency(subtotal)}</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !step4Valid}
            className="w-full h-11 text-sm font-bold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Confirmar solicitud
          </button>
        </div>
      )}
    </div>
  );
}
