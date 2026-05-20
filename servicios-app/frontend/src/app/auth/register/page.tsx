'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const ADDRESS_KEY = 'harambal_user_address';

// ── Field validation ────────────────────────────────────────────────────────

function validateField(name: string, value: string, allValues: Record<string, string>): string {
  switch (name) {
    case 'name':
      if (!value.trim()) return 'Nombre requerido';
      if (value.trim().length < 2) return 'Mínimo 2 caracteres';
      return '';
    case 'email':
      if (!value) return 'Correo requerido';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Formato inválido (ejemplo@correo.com)';
      return '';
    case 'phone':
      if (!value) return 'Teléfono requerido';
      const digits = value.replace(/\D/g, '');
      if (digits.length < 7) return 'Mínimo 7 dígitos';
      return '';
    case 'password':
      if (!value) return 'Contraseña requerida';
      if (value.length < 6) return 'Mínimo 6 caracteres';
      return '';
    case 'confirmPassword':
      if (!value) return 'Confirma tu contraseña';
      if (value !== allValues.password) return 'Las contraseñas no coinciden';
      return '';
    case 'calle':
      if (!value.trim()) return 'Calle requerida';
      if (value.trim().length < 3) return 'Mínimo 3 caracteres';
      return '';
    case 'numero':
      if (!value.trim()) return 'Número requerido';
      return '';
    case 'estado':
      if (!value.trim()) return 'Estado requerido';
      if (value.trim().length < 3) return 'Mínimo 3 caracteres';
      return '';
    case 'municipio':
      if (!value.trim()) return 'Municipio requerido';
      if (value.trim().length < 3) return 'Mínimo 3 caracteres';
      return '';
    case 'codigoPostal':
      if (!/^\d{5}$/.test(value)) return 'Exactamente 5 dígitos';
      return '';
    case 'bio':
      if (!value.trim()) return 'Descripción requerida';
      if (value.trim().length < 10) return 'Mínimo 10 caracteres';
      return '';
    default:
      return '';
  }
}

// ── Terms & Conditions Modal ────────────────────────────────────────────────

function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Viewer header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Términos y Condiciones</p>
            <p className="text-[10px] text-gray-400">Harambal · v1.0</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* "PDF" document body */}
        <div className="px-5 py-5 bg-[#F8F7F5] min-h-[200px]">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {/* Document meta */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Documento Legal</p>
                <p className="text-xs text-gray-500 mt-0.5">Harambal Marketplace de Servicios</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                  <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
                  <rect x="1" y="9" width="3" height="2" rx="0.5" />
                </svg>
              </div>
            </div>

            <h3 className="font-tight text-base font-bold text-gray-900 mb-4">
              Términos y Condiciones de Uso
            </h3>

            <p className="text-sm text-gray-700 leading-relaxed">
              Los conozco y saben que han hecho, si me hacen preguntas los funo :)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={onClose}
            className="w-full h-10 text-sm font-semibold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Field wrapper with icon feedback ────────────────────────────────────────

