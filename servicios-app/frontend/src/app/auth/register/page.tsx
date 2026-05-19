'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
          <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
          <rect x="1" y="9" width="3" height="2" rx="0.5" />
        </svg>
      </div>
      <span className="text-sm font-bold text-gray-900 tracking-tight">Harambal</span>
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENTE',
    phone: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
        bio: form.role === 'PROVEEDOR' ? form.bio : undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:border-gray-900 transition-colors duration-150";
  const labelBase = "text-xs font-semibold text-gray-500 uppercase tracking-wide";

  const ROLES = [
    {
      value: 'CLIENTE',
      label: 'Cliente',
      sub: 'Solicitar servicios a domicilio',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      value: 'PROVEEDOR',
      label: 'Proveedor',
      sub: 'Ofrecer servicios profesionales',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <BrandMark />
        </div>

        <h1 className="font-tight text-2xl font-bold text-gray-900 tracking-tight mb-1">
          Crear cuenta
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-gray-900 font-medium underline underline-offset-2 hover:text-gray-700 transition-colors">
            Inicia sesión
          </Link>
        </p>

        {/* Role selector */}
        <div className="mb-6">
          <p className={`${labelBase} mb-3`}>Tipo de cuenta</p>
          <div className="grid grid-cols-2 gap-2.5">
            {ROLES.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: opt.value }))}
                className={`p-4 rounded-xl border text-left transition-all duration-150 ${
                  form.role === opt.value
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className={`mb-2 ${form.role === opt.value ? 'text-white' : 'text-gray-400'}`}>
                  {opt.icon}
                </div>
                <p className={`text-sm font-semibold ${form.role === opt.value ? 'text-white' : 'text-gray-900'}`}>
                  {opt.label}
                </p>
                <p className={`text-xs mt-0.5 ${form.role === opt.value ? 'text-gray-400' : 'text-gray-400'}`}>
                  {opt.sub}
                </p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelBase}>Nombre completo</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" required className={inputBase} />
          </div>

          <div className="space-y-1.5">
            <label className={labelBase}>Correo electrónico</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" required className={inputBase} />
          </div>

          <div className="space-y-1.5">
            <label className={labelBase}>
              Teléfono <span className="text-gray-400 normal-case font-normal tracking-normal">(opcional)</span>
            </label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="55 1234 5678" className={inputBase} />
          </div>

          {form.role === 'PROVEEDOR' && (
            <div className="space-y-1.5">
              <label className={labelBase}>Descripción profesional</label>
              <input name="bio" value={form.bio} onChange={handleChange} placeholder="Tus habilidades y experiencia" className={inputBase} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelBase}>Contraseña</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mín. 6 caracteres" required className={inputBase} />
            </div>
            <div className="space-y-1.5">
              <label className={labelBase}>Confirmar</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repetir" required className={inputBase} />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-150 disabled:opacity-40"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            Crear cuenta
          </button>
        </form>
      </div>
    </div>
  );
}
