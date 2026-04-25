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
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Historial</h1>
        <p className="text-sm text-gray-500 mt-1">Solicitudes finalizadas y canceladas</p>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 rounded-xl bg-gray-900 border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-gray-800 border-dashed">
          <svg className="w-8 h-8 text-gray-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-600">Sin historial de servicios</p>
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
