'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api';
import { cn } from '@/lib/utils';

function ProfileModal({
  user,
  onClose,
  onSaved,
}: {
  user: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    setLoading(true);
    setError('');
    try {
      await usersApi.updateMe({ name: form.name.trim(), phone: form.phone.trim() });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Editar perfil</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Nombre completo</label>
            <input
              value={form.name}
              onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setError(''); }}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Teléfono</label>
            <input
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="55 1234 5678"
              type="tel"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Correo electrónico</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-800 bg-gray-850 text-gray-600 cursor-not-allowed"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400 px-1">{error}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 text-sm font-medium rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-750 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-9 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const roleLabel: Record<string, string> = {
  CLIENTE: 'Cliente',
  PROVEEDOR: 'Proveedor',
  ADMIN: 'Admin',
};

export function Header() {
  const { user, logout, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <>
      <header className="h-14 shrink-0 flex items-center px-6 border-b border-gray-800 bg-gray-900">
        <div className="flex-1" />

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(v => !v)}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors',
              open ? 'bg-gray-800' : 'hover:bg-gray-800',
            )}
          >
            <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-xs font-semibold text-blue-400 shrink-0 select-none">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-white leading-tight">{user?.name}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{roleLabel[user?.role || ''] || user?.role}</p>
            </div>
            <svg
              className={cn('w-3.5 h-3.5 text-gray-500 transition-transform duration-150 hidden sm:block', open && 'rotate-180')}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl border border-gray-800 bg-gray-900 shadow-2xl shadow-black/60 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                {user?.phone && <p className="text-xs text-gray-600 mt-0.5">{user.phone}</p>}
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setOpen(false); setShowProfile(true); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-left"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Editar perfil
                </button>
                <div className="h-px bg-gray-800 mx-3 my-1" />
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-950/20 transition-colors text-left"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onSaved={refreshUser}
        />
      )}
    </>
  );
}
