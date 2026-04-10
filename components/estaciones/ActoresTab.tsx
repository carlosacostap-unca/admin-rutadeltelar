'use client';

import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { Actor, ActorTipo } from '@/types/actor';
import { canEditContent } from '@/lib/permissions';

export default function ActoresTab({ estacionId, user }: { estacionId: string, user: any }) {
  const [actores, setActores] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActores() {
      try {
        const records = await pb.collection('actores').getFullList<Actor>({
          filter: `estacion_id = "${estacionId}"`,
          sort: '-created',
          requestKey: null,
        });
        setActores(records);
      } catch (error) {
        console.error('Error fetching actores for tab:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchActores();
  }, [estacionId]);

  const toggleActorStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'inactivo' ? 'borrador' : 'inactivo';
      await pb.collection('actores').update(id, { estado: newStatus });
      setActores(actores.map(a => a.id === id ? { ...a, estado: newStatus } : a));
    } catch (error) {
      console.error('Error toggling actor status:', error);
      alert('Error al cambiar el estado del actor');
    }
  };

  const canEdit = canEditContent(user);

  const getTipoLabel = (tipo: ActorTipo) => {
    const labels: Record<ActorTipo, string> = {
      artesano: 'Artesano',
      productor: 'Productor',
      hospedaje: 'Hospedaje',
      gastronomico: 'Gastronómico',
      guia: 'Guía de turismo'
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return <div className="text-center py-8 text-[var(--color-secondary)]">Cargando actores...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-on-surface)]">
          Actores de la Estación
        </h3>
        {canEdit && (
          <Link
            href={`/actores/create?estacion_id=${estacionId}`}
            className="btn-primary px-4 py-2 text-sm shadow-md"
          >
            + Nuevo Actor
          </Link>
        )}
      </div>

      <div className="bg-[var(--color-surface)] rounded-md border border-[var(--color-outline-variant)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] text-[var(--color-secondary)] text-sm">
              <th className="py-3 px-6 font-semibold">Nombre</th>
              <th className="py-3 px-6 font-semibold">Tipo</th>
              <th className="py-3 px-6 font-semibold">Estado</th>
              <th className="py-3 px-6 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actores.map((a) => (
              <tr key={a.id} className="border-b border-[var(--color-surface-variant)] hover:bg-[var(--color-surface-container)] transition-colors">
                <td className="py-4 px-6 text-sm text-[var(--color-on-surface)] font-medium">{a.nombre}</td>
                <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">{getTipoLabel(a.tipo)}</td>
                <td className="py-4 px-6 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${a.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                      a.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                      a.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {a.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/actores/${a.id}`} className="text-[var(--color-primary)] hover:text-[var(--color-on-primary-container)] font-medium transition-colors">
                      Ver
                    </Link>
                    {canEdit && (
                      <>
                        <Link href={`/actores/${a.id}/edit`} className="text-[var(--color-tertiary-fixed)] hover:text-[var(--color-on-tertiary-fixed-variant)] font-medium transition-colors">
                          Editar
                        </Link>
                        <button 
                          onClick={() => toggleActorStatus(a.id, a.estado)}
                          className={`font-medium transition-colors ${a.estado === 'inactivo' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                        >
                          {a.estado === 'inactivo' ? 'Restaurar' : 'Desactivar'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {actores.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[var(--color-secondary)]">
                  No hay actores registrados en esta estación.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
