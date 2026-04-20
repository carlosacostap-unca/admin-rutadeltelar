'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { Actor, ActorTipo } from '@/types/actor';
import { canEditContent } from '@/lib/permissions';
import CatalogSelect from '@/components/CatalogSelect';
import { getCatalogoLabel } from '@/lib/catalogos';

export default function ActoresPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><p>Cargando...</p></div>}>
      <ActoresContent />
    </Suspense>
  );
}

function ActoresContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEstacionId = searchParams.get('estacion_id') || '';
  
  const [actores, setActores] = useState<Actor[]>([]);
  const [loadingActores, setLoadingActores] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
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
    async function fetchActores() {
      if (user) {
        try {
          const records = await pb.collection('actores').getFullList<Actor>({
            sort: '-created',
            expand: 'estacion_id,tipo',
            requestKey: null,
          });
          setActores(records);
        } catch (error) {
          console.error('Error fetching actores:', error);
        } finally {
          setLoadingActores(false);
        }
      }
    }
    fetchActores();
  }, [user]);

  const toggleActorStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'inactivo' ? 'borrador' : 'inactivo';
      await pb.collection('actores').update(id, { estado: newStatus });
      setActores(actores.map(a => a.id === id ? { ...a, estado: newStatus } : a));
    } catch (error) {
      console.error('Error toggling actor status:', error);
      alert('Error al cambiar el estado del actor');
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
  const filteredActores = actores.filter((a) => {
    const matchesSearch = a.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter ? a.tipo === tipoFilter : true;
    const matchesEstado = estadoFilter ? a.estado === estadoFilter : true;
    const matchesEstacion = estacionFilter ? a.estacion_id === estacionFilter : true;
    return matchesSearch && matchesTipo && matchesEstado && matchesEstacion;
  });

  return (
    <div className="h-full bg-[var(--color-surface-dim)]">
      <main className="mx-auto px-6 py-8">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm shadow-md">&larr; Volver</button>
          <div className="flex justify-between items-center w-full">
            <h2 className="text-2xl font-extrabold tracking-[-0.02em] font-display text-[var(--color-primary)]">
              Actores
            </h2>
            {canEdit && (
              <Link
                href="/actores/create"
                className="btn-primary px-4 py-2 text-sm"
              >
                + Nuevo Actor
              </Link>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-[var(--color-surface-container)] pl-8 pr-6 py-6 rounded-md flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="input-field w-full text-[var(--color-on-surface-variant)] placeholder:text-[var(--color-surface-variant)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            {estacionFilter && (
              <button 
                onClick={() => { setEstacionFilter(''); router.replace('/actores'); }}
                className="input-field text-[var(--color-primary)] font-bold flex items-center gap-2 bg-[var(--color-primary-container)]"
              >
                {estacionNombre ? `Estación: ${estacionNombre}` : 'Limpiar filtro de Estación'}
                <span>✕</span>
              </button>
            )}
            <CatalogSelect
              collectionName="tipos_actor"
              value={tipoFilter}
              onChange={setTipoFilter}
              emptyLabel="Todos los tipos"
              className="input-field text-[var(--color-on-surface-variant)]"
            />
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
          {loadingActores ? (
            <p className="p-8 text-center text-[var(--color-on-surface-variant)]">Cargando actores...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {filteredActores.map((a) => (
                  <Link 
                    key={a.id} 
                    href={`/actores/${a.id}`}
                    className={`bg-[var(--color-surface-container)] p-5 rounded-xl hover:bg-[var(--color-surface-container-low)] transition-all shadow-sm flex flex-col gap-2 cursor-pointer ${a.estado === 'inactivo' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-[var(--color-primary)]">{a.nombre}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.05em] shrink-0
                        ${a.estado === 'aprobado' ? 'bg-[var(--color-secondary-container)] text-[var(--color-primary)]' : 
                          a.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                          a.estado === 'en_revision' ? 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]' :
                          'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)]'}`}>
                        {a.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--color-on-surface-variant)] flex flex-wrap items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {getCatalogoLabel(a.expand?.tipo, a.tipo)}
                      </span>
                      {a.expand?.estacion_id?.nombre && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {a.expand.estacion_id.nombre}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {filteredActores.length === 0 && (
                <div className="bg-[var(--color-surface-container)] p-8 text-center text-[var(--color-on-surface-variant)] rounded-md">
                  No hay actores registrados o que coincidan con los filtros.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
