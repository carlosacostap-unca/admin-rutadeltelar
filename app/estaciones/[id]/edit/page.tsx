'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';
import { Estacion } from '@/types/estacion';

export default function EditEstacionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [nombre, setNombre] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [descripcionGeneral, setDescripcionGeneral] = useState('');
  const [mapasReferencias, setMapasReferencias] = useState('');
  const [coordenadasGenerales, setCoordenadasGenerales] = useState('');
  const [estado, setEstado] = useState('borrador');
  const [estacion, setEstacion] = useState<Estacion | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !canEditContent(user as any))) {
      router.push('/estaciones');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchEstacion() {
      if (!id || !user) return;
      
      try {
        const record = await pb.collection('estaciones').getOne<Estacion>(id, {
          requestKey: null,
          expand: 'created_by,updated_by',
        });
        
        setEstacion(record);
        setNombre(record.nombre || '');
        setLocalidad(record.localidad || '');
        setDescripcionGeneral(record.descripcion_general || '');
        setMapasReferencias(record.mapas_referencias || '');
        setCoordenadasGenerales(record.coordenadas_generales || '');
        setEstado(record.estado || 'borrador');
      } catch (err) {
        console.error('Error fetching estacion:', err);
        setError('No se pudo cargar la estación. Es posible que no exista.');
      } finally {
        setLoadingData(false);
      }
    }
    
    fetchEstacion();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !localidad) {
      setError('Nombre y localidad son obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const data = {
        nombre,
        localidad,
        descripcion_general: descripcionGeneral,
        mapas_referencias: mapasReferencias,
        coordenadas_generales: coordenadasGenerales,
        estado,
        updated_by: user?.id,
      };
      
      await pb.collection('estaciones').update(id, data);
      router.push('/estaciones');
    } catch (err: any) {
      console.error('Error actualizando estación:', err);
      setError(err?.response?.message || 'Error al actualizar la estación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user || !canEditContent(user as any)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Header />
      <main className="mx-auto px-6 py-8 max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/estaciones" className="text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
            &larr; Volver
          </Link>
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Editar Estación
          </h2>
        </div>

        {loadingData ? (
          <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px] shadow-sm text-center">
            Cargando datos...
          </div>
        ) : error ? (
          <div className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] p-6 rounded-md">
            {error}
          </div>
        ) : (
          <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)]">
            {estacion && (
              <div className="mb-8 p-4 bg-[var(--color-surface-container-low)] rounded-md border border-[var(--color-outline-variant)]">
                <h3 className="text-sm font-semibold text-[var(--color-on-surface)] mb-2">Historial Básico</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--color-secondary)]">
                  <div>
                    <span className="block text-[var(--color-outline)] mb-1">Fecha de creación</span>
                    <span className="block font-medium">{new Date(estacion.created).toLocaleString()}</span>
                    {estacion.expand?.created_by && (
                      <span className="block mt-1 text-[var(--color-outline)]">Por: {estacion.expand.created_by.name || estacion.expand.created_by.email}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-[var(--color-outline)] mb-1">Última actualización</span>
                    <span className="block font-medium">{new Date(estacion.updated).toLocaleString()}</span>
                    {estacion.expand?.updated_by && (
                      <span className="block mt-1 text-[var(--color-outline)]">Por: {estacion.expand.updated_by.name || estacion.expand.updated_by.email}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-[var(--color-outline)] mb-1">Estado actual</span>
                    <span className="capitalize block font-medium">{estacion.estado.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Nombre de la estación *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Ej. Estación Belén"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Localidad *
                  </label>
                  <input
                    type="text"
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Ej. Belén, Catamarca"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Descripción general
                </label>
                <textarea
                  value={descripcionGeneral}
                  onChange={(e) => setDescripcionGeneral(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[100px] resize-y"
                  placeholder="Breve descripción de la estación..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Mapas / Referencias
                  </label>
                  <input
                    type="text"
                    value={mapasReferencias}
                    onChange={(e) => setMapasReferencias(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Enlaces a mapas o referencias"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Coordenadas generales
                  </label>
                  <input
                    type="text"
                    value={coordenadasGenerales}
                    onChange={(e) => setCoordenadasGenerales(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Latitud, Longitud"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-3">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full md:w-1/2 px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                >
                  <option value="borrador">Borrador</option>
                  <option value="en_revision">En revisión</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-4 border-t border-[var(--color-surface-variant)]">
                <Link
                  href="/estaciones"
                  className="px-6 py-2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-6 py-2"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
