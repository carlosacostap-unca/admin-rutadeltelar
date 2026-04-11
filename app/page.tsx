'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';

import RoleGuard from '@/components/RoleGuard';
import Link from 'next/link';

interface DashboardStats {
  estaciones: number;
  actores: number;
  productos: number;
  experiencias: number;
  imperdibles: number;
  usuarios: number;
}

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats>({
    estaciones: 0, actores: 0, productos: 0, experiencias: 0, imperdibles: 0, usuarios: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    // Si no hay usuario y ya terminó de cargar, enviarlo al login
    if (!user && !isLoading) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setIsLoadingStats(true);
      try {
        // Obtenemos solo el total de ítems de forma eficiente
        const [estaciones, actores, productos, experiencias, imperdibles] = await Promise.all([
          pb.collection('estaciones').getList(1, 1),
          pb.collection('actores').getList(1, 1),
          pb.collection('productos').getList(1, 1),
          pb.collection('experiencias').getList(1, 1),
          pb.collection('imperdibles').getList(1, 1),
        ]);

        let usuariosTotal = 0;
        if (user.roles?.includes('admin')) {
          const usuarios = await pb.collection('users').getList(1, 1);
          usuariosTotal = usuarios.totalItems;
        }

        setStats({
          estaciones: estaciones.totalItems,
          actores: actores.totalItems,
          productos: productos.totalItems,
          experiencias: experiencias.totalItems,
          imperdibles: imperdibles.totalItems,
          usuarios: usuariosTotal
        });
      } catch (error) {
        console.error('Error al cargar las estadísticas:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-[0.05em] animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-surface-dim)]">
      {/* Main Content */}
      <main className="mx-auto px-8 py-10 max-w-7xl">
        <div className="bg-[var(--color-surface-container)] pl-8 pr-6 py-8 rounded-md mb-12 border-l-4 border-[var(--color-primary)]">
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] font-display text-[var(--color-primary)] mb-4 leading-tight">
            Bienvenido/a, {user.name || 'Usuario'}
          </h2>
          <p className="text-base font-normal text-[var(--color-on-surface-variant)] leading-relaxed max-w-2xl">
            Has iniciado sesión correctamente. Desde este panel podrás acceder a las funciones del sistema según los roles que tienes asignados.
          </p>
        </div>

        {/* Resumen del Sistema */}
        <div className="mb-12">
          <h3 className="text-sm font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-6 border-b border-[var(--color-surface-variant)] pb-2 inline-block">
            Resumen General del Territorio
          </h3>
          
          {isLoadingStats ? (
            <div className="text-sm text-[var(--color-on-surface-variant)] font-bold uppercase tracking-[0.05em] animate-pulse">
              Calculando datos...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard title="Estaciones" count={stats.estaciones} href="/estaciones" />
              <StatCard title="Actores" count={stats.actores} href="/actores" />
              <StatCard title="Productos" count={stats.productos} href="/productos" />
              <StatCard title="Experiencias" count={stats.experiencias} href="/experiencias" />
              <StatCard title="Imperdibles" count={stats.imperdibles} href="/imperdibles" />
              {user.roles?.includes('admin') && (
                <StatCard title="Usuarios" count={stats.usuarios} href="/usuarios" />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, count, href }: { title: string, count: number, href: string }) {
  return (
    <Link href={href} className="bg-[var(--color-surface-container)] px-6 py-8 rounded-md flex flex-col items-center justify-center border-t-4 border-transparent hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-variant)] transition-all cursor-pointer">
      <span className="text-4xl font-extrabold text-[var(--color-primary)] font-display mb-3">{count}</span>
      <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-[0.05em] text-center">{title}</span>
    </Link>
  );
}
