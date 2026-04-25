'use client';

import { useState, useEffect, useCallback } from 'react';
import { requestsApi, usersApi } from '@/lib/api';
import { ServiceRequest, User } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDateShort } from '@/lib/utils';

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
      <p className="text-sm font-semibold text-white">{children}</p>
      {count !== undefined && (
        <span className="text-xs text-gray-600 tabular-nums">{count}</span>
      )}
    </div>
  );
}

const ROLE_LABEL: Record<string, string> = {
  CLIENTE: 'Cliente',
  PROVEEDOR: 'Proveedor',
  ADMIN: 'Admin',
};

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
        <div className="h-8 w-48 bg-gray-900 rounded-lg animate-pulse" />
        <div className="grid lg:grid-cols-2 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="h-80 rounded-xl bg-gray-900 border border-gray-800 animate-pulse" />
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
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Panel de administración</h1>
        <p className="text-sm text-gray-500 mt-1">Visión general del sistema</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: requests.length, color: 'text-white' },
          { label: 'Pendientes', value: statusCounts['PENDIENTE'] || 0, color: 'text-amber-400' },
          { label: 'En proceso', value: (statusCounts['ACEPTADA'] || 0) + (statusCounts['EN_PROCESO'] || 0), color: 'text-blue-400' },
          { label: 'Finalizadas', value: statusCounts['FINALIZADA'] || 0, color: 'text-emerald-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-600 mb-1.5">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <SectionLabel count={requests.length}>Solicitudes recientes</SectionLabel>
          <div className="divide-y divide-gray-800">
            {requests.slice(0, 12).map(req => (
              <div key={req.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-white truncate">{req.service?.name}</p>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {req.client?.name} · {formatDateShort(req.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {req.price && (
                    <span className="text-xs text-gray-500 tabular-nums">{formatCurrency(req.price)}</span>
                  )}
                  <StatusBadge status={req.status} />
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-gray-600">
                No hay solicitudes registradas
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <SectionLabel count={users.length}>Usuarios registrados</SectionLabel>
          <div className="divide-y divide-gray-800">
            {users.slice(0, 12).map(u => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-400 shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.name}</p>
                  <p className="text-xs text-gray-600 truncate">{u.email}</p>
                </div>
                <span className="text-[11px] font-medium text-gray-500 shrink-0">
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
