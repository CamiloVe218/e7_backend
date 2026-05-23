'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { usersApi, authApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const ROLE_LABEL: Record<string, string> = {
  CLIENTE: 'Cliente',
  PROVEEDOR: 'Proveedor',
  ADMIN: 'Administrador',
};

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

  const fieldBase = "w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:border-gray-900 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Editar perfil</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Nombre completo</label>
            <input
              value={form.name}
              onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setError(''); }}
              className={fieldBase}
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Teléfono</label>
            <input
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className={fieldBase}
              placeholder="55 1234 5678"
              type="tel"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Correo electrónico</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>

          {error && <p className="text-xs text-red-600 px-1">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-9 text-sm font-medium rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
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

function PasswordConfirmModal({
  user,
  onVerified,
  onClose,
}: {
  user: any;
  onVerified: () => void;
  onClose: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Ingresa tu contraseña'); return; }
    setLoading(true);
    setError('');
    try {
      await authApi.login(user.email, password);
      onVerified();
    } catch {
      setError('Contraseña incorrecta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-7 pt-7 pb-5">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-tight text-lg font-bold text-gray-900 mb-1">Confirmar identidad</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Por seguridad, ingresa tu contraseña para continuar.
          </p>
        </div>

        <div className="h-px bg-gray-100" />

        <form onSubmit={handleSubmit} className="px-7 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contraseña actual</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoFocus
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
              <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 h-10 text-sm font-bold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Header() {
  const { user, logout, refreshUser } = useAuth();
  const { toggle: toggleSidebar } = useSidebar();
  const [open, setOpen] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
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
      <header className="h-14 shrink-0 flex items-center px-4 lg:px-6 border-b border-gray-200 bg-white gap-2">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
          aria-label="Abrir menú de navegación"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1" />

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(v => !v)}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors duration-150',
              open ? 'bg-gray-100' : 'hover:bg-gray-100',
            )}
          >
            <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white shrink-0 select-none">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{ROLE_LABEL[user?.role || ''] || user?.role}</p>
            </div>
            <svg
              className={cn('w-3.5 h-3.5 text-gray-400 transition-transform duration-150 hidden sm:block', open && 'rotate-180')}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl border border-gray-200 bg-white shadow-dropdown z-50 overflow-hidden fade-up">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                {user?.phone && <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>}
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setOpen(false); setShowPasswordConfirm(true); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-left"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Editar perfil
                </button>
                <div className="h-px bg-gray-100 mx-3 my-1" />
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {showPasswordConfirm && (
        <PasswordConfirmModal
          user={user}
          onVerified={() => { setShowPasswordConfirm(false); setShowProfile(true); }}
          onClose={() => setShowPasswordConfirm(false)}
        />
      )}

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
