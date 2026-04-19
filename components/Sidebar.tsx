'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const activeLinkClasses = 'bg-[var(--color-primary-container)] text-[var(--color-surface-container)]';
  const inactiveLinkClasses = 'text-[var(--color-primary)] hover:bg-[var(--color-surface-variant)]';

  if (!user) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside 
        className={`w-64 bg-[var(--color-surface-container)] border-r border-[var(--color-surface-variant)] flex flex-col h-screen fixed top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-6 border-b border-[var(--color-surface-variant)] flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-extrabold tracking-[-0.02em] font-display text-[var(--color-primary)] leading-tight">
              Ruta del<br />Telar
            </h1>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)] transition-colors"
            aria-label="Cerrar menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <Link 
          href="/"
          className={`block px-4 py-3 rounded-md text-sm font-bold uppercase tracking-[0.05em] transition-colors ${pathname === '/' ? activeLinkClasses : inactiveLinkClasses}`}
        >
          Dashboard
        </Link>
        
        <RoleGuard allowedRoles={['admin', 'editor', 'revisor', 'consultor']}>
          <Link 
            href="/estaciones"
            className={`block px-4 py-3 rounded-md text-sm font-bold uppercase tracking-[0.05em] transition-colors ${pathname.startsWith('/estaciones') ? activeLinkClasses : inactiveLinkClasses}`}
          >
            Estaciones
          </Link>
          
          <Link 
            href="/actores"
            className={`block px-4 py-3 rounded-md text-sm font-bold uppercase tracking-[0.05em] transition-colors ${pathname.startsWith('/actores') ? activeLinkClasses : inactiveLinkClasses}`}
          >
            Actores
          </Link>

          <Link 
            href="/productos"
            className={`block px-4 py-3 rounded-md text-sm font-bold uppercase tracking-[0.05em] transition-colors ${pathname.startsWith('/productos') ? activeLinkClasses : inactiveLinkClasses}`}
          >
            Productos
          </Link>

          <Link 
            href="/experiencias"
            className={`block px-4 py-3 rounded-md text-sm font-bold uppercase tracking-[0.05em] transition-colors ${pathname.startsWith('/experiencias') ? activeLinkClasses : inactiveLinkClasses}`}
          >
            Experiencias
          </Link>

          <Link 
            href="/imperdibles"
            className={`block px-4 py-3 rounded-md text-sm font-bold uppercase tracking-[0.05em] transition-colors ${pathname.startsWith('/imperdibles') ? activeLinkClasses : inactiveLinkClasses}`}
          >
            Imperdibles
          </Link>
        </RoleGuard>

        <RoleGuard allowedRoles={['admin', 'revisor']}>
          <Link 
            href="/revision"
            className={`block px-4 py-3 rounded-md text-sm font-bold uppercase tracking-[0.05em] transition-colors ${pathname.startsWith('/revision') ? activeLinkClasses : inactiveLinkClasses}`}
          >
            Revisión
          </Link>
        </RoleGuard>

        <RoleGuard allowedRoles={['admin', 'editor']}>
          <Link 
            href="/borradores"
            className={`block px-4 py-3 rounded-md text-sm font-bold uppercase tracking-[0.05em] transition-colors ${pathname.startsWith('/borradores') ? activeLinkClasses : inactiveLinkClasses}`}
          >
            Borradores
          </Link>
        </RoleGuard>

        <RoleGuard allowedRoles={['admin']}>
          <Link 
            href="/usuarios"
            className={`block px-4 py-3 rounded-md text-sm font-bold uppercase tracking-[0.05em] transition-colors ${pathname.startsWith('/usuarios') ? activeLinkClasses : inactiveLinkClasses}`}
          >
            Usuarios
          </Link>
          <Link 
            href="/auditoria"
            className={`block px-4 py-3 rounded-md text-sm font-bold uppercase tracking-[0.05em] transition-colors ${pathname.startsWith('/auditoria') ? activeLinkClasses : inactiveLinkClasses}`}
          >
            Auditoría
          </Link>
        </RoleGuard>
      </div>
    </aside>
    </>
  );
}
