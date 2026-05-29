'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterPayload } from '@/types';

// ── Phone utilities ───────────────────────────────────────────────────────────

function sanitizePhone(input: string): string {
  return input.replace(/\D/g, '').slice(0, 10);
}

function formatPhone(digits: string): string {
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

function validatePhone(digits: string): string {
  if (!digits) return 'Teléfono requerido';
  if (digits.length < 10) return `El número debe tener 10 dígitos (faltan ${10 - digits.length})`;
  return '';
}

// ── Field validation ──────────────────────────────────────────────────────────

function validateField(name: string, value: string, allValues: Record<string, string>): string {
  switch (name) {
    case 'name':
      if (!value.trim()) return 'Nombre requerido';
      if (value.trim().length < 2) return 'Mínimo 2 caracteres';
      return '';
    case 'email':
      if (!value.trim()) return 'Correo requerido';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Formato inválido';
      return '';
    case 'phone':
      return validatePhone(value);
    case 'password':
      if (!value) return 'Contraseña requerida';
      if (value.length < 6) return 'Mínimo 6 caracteres';
      return '';
    case 'confirmPassword':
      if (!value) return 'Confirma tu contraseña';
      if (value !== allValues.password) return 'Las contraseñas no coinciden';
      return '';
    case 'bio':
      if (!value.trim()) return 'Descripción requerida';
      if (value.trim().length < 10) return 'Mínimo 10 caracteres';
      return '';
    case 'street':
      if (!value.trim()) return 'Calle requerida';
      return '';
    case 'extNumber':
      if (!value.trim()) return 'Número requerido';
      return '';
    case 'city':
      if (!value.trim()) return 'Municipio requerido';
      return '';
    case 'state':
      if (!value.trim()) return 'Estado requerido';
      return '';
    case 'zipCode':
      if (!value.trim()) return 'Código postal requerido';
      if (!/^\d{5}$/.test(value.trim())) return 'Debe ser 5 dígitos';
      return '';
    default:
      return '';
  }
}

// ── Module-level sub-components ───────────────────────────────────────────────
// NEVER define these inside the page component — doing so causes React to
// unmount/remount them on every render, making every input lose focus on
// each keystroke.

function FieldError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="text-[10px] text-red-500 flex items-center gap-1">
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
      </svg>
      {message}
    </p>
  );
}

