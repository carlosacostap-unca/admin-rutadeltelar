'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';

export default function CreateEstacionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [nombre, setNombre] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [descripcionGeneral, setDescripcionGeneral] = useState('');
  const [mapasReferencias, setMapasReferencias] = useState('');
  const [coordenadasGenerales, setCoordenadasGenerales] = useState('');
  const [estado, setEstado] = useState('borrador'); // estado inicial
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !canEditContent(user as any))) {
      router.push('/estaciones');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent, action: 'borrador' | 'continuar') => {
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
        estado: action === 'borrador' ? 'borrador' : estado,
        created_by: user?.id,
        updated_by: user?.id,
      };
      
      const record = await pb.collection('estaciones').create(data);
      
      if (action === 'borrador') {
        router.push('/estaciones');
      } else {
        router.push(`/estaciones/${record.id}/edit`);
      }
    } catch (err: any) {
      console.error('Error creando estación:', err);
      setError(err?.response?.message || 'Error al crear la estación.');
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
            Crear Estación
          </h2>
        </div>

        <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)]">
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-6">
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
                Estado inicial
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full md:w-1/2 px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
              >
                <option value="borrador">Borrador</option>
                <option value="en_revision">En revisión</option>
                <option value="aprobado">Aprobado</option>
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
                type="button"
                onClick={(e) => handleSubmit(e, 'borrador')}
                disabled={isSubmitting}
                className="px-6 py-2 border border-[var(--color-outline)] rounded-full text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] font-medium transition-colors"
              >
                Guardar Borrador
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'continuar')}
                disabled={isSubmitting}
                className="btn-primary px-6 py-2"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar y Continuar'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
