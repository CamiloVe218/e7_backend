'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// ── Decorative element (module-level — never recreated on render) ─────────────

function PaintBrush({ height, rotate }: { height: number; rotate: number }) {
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
        style={{ height: headH, clipPath: 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)' }}
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

// ── Validation helpers ────────────────────────────────────────────────────────

function validateEmail(v: string): string {
  if (!v.trim()) return 'Ingresa tu correo';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Ingresa un correo válido';
  return '';
}

function validatePassword(v: string): string {
  if (!v) return 'Ingresa tu contraseña';
  return '';
}

// ── Left branding panel ───────────────────────────────────────────────────────

function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[44%] bg-[#F5F5F3] border-r border-gray-200 flex-col justify-between p-14 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
            <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
            <rect x="1" y="9" width="3" height="2" rx="0.5" />
          </svg>
        </div>
        <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Harambal</span>
      </div>

      <div>
        <div className="w-24 h-24 rounded-3xl bg-gray-900 flex items-center justify-center mb-8 shadow-xl">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-12 h-12 text-white">
            <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
            <rect x="1" y="9" width="3" height="2" rx="0.5" />
          </svg>
        </div>
        <h1 className="font-tight text-[4.5rem] font-black text-gray-900 tracking-tighter leading-none mb-5">
          Harambal
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed mb-14 max-w-[280px]">
          Servicios a domicilio,<br />rápidos y confiables.
        </p>
        <PaintBrushes />
      </div>

      <p className="text-xs text-gray-400">© 2025 Harambal. Todos los derechos reservados.</p>
    </div>
  );
}

// ── Login form — uses useSearchParams, must be inside Suspense ────────────────

function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const [form, setForm]               = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [touched, setTouched]         = useState({ email: false, password: false });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading]         = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setSubmitError('');
    if (touched[name as keyof typeof touched]) {
      setFieldErrors(p => ({
        ...p,
        [name]: name === 'email' ? validateEmail(value) : validatePassword(value),
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setFieldErrors(p => ({
      ...p,
      [name]: name === 'email' ? validateEmail(value) : validatePassword(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(form.email);
    const passErr  = validatePassword(form.password);
    setFieldErrors({ email: emailErr, password: passErr });
    setTouched({ email: true, password: true });

    if (emailErr || passErr) return;

    setLoading(true);
    setSubmitError('');
    try {
      await login(form.email, form.password);
    } catch {
      setSubmitError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const ic = (field: 'email' | 'password') => {
    const hasError = touched[field] && fieldErrors[field];
    return [
      'w-full px-4 py-3 text-sm rounded-xl border bg-white text-gray-900',
      'placeholder:text-gray-400 focus:outline-none transition-all duration-150',
      hasError
        ? 'border-red-300 hover:border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)] bg-red-50'
        : 'border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(17,17,17,0.07)]',
    ].join(' ');
  };

  return (
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
        <p className="text-sm text-gray-500 mb-8">
          ¿Sin cuenta?{' '}
          <Link
            href="/auth/register"
            className="text-gray-900 font-semibold underline underline-offset-2 hover:text-gray-700 transition-colors"
          >
            Regístrate gratis
          </Link>
        </p>

        {/* Success banner — shown after registration */}
        {justRegistered && (
          <div className="flex items-center gap-3 px-4 py-3.5 mb-6 rounded-xl bg-emerald-50 border border-emerald-200">
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-emerald-800">¡Cuenta creada correctamente!</p>
              <p className="text-xs text-emerald-600 mt-0.5">Inicia sesión para continuar.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-5">

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Correo electrónico
            </label>
            <input
              id="login-email"
              name="login-email-field"
              type="text"
              inputMode="email"
              value={form.email}
              onChange={e => handleChange({ ...e, target: { ...e.target, name: 'email' } })}
              onBlur={e => handleBlur({ ...e, target: { ...e.target, name: 'email', value: form.email } })}
              placeholder="correo@ejemplo.com"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className={ic('email')}
              aria-invalid={touched.email && !!fieldErrors.email}
            />
            {touched.email && fieldErrors.email && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                </svg>
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              id="login-password"
              name="login-password-field"
              type="password"
              value={form.password}
              onChange={e => handleChange({ ...e, target: { ...e.target, name: 'password' } })}
              onBlur={e => handleBlur({ ...e, target: { ...e.target, name: 'password', value: form.password } })}
              placeholder="••••••••"
              autoComplete="new-password"
              className={ic('password')}
              aria-invalid={touched.password && !!fieldErrors.password}
            />
            {touched.password && fieldErrors.password && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                </svg>
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{submitError}</p>
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
  );
}

// ── Page — wraps LoginForm in Suspense (required for useSearchParams) ─────────

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex">
      <BrandPanel />
      <Suspense fallback={<div className="flex-1" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
