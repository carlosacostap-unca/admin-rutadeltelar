'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { Imperdible, ImperdibleTipo, ImperdiblePrioridad } from '@/types/imperdible';
import { canEditContent } from '@/lib/permissions';

export default function ImperdiblesPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><p>Cargando...</p></div>}>
      <ImperdiblesContent />
    </Suspense>
  );
}

function ImperdiblesContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEstacionId = searchParams.get('estacion_id') || '';

  const [imperdibles, setImperdibles] = useState<Imperdible[]>([]);
  const [loadingImperdibles, setLoadingImperdibles] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [prioridadFilter, setPrioridadFilter] = useState('');
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
    async function fetchImperdibles() {
      if (user) {
        try {
          const records = await pb.collection('imperdibles').getFullList<Imperdible>({
            sort: '-created',
            expand: 'estacion_id,actor_relacionado',
            requestKey: null,
          });
          setImperdibles(records);
        } catch (error) {
          console.error('Error fetching imperdibles:', error);
        } finally {
          setLoadingImperdibles(false);
        }
      }
    }
    fetchImperdibles();
  }, [user]);

  const toggleImperdibleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'inactivo' ? 'borrador' : 'inactivo';
      await pb.collection('imperdibles').update(id, { estado: newStatus });
      setImperdibles(imperdibles.map(i => i.id === id ? { ...i, estado: newStatus } : i));
    } catch (error) {
      console.error('Error toggling imperdible status:', error);
      alert('Error al cambiar el estado del imperdible');
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
  const filteredImperdibles = imperdibles.filter((i) => {
    const matchesSearch = i.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter ? i.tipo === tipoFilter : true;
    const matchesPrioridad = prioridadFilter ? i.prioridad === prioridadFilter : true;
    const matchesEstado = estadoFilter ? i.estado === estadoFilter : true;
    const matchesEstacion = estacionFilter ? i.estacion_id === estacionFilter : true;
    return matchesSearch && matchesTipo && matchesPrioridad && matchesEstado && matchesEstacion;
  });

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      lugar: 'Lugar',
      actividad: 'Actividad',
      evento: 'Evento',
      atractivo: 'Atractivo',
      otro: 'Otro'
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="h-full bg-[var(--color-surface-dim)]">
      <main className="mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] font-display text-[var(--color-primary)]">
            Imperdibles
          </h2>
          {canEdit && (
            <Link
              href="/imperdibles/create"
              className="btn-primary px-4 py-2 text-sm"
            >
              + Nuevo Imperdible
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
                onClick={() => { setEstacionFilter(''); router.replace('/imperdibles'); }}
                className="input-field text-[var(--color-primary)] font-bold flex items-center gap-2 bg-[var(--color-primary-container)]"
              >
                {estacionNombre ? `Estación: ${estacionNombre}` : 'Limpiar filtro de Estación'}
                <span>✕</span>
              </button>
            )}
            <select
              className="input-field text-[var(--color-on-surface-variant)]"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="lugar">Lugar</option>
              <option value="actividad">Actividad</option>
              <option value="evento">Evento</option>
              <option value="atractivo">Atractivo</option>
              <option value="otro">Otro</option>
            </select>
            <select
              className="input-field text-[var(--color-on-surface-variant)]"
              value={prioridadFilter}
              onChange={(e) => setPrioridadFilter(e.target.value)}
            >
              <option value="">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
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

        <div className="flex flex-col gap-4">
          {loadingImperdibles ? (
            <p className="p-8 text-center text-[var(--color-on-surface-variant)]">Cargando imperdibles...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {filteredImperdibles.map((i) => (
                  <Link 
                    key={i.id} 
                    href={`/imperdibles/${i.id}`}
                    className={`bg-[var(--color-surface-container)] p-5 rounded-xl hover:bg-[var(--color-surface-container-low)] transition-all shadow-sm flex flex-col gap-2 cursor-pointer ${i.estado === 'inactivo' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-[var(--color-primary)]">{i.titulo}</h3>
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.05em] 
                          ${i.prioridad === 'alta' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                            i.prioridad === 'media' ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]' : 
                            'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]'}`}>
                          {i.prioridad.toUpperCase()}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.05em] shrink-0
                        ${i.estado === 'aprobado' ? 'bg-[var(--color-secondary-container)] text-[var(--color-primary)]' : 
                          i.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                          i.estado === 'en_revision' ? 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]' :
                          'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)]'}`}>
                        {i.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    
                    <div className="text-sm text-[var(--color-on-surface-variant)] flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {getTipoLabel(i.tipo)}
                      </span>
                      {i.expand?.estacion_id?.nombre && (
                        <span className="flex items-center gap-1.5 border-l border-[var(--color-outline-variant)] pl-4">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {i.expand.estacion_id.nombre}
                        </span>
                      )}
                      {i.expand?.actores_relacionados && i.expand.actores_relacionados.length > 0 && (
                        <span className="flex items-center gap-1.5 border-l border-[var(--color-outline-variant)] pl-4">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {i.expand.actores_relacionados[0].nombre} {i.expand.actores_relacionados.length > 1 && `(+${i.expand.actores_relacionados.length - 1})`}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {!loadingImperdibles && filteredImperdibles.length === 0 && (
                <div className="bg-[var(--color-surface-container)] p-8 text-center text-[var(--color-on-surface-variant)] rounded-md">
                  No se encontraron imperdibles.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
