'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { Experiencia, ExperienciaCategoria } from '@/types/experiencia';
import { canEditContent } from '@/lib/permissions';

export default function ExperienciasPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><p>Cargando...</p></div>}>
      <ExperienciasContent />
    </Suspense>
  );
}

function ExperienciasContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEstacionId = searchParams.get('estacion_id') || '';

  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [loadingExperiencias, setLoadingExperiencias] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [estacionFilter, setEstacionFilter] = useState(initialEstacionId);
  const [estacionNombre, setEstacionNombre] = useState('');

  useEffect(() => {
    if (estacionFilter) {
      pb.collection('estaciones').getOne(estacionFilter, { requestKey: null })
        .then(record => setEstacionNombre(record.nombre))
        .catch(() => setEstacionNombre('Estación'));
    } else {
      setEstacionNombre('');
    }
  }, [estacionFilter]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchExperiencias() {
      if (user) {
        try {
          const records = await pb.collection('experiencias').getFullList<Experiencia>({
            sort: '-created',
            expand: 'estacion_id,responsable',
            requestKey: null,
          });
          setExperiencias(records);
        } catch (error) {
          console.error('Error fetching experiencias:', error);
        } finally {
          setLoadingExperiencias(false);
        }
      }
    }
    fetchExperiencias();
  }, [user]);

  const toggleExperienciaStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'inactivo' ? 'borrador' : 'inactivo';
      await pb.collection('experiencias').update(id, { estado: newStatus });
      setExperiencias(experiencias.map(e => e.id === id ? { ...e, estado: newStatus } : e));
    } catch (error) {
      console.error('Error toggling experiencia status:', error);
      alert('Error al cambiar el estado de la experiencia');
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

  // Aplicar filtros
  const filteredExperiencias = experiencias.filter((e) => {
    const matchesSearch = e.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFilter ? e.categoria === categoriaFilter : true;
    const matchesEstado = estadoFilter ? e.estado === estadoFilter : true;
    const matchesEstacion = estacionFilter ? e.estacion_id === estacionFilter : true;
    return matchesSearch && matchesCategoria && matchesEstado && matchesEstacion;
  });

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      taller: 'Taller',
      recorrido: 'Recorrido',
      degustacion: 'Degustación',
      demostracion: 'Demostración',
      convivencia: 'Convivencia',
      otros: 'Otros'
    };
    return labels[categoria] || categoria;
  };

  return (
    <div className="h-full bg-[var(--color-surface-dim)]">
      <main className="mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] font-display text-[var(--color-primary)]">
            Experiencias
          </h2>
          {canEdit && (
            <Link
              href="/experiencias/create"
              className="btn-primary px-4 py-2 text-sm"
            >
              + Nueva Experiencia
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-[var(--color-surface-container)] pl-8 pr-6 py-6 rounded-md flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por título..."
              className="input-field w-full text-[var(--color-on-surface-variant)] placeholder:text-[var(--color-surface-variant)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            {estacionFilter && (
              <button 
                onClick={() => { setEstacionFilter(''); router.replace('/experiencias'); }}
                className="input-field text-[var(--color-primary)] font-bold flex items-center gap-2 bg-[var(--color-primary-container)] whitespace-nowrap"
              >
                {estacionNombre ? `Estación: ${estacionNombre}` : 'Limpiar filtro'}
                <span>✕</span>
              </button>
            )}
            <select
              className="input-field text-[var(--color-on-surface-variant)]"
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              <option value="taller">Taller</option>
              <option value="recorrido">Recorrido</option>
              <option value="degustacion">Degustación</option>
              <option value="demostracion">Demostración</option>
              <option value="convivencia">Convivencia</option>
              <option value="otros">Otros</option>
            </select>
            <select
              className="input-field text-[var(--color-on-surface-variant)]"
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
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
          {loadingExperiencias ? (
            <p className="p-8 text-center text-[var(--color-on-surface-variant)]">Cargando experiencias...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {filteredExperiencias.map((e) => (
                  <Link 
                    key={e.id} 
                    href={`/experiencias/${e.id}`}
                    className={`bg-[var(--color-surface-container)] p-5 rounded-xl hover:bg-[var(--color-surface-container-low)] transition-all shadow-sm flex flex-col gap-2 cursor-pointer ${e.estado === 'inactivo' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-[var(--color-primary)]">{e.titulo}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.05em] shrink-0
                        ${e.estado === 'aprobado' ? 'bg-[var(--color-secondary-container)] text-[var(--color-primary)]' : 
                          e.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                          e.estado === 'en_revision' ? 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]' :
                          'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)]'}`}>
                        {e.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    
                    <div className="text-sm text-[var(--color-on-surface-variant)] flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {getCategoriaLabel(e.categoria)}
                      </span>
                      {e.expand?.estacion_id?.nombre && (
                        <span className="flex items-center gap-1.5 border-l border-[var(--color-outline-variant)] pl-4">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {e.expand.estacion_id.nombre}
                        </span>
                      )}
                      {e.expand?.responsable?.nombre && (
                        <span className="flex items-center gap-1.5 border-l border-[var(--color-outline-variant)] pl-4">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {e.expand.responsable.nombre}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {!loadingExperiencias && filteredExperiencias.length === 0 && (
                <div className="bg-[var(--color-surface-container)] p-8 text-center text-[var(--color-on-surface-variant)] rounded-md">
                  No se encontraron experiencias.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}