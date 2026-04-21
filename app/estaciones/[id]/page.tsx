'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb, { updateRecordAndReload } from '@/lib/pocketbase';
import Link from 'next/link';
import { canEditContent, hasAnyRole } from '@/lib/permissions';
import { Estacion } from '@/types/estacion';
import ContentStatusManager from '@/components/ContentStatusManager';
import Map from '@/components/Map';
import { getCatalogoLabel } from '@/lib/catalogos';
import EntityFeedbackSection from '@/components/EntityFeedbackSection';
import { deleteRecordWithAudit } from '@/lib/audit';

export default function EstacionDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [estacion, setEstacion] = useState<Estacion | null>(null);
  const [counts, setCounts] = useState({ actores: 0, productos: 0, experiencias: 0, imperdibles: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchEstacion() {
      if (!id || !user) return;

      const countCollection = async (collectionName: string, filters: string[]) => {
        for (const filter of filters) {
          try {
            const records = await pb.collection(collectionName).getFullList({
              filter,
              fields: 'id',
              requestKey: null,
            });
            return records.length;
          } catch (error) {
            console.warn(`No se pudo contar ${collectionName} con el filtro "${filter}"`, error);
          }
        }
        return 0;
      };
      
      try {
        const record = await pb.collection('estaciones').getOne<Estacion>(id, {
          requestKey: null,
          expand: 'departamento,created_by,updated_by',
        });
        setEstacion(record);

        // Fetch counts for related collections
        const [actoresCount, productosCount, experienciasCount, imperdiblesCount] = await Promise.all([
          countCollection('actores', [`estacion_id = "${id}"`]),
          countCollection('productos', [
            `estacion_id = "${id}" || estaciones_relacionadas ?= "${id}"`,
            `estacion_id = "${id}"`,
          ]),
          countCollection('experiencias', [`estacion_id = "${id}"`]),
          countCollection('imperdibles', [`estacion_id = "${id}"`]),
        ]);

        setCounts({
          actores: actoresCount,
          productos: productosCount,
          experiencias: experienciasCount,
          imperdibles: imperdiblesCount
        });

      } catch (err) {
        console.error('Error fetching estacion:', err);
        setError('No se pudo cargar la estación. Es posible que no exista.');
      } finally {
        setLoadingData(false);
      }
    }
    
    fetchEstacion();
  }, [id, user]);

  const toggleEstacionStatus = async () => {
    if (!estacion) return;
    
    try {
      const newStatus = estacion.estado === 'inactivo' ? 'borrador' : 'inactivo';
      const refreshedRecord = await updateRecordAndReload<Estacion>(
        'estaciones',
        id,
        { estado: newStatus },
        'departamento,created_by,updated_by'
      );
      setEstacion(refreshedRecord);
    } catch (error) {
      console.error('Error toggling estacion status:', error);
      alert('Error al cambiar el estado de la estación');
    }
  };

  const handleDelete = async () => {
    if (!estacion || !hasAnyRole(user as any, ['admin'])) return;
    const confirmed = window.confirm(`¿Seguro que deseas eliminar la estación "${estacion.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      await deleteRecordWithAudit('estaciones', estacion.id, user);
      router.push('/estaciones');
    } catch (error) {
      console.error('Error deleting estacion:', error);
      alert('Error al eliminar la estación');
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
  const fotoPortada = estacion?.foto_portada || estacion?.fotos?.[0] || null;
  const galeriaLegacy = estacion?.fotos
    ? estacion.foto_portada
      ? estacion.fotos
      : estacion.fotos.slice(1)
    : [];
  const galeriaFotos = Array.from(
    new Set([...(estacion?.galeria_fotos || []), ...galeriaLegacy])
  );

  return (
    <div className="h-full bg-[var(--color-surface)]">
      <main className="mx-auto px-6 py-8">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm shadow-md">&larr; Volver</button>
        </div>

        {loadingData ? (
          <div className="bg-[var(--color-surface-container)] p-8 rounded-[8px] shadow-sm text-center">
            Cargando datos...
          </div>
        ) : error ? (
          <div className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] p-6 rounded-md">
            {error}
          </div>
        ) : estacion ? (
          <>
            {/* Encabezado */}
            <div className={`bg-[var(--color-surface-container)] p-8 rounded-t-[8px]  mb-1 ${estacion.estado === 'inactivo' ? 'opacity-80 bg-gray-50 border-l-4 border-red-500' : ''}`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className={`text-3xl font-bold font-display ${estacion.estado === 'inactivo' ? 'text-gray-500' : 'text-[var(--color-primary)]'}`}>
                      {estacion.nombre}
                    </h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${estacion.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                        estacion.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                        estacion.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {estacion.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  {estacion.eslogan && (
                    <p className="text-[var(--color-secondary)] text-base italic mb-1">
                      {estacion.eslogan}
                    </p>
                  )}
                  <p className="text-[var(--color-secondary)] text-lg">
                    {estacion.localidad}
                  </p>
                  {estacion.departamento && (
                    <p className="text-[var(--color-secondary)] text-sm mt-1">
                      Departamento: {getCatalogoLabel(estacion.expand?.departamento, estacion.departamento)}
                    </p>
                  )}
                  <p className="text-[var(--color-secondary)] text-sm mt-1">
                    Estación inaugurada: {estacion.posee_estacion_inaugurada ? 'Sí' : 'No'}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 items-end">
                  <ContentStatusManager
                    collectionName="estaciones"
                    recordId={estacion.id}
                    currentState={estacion.estado}
                    observaciones={estacion.observaciones_revision}
                    expand="departamento,created_by,updated_by"
                    user={user}
                    onStatusChange={(updated) => setEstacion(updated)}
                  />
                  {canEdit && (
                    <div className="flex gap-3">
                      <button 
                        onClick={toggleEstacionStatus}
                        className={`font-medium transition-colors px-4 py-2 border rounded-full text-sm ${estacion.estado === 'inactivo' ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                      >
                        {estacion.estado === 'inactivo' ? 'Restaurar' : 'Desactivar'}
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
                        href={`/estaciones/${estacion.id}/edit`}
                        className="btn-primary px-4 py-2 text-sm shadow-md"
                      >
                        Editar Estación
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido General - Dashboard */}
            <div className="bg-[var(--color-surface-container)] p-8 rounded-b-[8px] min-h-[300px] flex flex-col gap-12">
              
              {/* Información General */}
              <section className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-3 uppercase tracking-[0.05em]">
                    Descripción General
                  </h3>
                  {estacion.descripcion_general ? (
                    <div
                      className="text-[var(--color-on-surface)] leading-7 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: estacion.descripcion_general }}
                    />
                  ) : (
                    <p className="text-[var(--color-on-surface)]">
                      No hay descripción disponible.
                    </p>
                  )}
                </div>
                
              </section>

              <hr className="border-[var(--color-outline-variant)]" />

              <div className="mt-8">
                <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                  Foto de portada
                </h3>
                {fotoPortada ? (
                  <div className="max-w-sm">
                    <div className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
                      <img
                        src={pb.files.getURL(estacion, fotoPortada)}
                        alt={`Portada de ${estacion.nombre}`}
                        className="object-contain w-full h-full p-1"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[var(--color-on-surface-variant)] italic">
                    No hay foto de portada disponible para esta estación.
                  </p>
                )}
              </div>

              <hr className="border-[var(--color-outline-variant)]" />

              <div className="mt-8">
                <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                  Galería de fotos
                </h3>
                {galeriaFotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {galeriaFotos.map((foto, index) => (
                      <div key={index} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
                        <img
                          src={pb.files.getURL(estacion, foto)}
                          alt={`Foto de galería ${index + 1} de ${estacion.nombre}`}
                          className="object-contain w-full h-full p-1"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--color-on-surface-variant)] italic">
                    No hay fotos en la galería de esta estación.
                  </p>
                )}
              </div>

              <hr className="border-[var(--color-outline-variant)]" />

              <div className="mt-8">
                <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-3 uppercase tracking-[0.05em]">
                  Ubicación
                </h3>
                {estacion.latitud !== undefined && estacion.latitud !== null && estacion.longitud !== undefined && estacion.longitud !== null ? (
                  <div className="w-full">
                    <Map lat={estacion.latitud} lng={estacion.longitud} label={estacion.nombre} />
                    <p className="text-xs text-[var(--color-outline)] mt-2">
                      Latitud: {estacion.latitud} | Longitud: {estacion.longitud}
                    </p>
                  </div>
                ) : (
                  <p className="text-[var(--color-outline)]">Coordenadas no especificadas</p>
                )}
              </div>

              <hr className="border-[var(--color-outline-variant)]" />

              {/* Resumen */}
              <section>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href={`/actores?estacion_id=${estacion.id}`} className="block bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-lg p-6 text-center shadow-sm hover:shadow-md hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-variant)] transition-all cursor-pointer">
                    <p className="text-[var(--color-outline)] text-xs font-bold uppercase tracking-wider mb-2">Actores</p>
                    <p className="text-4xl font-display font-bold text-[var(--color-primary)]">{counts.actores}</p>
                  </Link>
                  <Link href={`/productos?estacion_id=${estacion.id}`} className="block bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-lg p-6 text-center shadow-sm hover:shadow-md hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-variant)] transition-all cursor-pointer">
                    <p className="text-[var(--color-outline)] text-xs font-bold uppercase tracking-wider mb-2">Productos</p>
                    <p className="text-4xl font-display font-bold text-[var(--color-primary)]">{counts.productos}</p>
                  </Link>
                  <Link href={`/experiencias?estacion_id=${estacion.id}`} className="block bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-lg p-6 text-center shadow-sm hover:shadow-md hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-variant)] transition-all cursor-pointer">
                    <p className="text-[var(--color-outline)] text-xs font-bold uppercase tracking-wider mb-2">Experiencias</p>
                    <p className="text-4xl font-display font-bold text-[var(--color-primary)]">{counts.experiencias}</p>
                  </Link>
                  <Link href={`/imperdibles?estacion_id=${estacion.id}`} className="block bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-lg p-6 text-center shadow-sm hover:shadow-md hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-variant)] transition-all cursor-pointer">
                    <p className="text-[var(--color-outline)] text-xs font-bold uppercase tracking-wider mb-2">Imperdibles</p>
                    <p className="text-4xl font-display font-bold text-[var(--color-primary)]">{counts.imperdibles}</p>
                  </Link>
                </div>
              </section>

              <EntityFeedbackSection entityType="estaciones" entityId={estacion.id} />

            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
