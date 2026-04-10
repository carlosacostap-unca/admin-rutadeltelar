'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header';
import ContentStatusManager from '@/components/ContentStatusManager';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { canEditContent } from '@/lib/permissions';
import { Imperdible, ImperdibleTipo } from '@/types/imperdible';

const Map = dynamic(() => import('@/components/Map'), { ssr: false }) as React.FC<{ lat: number; lng: number; zoom?: number; label?: string }>;

export default function ImperdibleDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [imperdible, setImperdible] = useState<Imperdible | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchImperdible() {
      if (!id || !user) return;
      
      try {
        const record = await pb.collection('imperdibles').getOne<Imperdible>(id, {
          expand: 'estacion_id,actores_relacionados,productos_relacionados,experiencias_relacionadas,created_by,updated_by',
          requestKey: null,
        });
        setImperdible(record);
      } catch (err) {
        console.error('Error fetching imperdible:', err);
        setError('No se pudo cargar el imperdible. Es posible que no exista.');
      } finally {
        setLoadingData(false);
      }
    }
    
    fetchImperdible();
  }, [id, user]);

  const toggleImperdibleStatus = async () => {
    if (!imperdible) return;
    
    try {
      const newStatus = imperdible.estado === 'inactivo' ? 'borrador' : 'inactivo';
      const updatedRecord = await pb.collection('imperdibles').update<Imperdible>(id, { estado: newStatus });
      setImperdible({ ...imperdible, estado: updatedRecord.estado });
    } catch (error) {
      console.error('Error toggling imperdible status:', error);
      alert('Error al cambiar el estado del imperdible');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const canEdit = canEditContent(user as any);

  const getTipoLabel = (tipo: ImperdibleTipo | string) => {
    const labels: Record<string, string> = {
      lugar: 'Lugar',
      actividad: 'Actividad',
      evento: 'Evento',
      atractivo: 'Atractivo',
      otro: 'Otro'
    };
    return labels[tipo as string] || tipo;
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Header />
      <main className="mx-auto px-6 py-8 max-w-5xl">
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
          >
            &larr; Volver
          </button>
        </div>

        {loadingData ? (
          <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px] shadow-sm text-center">
            Cargando datos...
          </div>
        ) : error ? (
          <div className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] p-6 rounded-md">
            {error}
          </div>
        ) : imperdible ? (
          <>
            <ContentStatusManager
              collectionName="imperdibles"
              recordId={imperdible.id}
              currentState={imperdible.estado}
              observaciones={imperdible.observaciones_revision}
              user={user}
              onStatusChange={(updatedRecord) => setImperdible(updatedRecord as Imperdible)}
            />
            <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)]">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8 pb-6 border-b border-[var(--color-surface-variant)]">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold font-display text-[var(--color-primary)]">
                    {imperdible.titulo}
                  </h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${imperdible.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                      imperdible.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                      imperdible.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {imperdible.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${imperdible.prioridad === 'alta' ? 'bg-red-100 text-red-800' : 
                      imperdible.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}`}>
                    Prioridad: {imperdible.prioridad.toUpperCase()}
                  </span>
                </div>
                {imperdible.subtitulo && (
                  <p className="text-lg text-[var(--color-secondary)] mb-3">
                    {imperdible.subtitulo}
                  </p>
                )}
                <div className="flex items-center gap-4 text-[var(--color-secondary)] mt-3">
                  <span className="bg-[var(--color-surface-container)] px-3 py-1 rounded-full text-sm">
                    {getTipoLabel(imperdible.tipo)}
                  </span>
                  {imperdible.expand?.estacion_id && (
                    <Link href={`/estaciones/${imperdible.expand.estacion_id.id}`} className="hover:text-[var(--color-primary)] transition-colors flex items-center">
                      📍 {imperdible.expand.estacion_id.nombre}
                    </Link>
                  )}
                </div>
              </div>
              
              {canEdit && (
                <div className="flex gap-3">
                  <button 
                    onClick={toggleImperdibleStatus}
                    className={`font-medium transition-colors px-4 py-2 border rounded-full text-sm ${imperdible.estado === 'inactivo' ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                  >
                    {imperdible.estado === 'inactivo' ? 'Restaurar' : 'Desactivar'}
                  </button>
                  <Link
                    href={`/imperdibles/${imperdible.id}/edit`}
                    className="btn-primary px-4 py-2 text-sm shadow-md"
                  >
                    Editar Imperdible
                  </Link>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-2 uppercase tracking-wider">
                    Descripción Completa
                  </h3>
                  <p className="text-[var(--color-on-surface)] whitespace-pre-wrap">
                    {imperdible.descripcion || 'No hay descripción disponible.'}
                  </p>
                </div>

                {imperdible.motivo_destaque && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-2 uppercase tracking-wider">
                      Motivo de Destaque
                    </h3>
                    <p className="text-[var(--color-on-surface)] whitespace-pre-wrap bg-[var(--color-surface-container)] p-4 rounded-md italic">
                      {imperdible.motivo_destaque}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-2 uppercase tracking-wider">
                    Recomendaciones
                  </h3>
                  <p className="text-[var(--color-on-surface)] whitespace-pre-wrap">
                    {imperdible.recomendaciones || 'No hay recomendaciones específicas.'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[var(--color-surface)] p-4 rounded-md border border-[var(--color-outline-variant)]">
                  <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-3 uppercase tracking-wider">
                    Detalles Operativos y Ubicación
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                      <span className="text-[var(--color-on-surface-variant)]">Ubicación:</span>
                      <span className="font-medium text-[var(--color-on-surface)]">{imperdible.ubicacion || 'No especificada'}</span>
                    </div>
                    {(imperdible.latitud !== undefined && imperdible.longitud !== undefined && imperdible.latitud !== 0 && imperdible.longitud !== 0) && (
                      <div className="pt-2">
                        <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2 mb-4">
                          <span className="text-[var(--color-on-surface-variant)]">Coordenadas:</span>
                          <span className="font-medium text-[var(--color-on-surface)]">{imperdible.latitud}, {imperdible.longitud}</span>
                        </div>
                        <Map lat={imperdible.latitud} lng={imperdible.longitud} label={imperdible.titulo} />
                      </div>
                    )}
                    <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                      <span className="text-[var(--color-on-surface-variant)]">Duración Sugerida:</span>
                      <span className="font-medium text-[var(--color-on-surface)]">{imperdible.duracion_sugerida || 'No especificada'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                      <span className="text-[var(--color-on-surface-variant)]">Accesibilidad:</span>
                      <span className="font-medium text-[var(--color-on-surface)]">{imperdible.accesibilidad || 'No especificada'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                      <span className="text-[var(--color-on-surface-variant)]">Horarios:</span>
                      <span className="font-medium text-[var(--color-on-surface)]">{imperdible.horarios || 'No especificados'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                      <span className="text-[var(--color-on-surface-variant)]">Estacionalidad:</span>
                      <span className="font-medium text-[var(--color-on-surface)]">{imperdible.estacionalidad || 'No especificada'}</span>
                    </div>
                    {imperdible.videos_enlaces && (
                      <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                        <span className="text-[var(--color-on-surface-variant)]">Enlaces/Videos:</span>
                        <a href={imperdible.videos_enlaces} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-primary)] hover:underline truncate max-w-[200px]">
                          {imperdible.videos_enlaces}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-3 uppercase tracking-wider">
                    Entidades Relacionadas
                  </h3>
                  <div className="space-y-4">
                    {imperdible.expand?.actores_relacionados && imperdible.expand.actores_relacionados.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-[var(--color-on-surface-variant)] mb-2">Actores</h4>
                        <div className="flex flex-col gap-2">
                          {imperdible.expand.actores_relacionados.map(actor => (
                            <div key={actor.id} className="flex items-center p-2 bg-[var(--color-surface)] rounded-md border border-[var(--color-outline-variant)]">
                              <Link href={`/actores/${actor.id}`} className="font-medium text-[var(--color-primary)] hover:underline flex-1 text-sm">
                                {actor.nombre}
                              </Link>
                              <span className="text-[10px] text-[var(--color-secondary)] bg-[var(--color-surface-variant)] px-2 py-0.5 rounded-full capitalize">
                                {actor.tipo}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {imperdible.expand?.productos_relacionados && imperdible.expand.productos_relacionados.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-[var(--color-on-surface-variant)] mb-2">Productos</h4>
                        <div className="flex flex-col gap-2">
                          {imperdible.expand.productos_relacionados.map(prod => (
                            <div key={prod.id} className="flex items-center p-2 bg-[var(--color-surface)] rounded-md border border-[var(--color-outline-variant)]">
                              <Link href={`/productos/${prod.id}`} className="font-medium text-[var(--color-primary)] hover:underline flex-1 text-sm">
                                {prod.nombre}
                              </Link>
                              <span className="text-[10px] text-[var(--color-secondary)] bg-[var(--color-surface-variant)] px-2 py-0.5 rounded-full capitalize">
                                {prod.categoria}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {imperdible.expand?.experiencias_relacionadas && imperdible.expand.experiencias_relacionadas.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-[var(--color-on-surface-variant)] mb-2">Experiencias</h4>
                        <div className="flex flex-col gap-2">
                          {imperdible.expand.experiencias_relacionadas.map(exp => (
                            <div key={exp.id} className="flex items-center p-2 bg-[var(--color-surface)] rounded-md border border-[var(--color-outline-variant)]">
                              <Link href={`/experiencias/${exp.id}`} className="font-medium text-[var(--color-primary)] hover:underline flex-1 text-sm">
                                {exp.titulo}
                              </Link>
                              <span className="text-[10px] text-[var(--color-secondary)] bg-[var(--color-surface-variant)] px-2 py-0.5 rounded-full capitalize">
                                {exp.categoria}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!imperdible.expand?.actores_relacionados?.length && !imperdible.expand?.productos_relacionados?.length && !imperdible.expand?.experiencias_relacionadas?.length) && (
                      <p className="text-[var(--color-on-surface-variant)] italic text-sm">
                        No hay entidades relacionadas asignadas.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {imperdible.fotos && imperdible.fotos.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[var(--color-surface-variant)]">
                <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-4 uppercase tracking-wider">
                  Fotos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imperdible.fotos.map((foto, index) => (
                    <div key={index} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
                      <img 
                        src={pb.files.getUrl(imperdible, foto)} 
                        alt={`Foto de ${imperdible.titulo}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[var(--color-surface-variant)]">
              <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-4 uppercase tracking-wider">
                Historial
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--color-secondary)]">
                <div>
                  <span className="font-medium block mb-1">Creado el</span> 
                  {new Date(imperdible.created).toLocaleString()}
                  {imperdible.expand?.created_by && (
                    <span className="block mt-1 text-xs">Por: {imperdible.expand.created_by.name || imperdible.expand.created_by.email}</span>
                  )}
                </div>
                <div>
                  <span className="font-medium block mb-1">Última actualización</span> 
                  {new Date(imperdible.updated).toLocaleString()}
                  {imperdible.expand?.updated_by && (
                    <span className="block mt-1 text-xs">Por: {imperdible.expand.updated_by.name || imperdible.expand.updated_by.email}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
