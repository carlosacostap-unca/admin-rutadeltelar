'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import ContentStatusManager from '@/components/ContentStatusManager';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';
import { Producto, ProductoCategoria } from '@/types/producto';
import { getCatalogoLabel } from '@/lib/catalogos';
import EntityFeedbackSection from '@/components/EntityFeedbackSection';

export default function ProductoDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getActorDisplayLabel = (actor: any) => {
    const estacionNombreActor = actor?.expand?.estacion_id?.nombre || '';
    return `${actor.nombre} (${estacionNombreActor})`;
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchProducto() {
      if (!id || !user) return;
      
      try {
        const record = await pb.collection('productos').getOne<Producto>(id, {
          expand: 'estacion_id,estaciones_relacionadas,categoria,subcategoria,tecnicas,actores_relacionados,actores_relacionados.estacion_id,actores_relacionados.tipo,created_by,updated_by',
          requestKey: null,
        });
        setProducto(record);
      } catch (err) {
        console.error('Error fetching producto:', err);
        setError('No se pudo cargar el producto. Es posible que no exista.');
      } finally {
        setLoadingData(false);
      }
    }
    
    fetchProducto();
  }, [id, user]);

  const toggleProductoStatus = async () => {
    if (!producto) return;
    
    try {
      const newStatus = producto.estado === 'inactivo' ? 'borrador' : 'inactivo';
      const updatedRecord = await pb.collection('productos').update<Producto>(id, { estado: newStatus });
      setProducto({ ...producto, estado: updatedRecord.estado });
    } catch (error) {
      console.error('Error toggling producto status:', error);
      alert('Error al cambiar el estado del producto');
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
  const estacionesRelacionadas = producto?.expand?.estaciones_relacionadas && producto.expand.estaciones_relacionadas.length > 0
    ? producto.expand.estaciones_relacionadas
    : producto?.expand?.estacion_id
      ? [producto.expand.estacion_id]
      : [];

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
          <div className="bg-[var(--color-surface-container)] p-8 rounded-[8px] text-center">
            Cargando datos...
          </div>
        ) : error ? (
          <div className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] p-6 rounded-md">
            {error}
          </div>
        ) : producto ? (
          <>
            <ContentStatusManager
              collectionName="productos"
              recordId={producto.id}
              currentState={producto.estado}
              observaciones={producto.observaciones_revision}
              user={user}
              onStatusChange={(updatedRecord) => setProducto(updatedRecord as Producto)}
            />
            <div className="bg-[var(--color-surface-container)] p-8 rounded-[8px]">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8 pb-6 border-b border-[var(--color-surface-variant)]">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold font-display text-[var(--color-primary)]">
                    {producto.nombre}
                  </h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${producto.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                      producto.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                      producto.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {producto.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[var(--color-secondary)] mt-3">
                  <span className="bg-[var(--color-surface-container)] px-3 py-1 rounded-full text-sm">
                    {getCatalogoLabel(producto.expand?.categoria, producto.categoria)}
                  </span>
                  {producto.subcategoria && (
                    <span className="bg-[var(--color-surface)] px-3 py-1 rounded-full text-sm">
                      {getCatalogoLabel(producto.expand?.subcategoria, producto.subcategoria)}
                    </span>
                  )}
                  {estacionesRelacionadas.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                      {estacionesRelacionadas.map((estacion) => (
                        <Link
                          key={estacion.id}
                          href={`/estaciones/${estacion.id}`}
                          className="hover:text-[var(--color-primary)] transition-colors flex items-center"
                        >
                          📍 {estacion.nombre}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {canEdit && (
                <div className="flex gap-3">
                  <button 
                    onClick={toggleProductoStatus}
                    className={`font-medium transition-colors px-4 py-2 border rounded-full text-sm ${producto.estado === 'inactivo' ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                  >
                    {producto.estado === 'inactivo' ? 'Restaurar' : 'Desactivar'}
                  </button>
                  <Link
                    href={`/productos/${producto.id}/edit`}
                    className="btn-primary px-4 py-2 text-sm shadow-md"
                  >
                    Editar Producto
                  </Link>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                  Descripción
                </h3>
                <p className="text-[var(--color-on-surface)] whitespace-pre-wrap">
                  {producto.descripcion || 'No hay descripción disponible.'}
                </p>

                <div className="mt-6">
                  <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                    Técnicas
                  </h3>
                  {producto.expand?.tecnicas && producto.expand.tecnicas.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {producto.expand.tecnicas.map((tecnica) => (
                        <span
                          key={tecnica.id}
                          className="px-3 py-1 rounded-full bg-[var(--color-primary-container)] text-[var(--color-surface-container)] text-sm font-medium"
                        >
                          {tecnica.nombre}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--color-on-surface-variant)] italic">
                      No hay técnicas asociadas a este producto.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                  Actores Relacionados
                </h3>
                <div className="space-y-3">
                  {producto.expand?.actores_relacionados && producto.expand.actores_relacionados.length > 0 ? (
                    producto.expand.actores_relacionados.map(actor => (
                      <div key={actor.id} className="flex items-center p-3 bg-[var(--color-surface)] rounded-md border border-[var(--color-outline-variant)]">
                        <Link href={`/actores/${actor.id}`} className="font-medium text-[var(--color-primary)] hover:underline flex-1">
                          {getActorDisplayLabel(actor)}
                        </Link>
                        <span className="text-xs text-[var(--color-secondary)] bg-[var(--color-surface-variant)] px-2 py-1 rounded-full capitalize">
                          {getCatalogoLabel(actor.expand?.tipo, actor.tipo)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--color-on-surface-variant)] italic">
                      No hay actores vinculados a este producto.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--color-outline-variant)]">
              <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                Fotos
              </h3>
              {producto.fotos && producto.fotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {producto.fotos.map((foto, index) => (
                    <div key={index} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
                      <img 
                        src={pb.files.getURL(producto, foto)} 
                        alt={`Foto de ${producto.nombre}`}
                        className="object-contain w-full h-full p-1"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--color-on-surface-variant)] italic">
                  No hay fotos disponibles para este producto.
                </p>
              )}
            </div>

            <EntityFeedbackSection entityType="productos" entityId={producto.id} />

            <div className="mt-8 pt-6 border-t border-[var(--color-outline-variant)]">
              <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                Historial
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--color-secondary)]">
                <div>
                  <span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Creado el</span> 
                  {new Date(producto.created).toLocaleString()}
                  {producto.expand?.created_by && (
                    <span className="block mt-1 text-xs">Por: {producto.expand.created_by.name || producto.expand.created_by.email}</span>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Última actualización</span> 
                  {new Date(producto.updated).toLocaleString()}
                  {producto.expand?.updated_by && (
                    <span className="block mt-1 text-xs">Por: {producto.expand.updated_by.name || producto.expand.updated_by.email}</span>
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
