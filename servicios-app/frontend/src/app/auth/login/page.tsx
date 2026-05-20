'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const SAVED_EMAIL_KEY = 'harambal_last_email';

function PaintBrush({ height, rotate }: { height: number; rotate: number }) {
  const handleH = Math.round(height * 0.67);
  const headH = Math.round(height * 0.23);
  return (
    <div
      className="flex flex-col items-center"
      style={{ height, transform: `rotate(${rotate}deg)`, transformOrigin: 'bottom center' }}
    >
      <div className="w-[5px] rounded-full bg-gray-600 flex-1" />
      <div className="w-4 h-[5px] bg-gray-500 rounded-sm shrink-0 my-[3px]" />
      <div
        className="w-5 bg-gray-900 rounded-b-sm shrink-0"
        style={{
          height: headH,
          clipPath: 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)',
        }}
      />
    </div>
  );
}

function PaintBrushes() {
  return (
    <div className="flex items-end gap-4">
      <PaintBrush height={52} rotate={-6} />
      <PaintBrush height={76} rotate={-1} />
      <PaintBrush height={88} rotate={3} />
      <PaintBrush height={64} rotate={-2} />
      <PaintBrush height={46} rotate={7} />
    </div>
  );
}

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
      if (remember) localStorage.setItem(SAVED_EMAIL_KEY, form.email);
      else localStorage.removeItem(SAVED_EMAIL_KEY);
      await login(form.email, form.password);
    } catch (err: any) {
      setError(err.message || 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:border-gray-900 transition-colors duration-150';

  return (
    <div className="min-h-screen bg-white flex">
      {/* ── Left panel — branding ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] bg-[#F5F5F3] border-r border-gray-200 flex-col justify-between p-14 shrink-0">
        {/* Mini top brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
              <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
              <rect x="1" y="9" width="3" height="2" rx="0.5" />
            </svg>
          </div>
          <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Harambal</span>
        </div>

        {/* Center hero */}
        <div>
          {/* Large logo */}
          <div className="w-24 h-24 rounded-3xl bg-gray-900 flex items-center justify-center mb-8 shadow-xl">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-12 h-12 text-white">
              <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
              <rect x="1" y="9" width="3" height="2" rx="0.5" />
            </svg>
          </div>

          {/* Large name */}
          <h1 className="font-tight text-[4.5rem] font-black text-gray-900 tracking-tighter leading-none mb-5">
            Harambal
          </h1>

          <p className="text-gray-500 text-[15px] leading-relaxed mb-14 max-w-[280px]">
            Servicios a domicilio,<br />rápidos y confiables.
          </p>

          {/* Paint brushes */}
          <PaintBrushes />
        </div>

        <p className="text-xs text-gray-400">© 2025 Harambal. Todos los derechos reservados.</p>
      </div>

      {/* ── Right panel — form ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-10 py-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand */}
          <div className="mb-10 lg:hidden flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
                <rect x="1" y="9" width="3" height="2" rx="0.5" />
              </svg>
            </div>
            <span className="font-tight text-2xl font-black text-gray-900">Harambal</span>
          </div>

          <h2 className="font-tight text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Iniciar sesión
          </h2>
          <p className="text-sm text-gray-500 mb-10">
            ¿Sin cuenta?{' '}
            <Link
              href="/auth/register"
              className="text-gray-900 font-semibold underline underline-offset-2 hover:text-gray-700 transition-colors"
            >
              Regístrate gratis
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
                className={inputBase}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className={inputBase}
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-gray-900"
              />
              <span className="text-sm text-gray-500">Recordar correo</span>
            </label>

            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 text-sm font-bold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-150 disabled:opacity-40"
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
