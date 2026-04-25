'use client';

import { useState, useEffect, useCallback } from 'react';
import { requestsApi, servicesApi } from '@/lib/api';
import { ServiceRequest, Service } from '@/types';
import { RequestCard } from '@/components/requests/RequestCard';
import { ServiceRequestDrawer } from '@/components/requests/ServiceRequestDrawer';
import { useSocketEvents } from '@/hooks/useSocket';
import { getCatalogForService, SERVICE_LABELS } from '@/lib/catalog';
import { formatCurrency } from '@/lib/utils';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-600 mb-3">
      {children}
    </p>
  );
}

function SkeletonCard({ h = 'h-36' }: { h?: string }) {
  return <div className={`${h} rounded-xl bg-gray-900 border border-gray-800 animate-pulse`} />;
}

export default function ClientDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [preselectedId, setPreselectedId] = useState<string | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [reqs, svcs] = await Promise.all([requestsApi.getAll(), servicesApi.getAll()]);
      setRequests(reqs);
      setServices(svcs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 7000);
  };

  useSocketEvents({
    'request:accepted': () => { showToast('Solicitud registrada. En espera de que un trabajador acepte el servicio.'); fetchData(); },
    'request:status_changed': () => fetchData(),
  });

  const openDrawer = (serviceId?: string) => {
    setPreselectedId(serviceId);
    setDrawerOpen(true);
  };

  const handleCancelRequest = async (id: string, status: string) => {
    if (status !== 'CANCELADA') return;
    setActionLoading(true);
    try {
      await requestsApi.updateStatus(id, 'CANCELADA');
      await fetchData();
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const active = requests.filter(r => ['PENDIENTE', 'ACEPTADA', 'EN_PROCESO'].includes(r.status));

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {toast && (
        <div className="fixed top-4 right-4 z-40 max-w-sm px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl shadow-black/60">
          <p className="text-sm text-gray-300 leading-snug">{toast}</p>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Menú principal</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus solicitudes de servicio</p>
        </div>
        <button
          onClick={() => openDrawer()}
          className="flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva solicitud
        </button>
      </div>

      <div>
        <SectionLabel>Solicitudes activas</SectionLabel>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : active.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-gray-800 border-dashed">
            <svg className="w-8 h-8 text-gray-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-600">Sin solicitudes activas</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map(req => (
              <RequestCard
                key={req.id}
                request={req}
                role="CLIENTE"
                onUpdateStatus={handleCancelRequest}
                loading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionLabel>Servicios disponibles</SectionLabel>
        {loading ? (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} h="h-20" />)}
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {services.map(service => {
              const { key, data } = getCatalogForService(service.name);
              const label = SERVICE_LABELS[key] || service.name;
              const minPrice = data
                ? Math.min(...Object.values(data).flat().map(i => i.precio))
                : service.basePrice;
              return (
                <button
                  key={service.id}
                  onClick={() => openDrawer(service.id)}
                  className="group text-left bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-colors duration-150"
                >
                  <p className="text-sm font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {label}
                  </p>
                  <p className="text-xs text-gray-600">
                    Desde <span className="text-gray-400 font-medium">{formatCurrency(minPrice)}</span>
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ServiceRequestDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={fetchData}
        services={services}
        preselectedServiceId={preselectedId}
      />
    </div>
  );
}
