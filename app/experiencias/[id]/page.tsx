'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import ContentStatusManager from '@/components/ContentStatusManager';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';
import { Experiencia, ExperienciaCategoria } from '@/types/experiencia';

export default function ExperienciaDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [experiencia, setExperiencia] = useState<Experiencia | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchExperiencia() {
      if (!id || !user) return;
      
      try {
        const record = await pb.collection('experiencias').getOne<Experiencia>(id, {
          expand: 'estacion_id,responsable,created_by,updated_by',
          requestKey: null,
        });
        setExperiencia(record);
      } catch (err) {
        console.error('Error fetching experiencia:', err);
        setError('No se pudo cargar la experiencia. Es posible que no exista.');
      } finally {
        setLoadingData(false);
      }
    }
    
    fetchExperiencia();
  }, [id, user]);

  const toggleExperienciaStatus = async () => {
    if (!experiencia) return;
    
    try {
      const newStatus = experiencia.estado === 'inactivo' ? 'borrador' : 'inactivo';
      const updatedRecord = await pb.collection('experiencias').update<Experiencia>(id, { estado: newStatus });
      setExperiencia({ ...experiencia, estado: updatedRecord.estado });
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

  const getCategoriaLabel = (cat: ExperienciaCategoria | string) => {
    const labels: Record<string, string> = {
      taller: 'Taller',
      recorrido: 'Recorrido',
      degustacion: 'Degustación',
      demostracion: 'Demostración',
      convivencia: 'Convivencia',
      otros: 'Otros'
    };
    return labels[cat as string] || cat;
  };

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
        ) : experiencia ? (
          <>
            {/* Encabezado */}
            <div className={`bg-[var(--color-surface-container)] p-8 rounded-t-[8px] mb-1 ${experiencia.estado === 'inactivo' ? 'opacity-80 bg-gray-50 border-l-4 border-red-500' : ''}`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className={`text-3xl font-bold font-display ${experiencia.estado === 'inactivo' ? 'text-gray-500' : 'text-[var(--color-primary)]'}`}>
                      {experiencia.titulo}
                    </h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${experiencia.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                        experiencia.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                        experiencia.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {experiencia.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[var(--color-secondary)] mt-3">
                    <span className="bg-[var(--color-surface-variant)] px-3 py-1 rounded-full text-sm">
                      {getCategoriaLabel(experiencia.categoria)}
                    </span>
                    {experiencia.expand?.estacion_id && (
                      <Link href={`/estaciones/${experiencia.expand.estacion_id.id}`} className="hover:text-[var(--color-primary)] transition-colors flex items-center">
                        📍 {experiencia.expand.estacion_id.nombre}
                      </Link>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 items-end">
                  <ContentStatusManager
                    collectionName="experiencias"
                    recordId={experiencia.id}
                    currentState={experiencia.estado}
                    observaciones={experiencia.observaciones_revision}
                    user={user}
                    onStatusChange={(updatedRecord) => setExperiencia(updatedRecord as Experiencia)}
                  />
                  {canEdit && (
                    <div className="flex gap-3">
                      <button 
                        onClick={toggleExperienciaStatus}
                        className={`font-medium transition-colors px-4 py-2 border rounded-full text-sm ${experiencia.estado === 'inactivo' ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                      >
                        {experiencia.estado === 'inactivo' ? 'Restaurar' : 'Desactivar'}
                      </button>
                      <Link
                        href={`/experiencias/${experiencia.id}/edit`}
                        className="btn-primary px-4 py-2 text-sm shadow-md"
                      >
                        Editar Experiencia
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido General */}
            <div className="bg-[var(--color-surface-container)] p-8 rounded-b-[8px] min-h-[300px] flex flex-col gap-12">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                      Descripción General
                    </h3>
                    <p className="text-[var(--color-on-surface)] whitespace-pre-wrap">
                      {experiencia.descripcion || 'No hay descripción disponible.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                      Recomendaciones
                    </h3>
                    <p className="text-[var(--color-on-surface)] whitespace-pre-wrap">
                      {experiencia.recomendaciones || 'No hay recomendaciones específicas.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-[var(--color-surface)] p-6 rounded-md border border-[var(--color-outline-variant)]">
                    <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                      Detalles Operativos
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                        <span className="text-[var(--color-on-surface-variant)]">Duración:</span>
                        <span className="font-medium text-[var(--color-on-surface)]">{experiencia.duracion || 'No especificada'}</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--color-surface-variant)] pb-2">
                        <span className="text-[var(--color-on-surface-variant)]">Ubicación:</span>
                        <span className="font-medium text-[var(--color-on-surface)]">{experiencia.ubicacion || 'No especificada'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                      Responsable
                    </h3>
                    {experiencia.expand?.responsable ? (
                      <div className="flex items-center p-4 bg-[var(--color-surface)] rounded-md border border-[var(--color-outline-variant)]">
                        <Link href={`/actores/${experiencia.expand.responsable.id}`} className="font-medium text-[var(--color-primary)] hover:underline flex-1">
                          {experiencia.expand.responsable.nombre}
                        </Link>
                        <span className="text-xs text-[var(--color-secondary)] bg-[var(--color-surface-variant)] px-3 py-1 rounded-full capitalize font-medium tracking-wide">
                          {experiencia.expand.responsable.tipo}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[var(--color-on-surface-variant)] italic">
                        No hay responsable asignado.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-[var(--color-outline-variant)]" />

              <div>
                <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                  Fotos
                </h3>
                {experiencia.fotos && experiencia.fotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {experiencia.fotos.map((foto, index) => (
                      <div key={index} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
                        <img 
                          src={pb.files.getURL(experiencia, foto)} 
                          alt={`Foto de ${experiencia.titulo}`}
                          className="object-contain w-full h-full p-1"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--color-on-surface-variant)] italic">
                    No hay fotos disponibles para esta experiencia.
                  </p>
                )}
              </div>

              <hr className="border-[var(--color-outline-variant)]" />

              <div>
                <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                  Historial
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--color-secondary)]">
                  <div>
                    <span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Creado el</span> 
                    {new Date(experiencia.created).toLocaleString()}
                    {experiencia.expand?.created_by && (
                      <span className="block mt-1 text-xs">Por: {experiencia.expand.created_by.name || experiencia.expand.created_by.email}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Última actualización</span> 
                    {new Date(experiencia.updated).toLocaleString()}
                    {experiencia.expand?.updated_by && (
                      <span className="block mt-1 text-xs">Por: {experiencia.expand.updated_by.name || experiencia.expand.updated_by.email}</span>
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
