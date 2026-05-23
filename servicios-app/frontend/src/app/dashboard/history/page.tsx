'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { requestsApi } from '@/lib/api';
import { ServiceRequest } from '@/types';
import { RequestCard } from '@/components/requests/RequestCard';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestsApi.getHistory().then(setHistory).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-tight text-2xl font-bold text-gray-900 tracking-tight">Historial</h1>
        <p className="text-sm text-gray-400 mt-1">Solicitudes finalizadas y canceladas</p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 skeleton" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-gray-200 bg-white gap-2">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600">Sin historial de servicios</p>
            <p className="text-xs text-gray-400 mt-0.5">Aquí aparecerán tus servicios finalizados y cancelados</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {history.map(req => (
            <RequestCard
              key={req.id}
              request={req}
              role={user?.role || 'CLIENTE'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
