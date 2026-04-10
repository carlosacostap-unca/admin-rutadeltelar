'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import Header from '@/components/Header';
import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no hay usuario y ya terminó de cargar, enviarlo al login
    if (!user && !isLoading) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Header />

      {/* Main Content */}
      <main className="mx-auto px-6 py-8">
        <div className="bg-[var(--color-surface-container-lowest)] p-8 shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)] rounded-[8px] mb-8">
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)] mb-4">
            Bienvenido, {user.name || 'Usuario'}
          </h2>
          <p className="text-sm text-[var(--color-secondary)] leading-relaxed max-w-2xl">
            Has iniciado sesión correctamente. Desde este panel podrás acceder a las funciones del sistema según los roles que tienes asignados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RoleGuard allowedRoles={['admin']}>
            <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-[8px] shadow-sm border border-[var(--color-outline-variant)]">
              <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-2">Administración</h3>
              <p className="text-sm text-[var(--color-secondary)] mb-4">Gestiona los usuarios, sus roles y permisos dentro del sistema.</p>
              <Link href="/usuarios" className="text-[var(--color-tertiary-fixed)] font-medium text-sm hover:underline">
                Ir a Usuarios &rarr;
              </Link>
            </div>
          </RoleGuard>

          <RoleGuard allowedRoles={['admin', 'editor']}>
            <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-[8px] shadow-sm border border-[var(--color-outline-variant)]">
              <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-2">Edición de Contenido</h3>
              <p className="text-sm text-[var(--color-secondary)] mb-4">Crea y edita estaciones, actores, productos, experiencias e imperdibles.</p>
              <Link href="/estaciones" className="text-[var(--color-tertiary-fixed)] font-medium text-sm hover:underline">
                Gestionar Estaciones &rarr;
              </Link>
            </div>
          </RoleGuard>

          <RoleGuard allowedRoles={['admin', 'revisor']}>
            <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-[8px] shadow-sm border border-[var(--color-outline-variant)]">
              <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-2">Revisión</h3>
              <p className="text-sm text-[var(--color-secondary)] mb-4">Revisa la calidad de la información cargada y aprueba o rechaza el contenido.</p>
              <Link href="/estaciones" className="text-[var(--color-tertiary-fixed)] font-medium text-sm hover:underline">
                Ver Pendientes &rarr;
              </Link>
            </div>
          </RoleGuard>

          <RoleGuard allowedRoles={['consultor']}>
            <div className="bg-[var(--color-surface-container-lowest)] p-6 rounded-[8px] shadow-sm border border-[var(--color-outline-variant)]">
              <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-2">Consulta</h3>
              <p className="text-sm text-[var(--color-secondary)] mb-4">Explora la información de estaciones y actores del territorio.</p>
              <Link href="/estaciones" className="text-[var(--color-tertiary-fixed)] font-medium text-sm hover:underline">
                Explorar Datos &rarr;
              </Link>
            </div>
          </RoleGuard>
        </div>
      </main>
    </div>
  );
}
