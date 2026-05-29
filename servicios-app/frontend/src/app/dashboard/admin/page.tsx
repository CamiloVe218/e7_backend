'use client';

import { useState, useEffect, useCallback } from 'react';
import { requestsApi, usersApi, adminApi } from '@/lib/api';
import { ServiceRequest, User, RequestStats } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

const ROLE_LABEL: Record<string, string> = {
  CLIENTE:   'Cliente',
  PROVEEDOR: 'Proveedor',
  ADMIN:     'Admin',
};

const ROLE_COLOR: Record<string, string> = {
  CLIENTE:   'text-blue-700 bg-blue-50 border border-blue-200',
  PROVEEDOR: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
  ADMIN:     'text-violet-700 bg-violet-50 border border-violet-200',
};

const AVATAR_COLOR: Record<string, string> = {
  CLIENTE:   'bg-blue-600',
  PROVEEDOR: 'bg-emerald-600',
  ADMIN:     'bg-violet-600',
};

// ── Confirm modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onDismiss,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onDismiss}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-7 pt-7 pb-6">
          <h3 className="font-tight text-lg font-bold text-gray-900 mb-1.5">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="px-7 py-5 flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 h-10 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-10 text-sm font-semibold rounded-xl text-white transition-colors ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────

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

const REQ_PAGE_SIZE = 20;
const USER_PAGE_SIZE = 20;

