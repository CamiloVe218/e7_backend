'use client';

import { useState, useEffect, useCallback } from 'react';
import { requestsApi, servicesApi } from '@/lib/api';
import { ServiceRequest, Service } from '@/types';
import { RequestCard } from '@/components/requests/RequestCard';
import { ServiceRequestDrawer } from '@/components/requests/ServiceRequestDrawer';
import { useSocketEvents } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getCatalogForService, SERVICE_LABELS } from '@/lib/catalog';
import { formatCurrency } from '@/lib/utils';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold tracking-[0.08em] uppercase text-gray-400 mb-4">
      {children}
    </p>
  );
}

function Skeleton({ className = 'h-36' }: { className?: string }) {
  return <div className={`${className} skeleton`} />;
}

function EmptyRequests({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 rounded-xl border border-dashed border-gray-200 bg-white gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-600">Sin solicitudes activas</p>
        <p className="text-xs text-gray-400 mt-0.5">Contrata un servicio para comenzar</p>
      </div>
      <button
        onClick={onNew}
        className="mt-1 h-9 px-4 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
      >
        Nueva solicitud
      </button>
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl">
      <span className={`text-lg font-bold tabular-nums font-tight ${accent}`}>{value}</span>
      <span className="text-xs text-gray-400 leading-tight">{label}</span>
    </div>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [preselectedId, setPreselectedId] = useState<string | undefined>();

  const fetchData = useCallback(async () => {
    try {
      const [reqs, svcs] = await Promise.all([requestsApi.getAll(), servicesApi.getAll()]);
      setRequests(reqs);
      setServices(svcs);
    } catch {
      // silent — user stays on stale data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useSocketEvents({
    'request:accepted':       () => { success('¡Tu solicitud fue aceptada por un proveedor!'); fetchData(); },
    'request:status_changed': () => { fetchData(); },
    // request:status_changed already refreshes data; this handler only shows the toast.
    'request:completed':      () => { info('Tu servicio ha sido completado.'); },
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
      toastError(err.message || 'Error al cancelar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] ?? 'Cliente';
  const active    = requests.filter(r => ['PENDIENTE', 'ACEPTADA', 'EN_PROCESO', 'FINALIZADA'].includes(r.status) && !r.rating);
  const pending   = requests.filter(r => r.status === 'PENDIENTE').length;
  const inProg    = requests.filter(r => ['ACEPTADA', 'EN_PROCESO'].includes(r.status)).length;
  const done      = requests.filter(r => r.status === 'FINALIZADA').length;

  return (
    <div className="max-w-5xl mx-auto space-y-10">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold tracking-[0.08em] uppercase text-blue-600 mb-1">Cliente</p>
          <h1 className="font-tight text-2xl font-bold text-gray-900 tracking-tight">
            Hola, {firstName}
          </h1>
          <p className="text-sm text-gray-400 mt-1">¿En qué servicio te ayudamos hoy?</p>
        </div>
        <button
          onClick={() => openDrawer()}
          className="flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white transition-all duration-150 shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nueva solicitud
        </button>
      </div>

      {/* Stats strip */}
      {!loading && requests.length > 0 && (
        <div className="flex gap-2 flex-wrap animate-fade-in">
          <StatPill label="En espera"   value={pending} accent="text-amber-600" />
          <StatPill label="En proceso"  value={inProg}  accent="text-blue-600" />
          <StatPill label="Finalizadas" value={done}    accent="text-emerald-600" />
        </div>
      )}

      {/* Active requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Solicitudes activas</SectionLabel>
          {!loading && active.length > 0 && (
            <span className="text-xs tabular-nums text-gray-400">{active.length}</span>
          )}
        </div>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} />)}
          </div>
        ) : active.length === 0 ? (
          <EmptyRequests onNew={() => openDrawer()} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map(req => (
              <RequestCard
                key={req.id}
                request={req}
                role="CLIENTE"
                onUpdateStatus={handleCancelRequest}
                onRateComplete={fetchData}
                loading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Services catalog */}
      <div>
        <SectionLabel>Servicios disponibles</SectionLabel>
        {loading ? (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[76px]" />)}
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
                  className="group text-left bg-white border border-gray-200 hover:border-blue-200 hover:shadow-md rounded-xl p-4 transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{label}</p>
                    <svg
                      className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0 mt-0.5"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-400">
                    Desde{' '}
                    <span className="font-bold text-gray-700">{formatCurrency(minPrice)}</span>
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
