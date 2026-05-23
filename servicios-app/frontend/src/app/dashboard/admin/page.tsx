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

const ROLE_COLOR: Record<string, string> = {
  CLIENTE:   'text-blue-600 bg-blue-50',
  PROVEEDOR: 'text-violet-600 bg-violet-50',
  ADMIN:     'text-gray-600 bg-gray-100',
};

function StatCard({
  label,
  value,
  accent,
  iconBg,
  icon,
}: {
  label: string;
  value: number;
  accent?: string;
  iconBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold tracking-[0.08em] uppercase text-gray-400">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-bold tabular-nums font-tight ${accent ?? 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

function PanelHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <span className="text-xs text-gray-400 tabular-nums bg-gray-100 px-2 py-0.5 rounded-md">{count}</span>
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
        <div className="h-8 w-64 skeleton" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 skeleton" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="h-80 skeleton" />
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
        <StatCard
          label="Total"
          value={requests.length}
          iconBg="bg-gray-100"
          icon={
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          }
        />
        <StatCard
          label="Pendientes"
          value={statusCounts['PENDIENTE'] || 0}
          accent="text-amber-600"
          iconBg="bg-amber-50"
          icon={
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="En proceso"
          value={(statusCounts['ACEPTADA'] || 0) + (statusCounts['EN_PROCESO'] || 0)}
          accent="text-blue-600"
          iconBg="bg-blue-50"
          icon={
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatCard
          label="Finalizadas"
          value={statusCounts['FINALIZADA'] || 0}
          accent="text-emerald-600"
          iconBg="bg-emerald-50"
          icon={
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Two panels */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Requests */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
          <PanelHeader title="Solicitudes recientes" count={requests.length} />
          <div className="divide-y divide-gray-100">
            {requests.slice(0, 12).map(req => (
              <div key={req.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{req.service?.name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {req.client?.name} · {formatDateShort(req.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  {req.price && (
                    <span className="text-xs font-semibold text-gray-600 tabular-nums">{formatCurrency(req.price)}</span>
                  )}
                  <StatusBadge status={req.status} />
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="px-5 py-14 flex flex-col items-center gap-2 text-center">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-400">No hay solicitudes registradas</p>
              </div>
            )}
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
          <PanelHeader title="Usuarios registrados" count={users.length} />
          <div className="divide-y divide-gray-100">
            {users.slice(0, 12).map(u => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white shrink-0 select-none">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md shrink-0 ${ROLE_COLOR[u.role] || 'text-gray-500 bg-gray-100'}`}>
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
