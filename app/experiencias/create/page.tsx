'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';
import { Estacion } from '@/types/estacion';
import { Actor } from '@/types/actor';
import { ExperienciaCategoria, ExperienciaEstado } from '@/types/experiencia';

function CreateExperienciaForm() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [actores, setActores] = useState<Actor[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<ExperienciaCategoria | ''>('');
  const [estacionId, setEstacionId] = useState(searchParams.get('estacion_id') || '');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [responsable, setResponsable] = useState('');
  const [estado, setEstado] = useState<ExperienciaEstado>('borrador');
  const [fotos, setFotos] = useState<FileList | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !canEditContent(user as any))) {
      router.push('/experiencias');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [estacionesRecords, actoresRecords] = await Promise.all([
          pb.collection('estaciones').getFullList<Estacion>({
            sort: 'nombre',
            requestKey: null,
          }),
          pb.collection('actores').getFullList<Actor>({
            sort: 'nombre',
            requestKey: null,
          })
        ]);
        setEstaciones(estacionesRecords);
        setActores(actoresRecords);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    
    if (user && canEditContent(user as any)) {
      fetchData();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent, action: 'borrador' | 'continuar') => {
    e.preventDefault();
    if (!titulo || !categoria || !estacionId) {
      setError('Título, categoría y estación son obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('categoria', categoria);
      formData.append('estacion_id', estacionId);
      formData.append('estado', action === 'borrador' ? 'borrador' : estado);
      
      if (user?.id) {
        formData.append('created_by', user.id);
        formData.append('updated_by', user.id);
      }

      if (descripcion) formData.append('descripcion', descripcion);
      if (duracion) formData.append('duracion', duracion);
      if (recomendaciones) formData.append('recomendaciones', recomendaciones);
      if (ubicacion) formData.append('ubicacion', ubicacion);
      if (responsable) formData.append('responsable', responsable);
      
      if (fotos) {
        for (let i = 0; i < fotos.length; i++) {
          formData.append('fotos', fotos[i]);
        }
      }
      
      const record = await pb.collection('experiencias').create(formData);
      
      if (action === 'borrador') {
        router.push('/experiencias');
      } else {
        router.push(`/experiencias/${record.id}/edit`);
      }
    } catch (err: any) {
      console.error('Error creando experiencia:', err?.message, err?.response?.data);
      const validationErrors = err?.response?.data;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, details]: [string, any]) => `${field}: ${details.message}`)
          .join(' | ');
        setError(`Error de validación: ${errorMessages}`);
      } else {
        setError(err?.response?.message || 'Error al crear la experiencia. Verifica que la colección "experiencias" esté correctamente configurada en PocketBase.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar actores según la estación seleccionada
  const actoresFiltrados = estacionId 
    ? actores.filter(a => a.estacion_id === estacionId)
    : actores;

  if (isLoading || !user || !canEditContent(user as any) || loadingData) {
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
          <Link href="/experiencias" className="text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
            &larr; Volver
          </Link>
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Crear Experiencia
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
                  Título *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                  placeholder="Ej. Taller de Telar de Cintura"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Categoría *
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as ExperienciaCategoria)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                  required
                >
                  <option value="" disabled>Seleccionar Categoría...</option>
                  <option value="taller">Taller</option>
                  <option value="recorrido">Recorrido</option>
                  <option value="degustacion">Degustación</option>
                  <option value="demostracion">Demostración</option>
                  <option value="convivencia">Convivencia</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                Estación *
              </label>
              <select
                value={estacionId}
                onChange={(e) => {
                  setEstacionId(e.target.value);
                  setResponsable(''); // Limpiar responsable si cambia la estación
                }}
                className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                required
              >
                <option value="" disabled>Seleccionar Estación...</option>
                {estaciones.map((estacion) => (
                  <option key={estacion.id} value={estacion.id}>
                    {estacion.nombre} - {estacion.localidad}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[100px] resize-y"
                placeholder="Descripción de la experiencia..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Duración
                </label>
                <input
                  type="text"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                  placeholder="Ej. 2 horas, Medio día"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                  placeholder="Ej. Taller principal, Plaza central"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                Recomendaciones
              </label>
              <textarea
                value={recomendaciones}
                onChange={(e) => setRecomendaciones(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[80px] resize-y"
                placeholder="Recomendaciones para los visitantes (ropa cómoda, etc.)..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                Responsable (opcional)
              </label>
              <select
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                disabled={!estacionId || actoresFiltrados.length === 0}
              >
                <option value="">Ninguno</option>
                {actoresFiltrados.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.nombre} ({actor.tipo})
                  </option>
                ))}
              </select>
              {estacionId && actoresFiltrados.length === 0 && (
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                  No hay actores disponibles para la estación seleccionada.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                Fotos
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFotos(e.target.files)}
                className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
              />
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                Puedes seleccionar múltiples imágenes.
              </p>
            </div>

            <div className="pt-6 flex items-center justify-end gap-4 border-t border-[var(--color-outline-variant)]">
              <button
                type="button"
                onClick={() => router.push('/experiencias')}
                className="px-6 py-2 border border-[var(--color-outline)] rounded-full text-[var(--color-primary)] hover:bg-[var(--color-surface-variant)] transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'borrador')}
                disabled={isSubmitting}
                className="px-6 py-2 border border-[var(--color-primary)] rounded-full text-[var(--color-primary)] hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] transition-colors font-medium text-sm"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar como Borrador'}
              </button>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'continuar')}
                disabled={isSubmitting}
                className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-full hover:bg-[var(--color-primary-fixed-dim)] transition-colors font-medium text-sm shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
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

export default function CreateExperienciaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <CreateExperienciaForm />
    </Suspense>
  );
}
