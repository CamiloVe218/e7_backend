'use client';

import { useState, useEffect, useCallback } from 'react';
import { requestsApi, usersApi } from '@/lib/api';
import { ServiceRequest, User } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDateShort } from '@/lib/utils';

const ROLE_LABEL: Record<string, string> = {
  CLIENTE:   'Cliente',
  PROVEEDOR: 'Proveedor',
  ADMIN:     'Admin',
};

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card">
      <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-gray-400 mb-2">{label}</p>
      <p className={`text-3xl font-bold tabular-nums font-tight ${accent || 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function PanelHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <span className="text-xs text-gray-400 tabular-nums">{count}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [reqs, usrs] = await Promise.all([requestsApi.getAll(), usersApi.getAll()]);
      setRequests(reqs);
      setUsers(usrs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="h-80 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statusCounts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-tight text-2xl font-bold text-gray-900 tracking-tight">Panel de administración</h1>
        <p className="text-sm text-gray-400 mt-1">Visión general del sistema</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total"       value={requests.length} />
        <StatCard label="Pendientes"  value={statusCounts['PENDIENTE'] || 0}  accent="text-amber-600" />
        <StatCard label="En proceso"  value={(statusCounts['ACEPTADA'] || 0) + (statusCounts['EN_PROCESO'] || 0)} accent="text-blue-600" />
        <StatCard label="Finalizadas" value={statusCounts['FINALIZADA'] || 0} accent="text-emerald-600" />
      </div>

      {/* Two panels */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Requests */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
          <PanelHeader title="Solicitudes recientes" count={requests.length} />
          <div className="divide-y divide-gray-100">
            {requests.slice(0, 12).map(req => (
              <div key={req.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{req.service?.name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {req.client?.name} · {formatDateShort(req.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {req.price && (
                    <span className="text-xs font-semibold text-gray-600 tabular-nums">{formatCurrency(req.price)}</span>
                  )}
                  <StatusBadge status={req.status} />
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-gray-400">
                No hay solicitudes registradas
              </div>
            )}
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
          <PanelHeader title="Usuarios registrados" count={users.length} />
          <div className="divide-y divide-gray-100">
            {users.slice(0, 12).map(u => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 select-none">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span className="text-xs font-medium text-gray-400 shrink-0">
                  {ROLE_LABEL[u.role] || u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
