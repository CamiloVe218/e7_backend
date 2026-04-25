'use client';

import { useState, useEffect, useCallback } from 'react';
import { requestsApi } from '@/lib/api';
import { ServiceRequest } from '@/types';
import { RequestCard } from '@/components/requests/RequestCard';
import { useSocketEvents } from '@/hooks/useSocket';

export default function ProviderDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useSocketEvents({
    'request:new': () => { showToast('Nueva solicitud disponible'); fetchData(); },
    'request:updated': () => fetchData(),
  });

  const handleAccept = async (id: string) => {
    setActionLoading(true);
    try {
      await requestsApi.accept(id);
      showToast('Solicitud aceptada');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error al aceptar');
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
      showToast(err.message || 'Error al actualizar');
    } finally {
      setActionLoading(false);
    }
  };

  const available = requests.filter(r => r.status === 'PENDIENTE');
  const myActive = requests.find(r => ['ACEPTADA', 'EN_PROCESO'].includes(r.status) && r.provider);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {toast && (
        <div className="fixed top-4 right-4 z-40 max-w-sm px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl shadow-black/60">
          <p className="text-sm text-gray-300">{toast}</p>
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Menú principal</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona las solicitudes disponibles</p>
      </div>

      {myActive && (
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-600 mb-3">
            Servicio activo
          </p>
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

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-600">
            Solicitudes disponibles
          </p>
          <span className="text-xs text-gray-600 tabular-nums">{available.length}</span>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 rounded-xl bg-gray-900 border border-gray-800 animate-pulse" />
            ))}
          </div>
        ) : available.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-gray-800 border-dashed">
            <svg className="w-8 h-8 text-gray-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm text-gray-600">No hay solicitudes disponibles</p>
            <p className="text-xs text-gray-700 mt-1">Las nuevas apareceran aquí en tiempo real</p>
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
