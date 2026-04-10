'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <header className="bg-[var(--color-surface-container)] shadow-sm">
      <div className="mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/">
            <h1 className="text-xl font-bold font-display text-[var(--color-primary)]">
              Ruta del Telar
            </h1>
          </Link>
          <nav className="flex gap-4">
            <Link 
              href="/"
              className={`text-sm font-medium px-3 py-2 rounded-md ${pathname === '/' ? 'bg-[var(--color-primary-container)] text-white' : 'text-[var(--color-secondary)] hover:bg-[var(--color-surface-variant)]'}`}
            >
              Dashboard
            </Link>
            
            <RoleGuard allowedRoles={['admin', 'editor', 'revisor', 'consultor']}>
              <Link 
                href="/estaciones"
                className={`text-sm font-medium px-3 py-2 rounded-md ${pathname.startsWith('/estaciones') ? 'bg-[var(--color-primary-container)] text-white' : 'text-[var(--color-secondary)] hover:bg-[var(--color-surface-variant)]'}`}
              >
                Estaciones
              </Link>
            </RoleGuard>

            <RoleGuard allowedRoles={['admin']}>
              <Link 
                href="/usuarios"
                className={`text-sm font-medium px-3 py-2 rounded-md ${pathname.startsWith('/usuarios') ? 'bg-[var(--color-primary-container)] text-white' : 'text-[var(--color-secondary)] hover:bg-[var(--color-surface-variant)]'}`}
              >
                Usuarios
              </Link>
              <Link 
                href="/carga-masiva"
                className={`text-sm font-medium px-3 py-2 rounded-md ${pathname.startsWith('/carga-masiva') ? 'bg-[var(--color-primary-container)] text-white' : 'text-[var(--color-secondary)] hover:bg-[var(--color-surface-variant)]'}`}
              >
                Carga Masiva
              </Link>
            </RoleGuard>
          </nav>
        </div>
        <div className="flex items-center space-x-6">
          <span className="text-sm font-medium text-[var(--color-secondary)]">
            {user.name || user.email}
          </span>
          <button
            onClick={logout}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