function FieldIcon({ touched, error }: { touched: boolean; error: string }) {
  if (!touched) return null;
  if (error) {
    return (
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'CLIENTE', phone: '', bio: '',
    calle: '', numero: '', estado: '', municipio: '', codigoPostal: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    setSubmitError('');
    if (touched[name]) {
      setFieldErrors(p => ({ ...p, [name]: validateField(name, value, updated) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setFieldErrors(p => ({ ...p, [name]: validateField(name, value, form) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields touched and run full validation
    const requiredFields = ['name', 'email', 'phone', 'password', 'confirmPassword', 'calle', 'numero', 'estado', 'municipio', 'codigoPostal'];
    if (form.role === 'PROVEEDOR') requiredFields.push('bio');

    const newTouched: Record<string, boolean> = {};
    const newErrors: Record<string, string> = {};
    for (const f of requiredFields) {
      newTouched[f] = true;
      newErrors[f] = validateField(f, (form as any)[f], form);
    }
    setTouched(p => ({ ...p, ...newTouched }));
    setFieldErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) { setSubmitError('Corrige los errores antes de continuar'); return; }

    if (!acceptTerms) { setSubmitError('Debes aceptar los términos y condiciones'); return; }

    // Save address to localStorage
    const fullAddress = `${form.calle.trim()} ${form.numero.trim()}, ${form.municipio.trim()}, ${form.estado.trim()}, CP ${form.codigoPostal}`;
    localStorage.setItem(ADDRESS_KEY, fullAddress);

    setLoading(true);
    setSubmitError('');
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
      setSubmitError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  // Input class builder
  const ic = (name: string) => {
    const hasError = touched[name] && fieldErrors[name];
    const isValid  = touched[name] && !fieldErrors[name] && (form as any)[name];
    return [
      'w-full pl-3.5 pr-9 py-2.5 text-sm rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all duration-150',
      hasError ? 'border-red-300 focus:border-red-400 bg-red-50' :
      isValid  ? 'border-emerald-300 focus:border-emerald-400' :
                 'border-gray-200 hover:border-gray-300 focus:border-gray-900',
    ].join(' ');
  };

  const labelBase = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';

  const FieldWrap = ({ name, children }: { name: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      {children}
      {touched[name] && fieldErrors[name] && (
        <p className="text-[10px] text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
          </svg>
          {fieldErrors[name]}
        </p>
      )}
    </div>
  );

  const ROLES = [
    {
      value: 'CLIENTE', label: 'Cliente', sub: 'Solicitar servicios a domicilio',
      icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
    },
    {
      value: 'PROVEEDOR', label: 'Proveedor', sub: 'Ofrecer servicios profesionales',
      icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px] text-white">
                <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
                <rect x="1" y="9" width="3" height="2" rx="0.5" />
              </svg>
            </div>
            <span className="font-tight text-lg font-black text-gray-900">Harambal</span>
          </div>

          <h1 className="font-tight text-2xl font-bold text-gray-900 tracking-tight mb-1">Crear cuenta</h1>
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
                    form.role === opt.value ? 'border-gray-900 bg-gray-900' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`mb-2 ${form.role === opt.value ? 'text-white' : 'text-gray-400'}`}>{opt.icon}</div>
                  <p className={`text-sm font-semibold ${form.role === opt.value ? 'text-white' : 'text-gray-900'}`}>{opt.label}</p>
                  <p className="text-xs mt-0.5 text-gray-400">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <FieldWrap name="name">
              <label className={labelBase}>Nombre completo</label>
              <div className="relative">
                <input name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} placeholder="Tu nombre completo" className={ic('name')} />
                <FieldIcon touched={!!touched.name} error={fieldErrors.name} />
              </div>
            </FieldWrap>

            {/* Email */}
            <FieldWrap name="email">
              <label className={labelBase}>Correo electrónico</label>
              <div className="relative">
                <input name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} placeholder="usuario@gmail.com" className={ic('email')} />
                <FieldIcon touched={!!touched.email} error={fieldErrors.email} />
              </div>
            </FieldWrap>

            {/* Phone — numbers only */}
            <FieldWrap name="phone">
              <label className={labelBase}>Teléfono</label>
              <div className="relative">
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => {
                    const val = e.target.value.replace(/[^\d\s\-+()]/g, '');
                    handleChange({ ...e, target: { ...e.target, value: val, name: 'phone' } } as any);
                  }}
                  onBlur={handleBlur}
                  placeholder="55 1234 5678"
                  inputMode="tel"
                  className={ic('phone')}
                />
                <FieldIcon touched={!!touched.phone} error={fieldErrors.phone} />
              </div>
            </FieldWrap>

            {/* Bio — provider only */}
            {form.role === 'PROVEEDOR' && (
              <FieldWrap name="bio">
                <label className={labelBase}>Descripción profesional</label>
                <div className="relative">
                  <input name="bio" value={form.bio} onChange={handleChange} onBlur={handleBlur} placeholder="Tus habilidades y experiencia" className={ic('bio')} />
                  <FieldIcon touched={!!touched.bio} error={fieldErrors.bio} />
                </div>
              </FieldWrap>
            )}

            {/* ── Dirección ──────────────────────────────────── */}
            <div className="pt-1">
              <p className={`${labelBase} mb-3 flex items-center gap-1.5`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Dirección
              </p>
              <div className="space-y-3 p-4 rounded-xl border border-gray-100 bg-gray-50">

                {/* Calle + Número */}
                <div className="grid grid-cols-3 gap-2.5">
                  <FieldWrap name="calle">
                    <div className="col-span-2">
                      <label className={labelBase}>Calle</label>
                      <div className="relative">
                        <input name="calle" value={form.calle} onChange={handleChange} onBlur={handleBlur} placeholder="Nombre de la calle" className={ic('calle')} />
                        <FieldIcon touched={!!touched.calle} error={fieldErrors.calle} />
                      </div>
                    </div>
                  </FieldWrap>
                  <FieldWrap name="numero">
                    <label className={labelBase}>Número</label>
                    <div className="relative">
                      <input
                        name="numero"
                        value={form.numero}
                        onChange={e => {
                          const val = e.target.value.replace(/[^\d]/g, '');
                          handleChange({ ...e, target: { ...e.target, value: val, name: 'numero' } } as any);
                        }}
                        onBlur={handleBlur}
                        placeholder="123"
                        inputMode="numeric"
                        className={ic('numero')}
                      />
                      <FieldIcon touched={!!touched.numero} error={fieldErrors.numero} />
                    </div>
                  </FieldWrap>
                </div>

                {/* Estado + Municipio */}
                <div className="grid grid-cols-2 gap-2.5">
                  <FieldWrap name="estado">
                    <label className={labelBase}>Estado</label>
                    <div className="relative">
                      <input name="estado" value={form.estado} onChange={handleChange} onBlur={handleBlur} placeholder="Oaxaca" className={ic('estado')} />
                      <FieldIcon touched={!!touched.estado} error={fieldErrors.estado} />
                    </div>
                  </FieldWrap>
                  <FieldWrap name="municipio">
                    <label className={labelBase}>Municipio</label>
                    <div className="relative">
                      <input name="municipio" value={form.municipio} onChange={handleChange} onBlur={handleBlur} placeholder="Oaxaca de Juárez" className={ic('municipio')} />
                      <FieldIcon touched={!!touched.municipio} error={fieldErrors.municipio} />
                    </div>
                  </FieldWrap>
                </div>

                {/* CP */}
                <FieldWrap name="codigoPostal">
                  <label className={labelBase}>Código Postal</label>
                  <div className="relative">
                    <input
                      name="codigoPostal"
                      value={form.codigoPostal}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                        handleChange({ ...e, target: { ...e.target, value: val, name: 'codigoPostal' } } as any);
                      }}
                      onBlur={handleBlur}
                      placeholder="68000"
                      inputMode="numeric"
                      maxLength={5}
                      className={ic('codigoPostal')}
                    />
                    <FieldIcon touched={!!touched.codigoPostal} error={fieldErrors.codigoPostal} />
                  </div>
                </FieldWrap>

              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-3">
              <FieldWrap name="password">
                <label className={labelBase}>Contraseña</label>
                <div className="relative">
                  <input name="password" type="password" value={form.password} onChange={handleChange} onBlur={handleBlur} placeholder="Mín. 6 caracteres" className={ic('password')} />
                  <FieldIcon touched={!!touched.password} error={fieldErrors.password} />
                </div>
              </FieldWrap>
              <FieldWrap name="confirmPassword">
                <label className={labelBase}>Confirmar</label>
                <div className="relative">
                  <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} placeholder="Repetir" className={ic('confirmPassword')} />
                  <FieldIcon touched={!!touched.confirmPassword} error={fieldErrors.confirmPassword} />
                </div>
              </FieldWrap>
            </div>

            {/* Terms & Conditions */}
            <div className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
              !acceptTerms && submitError.includes('términos') ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <button
                type="button"
                onClick={() => setAcceptTerms(v => !v)}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                  acceptTerms ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                {acceptTerms && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <p className="text-xs text-gray-600 leading-relaxed">
                Acepto los{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-gray-900 font-semibold underline underline-offset-2 hover:text-gray-700 transition-colors"
                >
                  términos y condiciones
                </button>{' '}
                de uso de Harambal
              </p>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-150 disabled:opacity-40"
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

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </>
  );
}
