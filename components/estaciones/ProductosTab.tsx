import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';
import { Producto } from '@/types/producto';

interface ProductosTabProps {
  estacionId: string;
  user: any;
}

export default function ProductosTab({ estacionId, user }: ProductosTabProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canEdit = user ? canEditContent(user) : false;
  const getActorDisplayLabel = (actor: any) => {
    const estacionNombreActor = actor?.expand?.estacion_id?.nombre || '';
    return `${actor.nombre} (${estacionNombreActor})`;
  };

  useEffect(() => {
    async function fetchProductos() {
      try {
        const records = await pb.collection('productos').getFullList<Producto>({
          filter: `estacion_id = "${estacionId}" || estaciones_relacionadas ?= "${estacionId}"`,
          sort: '-created',
          requestKey: null,
          expand: 'actores_relacionados,actores_relacionados.estacion_id,estaciones_relacionadas'
        });
        setProductos(records);
      } catch (err) {
        console.error('Error fetching productos for estacion:', err);
        setError('No se pudieron cargar los productos asociados.');
      } finally {
        setLoading(false);
      }
    }

    if (estacionId) {
      fetchProductos();
    }
  }, [estacionId]);

  if (loading) {
    return <div className="text-center py-8 text-[var(--color-secondary)]">Cargando productos...</div>;
  }

  if (error) {
    return <div className="text-[var(--color-error)] p-4 bg-[var(--color-error-container)] rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-[var(--color-primary)]">
          Productos de la Estación ({productos.length})
        </h3>
        {canEdit && (
          <Link
            href={`/productos/create?estacion_id=${estacionId}`}
            className="btn-primary px-4 py-2 text-sm shadow-md flex items-center gap-2"
          >
            <span>+</span> Nuevo Producto
          </Link>
        )}
      </div>

      {productos.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[var(--color-outline-variant)] rounded-lg bg-[var(--color-surface)]">
          <p className="text-[var(--color-secondary)] mb-4">No hay productos registrados en esta estación.</p>
          {canEdit && (
            <Link
              href={`/productos/create?estacion_id=${estacionId}`}
              className="text-[var(--color-primary)] hover:underline font-medium"
            >
              Registrar el primer producto
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productos.map(producto => (
            <div key={producto.id} className="border border-[var(--color-outline-variant)] rounded-lg p-5 bg-[var(--color-surface)] hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-3">
                <Link href={`/productos/${producto.id}`} className="text-xl font-bold text-[var(--color-primary)] hover:underline">
                  {producto.nombre}
                </Link>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2
                  ${producto.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                    producto.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                    producto.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {producto.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-[var(--color-surface-container)] text-[var(--color-secondary)] px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">
                  {producto.categoria}
                </span>
              </div>
              
              <p className="text-sm text-[var(--color-on-surface-variant)] line-clamp-2 mb-4">
                {producto.descripcion || 'Sin descripción'}
              </p>

              {producto.expand?.actores_relacionados && producto.expand.actores_relacionados.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--color-outline-variant)] text-xs text-[var(--color-secondary)]">
                  <span className="font-medium">Actores:</span> {producto.expand.actores_relacionados.map((a) => getActorDisplayLabel(a)).join(', ')}
                </div>
              )}
              
              {canEdit && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-[var(--color-surface-container)]/90 backdrop-blur p-1 rounded-md shadow-sm">
                  <Link
                    href={`/productos/${producto.id}/edit`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Editar producto"
                  >
                    ✏️
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
