'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { Estacion } from '@/types/estacion';
import { canEditContent } from '@/lib/permissions';

export default function EstacionesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [loadingEstaciones, setLoadingEstaciones] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [localidadFilter, setLocalidadFilter] = useState('');

  // Extract unique localities for the filter
  const localidades = Array.from(new Set(estaciones.map(e => e.localidad).filter(Boolean))).sort();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchEstaciones() {
      if (user) {
        try {
          // fetch without requestKey to avoid auto-cancellation
          const records = await pb.collection('estaciones').getFullList<Estacion>({
            sort: '-created',
            requestKey: null,
          });
          setEstaciones(records);
        } catch (error) {
          console.error('Error fetching estaciones:', error);
          // If the collection doesn't exist yet, it might throw an error. We handle it gracefully.
        } finally {
          setLoadingEstaciones(false);
        }
      }
    }
    fetchEstaciones();
  }, [user]);

  const toggleEstacionStatus = async (id: string, currentStatus: string) => {
    try {
      // US-14: Desactivar estación (cambia el estado a inactivo, o de inactivo a borrador)
      const newStatus = currentStatus === 'inactivo' ? 'borrador' : 'inactivo';
      await pb.collection('estaciones').update(id, { estado: newStatus });
      setEstaciones(estaciones.map(e => e.id === id ? { ...e, estado: newStatus } : e));
    } catch (error) {
      console.error('Error toggling estacion status:', error);
      alert('Error al cambiar el estado de la estación');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const canEdit = canEditContent(user as any);

  // Normalizar texto quitando acentos
  const normalizeText = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Apply filters
  const filteredEstaciones = estaciones.filter((e) => {
    const normalizedSearch = normalizeText(searchTerm);
    const matchesSearch = normalizeText(e.nombre).includes(normalizedSearch) || 
                          normalizeText(e.eslogan || '').includes(normalizedSearch) ||
                          normalizeText(e.localidad || '').includes(normalizedSearch) ||
                          normalizeText(e.departamento || '').includes(normalizedSearch);
    const matchesLocalidad = localidadFilter ? e.localidad === localidadFilter : true;
    const matchesStatus = statusFilter ? e.estado === statusFilter : true;
    return matchesSearch && matchesLocalidad && matchesStatus;
  });

  return (
    <div className="h-full bg-[var(--color-surface-dim)]">
      <main className="mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] font-display text-[var(--color-primary)]">
            Estaciones
          </h2>
          {canEdit && (
            <Link
              href="/estaciones/create"
              className="btn-primary px-4 py-2 text-sm"
            >
              + Nueva Estación
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-surface-container)] pl-8 pr-6 py-6 rounded-md flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, eslogan, localidad o departamento..."
              className="input-field w-full text-[var(--color-on-surface-variant)] placeholder:text-[var(--color-surface-variant)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="input-field text-[var(--color-on-surface-variant)]"
              value={localidadFilter}
              onChange={(e) => setLocalidadFilter(e.target.value)}
            >
              <option value="">Todas las localidades</option>
              {localidades.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <select
              className="input-field text-[var(--color-on-surface-variant)]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="en_revision">En revisión</option>
              <option value="aprobado">Aprobado</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {loadingEstaciones ? (
            <p className="p-8 text-center text-[var(--color-on-surface-variant)]">Cargando estaciones...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {filteredEstaciones.map((e) => (
                  <Link 
                    key={e.id} 
                    href={`/estaciones/${e.id}`}
                    className={`bg-[var(--color-surface-container)] p-5 rounded-xl hover:bg-[var(--color-surface-container-low)] transition-all shadow-sm flex flex-col gap-2 cursor-pointer ${e.estado === 'inactivo' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--color-primary)]">{e.nombre}</h3>
                        {e.eslogan && (
                          <p className="text-sm italic text-[var(--color-secondary)] mt-1">{e.eslogan}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.05em] shrink-0
                        ${e.estado === 'aprobado' ? 'bg-[var(--color-secondary-container)] text-[var(--color-primary)]' : 
                          e.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                          e.estado === 'en_revision' ? 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]' :
                          'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)]'}`}>
                        {e.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--color-on-surface-variant)] flex items-center gap-2 mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{e.localidad}</span>
                      {e.departamento && (
                        <span className="text-xs uppercase tracking-[0.05em] text-[var(--color-outline)]">
                          {e.departamento}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {filteredEstaciones.length === 0 && (
                <div className="bg-[var(--color-surface-container)] p-8 text-center text-[var(--color-on-surface-variant)] rounded-md">
                  No hay estaciones registradas o que coincidan con los filtros.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
