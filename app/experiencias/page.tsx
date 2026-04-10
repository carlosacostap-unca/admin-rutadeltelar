'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { Experiencia, ExperienciaCategoria } from '@/types/experiencia';
import Header from '@/components/Header';
import { canEditContent } from '@/lib/permissions';

export default function ExperienciasPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [loadingExperiencias, setLoadingExperiencias] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchExperiencias() {
      if (user) {
        try {
          const records = await pb.collection('experiencias').getFullList<Experiencia>({
            sort: '-created',
            expand: 'estacion_id,responsable',
            requestKey: null,
          });
          setExperiencias(records);
        } catch (error) {
          console.error('Error fetching experiencias:', error);
        } finally {
          setLoadingExperiencias(false);
        }
      }
    }
    fetchExperiencias();
  }, [user]);

  const toggleExperienciaStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'inactivo' ? 'borrador' : 'inactivo';
      await pb.collection('experiencias').update(id, { estado: newStatus });
      setExperiencias(experiencias.map(e => e.id === id ? { ...e, estado: newStatus } : e));
    } catch (error) {
      console.error('Error toggling experiencia status:', error);
      alert('Error al cambiar el estado de la experiencia');
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
  const filteredExperiencias = experiencias.filter((e) => {
    const matchesSearch = e.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFilter ? e.categoria === categoriaFilter : true;
    const matchesEstado = estadoFilter ? e.estado === estadoFilter : true;
    return matchesSearch && matchesCategoria && matchesEstado;
  });

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      taller: 'Taller',
      recorrido: 'Recorrido',
      degustacion: 'Degustación',
      demostracion: 'Demostración',
      convivencia: 'Convivencia',
      otros: 'Otros'
    };
    return labels[categoria] || categoria;
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Header />
      <main className="mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Experiencias
          </h2>
          {canEdit && (
            <Link
              href="/experiencias/create"
              className="btn-primary px-4 py-2 text-sm shadow-md"
            >
              + Nueva Experiencia
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
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            <option value="taller">Taller</option>
            <option value="recorrido">Recorrido</option>
            <option value="degustacion">Degustación</option>
            <option value="demostracion">Demostración</option>
            <option value="convivencia">Convivencia</option>
            <option value="otros">Otros</option>
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
          {loadingExperiencias ? (
            <p className="p-8 text-center text-[var(--color-secondary)]">Cargando experiencias...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] text-[var(--color-secondary)] text-sm">
                    <th className="py-3 px-6 font-semibold">Título</th>
                    <th className="py-3 px-6 font-semibold">Categoría</th>
                    <th className="py-3 px-6 font-semibold">Estación</th>
                    <th className="py-3 px-6 font-semibold">Responsable</th>
                    <th className="py-3 px-6 font-semibold">Estado</th>
                    <th className="py-3 px-6 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExperiencias.map((e) => (
                    <tr key={e.id} className="border-b border-[var(--color-surface-variant)] hover:bg-[var(--color-surface-container-lowest)] transition-colors">
                      <td className="py-4 px-6 text-sm text-[var(--color-on-surface)] font-medium">{e.titulo}</td>
                      <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">{getCategoriaLabel(e.categoria)}</td>
                      <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">
                        {e.expand?.estacion_id?.nombre || <span className="text-[var(--color-outline)]">Sin estación</span>}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">
                        {e.expand?.responsable?.nombre || <span className="text-[var(--color-outline)]">Ninguno</span>}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${e.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                            e.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                            e.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {e.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex justify-end gap-3">
                          <Link href={`/experiencias/${e.id}`} className="text-[var(--color-primary)] hover:text-[var(--color-on-primary-container)] font-medium transition-colors">
                            Ver detalle
                          </Link>
                          {canEdit && (
                            <>
                              <Link href={`/experiencias/${e.id}/edit`} className="text-[var(--color-tertiary-fixed)] hover:text-[var(--color-on-tertiary-fixed-variant)] font-medium transition-colors">
                                Editar
                              </Link>
                              <button 
                                onClick={() => toggleExperienciaStatus(e.id, e.estado)}
                                className={`font-medium transition-colors ${e.estado === 'inactivo' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                              >
                                {e.estado === 'inactivo' ? 'Restaurar' : 'Desactivar'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredExperiencias.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--color-secondary)]">
                        No se encontraron experiencias.
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