'use client';

import { useState, useEffect, useCallback } from 'react';
import { requestsApi, providersApi } from '@/lib/api';
import { ServiceRequest } from '@/types';
import { RequestCard } from '@/components/requests/RequestCard';
import { useSocketEvents } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import { ToastContainer } from '@/components/ui/Toast';

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-xs font-bold tracking-[0.08em] uppercase text-gray-400">{children}</p>
      {count !== undefined && (
        <span className="text-xs tabular-nums text-gray-400">{count}</span>
      )}
    </div>
  );
}

function Skeleton({ className = 'h-36' }: { className?: string }) {
  return <div className={`${className} skeleton`} />;
}

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availLoading, setAvailLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const reqs = await requestsApi.getAll();
      setRequests(reqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    providersApi.getMyProfile()
      .then(p => setIsAvailable(p.isAvailable ?? true))
      .catch(() => setIsAvailable(true));
  }, []);

  const toggleAvailability = async () => {
    if (isAvailable === null || availLoading) return;
    const next = !isAvailable;
    setAvailLoading(true);
    try {
      await providersApi.updateProfile({ isAvailable: next });
      setIsAvailable(next);
      showToast(next ? 'Ahora estás disponible para nuevas solicitudes' : 'Has pausado la recepción de solicitudes');
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar disponibilidad');
    } finally {
      setAvailLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useSocketEvents({
    'request:new':     () => { showToast('Nueva solicitud disponible'); fetchData(); },
    'request:updated': () => fetchData(),
  });

  const handleAccept = async (id: string) => {
    setActionLoading(true);
    try {
      await requestsApi.accept(id);
      showToast('Solicitud aceptada correctamente');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error al aceptar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setActionLoading(true);
    try {
      await requestsApi.updateStatus(id, status);
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar el estado');
    } finally {
      setActionLoading(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] ?? 'Proveedor';
  const available = requests.filter(r => r.status === 'PENDIENTE');
  const myActive  = requests.find(r => ['ACEPTADA', 'EN_PROCESO'].includes(r.status) && r.provider);

  return (
    <div className="max-w-5xl mx-auto space-y-10">

      <ToastContainer message={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-tight text-2xl font-bold text-gray-900 tracking-tight">
            Hola, {firstName}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isAvailable ? 'Estás recibiendo nuevas solicitudes' : 'Has pausado la recepción de solicitudes'}
          </p>
        </div>

        {/* Availability toggle */}
        <div
          className={`flex items-center gap-4 px-5 py-3.5 rounded-xl border transition-colors duration-300 shrink-0 ${
            isAvailable ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="relative w-2 h-2 shrink-0">
                <div className={`absolute inset-0 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                {isAvailable && (
                  <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                )}
              </div>
              <p className={`text-sm font-bold ${isAvailable ? 'text-emerald-700' : 'text-gray-400'}`}>
                {isAvailable === null ? '...' : isAvailable ? 'En línea' : 'No disponible'}
              </p>
            </div>
            <p className={`text-xs mt-0.5 pl-4 ${isAvailable ? 'text-emerald-600' : 'text-gray-400'}`}>
              {isAvailable ? 'Recibiendo solicitudes' : 'Pausado'}
            </p>
          </div>
          <button
            onClick={toggleAvailability}
            disabled={availLoading || isAvailable === null}
            aria-label="Alternar disponibilidad"
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 disabled:opacity-50 shrink-0 focus:outline-none ${
              isAvailable ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                isAvailable ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Active service */}
      {myActive && (
        <div>
          <SectionLabel>Servicio activo</SectionLabel>
          <div className="max-w-sm">
            <RequestCard
              request={myActive}
              role="PROVEEDOR"
              onUpdateStatus={handleUpdateStatus}
              loading={actionLoading}
            />
          </div>
        </div>
      )}

      {/* Available requests */}
      <div>
        <SectionLabel count={isAvailable ? available.length : undefined}>
          Solicitudes disponibles
        </SectionLabel>

        {isAvailable === false ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-gray-200 bg-white gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">No estás disponible</p>
              <p className="text-xs text-gray-400 mt-0.5">Activa tu disponibilidad para recibir solicitudes</p>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={availLoading}
              className="mt-1 h-8 px-4 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-40"
            >
              Activar disponibilidad
            </button>
          </div>
        ) : loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} />)}
          </div>
        ) : available.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 rounded-xl border border-dashed border-gray-200 bg-white gap-2">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Sin solicitudes disponibles</p>
              <p className="text-xs text-gray-400 mt-0.5">Las nuevas aparecerán aquí en tiempo real</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {available.map(req => (
              <RequestCard
                key={req.id}
                request={req}
                role="PROVEEDOR"
                onAccept={myActive ? undefined : handleAccept}
                loading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
