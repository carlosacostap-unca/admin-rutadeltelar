import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';
import { Imperdible } from '@/types/imperdible';

interface ImperdiblesTabProps {
  estacionId: string;
  user: any;
}

export default function ImperdiblesTab({ estacionId, user }: ImperdiblesTabProps) {
  const [imperdibles, setImperdibles] = useState<Imperdible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canEdit = user ? canEditContent(user) : false;

  useEffect(() => {
    async function fetchImperdibles() {
      try {
        const records = await pb.collection('imperdibles').getFullList<Imperdible>({
          filter: `estacion_id = "${estacionId}"`,
          sort: '-created',
          expand: 'actores_relacionados,productos_relacionados,experiencias_relacionadas',
        });
        setImperdibles(records);
      } catch (err) {
        console.error('Error fetching imperdibles for estacion:', err);
        setError('No se pudieron cargar los imperdibles asociados.');
      } finally {
        setLoading(false);
      }
    }

    if (estacionId) {
      fetchImperdibles();
    }
  }, [estacionId]);

  if (loading) {
    return <div className="text-center py-8 text-[var(--color-secondary)]">Cargando imperdibles...</div>;
  }

  if (error) {
    return <div className="text-[var(--color-error)] p-4 bg-[var(--color-error-container)] rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-[var(--color-primary)]">
          Imperdibles de la Estación ({imperdibles.length})
        </h3>
        {canEdit && (
          <Link
            href={`/imperdibles/create?estacion_id=${estacionId}`}
            className="btn-primary px-4 py-2 text-sm shadow-md flex items-center gap-2"
          >
            <span>+</span> Nuevo Imperdible
          </Link>
        )}
      </div>

      {imperdibles.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[var(--color-outline-variant)] rounded-lg bg-[var(--color-surface)]">
          <p className="text-[var(--color-secondary)] mb-4">No hay imperdibles registrados en esta estación.</p>
          {canEdit && (
            <Link
              href={`/imperdibles/create?estacion_id=${estacionId}`}
              className="text-[var(--color-primary)] hover:underline font-medium"
            >
              Registrar el primer imperdible
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {imperdibles.map(imperdible => (
            <div key={imperdible.id} className="border border-[var(--color-outline-variant)] rounded-lg p-5 bg-[var(--color-surface)] hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-3">
                <Link href={`/imperdibles/${imperdible.id}`} className="text-xl font-bold text-[var(--color-primary)] hover:underline">
                  {imperdible.titulo}
                </Link>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2
                  ${imperdible.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                    imperdible.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                    imperdible.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {imperdible.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-[var(--color-surface-container)] text-[var(--color-secondary)] px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">
                  {imperdible.tipo}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider
                  ${imperdible.prioridad === 'alta' ? 'bg-red-100 text-red-800' : 
                    imperdible.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'}`}>
                  Prioridad {imperdible.prioridad}
                </span>
              </div>
              
              <p className="text-sm text-[var(--color-on-surface-variant)] line-clamp-2 mb-4">
                {imperdible.descripcion || imperdible.subtitulo || 'Sin descripción'}
              </p>

              {imperdible.expand?.actores_relacionados && imperdible.expand.actores_relacionados.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--color-outline-variant)] text-sm text-[var(--color-secondary)]">
                  <span className="font-medium">Actores relacionados:</span> {imperdible.expand.actores_relacionados.map(a => a.nombre).join(', ')}
                </div>
              )}
              {imperdible.expand?.productos_relacionados && imperdible.expand.productos_relacionados.length > 0 && (
                <div className="mt-1 text-sm text-[var(--color-secondary)]">
                  <span className="font-medium">Productos relacionados:</span> {imperdible.expand.productos_relacionados.map(p => p.nombre).join(', ')}
                </div>
              )}
              {imperdible.expand?.experiencias_relacionadas && imperdible.expand.experiencias_relacionadas.length > 0 && (
                <div className="mt-1 text-sm text-[var(--color-secondary)]">
                  <span className="font-medium">Experiencias relacionadas:</span> {imperdible.expand.experiencias_relacionadas.map(e => e.titulo).join(', ')}
                </div>
              )}
              
              {canEdit && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white/90 backdrop-blur p-1 rounded-md shadow-sm">
                  <Link
                    href={`/imperdibles/${imperdible.id}/edit`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Editar imperdible"
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
