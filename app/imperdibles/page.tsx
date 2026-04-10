'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { Imperdible, ImperdibleTipo, ImperdiblePrioridad } from '@/types/imperdible';
import Header from '@/components/Header';
import { canEditContent } from '@/lib/permissions';

export default function ImperdiblesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [imperdibles, setImperdibles] = useState<Imperdible[]>([]);
  const [loadingImperdibles, setLoadingImperdibles] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [prioridadFilter, setPrioridadFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchImperdibles() {
      if (user) {
        try {
          const records = await pb.collection('imperdibles').getFullList<Imperdible>({
            sort: '-created',
            expand: 'estacion_id,actor_relacionado',
            requestKey: null,
          });
          setImperdibles(records);
        } catch (error) {
          console.error('Error fetching imperdibles:', error);
        } finally {
          setLoadingImperdibles(false);
        }
      }
    }
    fetchImperdibles();
  }, [user]);

  const toggleImperdibleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'inactivo' ? 'borrador' : 'inactivo';
      await pb.collection('imperdibles').update(id, { estado: newStatus });
      setImperdibles(imperdibles.map(i => i.id === id ? { ...i, estado: newStatus } : i));
    } catch (error) {
      console.error('Error toggling imperdible status:', error);
      alert('Error al cambiar el estado del imperdible');
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
  const filteredImperdibles = imperdibles.filter((i) => {
    const matchesSearch = i.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter ? i.tipo === tipoFilter : true;
    const matchesPrioridad = prioridadFilter ? i.prioridad === prioridadFilter : true;
    const matchesEstado = estadoFilter ? i.estado === estadoFilter : true;
    return matchesSearch && matchesTipo && matchesPrioridad && matchesEstado;
  });

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      lugar: 'Lugar',
      actividad: 'Actividad',
      evento: 'Evento',
      atractivo: 'Atractivo',
      otro: 'Otro'
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Header />
      <main className="mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Imperdibles
          </h2>
          {canEdit && (
            <Link
              href="/imperdibles/create"
              className="btn-primary px-4 py-2 text-sm shadow-md"
            >
              + Nuevo Imperdible
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Buscar por título..."
            className="border border-[var(--color-outline)] rounded-md px-3 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border border-[var(--color-outline)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="lugar">Lugar</option>
            <option value="actividad">Actividad</option>
            <option value="evento">Evento</option>
            <option value="atractivo">Atractivo</option>
            <option value="otro">Otro</option>
          </select>
          <select
            className="border border-[var(--color-outline)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
            value={prioridadFilter}
            onChange={(e) => setPrioridadFilter(e.target.value)}
          >
            <option value="">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <select
            className="border border-[var(--color-outline)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
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
          {loadingImperdibles ? (
            <p className="p-8 text-center text-[var(--color-secondary)]">Cargando imperdibles...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] text-[var(--color-secondary)] text-sm">
                    <th className="py-3 px-6 font-semibold">Título</th>
                    <th className="py-3 px-6 font-semibold">Tipo</th>
                    <th className="py-3 px-6 font-semibold">Estación</th>
                    <th className="py-3 px-6 font-semibold">Prioridad</th>
                    <th className="py-3 px-6 font-semibold">Estado</th>
                    <th className="py-3 px-6 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredImperdibles.map((i) => (
                    <tr key={i.id} className="border-b border-[var(--color-surface-variant)] hover:bg-[var(--color-surface-container-lowest)] transition-colors">
                      <td className="py-4 px-6 text-sm text-[var(--color-on-surface)] font-medium">{i.titulo}</td>
                      <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">{getTipoLabel(i.tipo)}</td>
                      <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">
                        {i.expand?.estacion_id?.nombre || <span className="text-[var(--color-outline)]">Sin estación</span>}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${i.prioridad === 'alta' ? 'bg-red-100 text-red-800' : 
                            i.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'}`}>
                          {i.prioridad.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${i.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                            i.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                            i.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {i.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex justify-end gap-3">
                          <Link href={`/imperdibles/${i.id}`} className="text-[var(--color-primary)] hover:text-[var(--color-on-primary-container)] font-medium transition-colors">
                            Ver detalle
                          </Link>
                          {canEdit && (
                            <>
                              <Link href={`/imperdibles/${i.id}/edit`} className="text-[var(--color-tertiary-fixed)] hover:text-[var(--color-on-tertiary-fixed-variant)] font-medium transition-colors">
                                Editar
                              </Link>
                              <button 
                                onClick={() => toggleImperdibleStatus(i.id, i.estado)}
                                className={`font-medium transition-colors ${i.estado === 'inactivo' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                              >
                                {i.estado === 'inactivo' ? 'Restaurar' : 'Desactivar'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredImperdibles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--color-secondary)]">
                        No se encontraron imperdibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
