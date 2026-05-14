'use client';

import { asPocketBaseError } from '@/lib/pocketbaseErrors';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import pb from '@/lib/pocketbase';
import { createRecordWithAudit } from '@/lib/audit';
import Link from 'next/link';
import { canEditContent, canReviewContent } from '@/lib/permissions';
import { Estacion } from '@/types/estacion';
import { Actor } from '@/types/actor';
import { ExperienciaCategoria, ExperienciaEstado } from '@/types/experiencia';
import CatalogSelect from '@/components/CatalogSelect';
import EntityMediaUpload from '@/components/EntityMediaUpload';
import { appendCreateMediaFiles } from '@/lib/entityMediaForm';

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
  const [fotoPortada, setFotoPortada] = useState<File | null>(null);
  const [galeriaFotos, setGaleriaFotos] = useState<FileList | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !canEditContent(user))) {
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
    
    if (user && canEditContent(user)) {
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
      
      appendCreateMediaFiles(formData, fotoPortada, galeriaFotos);
      
      await createRecordWithAudit('experiencias', formData, user);
      
      router.push('/experiencias');
    } catch (err: unknown) {
      console.error('Error creando experiencia:', asPocketBaseError(err)?.message, asPocketBaseError(err)?.response?.data);
      const validationErrors = asPocketBaseError(err)?.response?.data;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, details]: [string, { message?: string }]) => `${field}: ${details.message}`)
          .join(' | ');
        setError(`Error de validación: ${errorMessages}`);
      } else {
        setError(asPocketBaseError(err)?.response?.message || 'Error al crear la experiencia. Verifica que la colección "experiencias" esté correctamente configurada en PocketBase.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar actores según la estación seleccionada
  const actoresFiltrados = estacionId 
    ? actores.filter(a => a.estacion_id === estacionId)
    : actores;

  if (isLoading || !user || !canEditContent(user) || loadingData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-surface)] flex flex-col">
      <main className="mx-auto px-6 py-8 flex-1 w-full">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm shadow-md">&larr; Volver</button>
          <h1 className="text-[32px] font-bold text-[var(--color-primary)] tracking-tight ml-4">
            Crear Experiencia
          </h1>
        </div>

        <div className="bg-[var(--color-surface-container)] p-8 rounded-md">
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Título *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej. Taller de Telar de Cintura"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Categoría *
                </label>
                <CatalogSelect
                  collectionName="categorias_experiencia"
                  value={categoria}
                  onChange={(value) => setCategoria(value as ExperienciaCategoria)}
                  emptyLabel="Seleccionar categoría..."
                  className="input-field w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Estación *
              </label>
              <select
                value={estacionId}
                onChange={(e) => {
                  setEstacionId(e.target.value);
                  setResponsable(''); // Limpiar responsable si cambia la estación
                }}
                className="input-field w-full"
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
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="input-field w-full min-h-[100px] resize-y"
                placeholder="Descripción de la experiencia..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Duración
                </label>
                <input
                  type="text"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej. 2 horas, Medio día"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej. Taller principal, Plaza central"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Recomendaciones
              </label>
              <textarea
                value={recomendaciones}
                onChange={(e) => setRecomendaciones(e.target.value)}
                className="input-field w-full min-h-[80px] resize-y"
                placeholder="Recomendaciones para los visitantes (ropa cómoda, etc.)..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Responsable (opcional)
              </label>
              <select
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="input-field w-full"
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

            <EntityMediaUpload
              entityLabel="experiencia"
              coverFile={fotoPortada}
              onCoverFileChange={setFotoPortada}
              galleryFiles={galeriaFotos}
              onGalleryFilesChange={setGaleriaFotos}
            />
            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Estado inicial
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as ExperienciaEstado)}
                className="input-field w-full md:w-1/2"
              >
                <option value="borrador">Borrador</option>
                <option value="en_revision">En revisión</option>
                {canReviewContent(user) && (
                  <option value="aprobado">Aprobado</option>
                )}
              </select>
            </div>

            <div className="pt-8 flex flex-col md:flex-row justify-end gap-4 border-t border-[var(--color-surface-variant)] mt-8">
              <Link
                href="/experiencias"
                className="btn-secondary px-6 py-2 text-sm shadow-sm text-center"
              >
                Cancelar
              </Link>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'continuar')}
                disabled={isSubmitting}
                className="btn-primary px-6 py-2 text-sm shadow-md"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
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
    <Suspense fallback={<div className="h-full flex items-center justify-center">Cargando...</div>}>
      <CreateExperienciaForm />
    </Suspense>
  );
}
