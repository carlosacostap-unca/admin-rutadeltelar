'use client';

import { useEffect, useMemo, useState } from 'react';
import pb from '@/lib/pocketbase';
import { ComentarioEntidad, FeedbackEntityType, PuntuacionEntidad } from '@/types/feedback';

interface EntityFeedbackSectionProps {
  entityType: FeedbackEntityType;
  entityId: string;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

const renderStars = (value: number) => {
  const normalized = Math.max(0, Math.min(5, Math.round(value)));
  return `${'★'.repeat(normalized)}${'☆'.repeat(5 - normalized)}`;
};

export default function EntityFeedbackSection({
  entityType,
  entityId,
}: EntityFeedbackSectionProps) {
  const [comentarios, setComentarios] = useState<ComentarioEntidad[]>([]);
  const [puntuaciones, setPuntuaciones] = useState<PuntuacionEntidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchFeedback = async () => {
      try {
        const filter = `entidad_tipo = "${entityType}" && entidad_id = "${entityId}"`;
        const [comentariosRecords, puntuacionesRecords] = await Promise.all([
          pb.collection('comentarios').getFullList<ComentarioEntidad>({
            filter,
            sort: '-created',
            requestKey: null,
          }),
          pb.collection('puntuaciones').getFullList<PuntuacionEntidad>({
            filter,
            sort: '-created',
            requestKey: null,
          }),
        ]);

        if (!cancelled) {
          setComentarios(comentariosRecords);
          setPuntuaciones(puntuacionesRecords);
        }
      } catch (error) {
        const status = (error as any)?.status;
        if (status !== 404) {
          console.warn(`No se pudo cargar el feedback para ${entityType}/${entityId}:`, error);
        }
        if (!cancelled) {
          setComentarios([]);
          setPuntuaciones([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchFeedback();

    return () => {
      cancelled = true;
    };
  }, [entityType, entityId]);

  const promedio = useMemo(() => {
    if (puntuaciones.length === 0) return null;
    const total = puntuaciones.reduce((sum, item) => sum + (item.puntuacion || 0), 0);
    return total / puntuaciones.length;
  }, [puntuaciones]);

  return (
    <div className="mt-8 pt-6 border-t border-[var(--color-outline-variant)]">
      <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
        Comentarios y Puntuaciones
      </h3>

      {loading ? (
        <p className="text-sm text-[var(--color-on-surface-variant)]">Cargando feedback...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--color-surface)] p-5 rounded-md border border-[var(--color-outline-variant)]">
            <h4 className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-4">
              Comentarios
            </h4>
            {comentarios.length > 0 ? (
              <div className="space-y-3">
                {comentarios.map((comentario) => (
                  <div key={comentario.id} className="border border-[var(--color-outline-variant)] rounded-md p-3 bg-[var(--color-surface-container)]">
                    <p className="text-sm text-[var(--color-on-surface)] whitespace-pre-wrap">
                      {comentario.comentario}
                    </p>
                    <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                      {comentario.autor_nombre || 'Sin autor'}{comentario.created ? ` · ${formatDate(comentario.created)}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-[var(--color-on-surface-variant)]">
                No hay comentarios registrados.
              </p>
            )}
          </div>

          <div className="bg-[var(--color-surface)] p-5 rounded-md border border-[var(--color-outline-variant)]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h4 className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em]">
                Puntuaciones
              </h4>
              <span className="text-sm font-medium text-[var(--color-primary)]">
                {promedio !== null ? `${promedio.toFixed(1)}/5` : 'Sin puntuaciones'}
              </span>
            </div>
            {puntuaciones.length > 0 ? (
              <div className="space-y-3">
                {puntuaciones.map((puntuacion) => (
                  <div key={puntuacion.id} className="border border-[var(--color-outline-variant)] rounded-md p-3 bg-[var(--color-surface-container)]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--color-primary)]">
                        {renderStars(puntuacion.puntuacion)} ({puntuacion.puntuacion}/5)
                      </span>
                      <span className="text-xs text-[var(--color-on-surface-variant)]">
                        {puntuacion.autor_nombre || 'Sin autor'}
                      </span>
                    </div>
                    {puntuacion.comentario && (
                      <p className="text-sm text-[var(--color-on-surface)] whitespace-pre-wrap mt-2">
                        {puntuacion.comentario}
                      </p>
                    )}
                    {puntuacion.created && (
                      <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                        {formatDate(puntuacion.created)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-[var(--color-on-surface-variant)]">
                No hay puntuaciones registradas.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
