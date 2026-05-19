'use client';

import { useState, useEffect, useCallback } from 'react';
import { requestsApi, servicesApi } from '@/lib/api';
import { ServiceRequest, Service } from '@/types';
import { RequestCard } from '@/components/requests/RequestCard';
import { ServiceRequestDrawer } from '@/components/requests/ServiceRequestDrawer';
import { useSocketEvents } from '@/hooks/useSocket';
import { getCatalogForService, SERVICE_LABELS } from '@/lib/catalog';
import { formatCurrency } from '@/lib/utils';

function Overline({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-gray-400 mb-4">
      {children}
    </p>
  );
}

function Skeleton({ className = 'h-36' }: { className?: string }) {
  return <div className={`${className} rounded-xl bg-gray-200 animate-pulse`} />;
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-gray-200 bg-white">
      <div className="text-gray-300 mb-3">{icon}</div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
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
    'request:accepted':      () => { showToast('En espera de que un trabajador acepte el servicio.'); fetchData(); },
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

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-40 max-w-sm px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-dropdown">
          <p className="text-sm text-gray-700 leading-snug">{toast}</p>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-tight text-2xl font-bold text-gray-900 tracking-tight">Menú principal</h1>
          <p className="text-sm text-gray-400 mt-1">Gestiona tus solicitudes de servicio</p>
        </div>
        <button
          onClick={() => openDrawer()}
          className="flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nueva solicitud
        </button>
      </div>

      {/* Active requests */}
      <div>
        <Overline>Solicitudes activas</Overline>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} />)}
          </div>
        ) : active.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            message="Sin solicitudes activas"
          />
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

      {/* Services catalog */}
      <div>
        <Overline>Servicios disponibles</Overline>
        {loading ? (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
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
                  className="group text-left bg-white border border-gray-200 hover:border-gray-900 hover:shadow-sm rounded-xl p-4 transition-all duration-150"
                >
                  <p className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
                    {label}
                  </p>
                  <p className="text-xs text-gray-400">
                    Desde <span className="font-semibold text-gray-600">{formatCurrency(minPrice)}</span>
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
