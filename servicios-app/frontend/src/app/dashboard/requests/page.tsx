'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { requestsApi, servicesApi } from '@/lib/api';
import { ServiceRequest, Service } from '@/types';
import { RequestCard } from '@/components/requests/RequestCard';
import { ServiceRequestDrawer } from '@/components/requests/ServiceRequestDrawer';

const FILTERS = [
  { label: 'Todas',      value: '' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Aceptadas',  value: 'ACEPTADA' },
  { label: 'En proceso', value: 'EN_PROCESO' },
  { label: 'Finalizadas', value: 'FINALIZADA' },
  { label: 'Canceladas', value: 'CANCELADA' },
];

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const reqs = await requestsApi.getAll(activeFilter || undefined);
      setRequests(reqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => {
    servicesApi.getAll().then(svcs => setServices(svcs as Service[])).catch(console.error);
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    setActionLoading(true);
    try {
      await requestsApi.updateStatus(id, status);
      await fetchRequests();
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-tight text-2xl font-bold text-gray-900 tracking-tight">Mis solicitudes</h1>
          <p className="text-sm text-gray-400 mt-1">
            {requests.length} {requests.length === 1 ? 'solicitud' : 'solicitudes'}
          </p>
        </div>
        {user?.role === 'CLIENTE' && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Nueva solicitud
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => { setActiveFilter(f.value); setLoading(true); }}
            className={`h-8 px-3 text-xs font-semibold rounded-lg transition-all duration-150 ${
              activeFilter === f.value
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 skeleton" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 rounded-xl border border-dashed border-gray-200 bg-white gap-2">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600">
              {activeFilter ? 'Sin solicitudes con este filtro' : 'No hay solicitudes'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeFilter ? 'Prueba con un filtro diferente' : 'Tus solicitudes aparecerán aquí'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map(req => (
            <RequestCard
              key={req.id}
              request={req}
              role={user?.role || 'CLIENTE'}
              onUpdateStatus={handleUpdateStatus}
              loading={actionLoading}
            />
          ))}
        </div>
      )}

      <ServiceRequestDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={fetchRequests}
        services={services}
      />
    </div>
  );
}
