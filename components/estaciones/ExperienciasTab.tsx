import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';
import { Experiencia } from '@/types/experiencia';

interface ExperienciasTabProps {
  estacionId: string;
  user: any;
}

export default function ExperienciasTab({ estacionId, user }: ExperienciasTabProps) {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canEdit = user ? canEditContent(user) : false;

  useEffect(() => {
    async function fetchExperiencias() {
      try {
        const records = await pb.collection('experiencias').getFullList<Experiencia>({
          filter: `estacion_id = "${estacionId}"`,
          sort: '-created',
          requestKey: null,
          expand: 'responsable'
        });
        setExperiencias(records);
      } catch (err) {
        console.error('Error fetching experiencias for estacion:', err);
        setError('No se pudieron cargar las experiencias asociadas.');
      } finally {
        setLoading(false);
      }
    }

    if (estacionId) {
      fetchExperiencias();
    }
  }, [estacionId]);

  if (loading) {
    return <div className="text-center py-8 text-[var(--color-secondary)]">Cargando experiencias...</div>;
  }

  if (error) {
    return <div className="text-[var(--color-error)] p-4 bg-[var(--color-error-container)] rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-[var(--color-primary)]">
          Experiencias de la Estación ({experiencias.length})
        </h3>
        {canEdit && (
          <Link
            href={`/experiencias/create?estacion_id=${estacionId}`}
            className="btn-primary px-4 py-2 text-sm shadow-md flex items-center gap-2"
          >
            <span>+</span> Nueva Experiencia
          </Link>
        )}
      </div>

      {experiencias.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[var(--color-outline-variant)] rounded-lg bg-[var(--color-surface)]">
          <p className="text-[var(--color-secondary)] mb-4">No hay experiencias registradas en esta estación.</p>
          {canEdit && (
            <Link
              href={`/experiencias/create?estacion_id=${estacionId}`}
              className="text-[var(--color-primary)] hover:underline font-medium"
            >
              Registrar la primera experiencia
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiencias.map(experiencia => (
            <div key={experiencia.id} className="border border-[var(--color-outline-variant)] rounded-lg p-5 bg-[var(--color-surface)] hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-3">
                <Link href={`/experiencias/${experiencia.id}`} className="text-xl font-bold text-[var(--color-primary)] hover:underline">
                  {experiencia.titulo}
                </Link>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2
                  ${experiencia.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                    experiencia.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                    experiencia.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {experiencia.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-[var(--color-surface-container)] text-[var(--color-secondary)] px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">
                  {experiencia.categoria}
                </span>
                {experiencia.duracion && (
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">
                    ⏱ {experiencia.duracion}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-[var(--color-on-surface-variant)] line-clamp-2 mb-4">
                {experiencia.descripcion || 'Sin descripción'}
              </p>

              {experiencia.expand?.responsable && (
                <div className="mt-3 pt-3 border-t border-[var(--color-outline-variant)] text-xs text-[var(--color-secondary)]">
                  <span className="font-medium">Responsable:</span> {experiencia.expand.responsable.nombre}
                </div>
              )}
              
              {canEdit && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-[var(--color-surface-container)]/90 backdrop-blur p-1 rounded-md shadow-sm">
                  <Link
                    href={`/experiencias/${experiencia.id}/edit`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Editar experiencia"
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
