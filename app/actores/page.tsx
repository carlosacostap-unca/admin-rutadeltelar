'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { Actor, ActorTipo } from '@/types/actor';
import Header from '@/components/Header';
import { canEditContent } from '@/lib/permissions';

export default function ActoresPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [actores, setActores] = useState<Actor[]>([]);
  const [loadingActores, setLoadingActores] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchActores() {
      if (user) {
        try {
          const records = await pb.collection('actores').getFullList<Actor>({
            sort: '-created',
            expand: 'estacion_id',
            requestKey: null,
          });
          setActores(records);
        } catch (error) {
          console.error('Error fetching actores:', error);
        } finally {
          setLoadingActores(false);
        }
      }
    }
    fetchActores();
  }, [user]);

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

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const canEdit = canEditContent(user as any);

  // Aplicar filtros
  const filteredActores = actores.filter((a) => {
    const matchesSearch = a.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter ? a.tipo === tipoFilter : true;
    const matchesEstado = estadoFilter ? a.estado === estadoFilter : true;
    return matchesSearch && matchesTipo && matchesEstado;
  });

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

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Header />
      <main className="mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Actores
          </h2>
          {canEdit && (
            <Link
              href="/actores/create"
              className="btn-primary px-4 py-2 text-sm shadow-md"
            >
              + Nuevo Actor
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="border border-[var(--color-outline)] rounded-md px-3 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border border-[var(--color-outline)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="artesano">Artesano</option>
            <option value="productor">Productor</option>
            <option value="hospedaje">Hospedaje</option>
            <option value="gastronomico">Gastronómico</option>
            <option value="guia">Guía de turismo</option>
          </select>
          <select
            className="border border-[var(--color-outline)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="en_revision">En revisión</option>
            <option value="aprobado">Aprobado</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="bg-[var(--color-surface-container-lowest)] rounded-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)] overflow-hidden">
          {loadingActores ? (
            <p className="p-8 text-center text-[var(--color-secondary)]">Cargando actores...</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] text-[var(--color-secondary)] text-sm">
                  <th className="py-3 px-6 font-semibold">Nombre</th>
                  <th className="py-3 px-6 font-semibold">Tipo</th>
                  <th className="py-3 px-6 font-semibold">Estación</th>
                  <th className="py-3 px-6 font-semibold">Estado</th>
                  <th className="py-3 px-6 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredActores.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--color-surface-variant)] hover:bg-[var(--color-surface-container-lowest)] transition-colors">
                    <td className="py-4 px-6 text-sm text-[var(--color-on-surface)] font-medium">{a.nombre}</td>
                    <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">{getTipoLabel(a.tipo)}</td>
                    <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">
                      {a.expand?.estacion_id?.nombre || <span className="text-[var(--color-outline)]">Sin estación</span>}
                    </td>
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
                          Ver detalle
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
                {filteredActores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--color-secondary)]">
                      No hay actores registrados o que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
