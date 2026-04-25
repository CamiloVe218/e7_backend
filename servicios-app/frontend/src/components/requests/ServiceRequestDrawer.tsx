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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  services: Service[];
  preselectedServiceId?: string;
}

type Step = 1 | 2 | 3 | 4;

const PAYMENT_METHODS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' },
];

interface Selection {
  serviceId: string;
  serviceKey: string;
  serviceName: string;
  category: string;
  itemIndex: number | null;
  quantity: number;
  multiQty: Record<string, number>;
  address: string;
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
  address: '',
  paymentMethod: 'EFECTIVO',
};

function Stepper({ step }: { step: Step }) {
  const labels = ['Servicio', 'Categoría', 'Tipo', 'Detalles'];
  return (
    <div className="flex items-center gap-0 px-6 py-3 border-b border-gray-800">
      {labels.map((label, i) => {
        const s = (i + 1) as Step;
        const done = s < step;
        const active = s === step;
        return (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-1.5 ${active ? 'opacity-100' : done ? 'opacity-60' : 'opacity-25'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'
              }`}>
                {done ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? 'text-white' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
            {i < 3 && (
              <div className={`w-8 h-px mx-2 ${done ? 'bg-blue-600/40' : 'bg-gray-800'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Counter({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-lg border border-gray-800 bg-gray-900 text-white font-bold hover:border-gray-700 hover:bg-gray-850 transition-colors flex items-center justify-center"
      >
        −
      </button>
      <span className="w-12 text-center text-sm font-semibold text-white tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-lg border border-gray-800 bg-gray-900 text-white font-bold hover:border-gray-700 hover:bg-gray-850 transition-colors flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}

export function ServiceRequestDrawer({ isOpen, onClose, onSuccess, services, preselectedServiceId }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [sel, setSel] = useState<Selection>(INIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

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
    if (isOpen) { reset(); setError(''); setConfirmed(false); }
  }, [isOpen, reset]);

  const catalog = sel.serviceKey ? CATALOG[sel.serviceKey] || null : null;
  const categories = catalog ? Object.keys(catalog) : [];
  const items: CatalogItem[] = catalog && sel.category ? catalog[sel.category] || [] : [];
  const item: CatalogItem | null = sel.itemIndex !== null ? items[sel.itemIndex] ?? null : null;
  const qtyConfig = sel.serviceKey ? getQuantityConfig(sel.serviceKey) : null;

  const totalQty = qtyConfig?.multiFields
    ? Object.values(sel.multiQty).reduce((a, b) => a + b, 0)
    : sel.quantity;

  const subtotal = item ? item.precio * (totalQty || 1) : 0;

  const multiOk = qtyConfig?.multiFields
    ? Object.values(sel.multiQty).reduce((a, b) => a + b, 0) > 0
    : true;

  const step4Valid = sel.address.trim().length > 0 && (qtyConfig?.multiFields ? multiOk : sel.quantity >= 1);

  const autoDesc = item
    ? (() => {
        const qPart = qtyConfig?.multiFields
          ? qtyConfig.multiFields.filter(f => (sel.multiQty[f.key] || 0) > 0).map(f => `${sel.multiQty[f.key]} ${f.label.toLowerCase()}`).join(', ')
          : `${sel.quantity} ${qtyConfig?.unit || 'unidades'}`;
        return `${sel.serviceName} - ${CATEGORY_LABELS[sel.category] || sel.category}: ${item.nombre} (${qPart})`;
      })()
    : '';

  const handleService = (svc: Service) => {
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

  const handleSubmit = async () => {
    if (!sel.address.trim()) { setError('La dirección es requerida'); return; }
    if (qtyConfig?.multiFields && !multiOk) { setError('Ingresa al menos una cantidad'); return; }
    setLoading(true);
    setError('');
    try {
      await requestsApi.create({
        serviceId: sel.serviceId,
        description: autoDesc,
        address: sel.address.trim(),
        lat: 19.4326,
        lng: -99.1332,
        price: subtotal || undefined,
        paymentMethod: sel.paymentMethod,
      });
      setConfirmed(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const payLabel = PAYMENT_METHODS.find(p => p.value === sel.paymentMethod)?.label || sel.paymentMethod;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
      <div className="flex items-center gap-3 px-6 py-0 h-14 border-b border-gray-800 shrink-0">
        {step > 1 && !confirmed && (
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex-1 flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
              <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
              <rect x="1" y="9" width="3" height="2" rx="0.5" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-white">
            {confirmed ? 'Solicitud registrada' : sel.serviceName || 'Nueva solicitud'}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!confirmed && <Stepper step={step} />}

      <div className="flex-1 overflow-y-auto">
        {confirmed ? (
          <div className="flex flex-col items-center justify-center min-h-full px-6 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-950/50 border border-emerald-900/60 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Solicitud enviada</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
              En espera de que un trabajador acepte el servicio.
            </p>

            <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
              {[
                { label: 'Servicio', value: sel.serviceName },
                { label: 'Categoría', value: CATEGORY_LABELS[sel.category] || sel.category },
                { label: 'Trabajo', value: item?.nombre },
                qtyConfig?.multiFields
                  ? null
                  : { label: 'Cantidad', value: `${sel.quantity} ${qtyConfig?.unit}` },
                { label: 'Método de pago', value: payLabel },
                { label: 'Ubicación', value: sel.address },
              ].filter(Boolean).map((row, i) => row && (
                <div key={i} className="flex items-start justify-between px-4 py-2.5 border-b border-gray-800 last:border-0">
                  <span className="text-xs text-gray-600 shrink-0 w-28">{row.label}</span>
                  <span className="text-xs text-gray-300 text-right">{row.value}</span>
                </div>
              ))}
              {qtyConfig?.multiFields && qtyConfig.multiFields.filter(f => (sel.multiQty[f.key] || 0) > 0).map(f => (
                <div key={f.key} className="flex justify-between px-4 py-2.5 border-b border-gray-800">
                  <span className="text-xs text-gray-600">{f.label}</span>
                  <span className="text-xs text-gray-300">{sel.multiQty[f.key]}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 bg-gray-850">
                <span className="text-xs font-semibold text-gray-400">Total estimado</span>
                <span className="text-sm font-bold text-white">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <div className="flex gap-3 w-full max-w-sm">
              <button
                onClick={() => { setConfirmed(false); setSel(INIT); setStep(1); setError(''); }}
                className="flex-1 h-10 text-sm font-medium rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-750 transition-colors"
              >
                Pedir más
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-10 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        ) : step === 1 ? (
          <div className="max-w-2xl mx-auto px-6 py-8">
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-600 mb-4">
              Selecciona un servicio
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {services.map(svc => {
                const { key } = getCatalogForService(svc.name);
                return (
                  <button
                    key={svc.id}
                    onClick={() => handleService(svc)}
                    className="p-4 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-850 text-left transition-colors group"
                  >
                    <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors leading-tight">
                      {SERVICE_LABELS[key] || svc.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : step === 2 ? (
          <div className="max-w-lg mx-auto px-6 py-8">
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-600 mb-1">{sel.serviceName}</p>
            <p className="text-sm text-gray-500 mb-6">Selecciona la categoría del trabajo</p>
            <div className="space-y-2">
              {categories.map(cat => {
                const catItems = catalog![cat];
                const min = Math.min(...catItems.map(i => i.precio));
                const max = Math.max(...catItems.map(i => i.precio));
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategory(cat)}
                    className="w-full flex items-center justify-between px-4 py-4 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-850 transition-colors text-left group"
                  >
                    <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">{formatCurrency(min)} – {formatCurrency(max)}</span>
                      <svg className="w-4 h-4 text-gray-700 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : step === 3 ? (
          <div className="max-w-lg mx-auto px-6 py-8">
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-600 mb-1">
              {sel.serviceName} · {CATEGORY_LABELS[sel.category] || sel.category}
            </p>
            <p className="text-sm text-gray-500 mb-6">Selecciona el tipo de trabajo</p>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <button
                  key={idx}
                  onClick={() => handleItem(idx)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-850 transition-colors text-left group"
                >
                  <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                    {it.nombre}
                  </span>
                  <span className="text-sm font-semibold text-white tabular-nums ml-4">
                    {formatCurrency(it.precio)}
                    {['jardineria', 'pintura'].includes(sel.serviceKey) && (
                      <span className="text-xs font-normal text-gray-600"> /m²</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto px-6 py-8 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-600 px-4 pt-3 pb-2">
                Resumen de selección
              </p>
              {[
                { label: 'Servicio', value: sel.serviceName },
                { label: 'Categoría', value: CATEGORY_LABELS[sel.category] || sel.category },
                { label: 'Trabajo', value: item?.nombre },
                { label: 'Precio unitario', value: `${formatCurrency(item?.precio ?? 0)}${['jardineria', 'pintura'].includes(sel.serviceKey) ? ' /m²' : ''}` },
              ].map((row, i) => (
                <div key={i} className="flex justify-between px-4 py-2 border-t border-gray-800">
                  <span className="text-xs text-gray-600">{row.label}</span>
                  <span className="text-xs text-gray-300 font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-600 mb-3">
                {qtyConfig?.label || 'Cantidad'}
              </p>
              {qtyConfig?.multiFields ? (
                <div className="space-y-3">
                  {qtyConfig.multiFields.map(f => (
                    <div key={f.key} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-300">{f.label}</span>
                      <Counter
                        value={sel.multiQty[f.key] || 0}
                        onChange={v => setSel(p => ({ ...p, multiQty: { ...p.multiQty, [f.key]: v } }))}
                        min={0}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Counter
                    value={sel.quantity}
                    onChange={v => setSel(p => ({ ...p, quantity: v }))}
                    min={qtyConfig?.min ?? 1}
                  />
                  <span className="text-sm text-gray-600">{qtyConfig?.unit}</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-600 mb-3">
                Método de pago
              </p>
              <div className="flex gap-2">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setSel(p => ({ ...p, paymentMethod: pm.value }))}
                    className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-colors ${
                      sel.paymentMethod === pm.value
                        ? 'border-blue-600/60 bg-blue-600/10 text-blue-400'
                        : 'border-gray-800 bg-gray-900 text-gray-500 hover:border-gray-700 hover:text-gray-300'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-600 mb-2">
                Dirección del servicio
              </p>
              <input
                type="text"
                value={sel.address}
                onChange={e => { setSel(p => ({ ...p, address: e.target.value })); setError(''); }}
                placeholder="Calle, número, colonia, ciudad"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {autoDesc && (
              <div>
                <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-600 mb-2">
                  Descripción generada
                </p>
                <p className="text-xs text-gray-500 leading-relaxed bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5">
                  {autoDesc}
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-950/30 border border-red-900/50">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {!confirmed && step === 4 && (
        <div className="shrink-0 border-t border-gray-800 bg-gray-900 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-600 space-y-0.5">
              <p className="text-gray-400 font-medium">{sel.serviceName}</p>
              <p>{CATEGORY_LABELS[sel.category] || sel.category} · {item?.nombre}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-600 mb-0.5">Total estimado</p>
              <p className="text-xl font-bold text-white tabular-nums">{formatCurrency(subtotal)}</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !step4Valid}
            className="w-full h-10 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
