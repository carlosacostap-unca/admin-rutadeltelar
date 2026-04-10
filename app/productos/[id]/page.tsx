'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header';
import ContentStatusManager from '@/components/ContentStatusManager';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';
import { Producto, ProductoCategoria } from '@/types/producto';

export default function ProductoDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          expand: 'estacion_id,actores_relacionados,created_by,updated_by',
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
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const canEdit = canEditContent(user as any);

  const getCategoriaLabel = (cat: ProductoCategoria | string) => {
    const labels: Record<string, string> = {
      textil: 'Textil',
      ceramica: 'Cerámica',
      madera: 'Madera',
      metal: 'Metal',
      cuero: 'Cuero',
      gastronomia: 'Gastronomía',
      otros: 'Otros'
    };
    return labels[cat as string] || cat;
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Header />
      <main className="mx-auto px-6 py-8 max-w-4xl">
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
            <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)]">
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
                    {getCategoriaLabel(producto.categoria)}
                  </span>
                  {producto.expand?.estacion_id && (
                    <Link href={`/estaciones/${producto.expand.estacion_id.id}`} className="hover:text-[var(--color-primary)] transition-colors flex items-center">
                      📍 {producto.expand.estacion_id.nombre}
                    </Link>
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
                <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-3 uppercase tracking-wider">
                  Descripción
                </h3>
                <p className="text-[var(--color-on-surface)] whitespace-pre-wrap">
                  {producto.descripcion || 'No hay descripción disponible.'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-3 uppercase tracking-wider">
                  Actores Relacionados
                </h3>
                <div className="space-y-3">
                  {producto.expand?.actores_relacionados && producto.expand.actores_relacionados.length > 0 ? (
                    producto.expand.actores_relacionados.map(actor => (
                      <div key={actor.id} className="flex items-center p-3 bg-[var(--color-surface)] rounded-md border border-[var(--color-outline-variant)]">
                        <Link href={`/actores/${actor.id}`} className="font-medium text-[var(--color-primary)] hover:underline flex-1">
                          {actor.nombre}
                        </Link>
                        <span className="text-xs text-[var(--color-secondary)] bg-[var(--color-surface-variant)] px-2 py-1 rounded-full capitalize">
                          {actor.tipo}
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

            {producto.fotos && producto.fotos.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[var(--color-surface-variant)]">
                <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-4 uppercase tracking-wider">
                  Fotos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {producto.fotos.map((foto, index) => (
                    <div key={index} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
                      <img 
                        src={pb.files.getUrl(producto, foto)} 
                        alt={`Foto de ${producto.nombre}`}
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
                  {new Date(producto.created).toLocaleString()}
                  {producto.expand?.created_by && (
                    <span className="block mt-1 text-xs">Por: {producto.expand.created_by.name || producto.expand.created_by.email}</span>
                  )}
                </div>
                <div>
                  <span className="font-medium block mb-1">Última actualización</span> 
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
