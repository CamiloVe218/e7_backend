'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { requestsApi } from '@/lib/api';
import { ServiceRequest } from '@/types';
import { RequestCard } from '@/components/requests/RequestCard';

const STATUS_FILTERS = [
  { value: '',           label: 'Todos' },
  { value: 'FINALIZADA', label: 'Finalizadas' },
  { value: 'CANCELADA',  label: 'Canceladas' },
];

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await requestsApi.getHistory();
      setHistory(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const base = filter ? history.filter(r => r.status === filter) : history;
  // CLIENTE: hide FINALIZADA without rating — they still need to complete pay+rate in the dashboard.
  // PROVEEDOR / ADMIN: show all terminal requests regardless of rating state.
  const displayed = user?.role === 'CLIENTE'
    ? base.filter(r => r.status !== 'FINALIZADA' || !!r.rating)
    : base;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-tight text-2xl font-bold text-gray-900 tracking-tight">Historial</h1>
          <p className="text-sm text-gray-400 mt-1">Solicitudes finalizadas y canceladas</p>
        </div>

        {/* Filter pills */}
        {history.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`h-8 px-3.5 text-xs font-semibold rounded-lg border transition-all duration-150 active:scale-[0.97] ${
                  filter === f.value
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 skeleton" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-gray-200 bg-white gap-2">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600">
              {filter ? 'Sin resultados para este filtro' : 'Sin historial de servicios'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {filter ? 'Prueba con otro filtro' : 'Aquí aparecerán tus servicios finalizados y cancelados'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map(req => (
            <RequestCard
              key={req.id}
              request={req}
              role={user?.role || 'CLIENTE'}
              onRateComplete={fetchHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
