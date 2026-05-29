'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { cn } from '@/lib/utils';

// ── Role configuration ────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; accent: string; bg: string; dot: string }> = {
  CLIENTE:   { label: 'Cliente',        accent: 'text-blue-600',   bg: 'bg-blue-50',   dot: 'bg-blue-500'   },
  PROVEEDOR: { label: 'Proveedor',      accent: 'text-emerald-600',bg: 'bg-emerald-50',dot: 'bg-emerald-500' },
  ADMIN:     { label: 'Administrador',  accent: 'text-violet-600', bg: 'bg-violet-50', dot: 'bg-violet-500'  },
};

// ── Nav items ─────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

function HomeIcon()     { return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>; }
function ListIcon()     { return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>; }
function HistoryIcon()  { return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function ChartIcon()    { return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>; }
function UsersIcon()    { return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function HelpIcon()     { return <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>; }

const navItems: NavItem[] = [
  { label: 'Inicio',          href: '/dashboard/client',   roles: ['CLIENTE'],            icon: <HomeIcon /> },
  { label: 'Mis solicitudes', href: '/dashboard/requests', roles: ['CLIENTE'],            icon: <ListIcon /> },
  { label: 'Historial',       href: '/dashboard/history',  roles: ['CLIENTE', 'PROVEEDOR'], icon: <HistoryIcon /> },
  { label: 'Inicio',          href: '/dashboard/provider', roles: ['PROVEEDOR'],          icon: <HomeIcon /> },
  { label: 'Panel',           href: '/dashboard/admin',    roles: ['ADMIN'],              icon: <ChartIcon /> },
  { label: 'Usuarios',        href: '/dashboard/admin/users', roles: ['ADMIN'],           icon: <UsersIcon /> },
];

// ── Help Modal ────────────────────────────────────────────────────────────────

function HelpModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-7 pt-7 pb-5">
          <button onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
            <HelpIcon />
          </div>
          <h3 className="font-tight text-lg font-bold text-gray-900">Centro de Ayuda</h3>
          <p className="text-xs text-gray-400 mt-1">Estamos aquí para ayudarte</p>
        </div>
        <div className="h-px bg-gray-100 mx-7" />
        <div className="px-7 py-5 space-y-3">
          {[
            { href: 'tel:9512185032', icon: <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>, label: 'Teléfono', value: '951 218 5032' },
            { href: 'mailto:soporte@harambal.mx', icon: <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, label: 'Correo', value: 'soporte@harambal.mx' },
          ].map(item => (
            <a key={item.href} href={item.href} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200 transition-all group">
              <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs group-hover:border-gray-300 transition-colors">{item.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{item.value}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 shrink-0 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
            </a>
          ))}
        </div>
        <div className="px-7 pb-7">
          <button onClick={onClose} className="w-full h-10 text-sm font-semibold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export function Sidebar() {
  const { user } = useAuth();
  const pathname  = usePathname();
  const { open, close } = useSidebar();
  const connected = useConnectionStatus();
  const [showHelp, setShowHelp] = useState(false);

  const role    = user?.role || 'CLIENTE';
  const cfg     = ROLE_CONFIG[role] ?? ROLE_CONFIG.CLIENTE;
  const filtered = navItems.filter(item => user && item.roles.includes(role));

  // Auto-close on navigation
  useEffect(() => { close(); }, [pathname, close]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open, close]);

  // Lock scroll on mobile
  useEffect(() => {
    if (open && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-30 lg:hidden transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 flex flex-col',
          'transition-transform duration-300 ease-premium will-change-transform',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0 lg:w-[220px] lg:z-auto lg:transition-none lg:will-change-auto',
        )}
      >
        {/* Brand */}
        <div className="h-[57px] flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
                <rect x="1" y="9" width="3" height="2" rx="0.5" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 tracking-tight">Harambal</span>
            </div>
          </div>

          {/* Close on mobile */}
          <button
            onClick={close}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar menú"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-4 pb-2">
          <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold', cfg.bg, cfg.accent)}>
            <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
            {cfg.label}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2 overflow-y-auto" aria-label="Navegación principal">
          <div className="space-y-0.5">
            {filtered.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                    active
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium',
                  )}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <div className={cn('absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full', cfg.dot)} />
                  )}
                  <span className={cn('transition-colors', active ? cfg.accent : 'text-gray-400 group-hover:text-gray-600')}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom: connection status + help */}
        <div className="px-2 py-3 border-t border-gray-100 shrink-0 space-y-1">
          {/* Connection indicator */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
            <div className="relative w-2 h-2 shrink-0">
              <div className={cn('w-2 h-2 rounded-full', connected ? 'bg-emerald-500' : 'bg-gray-300')} />
              {connected && <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping-slow" />}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {connected ? 'En línea' : 'Sin conexión'}
            </span>
          </div>

          {/* Help */}
          <button
            onClick={() => setShowHelp(true)}
            aria-label="Abrir centro de ayuda"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-150 font-medium"
          >
            <span className="text-gray-400">
              <HelpIcon />
            </span>
            <span>Centro de Ayuda</span>
          </button>
        </div>
      </aside>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