function FieldStatus({ touched, hasError }: { touched: boolean; hasError: boolean }) {
  if (!touched) return null;
  if (hasError) {
    return (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  return (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800">Términos y Condiciones</p>
            <p className="text-[10px] text-gray-400">Harambal · v1.0</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 bg-[#F8F7F5]">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>Al utilizar Harambal Servicios aceptas que eres mayor de edad y que los datos proporcionados son verídicos.</p>
            <p>Los pagos entre clientes y proveedores se realizan directamente. Harambal actúa únicamente como plataforma intermediaria.</p>
            <p>Tus datos personales son tratados conforme a nuestra Política de Privacidad. No compartimos información con terceros sin tu consentimiento.</p>
            <p>Nos reservamos el derecho de suspender cuentas que violen estos términos.</p>
            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">Última actualización: mayo 2026 · v1.0</p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <button onClick={onClose} className="w-full h-10 text-sm font-semibold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LABEL = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';

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

// ── Main component ────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'CLIENTE', phone: '', bio: '',
    // Address — stored as raw user input (no formatting needed for these)
    street: '', extNumber: '', city: '', state: '', zipCode: '',
  });
  const [touched, setTouched]         = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms]     = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading]         = useState(false);

  // Generic text field change handler
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

  // Build className for a field
  const ic = (name: string) => {
    const hasError = touched[name] && fieldErrors[name];
    const isValid  = touched[name] && !fieldErrors[name] && form[name as keyof typeof form];
    return [
      'w-full pl-3.5 pr-9 py-2.5 text-sm rounded-xl border bg-white text-gray-900',
      'placeholder:text-gray-400 focus:outline-none transition-all duration-150',
      hasError
        ? 'border-red-300 hover:border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)] bg-red-50'
        : isValid
        ? 'border-emerald-300 hover:border-emerald-400 focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]'
        : 'border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(17,17,17,0.07)]',
    ].join(' ');
  };

  // Shorthand for rendering a field icon
  const si = (name: string) => (
    <FieldStatus
      touched={!!touched[name]}
      hasError={!!(touched[name] && fieldErrors[name])}
    />
  );

  // Shorthand for rendering the error message
  const fe = (name: string) => (
    <FieldError message={touched[name] ? (fieldErrors[name] ?? '') : ''} />
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const required = ['name', 'email', 'phone', 'password', 'confirmPassword',
                      'street', 'extNumber', 'city', 'state', 'zipCode'];
    if (form.role === 'PROVEEDOR') required.push('bio');

    const newTouched: Record<string, boolean> = {};
    const newErrors: Record<string, string>   = {};
    for (const f of required) {
      newTouched[f] = true;
      newErrors[f]  = validateField(f, form[f as keyof typeof form], form);
    }
    setTouched(p => ({ ...p, ...newTouched }));
    setFieldErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      setSubmitError('Corrige los errores antes de continuar');
      return;
    }
    if (!acceptTerms) {
      setSubmitError('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);
    setSubmitError('');
    try {
      const payload: RegisterPayload = {
        name:      form.name.trim(),
        email:     form.email.trim().toLowerCase(),
        password:  form.password,
        role:      form.role,
        phone:     form.phone || undefined,       // raw 10 digits
        bio:       form.role === 'PROVEEDOR' ? form.bio.trim() : undefined,
        street:    form.street.trim() || undefined,
        extNumber: form.extNumber.trim() || undefined,
        city:      form.city.trim() || undefined,
        state:     form.state.trim() || undefined,
        zipCode:   form.zipCode.trim() || undefined,
      };
      await register(payload);
      // AuthContext.register redirects to /auth/login?registered=1 — no more code needed here
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('registrado')) {
        setSubmitError('Este correo ya está registrado. Intenta con otro.');
      } else if (msg.includes('conexión') || msg.includes('servidor')) {
        setSubmitError('No se pudo conectar con el servidor. Intenta de nuevo.');
      } else {
        setSubmitError(msg || 'Error al crear la cuenta. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

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
            <p className={`${LABEL} mb-3`}>Tipo de cuenta</p>
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

          <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-4">

            {/* ── Datos personales ─────────────────────────────────────────── */}
            <div>
              <p className={`${LABEL} mb-3`}>Datos personales</p>
              <div className="space-y-3">

                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-name" className={LABEL}>Nombre completo</label>
                  <div className="relative">
                    <input
                      id="reg-name"
                      name="reg-name-x"
                      value={form.name}
                      onChange={e => handleChange({ ...e, target: { ...e.target, name: 'name' } })}
                      onBlur={e => handleBlur({ ...e, target: { ...e.target, name: 'name', value: form.name } })}
                      placeholder=""
                      autoComplete="off"
                      className={ic('name')}
                    />
                    {si('name')}
                  </div>
                  {fe('name')}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-email" className={LABEL}>Correo electrónico</label>
                  <div className="relative">
                    <input
                      id="reg-email"
                      name="reg-email-x"
                      type="text"
                      inputMode="email"
                      value={form.email}
                      onChange={e => handleChange({ ...e, target: { ...e.target, name: 'email' } })}
                      onBlur={e => handleBlur({ ...e, target: { ...e.target, name: 'email', value: form.email } })}
                      placeholder=""
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      className={ic('email')}
                    />
                    {si('email')}
                  </div>
                  {fe('email')}
                </div>

                {/* Phone — raw digits in state, formatted display */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-phone" className={LABEL}>Teléfono (10 dígitos)</label>
                  <div className="relative">
                    <input
                      id="reg-phone"
                      name="reg-phone-x"
                      type="text"
                      inputMode="numeric"
                      value={formatPhone(form.phone)}
                      onChange={e => {
                        const digits = sanitizePhone(e.target.value);
                        const updated = { ...form, phone: digits };
                        setForm(updated);
                        setSubmitError('');
                        if (touched.phone) {
                          setFieldErrors(p => ({ ...p, phone: validatePhone(digits) }));
                        }
                      }}
                      onBlur={() => {
                        setTouched(p => ({ ...p, phone: true }));
                        setFieldErrors(p => ({ ...p, phone: validatePhone(form.phone) }));
                      }}
                      placeholder=""
                      autoComplete="off"
                      maxLength={12}
                      className={ic('phone')}
                    />
                    {si('phone')}
                  </div>
                  {fe('phone')}
                </div>

                {/* Bio — provider only */}
                {form.role === 'PROVEEDOR' && (
                  <div className="space-y-1.5">
                    <label htmlFor="reg-bio" className={LABEL}>Descripción profesional</label>
                    <div className="relative">
                      <input
                        id="reg-bio"
                        name="reg-bio-x"
                        value={form.bio}
                        onChange={e => handleChange({ ...e, target: { ...e.target, name: 'bio' } })}
                        onBlur={e => handleBlur({ ...e, target: { ...e.target, name: 'bio', value: form.bio } })}
                        placeholder=""
                        autoComplete="off"
                        className={ic('bio')}
                      />
                      {si('bio')}
                    </div>
                    {fe('bio')}
                  </div>
                )}
              </div>
            </div>

            {/* ── Domicilio ─────────────────────────────────────────────────── */}
            <div>
              <p className={`${LABEL} mb-3`}>Domicilio</p>
              <div className="space-y-3">

                {/* Calle + Número */}
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="reg-street" className={LABEL}>Calle</label>
                    <div className="relative">
                      <input
                        id="reg-street"
                        name="reg-street-x"
                        value={form.street}
                        onChange={e => handleChange({ ...e, target: { ...e.target, name: 'street' } })}
                        onBlur={e => handleBlur({ ...e, target: { ...e.target, name: 'street', value: form.street } })}
                        placeholder=""
                        autoComplete="off"
                        className={ic('street')}
                      />
                      {si('street')}
                    </div>
                    {fe('street')}
                  </div>

                  <div className="space-y-1.5 w-24">
                    <label htmlFor="reg-extnumber" className={LABEL}>Núm.</label>
                    <div className="relative">
                      <input
                        id="reg-extnumber"
                        name="reg-extnumber-x"
                        value={form.extNumber}
                        onChange={e => handleChange({ ...e, target: { ...e.target, name: 'extNumber' } })}
                        onBlur={e => handleBlur({ ...e, target: { ...e.target, name: 'extNumber', value: form.extNumber } })}
                        placeholder=""
                        autoComplete="off"
                        className={ic('extNumber').replace('pl-3.5 pr-9', 'px-3.5')}
                      />
                    </div>
                    {fe('extNumber')}
                  </div>
                </div>

                {/* Ciudad + Estado */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="reg-city" className={LABEL}>Municipio</label>
                    <div className="relative">
                      <input
                        id="reg-city"
                        name="reg-city-x"
                        value={form.city}
                        onChange={e => handleChange({ ...e, target: { ...e.target, name: 'city' } })}
                        onBlur={e => handleBlur({ ...e, target: { ...e.target, name: 'city', value: form.city } })}
                        placeholder=""
                        autoComplete="off"
                        className={ic('city')}
                      />
                      {si('city')}
                    </div>
                    {fe('city')}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reg-state" className={LABEL}>Estado</label>
                    <div className="relative">
                      <input
                        id="reg-state"
                        name="reg-state-x"
                        value={form.state}
                        onChange={e => handleChange({ ...e, target: { ...e.target, name: 'state' } })}
                        onBlur={e => handleBlur({ ...e, target: { ...e.target, name: 'state', value: form.state } })}
                        placeholder=""
                        autoComplete="off"
                        className={ic('state')}
                      />
                      {si('state')}
                    </div>
                    {fe('state')}
                  </div>
                </div>

                {/* Código Postal */}
                <div className="space-y-1.5 max-w-[160px]">
                  <label htmlFor="reg-zip" className={LABEL}>Código postal</label>
                  <div className="relative">
                    <input
                      id="reg-zip"
                      name="reg-zip-x"
                      type="text"
                      inputMode="numeric"
                      value={form.zipCode}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 5);
                        const updated = { ...form, zipCode: v };
                        setForm(updated);
                        setSubmitError('');
                        if (touched.zipCode) {
                          setFieldErrors(p => ({ ...p, zipCode: validateField('zipCode', v, updated) }));
                        }
                      }}
                      onBlur={() => {
                        setTouched(p => ({ ...p, zipCode: true }));
                        setFieldErrors(p => ({ ...p, zipCode: validateField('zipCode', form.zipCode, form) }));
                      }}
                      placeholder=""
                      maxLength={5}
                      autoComplete="off"
                      className={ic('zipCode').replace('pl-3.5 pr-9', 'px-3.5')}
                    />
                  </div>
                  {fe('zipCode')}
                </div>
              </div>
            </div>

            {/* ── Contraseña ───────────────────────────────────────────────── */}
            <div>
              <p className={`${LABEL} mb-3`}>Contraseña</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="reg-password" className={LABEL}>Contraseña</label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      name="reg-password-x"
                      type="password"
                      value={form.password}
                      onChange={e => handleChange({ ...e, target: { ...e.target, name: 'password' } })}
                      onBlur={e => handleBlur({ ...e, target: { ...e.target, name: 'password', value: form.password } })}
                      placeholder=""
                      autoComplete="new-password"
                      className={ic('password')}
                    />
                    {si('password')}
                  </div>
                  {fe('password')}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-confirm" className={LABEL}>Confirmar</label>
                  <div className="relative">
                    <input
                      id="reg-confirm"
                      name="reg-confirm-x"
                      type="password"
                      value={form.confirmPassword}
                      onChange={e => handleChange({ ...e, target: { ...e.target, name: 'confirmPassword' } })}
                      onBlur={e => handleBlur({ ...e, target: { ...e.target, name: 'confirmPassword', value: form.confirmPassword } })}
                      placeholder=""
                      autoComplete="new-password"
                      className={ic('confirmPassword')}
                    />
                    {si('confirmPassword')}
                  </div>
                  {fe('confirmPassword')}
                </div>
              </div>
            </div>

            {/* ── Términos ─────────────────────────────────────────────────── */}
            <div className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
              !acceptTerms && submitError.includes('términos') ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <button
                type="button"
                role="checkbox"
                aria-checked={acceptTerms}
                aria-label="Acepto los términos y condiciones de Harambal"
                onClick={() => { setAcceptTerms(v => !v); setSubmitError(''); }}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                  acceptTerms ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                {acceptTerms && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <p className="text-xs text-gray-600 leading-relaxed">
                Acepto los{' '}
                <button type="button" onClick={() => setShowTerms(true)} className="text-gray-900 font-semibold underline underline-offset-2 hover:text-gray-700 transition-colors">
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