function PanelHeader({ title, showing, total }: { title: string; showing: number; total: number }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <span className="text-xs text-gray-400 tabular-nums bg-gray-100 px-2 py-0.5 rounded-md">
        {showing < total ? `${showing} de ${total}` : total}
      </span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

type PendingAction = {
  type: 'cancel-request' | 'suspend-user' | 'reactivate-user';
  id: string;
  label: string;
};

export default function AdminDashboard() {
  const { success, error: toastError } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [reqTotal, setReqTotal] = useState(0);
  const [reqHasMore, setReqHasMore] = useState(false);
  const [reqPage, setReqPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const fetchRequests = useCallback(async (page: number) => {
    const result = await requestsApi.getAllPaginated(page, REQ_PAGE_SIZE);
    if (page === 1) {
      setRequests(result.data);
    } else {
      setRequests(prev => [...prev, ...result.data]);
    }
    setReqTotal(result.total);
    setReqHasMore(result.hasMore);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usrs, reqStats] = await Promise.all([
        usersApi.getAll(),
        requestsApi.getStats(),
      ]);
      setUsers(usrs);
      setStats(reqStats);
      await fetchRequests(1);
      setReqPage(1);
    } catch {
      // silent — stale data stays visible
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConfirmAction = async () => {
    if (!pendingAction || actionBusy) return;
    setActionBusy(true);
    try {
      if (pendingAction.type === 'cancel-request') {
        await adminApi.cancelRequest(pendingAction.id);
        success('Solicitud cancelada correctamente');
        setRequests(prev =>
          prev.map(r => r.id === pendingAction.id ? { ...r, status: 'CANCELADA' as const } : r),
        );
      } else if (pendingAction.type === 'suspend-user') {
        await adminApi.suspendUser(pendingAction.id);
        success(`${pendingAction.label} ha sido suspendido`);
        setUsers(prev =>
          prev.map(u => u.id === pendingAction.id ? { ...u, isSuspended: true } : u),
        );
      } else {
        await adminApi.reactivateUser(pendingAction.id);
        success(`${pendingAction.label} ha sido reactivado`);
        setUsers(prev =>
          prev.map(u => u.id === pendingAction.id ? { ...u, isSuspended: false } : u),
        );
      }
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Error al ejecutar la acción');
    } finally {
      setActionBusy(false);
      setPendingAction(null);
    }
  };

  const handleLoadMoreRequests = async () => {
    const next = reqPage + 1;
    setReqPage(next);
    await fetchRequests(next);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-64 skeleton" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 skeleton" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          {[1, 2].map(i => <div key={i} className="h-80 skeleton" />)}
        </div>
      </div>
    );
  }

  const TERMINAL = new Set(['FINALIZADA', 'CANCELADA']);

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.08em] uppercase text-violet-600 mb-1">Administrador</p>
          <h1 className="font-tight text-2xl font-bold text-gray-900 tracking-tight">Panel de administración</h1>
          <p className="text-sm text-gray-400 mt-1">Visión general del sistema</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.97] transition-all shrink-0"
          aria-label="Actualizar datos"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Stats row — from server stats endpoint */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total"
          value={stats?.total ?? 0}
          iconBg="bg-gray-100"
          icon={
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          }
        />
        <StatCard
          label="Pendientes"
          value={stats?.pending ?? 0}
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
          value={(stats?.accepted ?? 0) + (stats?.inProcess ?? 0)}
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
          value={stats?.completed ?? 0}
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
        {(() => {
          return (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
              <PanelHeader title="Solicitudes recientes" showing={requests.length} total={reqTotal} />
              <div className="divide-y divide-gray-100">
                {requests.map(req => (
                  <div key={req.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{req.service?.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {req.client?.name} · {formatDateShort(req.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {req.price && (
                        <span className="text-xs font-semibold text-gray-600 tabular-nums">{formatCurrency(req.price)}</span>
                      )}
                      <StatusBadge status={req.status} />
                      {!TERMINAL.has(req.status) && (
                        <button
                          onClick={() => setPendingAction({
                            type: 'cancel-request',
                            id: req.id,
                            label: req.service?.name ?? 'solicitud',
                          })}
                          className="h-7 px-2.5 text-[11px] font-semibold rounded-lg text-red-500 border border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
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
              {reqHasMore && (
                <div className="px-5 py-3 border-t border-gray-100">
                  <button
                    onClick={handleLoadMoreRequests}
                    className="w-full h-8 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Ver más ({reqTotal - requests.length} restantes)
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Users */}
        {(() => {
          const pagedUsers = users.slice(0, userPage * USER_PAGE_SIZE);
          return (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-card">
              <PanelHeader title="Usuarios registrados" showing={pagedUsers.length} total={users.length} />
              <div className="divide-y divide-gray-100">
                {pagedUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 select-none ${
                      u.isSuspended ? 'bg-gray-300' : (AVATAR_COLOR[u.role] ?? 'bg-gray-900')
                    }`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                        {u.isSuspended && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500 border border-red-100 shrink-0">
                            Suspendido
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${ROLE_COLOR[u.role] || 'text-gray-500 bg-gray-100'}`}>
                        {ROLE_LABEL[u.role] || u.role}
                      </span>
                      {u.role !== 'ADMIN' && (
                        u.isSuspended ? (
                          <button
                            onClick={() => setPendingAction({
                              type: 'reactivate-user',
                              id: u.id,
                              label: u.name,
                            })}
                            className="h-7 px-2.5 text-[11px] font-semibold rounded-lg text-emerald-600 border border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                          >
                            Reactivar
                          </button>
                        ) : (
                          <button
                            onClick={() => setPendingAction({
                              type: 'suspend-user',
                              id: u.id,
                              label: u.name,
                            })}
                            className="h-7 px-2.5 text-[11px] font-semibold rounded-lg text-red-500 border border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors"
                          >
                            Suspender
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {pagedUsers.length < users.length && (
                <div className="px-5 py-3 border-t border-gray-100">
                  <button
                    onClick={() => setUserPage(p => p + 1)}
                    className="w-full h-8 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Ver más ({users.length - pagedUsers.length} usuarios)
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Confirm modal */}
      {pendingAction && (
        <ConfirmModal
          title={
            pendingAction.type === 'cancel-request'
              ? '¿Cancelar solicitud?'
              : pendingAction.type === 'suspend-user'
              ? '¿Suspender usuario?'
              : '¿Reactivar usuario?'
          }
          body={
            pendingAction.type === 'cancel-request'
              ? `La solicitud "${pendingAction.label}" será cancelada de forma permanente.`
              : pendingAction.type === 'suspend-user'
              ? `${pendingAction.label} no podrá iniciar sesión mientras su cuenta esté suspendida.`
              : `${pendingAction.label} podrá volver a iniciar sesión con normalidad.`
          }
          confirmLabel={
            pendingAction.type === 'cancel-request'
              ? 'Sí, cancelar'
              : pendingAction.type === 'suspend-user'
              ? 'Suspender'
              : 'Reactivar'
          }
          danger={pendingAction.type !== 'reactivate-user'}
          onConfirm={handleConfirmAction}
          onDismiss={() => !actionBusy && setPendingAction(null)}
        />
      )}
    </div>
  );
}
