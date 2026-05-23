'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Menú principal',
    href: '/dashboard/client',
    roles: ['CLIENTE'],
    icon: (active) => (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    label: 'Mis solicitudes',
    href: '/dashboard/requests',
    roles: ['CLIENTE'],
    icon: (active) => (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Historial',
    href: '/dashboard/history',
    roles: ['CLIENTE', 'PROVEEDOR'],
    icon: (active) => (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Menú principal',
    href: '/dashboard/provider',
    roles: ['PROVEEDOR'],
    icon: (active) => (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    label: 'Panel de control',
    href: '/dashboard/admin',
    roles: ['ADMIN'],
    icon: (active) => (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Usuarios',
    href: '/dashboard/admin/users',
    roles: ['ADMIN'],
    icon: (active) => (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-7 pt-7 pb-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="font-tight text-lg font-bold text-gray-900">Centro de Ayuda</h3>
          <p className="text-xs text-gray-400 mt-1">Estamos aquí para ayudarte</p>
        </div>

        <div className="h-px bg-gray-100 mx-7" />

        <div className="px-7 py-5 space-y-4">
          <a
            href="tel:9512185032"
            className="flex items-center gap-4 p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200 transition-all duration-150 group"
          >
            <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm group-hover:border-gray-300 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Teléfono</p>
              <p className="text-sm font-semibold text-gray-900">951 218 5032</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href="mailto:chernandez10.20.30.40@gmail.com"
            className="flex items-center gap-4 p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200 transition-all duration-150 group"
          >
            <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm group-hover:border-gray-300 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Correo</p>
              <p className="text-xs font-semibold text-gray-900 truncate">chernandez10.20.30.40@gmail.com</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 ml-auto shrink-0 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="px-7 pb-7">
          <button
            onClick={onClose}
            className="w-full h-10 text-sm font-semibold rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { open, close } = useSidebar();
  const [showHelp, setShowHelp] = useState(false);

  // Auto-close on navigation (mobile)
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (open && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const filtered = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {/* Overlay — mobile only, closes sidebar on tap */}
      <div
        className={cn(
          'fixed inset-0 z-30 lg:hidden transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          // Mobile: fixed overlay panel that slides in from left
          'fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 flex flex-col',
          'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
          open ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static, always visible in the flex flow
          'lg:relative lg:translate-x-0 lg:w-60 lg:z-auto lg:transition-none lg:will-change-auto',
        )}
      >
        {/* Brand */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M3 8h11l4 2-4 2H3a1 1 0 01-1-1V9a1 1 0 011-1z" />
                <rect x="1" y="9" width="3" height="2" rx="0.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">Harambal</span>
          </div>

          {/* Close button — visible only on mobile */}
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

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-0.5">
            {filtered.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                    active
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-normal',
                  )}
                >
                  {item.icon(active)}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Help Center */}
        <div className="px-3 py-3 border-t border-gray-200 shrink-0">
          <button
            onClick={() => setShowHelp(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-150 group"
          >
            <svg
              className="w-4 h-4 shrink-0 group-hover:text-gray-700 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Centro de Ayuda</span>
          </button>
        </div>
      </aside>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
