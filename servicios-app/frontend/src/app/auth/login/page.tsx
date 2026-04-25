'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const SAVED_EMAIL_KEY = 'harambal_last_email';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_EMAIL_KEY);
    if (saved) setForm(p => ({ ...p, email: saved }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (remember) {
        localStorage.setItem(SAVED_EMAIL_KEY, form.email);
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY);
      }
      await login(form.email, form.password);
    } catch (err: any) {
      setError(err.message || 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 border-r border-gray-800 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
              <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
              <rect x="1" y="9" width="3" height="2" rx="0.5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Harambal</span>
        </div>

        <div>
          <blockquote className="text-gray-400 text-base leading-relaxed mb-6 max-w-sm">
            "Conecta con los mejores profesionales de servicios en tu ciudad. Rápido, confiable y transparente."
          </blockquote>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
                <rect x="1" y="9" width="3" height="2" rx="0.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Harambal</span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 mb-8">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 transition-colors">
              Regístrate
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Correo electrónico</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Contraseña</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-900 accent-blue-600"
              />
              <span className="text-sm text-gray-400">Recordar correo</span>
            </label>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-950/30 border border-red-900/50">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
