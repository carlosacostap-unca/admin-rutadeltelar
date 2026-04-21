'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import ContentStatusManager from '@/components/ContentStatusManager';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { canEditContent, hasAnyRole } from '@/lib/permissions';
import { Imperdible, ImperdibleTipo } from '@/types/imperdible';
import { getCatalogoLabel, normalizeCatalogName } from '@/lib/catalogos';
import { formatUtcToBrowserLocale, getBrowserTimeZoneLabel } from '@/lib/datetime';
import EntityFeedbackSection from '@/components/EntityFeedbackSection';
import { deleteRecordWithAudit } from '@/lib/audit';

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
          expand: 'estacion_id,tipo,prioridad,actores_relacionados,productos_relacionados,experiencias_relacionadas,created_by,updated_by',
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

  const handleDelete = async () => {
    if (!imperdible || !hasAnyRole(user as any, ['admin'])) return;
    const confirmed = window.confirm(`¿Seguro que deseas eliminar el imperdible "${imperdible.titulo}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      await deleteRecordWithAudit('imperdibles', imperdible.id, user);
      router.push('/imperdibles');
    } catch (error) {
      console.error('Error deleting imperdible:', error);
      alert('Error al eliminar el imperdible');
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
  const canDelete = hasAnyRole(user as any, ['admin']);
  const esEvento = normalizeCatalogName(imperdible?.expand?.tipo?.nombre || imperdible?.tipo) === 'evento';
  const fechaHoraEventoLabel = formatUtcToBrowserLocale(imperdible?.fecha_hora_evento);
  const gmtLabel = getBrowserTimeZoneLabel(imperdible?.fecha_hora_evento);

  return (
    <div className="h-full bg-[var(--color-surface)]">
      <main className="mx-auto px-6 py-8">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button 
            onClick={() => router.back()}
            className="btn-primary px-4 py-2 text-sm shadow-md"
          >
            &larr; Volver
          </button>
        </div>

        {loadingData ? (
          <div className="bg-[var(--color-surface-container)] p-8 rounded-[8px] shadow-sm text-center">
            Cargando datos...
          </div>
        ) : error ? (
          <div className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] p-6 rounded-md">
            {error}
          </div>
        ) : imperdible ? (
          <>
            {/* Encabezado */}
            <div className={`bg-[var(--color-surface-container)] p-8 rounded-t-[8px]  mb-1 ${imperdible.estado === 'inactivo' ? 'opacity-80 bg-gray-50 border-l-4 border-red-500' : ''}`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className={`text-3xl font-bold font-display ${imperdible.estado === 'inactivo' ? 'text-gray-500' : 'text-[var(--color-primary)]'}`}>
                      {imperdible.titulo}
                    </h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${imperdible.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                        imperdible.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                        imperdible.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {imperdible.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  {imperdible.subtitulo && (
                    <p className="text-lg text-[var(--color-secondary)] mb-3">
                      {imperdible.subtitulo}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-[var(--color-secondary)] mt-3">
                    <span className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] px-3 py-1 rounded-full text-sm font-medium">
                      {getCatalogoLabel(imperdible.expand?.tipo, imperdible.tipo)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-[0.05em] 
                      ${normalizeCatalogName(imperdible.expand?.prioridad?.nombre || imperdible.prioridad) === 'alta' ? 'bg-[var(--color-error-container)] text-[var(--color-surface-container)]' : 
                        normalizeCatalogName(imperdible.expand?.prioridad?.nombre || imperdible.prioridad) === 'media' ? 'bg-[var(--color-primary-container)] text-[var(--color-surface-container)]' : 
                        'bg-[var(--color-surface-variant)] text-[var(--color-surface-container)]'}`}>
                      Prioridad: {getCatalogoLabel(imperdible.expand?.prioridad, imperdible.prioridad)}
                    </span>
                    {imperdible.expand?.estacion_id && (
                      <Link href={`/estaciones/${imperdible.expand.estacion_id.id}`} className="hover:text-[var(--color-primary)] transition-colors flex items-center font-medium">
                        📍 {imperdible.expand.estacion_id.nombre}
                      </Link>
                    )}
                  </div>
                  {esEvento && fechaHoraEventoLabel && (
                    <p className="text-sm text-[var(--color-secondary)] mt-3">
                      Fecha y hora del evento: {fechaHoraEventoLabel} ({gmtLabel})
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 items-end">
                  <ContentStatusManager
                    collectionName="imperdibles"
                    recordId={imperdible.id}
                    currentState={imperdible.estado}
                    observaciones={imperdible.observaciones_revision}
                    expand="estacion_id,tipo,prioridad,actores_relacionados,productos_relacionados,experiencias_relacionadas,created_by,updated_by"
                    user={user}
                    onStatusChange={(updatedRecord) => setImperdible(updatedRecord as Imperdible)}
                  />
                  {canEdit && (
                    <div className="flex gap-3">
                      <button 
                        onClick={toggleImperdibleStatus}
                        className={`font-medium transition-colors px-4 py-2 border rounded-full text-sm ${imperdible.estado === 'inactivo' ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                      >
                        {imperdible.estado === 'inactivo' ? 'Restaurar' : 'Desactivar'}
                      </button>
                      {canDelete && (
                        <button
                          onClick={handleDelete}
                          className="font-medium transition-colors px-4 py-2 border rounded-full text-sm border-red-700 text-red-700 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      )}
                      <Link
                        href={`/imperdibles/${imperdible.id}/edit`}
                        className="btn-primary px-4 py-2 text-sm shadow-md"
                      >
                        Editar Imperdible
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido General - Dashboard */}
            <div className="bg-[var(--color-surface-container)] p-8 rounded-b-[8px] min-h-[300px] flex flex-col gap-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                    Descripción Completa
                  </h3>
                  <p className="text-[var(--color-on-surface)] whitespace-pre-wrap">
                    {imperdible.descripcion || 'No hay descripción disponible.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                    Recomendaciones
                  </h3>
                  <p className="text-[var(--color-on-surface)] whitespace-pre-wrap">
                    {imperdible.recomendaciones || 'No hay recomendaciones específicas.'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[var(--color-surface)] p-4 rounded-md border border-[var(--color-outline-variant)]">
                  <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                    Detalles Operativos y Ubicación
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                      <span className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em]">Ubicación:</span>
                      <span className="font-medium text-[var(--color-on-surface)] text-right">{imperdible.ubicacion || 'No especificada'}</span>
                    </div>
                    {(imperdible.latitud !== undefined && imperdible.longitud !== undefined && imperdible.latitud !== 0 && imperdible.longitud !== 0) && (
                      <div className="pt-2">
                        <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2 mb-4">
                          <span className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em]">Coordenadas:</span>
                          <span className="font-medium text-[var(--color-on-surface)]">{imperdible.latitud}, {imperdible.longitud}</span>
                        </div>
                        <Map lat={imperdible.latitud} lng={imperdible.longitud} label={imperdible.titulo} />
                      </div>
                    )}
                    <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                      <span className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em]">Duración Sugerida:</span>
                      <span className="font-medium text-[var(--color-on-surface)] text-right">{imperdible.duracion_sugerida || 'No especificada'}</span>
                    </div>
                    {esEvento && fechaHoraEventoLabel && (
                      <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                        <span className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em]">Fecha y hora:</span>
                        <span className="font-medium text-[var(--color-on-surface)] text-right">
                          {fechaHoraEventoLabel} ({gmtLabel})
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                      <span className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em]">Accesibilidad:</span>
                      <span className="font-medium text-[var(--color-on-surface)] text-right">{imperdible.accesibilidad || 'No especificada'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                      <span className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em]">Horarios:</span>
                      <span className="font-medium text-[var(--color-on-surface)] text-right">{imperdible.horarios || 'No especificados'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                      <span className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em]">Estacionalidad:</span>
                      <span className="font-medium text-[var(--color-on-surface)] text-right">{imperdible.estacionalidad || 'No especificada'}</span>
                    </div>
                    {imperdible.videos_enlaces && (
                      <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                        <span className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em]">Enlaces/Videos:</span>
                        <a href={imperdible.videos_enlaces} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-primary)] hover:underline truncate max-w-[200px] text-right">
                          {imperdible.videos_enlaces}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                    Entidades Relacionadas
                  </h3>
                  <div className="space-y-4">
                    {imperdible.expand?.actores_relacionados && imperdible.expand.actores_relacionados.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-2">Actores</h4>
                        <div className="flex flex-col gap-2">
                          {imperdible.expand.actores_relacionados.map(actor => (
                            <div key={actor.id} className="flex items-center p-3 bg-[var(--color-surface)] rounded-md border border-[var(--color-outline-variant)]">
                              <Link href={`/actores/${actor.id}`} className="font-medium text-[var(--color-primary)] hover:underline flex-1">
                                {actor.nombre}
                              </Link>
                              <span className="text-xs text-[var(--color-secondary)] bg-[var(--color-surface-variant)] px-2 py-1 rounded-full capitalize">
                                {actor.tipo}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {imperdible.expand?.productos_relacionados && imperdible.expand.productos_relacionados.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-2">Productos</h4>
                        <div className="flex flex-col gap-2">
                          {imperdible.expand.productos_relacionados.map(prod => (
                            <div key={prod.id} className="flex items-center p-3 bg-[var(--color-surface)] rounded-md border border-[var(--color-outline-variant)]">
                              <Link href={`/productos/${prod.id}`} className="font-medium text-[var(--color-primary)] hover:underline flex-1">
                                {prod.nombre}
                              </Link>
                              <span className="text-xs text-[var(--color-secondary)] bg-[var(--color-surface-variant)] px-2 py-1 rounded-full capitalize">
                                {prod.categoria}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {imperdible.expand?.experiencias_relacionadas && imperdible.expand.experiencias_relacionadas.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-2">Experiencias</h4>
                        <div className="flex flex-col gap-2">
                          {imperdible.expand.experiencias_relacionadas.map(exp => (
                            <div key={exp.id} className="flex items-center p-3 bg-[var(--color-surface)] rounded-md border border-[var(--color-outline-variant)]">
                              <Link href={`/experiencias/${exp.id}`} className="font-medium text-[var(--color-primary)] hover:underline flex-1">
                                {exp.titulo}
                              </Link>
                              <span className="text-xs text-[var(--color-secondary)] bg-[var(--color-surface-variant)] px-2 py-1 rounded-full capitalize">
                                {exp.categoria}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!imperdible.expand?.actores_relacionados?.length && !imperdible.expand?.productos_relacionados?.length && !imperdible.expand?.experiencias_relacionadas?.length) && (
                      <p className="text-sm italic text-[var(--color-on-surface-variant)]">
                        No hay entidades relacionadas asignadas.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-[var(--color-outline-variant)]" />

            <div className="mt-8">
              <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                Fotos
              </h3>
              {imperdible.fotos && imperdible.fotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imperdible.fotos.map((foto, index) => (
                    <div key={index} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
                      <img 
                        src={pb.files.getURL(imperdible, foto)} 
                        alt={`Foto de ${imperdible.titulo}`}
                        className="object-contain w-full h-full p-1"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--color-on-surface-variant)] italic">
                  No hay fotos disponibles para este imperdible.
                </p>
              )}
            </div>

            <hr className="border-[var(--color-outline-variant)]" />

            <EntityFeedbackSection entityType="imperdibles" entityId={imperdible.id} />

            <hr className="border-[var(--color-outline-variant)]" />

            <div className="mt-8">
              <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                Historial
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--color-on-surface-variant)]">
                <div>
                  <span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Creado el</span> 
                  {new Date(imperdible.created).toLocaleString()}
                  {imperdible.expand?.created_by && (
                    <span className="block mt-1 text-xs">Por: {imperdible.expand.created_by.name || imperdible.expand.created_by.email}</span>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Última actualización</span> 
                  {new Date(imperdible.updated).toLocaleString()}
                  {imperdible.expand?.updated_by && (
                    <span className="block mt-1 text-xs">Por: {imperdible.expand.updated_by.name || imperdible.expand.updated_by.email}</span>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
