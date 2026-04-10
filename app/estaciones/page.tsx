'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { Estacion } from '@/types/estacion';
import Header from '@/components/Header';
import { canEditContent } from '@/lib/permissions';

export default function EstacionesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [loadingEstaciones, setLoadingEstaciones] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [localidadFilter, setLocalidadFilter] = useState('');

  // Extract unique localities for the filter
  const localidades = Array.from(new Set(estaciones.map(e => e.localidad).filter(Boolean))).sort();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchEstaciones() {
      if (user) {
        try {
          // fetch without requestKey to avoid auto-cancellation
          const records = await pb.collection('estaciones').getFullList<Estacion>({
            sort: '-created',
            requestKey: null,
          });
          setEstaciones(records);
        } catch (error) {
          console.error('Error fetching estaciones:', error);
          // If the collection doesn't exist yet, it might throw an error. We handle it gracefully.
        } finally {
          setLoadingEstaciones(false);
        }
      }
    }
    fetchEstaciones();
  }, [user]);

  const toggleEstacionStatus = async (id: string, currentStatus: string) => {
    try {
      // US-14: Desactivar estación (cambia el estado a inactivo, o de inactivo a borrador)
      const newStatus = currentStatus === 'inactivo' ? 'borrador' : 'inactivo';
      await pb.collection('estaciones').update(id, { estado: newStatus });
      setEstaciones(estaciones.map(e => e.id === id ? { ...e, estado: newStatus } : e));
    } catch (error) {
      console.error('Error toggling estacion status:', error);
      alert('Error al cambiar el estado de la estación');
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

  // Normalizar texto quitando acentos
  const normalizeText = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Apply filters
  const filteredEstaciones = estaciones.filter((e) => {
    const normalizedSearch = normalizeText(searchTerm);
    const matchesSearch = normalizeText(e.nombre).includes(normalizedSearch) || 
                          normalizeText(e.localidad || '').includes(normalizedSearch);
    const matchesLocalidad = localidadFilter ? e.localidad === localidadFilter : true;
    const matchesStatus = statusFilter ? e.estado === statusFilter : true;
    return matchesSearch && matchesLocalidad && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Header />
      <main className="mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Estaciones
          </h2>
          {canEdit && (
            <Link
              href="/estaciones/create"
              className="btn-primary px-4 py-2 text-sm shadow-md"
            >
              + Nueva Estación
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-t-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)] flex flex-col md:flex-row gap-4 border-b border-[var(--color-outline-variant)]">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o localidad..."
              className="w-full rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              value={localidadFilter}
              onChange={(e) => setLocalidadFilter(e.target.value)}
            >
              <option value="">Todas las localidades</option>
              {localidades.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <select
              className="rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="en_revision">En revisión</option>
              <option value="aprobado">Aprobado</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="bg-[var(--color-surface-container-lowest)] rounded-b-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)] overflow-hidden">
          {loadingEstaciones ? (
            <p className="p-8 text-center text-[var(--color-secondary)]">Cargando estaciones...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] text-[var(--color-secondary)] text-sm">
                  <th className="py-3 px-6 font-semibold">Nombre</th>
                  <th className="py-3 px-6 font-semibold">Localidad</th>
                  <th className="py-3 px-6 font-semibold">Estado</th>
                  <th className="py-3 px-6 font-semibold">Actualización</th>
                  <th className="py-3 px-6 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEstaciones.map((e) => (
                  <tr key={e.id} className={`border-b border-[var(--color-surface-variant)] hover:bg-[var(--color-surface-container-lowest)] transition-colors ${e.estado === 'inactivo' ? 'opacity-60 bg-gray-50' : ''}`}>
                    <td className="py-4 px-6 text-sm text-[var(--color-on-surface)] font-medium">{e.nombre}</td>
                    <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">{e.localidad}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${e.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                          e.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                          e.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {e.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">
                      {new Date(e.updated).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-right">
                      <div className="flex justify-end gap-3">
                        <Link href={`/estaciones/${e.id}`} className="text-[var(--color-primary)] hover:text-[var(--color-on-primary-container)] font-medium transition-colors">
                          Ver detalle
                        </Link>
                        {canEdit && (
                          <>
                            <Link href={`/estaciones/${e.id}/edit`} className="text-[var(--color-tertiary-fixed)] hover:text-[var(--color-on-tertiary-fixed-variant)] font-medium transition-colors">
                              Editar
                            </Link>
                            <button 
                              onClick={() => toggleEstacionStatus(e.id, e.estado)}
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
                {filteredEstaciones.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--color-secondary)]">
                      No hay estaciones registradas o que coincidan con los filtros.
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
