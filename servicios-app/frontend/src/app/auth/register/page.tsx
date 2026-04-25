'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors";
  const labelClass = "text-xs font-medium text-gray-400";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
              <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
              <rect x="1" y="9" width="3" height="2" rx="0.5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Harambal</span>
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Crear cuenta</h1>
        <p className="text-sm text-gray-500 mb-8">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Inicia sesión
          </Link>
        </p>

        <div className="mb-5">
          <p className={`${labelClass} mb-2`}>Tipo de cuenta</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'CLIENTE', label: 'Cliente', sub: 'Solicitar servicios' },
              { value: 'PROVEEDOR', label: 'Proveedor', sub: 'Ofrecer servicios' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: opt.value }))}
                className={`p-3 rounded-xl border text-left transition-all ${
                  form.role === opt.value
                    ? 'border-blue-600/60 bg-blue-600/10'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }`}
              >
                <p className={`text-sm font-medium ${form.role === opt.value ? 'text-blue-400' : 'text-gray-300'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Nombre completo</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" required className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Correo electrónico</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" required className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Teléfono <span className="text-gray-600">(opcional)</span></label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="55 1234 5678" className={inputClass} />
          </div>

          {form.role === 'PROVEEDOR' && (
            <div className="space-y-1.5">
              <label className={labelClass}>Descripción profesional</label>
              <input name="bio" value={form.bio} onChange={handleChange} placeholder="Tus habilidades y experiencia" className={inputClass} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>Contraseña</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mín. 6 caracteres" required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Confirmar</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repite tu contraseña" required className={inputClass} />
            </div>
          </div>

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
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Crear cuenta
          </button>
        </form>
      </div>
    </div>
  );
}
