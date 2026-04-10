'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';
import { Estacion } from '@/types/estacion';
import { Actor } from '@/types/actor';
import { Experiencia, ExperienciaCategoria, ExperienciaEstado } from '@/types/experiencia';

export default function EditExperienciaPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [experiencia, setExperiencia] = useState<Experiencia | null>(null);
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [actores, setActores] = useState<Actor[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<ExperienciaCategoria | ''>('');
  const [estacionId, setEstacionId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [responsable, setResponsable] = useState('');
  const [estado, setEstado] = useState<ExperienciaEstado>('borrador');
  const [fotos, setFotos] = useState<FileList | null>(null);
  const [fotosParaEliminar, setFotosParaEliminar] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !canEditContent(user as any))) {
      router.push('/experiencias');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      
      try {
        const [experienciaRecord, estacionesRecords, actoresRecords] = await Promise.all([
          pb.collection('experiencias').getOne<Experiencia>(id, { expand: 'estacion_id,responsable,created_by,updated_by', requestKey: null }),
          pb.collection('estaciones').getFullList<Estacion>({
            sort: 'nombre',
            requestKey: null,
          }),
          pb.collection('actores').getFullList<Actor>({
            sort: 'nombre',
            requestKey: null,
          })
        ]);
        
        setExperiencia(experienciaRecord);
        setEstaciones(estacionesRecords);
        setActores(actoresRecords);
        
        // Inicializar form
        setTitulo(experienciaRecord.titulo);
        setCategoria(experienciaRecord.categoria as ExperienciaCategoria);
        setEstacionId(experienciaRecord.estacion_id);
        setDescripcion(experienciaRecord.descripcion || '');
        setDuracion(experienciaRecord.duracion || '');
        setRecomendaciones(experienciaRecord.recomendaciones || '');
        setUbicacion(experienciaRecord.ubicacion || '');
        setResponsable(experienciaRecord.responsable || '');
        setEstado(experienciaRecord.estado);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('No se pudo cargar la experiencia para editar.');
      } finally {
        setLoadingData(false);
      }
    };
    
    if (user && canEditContent(user as any)) {
      fetchData();
    }
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent, action: 'guardar' | 'publicar') => {
    e.preventDefault();
    if (!titulo || !categoria || !estacionId) {
      setError('Título, categoría y estación son obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      let newEstado = estado;
      if (action === 'publicar') {
        newEstado = 'aprobado';
      }
      
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('categoria', categoria);
      formData.append('estacion_id', estacionId);
      formData.append('estado', newEstado);
      
      if (user?.id) {
        formData.append('updated_by', user.id);
      }

      if (descripcion) formData.append('descripcion', descripcion);
      else formData.append('descripcion', '');
      
      if (duracion) formData.append('duracion', duracion);
      else formData.append('duracion', '');
      
      if (recomendaciones) formData.append('recomendaciones', recomendaciones);
      else formData.append('recomendaciones', '');
      
      if (ubicacion) formData.append('ubicacion', ubicacion);
      else formData.append('ubicacion', '');
      
      if (responsable) formData.append('responsable', responsable);
      else formData.append('responsable', '');
      
      if (fotosParaEliminar.length > 0) {
        fotosParaEliminar.forEach(filename => {
          formData.append('fotos-', filename);
        });
      }

      if (fotos && fotos.length > 0) {
        for (let i = 0; i < fotos.length; i++) {
          formData.append('fotos+', fotos[i]);
        }
      }
      
      await pb.collection('experiencias').update(id, formData);
      
      router.push(`/experiencias/${id}`);
    } catch (err: any) {
      console.error('Error actualizando experiencia:', err?.message, err?.response?.data);
      const validationErrors = err?.response?.data;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, details]: [string, any]) => `${field}: ${details.message}`)
          .join(' | ');
        setError(`Error de validación: ${errorMessages}`);
      } else {
        setError(err?.response?.message || 'Error al actualizar la experiencia. Verifica la configuración en PocketBase.');
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
      <div className="flex h-full items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!experiencia && !loadingData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Experiencia no encontrada.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-surface)] flex flex-col">
      <main className="mx-auto px-6 py-8 flex-1 w-full">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm shadow-md">&larr; Volver</button>
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Editar Experiencia
          </h2>
        </div>

        <div className="bg-[var(--color-surface-container)] p-8 rounded-[8px]">
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
              {error}
            </div>
          )}
          
          {experiencia && (
            <div className="mb-8 p-4 bg-[var(--color-surface-container-low)] rounded-md border border-[var(--color-outline-variant)]">
              <h3 className="text-sm font-semibold text-[var(--color-on-surface)] mb-2">Historial Básico</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--color-secondary)]">
                <div>
                  <span className="block text-[var(--color-outline)] mb-1">Fecha de creación</span>
                  <span className="block font-medium">{new Date(experiencia.created).toLocaleString()}</span>
                  {experiencia.expand?.created_by && (
                    <span className="block mt-1 text-[var(--color-outline)]">Por: {experiencia.expand.created_by.name || experiencia.expand.created_by.email}</span>
                  )}
                </div>
                <div>
                  <span className="block text-[var(--color-outline)] mb-1">Última actualización</span>
                  <span className="block font-medium">{new Date(experiencia.updated).toLocaleString()}</span>
                  {experiencia.expand?.updated_by && (
                    <span className="block mt-1 text-[var(--color-outline)]">Por: {experiencia.expand.updated_by.name || experiencia.expand.updated_by.email}</span>
                  )}
                </div>
                <div>
                  <span className="block text-[var(--color-outline)] mb-1">Estado actual</span>
                  <span className="capitalize block font-medium">{experiencia.estado.replace('_', ' ')}</span>
                </div>
              </div>
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
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as ExperienciaCategoria)}
                  className="input-field w-full"
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
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Estación *
              </label>
              <select
                value={estacionId}
                onChange={(e) => {
                  setEstacionId(e.target.value);
                  if (responsable) {
                    const actor = actores.find(a => a.id === responsable);
                    if (actor && actor.estacion_id !== e.target.value) {
                      setResponsable(''); // Limpiar responsable si ya no pertenece a la nueva estación
                    }
                  }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as ExperienciaEstado)}
                  className="input-field w-full"
                >
                  <option value="borrador">Borrador</option>
                  <option value="en_revision">En Revisión</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="inactivo">Inactivo</option>
                </select>
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
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Fotos Actuales
              </label>
              {experiencia?.fotos && experiencia.fotos.length > 0 && experiencia.fotos.filter(f => !fotosParaEliminar.includes(f)).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {experiencia.fotos.filter(f => !fotosParaEliminar.includes(f)).map((foto, index) => (
                    <div key={index} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)] group">
                      <img 
                        src={pb.files.getURL(experiencia, foto)} 
                        alt={`Foto de ${experiencia.titulo}`}
                        className="object-contain w-full h-full p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setFotosParaEliminar([...fotosParaEliminar, foto])}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar foto"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--color-on-surface-variant)] text-sm italic">
                  No hay fotos guardadas para esta experiencia.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Añadir Nuevas Fotos (Opcional)
              </label>
              <div className="flex flex-col gap-4">
                {fotos && fotos.length > 0 && (
                  <div className="flex flex-wrap gap-4">
                    {Array.from(fotos).map((foto, index) => (
                      <div key={index} className="aspect-square w-32 bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)] group">
                        <img 
                          src={URL.createObjectURL(foto)} 
                          alt={`Nueva foto ${index + 1}`}
                          className="object-contain w-full h-full p-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const dt = new DataTransfer();
                            Array.from(fotos).filter((_, i) => i !== index).forEach(f => dt.items.add(f));
                            setFotos(dt.files.length > 0 ? dt.files : null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar nueva foto"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const currentFotosCount = (experiencia?.fotos?.length || 0) - fotosParaEliminar.length;
                      const existingNewFotosCount = fotos?.length || 0;
                      const newFotosCount = e.target.files?.length || 0;
                      
                      if (currentFotosCount + existingNewFotosCount + newFotosCount > 5) {
                        alert(`Puedes tener un máximo de 5 imágenes por experiencia. Te quedan ${5 - (currentFotosCount + existingNewFotosCount)} espacios.`);
                      } else {
                        const dt = new DataTransfer();
                        if (fotos) {
                          Array.from(fotos).forEach(f => dt.items.add(f));
                        }
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(f => dt.items.add(f));
                        }
                        setFotos(dt.files);
                      }
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="btn-secondary px-4 py-2 text-sm shadow-sm"
                  >
                    + Añadir foto
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                Selecciona imágenes si deseas subir nuevas fotos para esta experiencia. Puedes tener hasta 5 imágenes en total.
              </p>
            </div>

            <div className="pt-8 flex flex-col md:flex-row justify-end gap-4 border-t border-[var(--color-surface-variant)] mt-8">
              <button
                type="button"
                onClick={() => router.push(`/experiencias/${id}`)}
                className="btn-secondary px-6 py-2 text-sm shadow-sm text-center w-full md:w-auto"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'guardar')}
                disabled={isSubmitting}
                className="btn-primary px-6 py-2 text-sm shadow-md w-full md:w-auto"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
