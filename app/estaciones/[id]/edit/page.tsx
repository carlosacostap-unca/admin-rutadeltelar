'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import { createRecordWithAudit, updateRecordWithAudit } from '@/lib/audit';
import Link from 'next/link';
import { canEditContent, canReviewContent } from '@/lib/permissions';
import { CATAMARCA_DEPARTAMENTOS, Estacion } from '@/types/estacion';
import MapPicker from '@/components/MapPicker';

export default function EditEstacionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [nombre, setNombre] = useState('');
  const [eslogan, setEslogan] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [descripcionGeneral, setDescripcionGeneral] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [estado, setEstado] = useState('borrador');
  const [fotoPortada, setFotoPortada] = useState<File | null>(null);
  const [fotoPortadaParaEliminar, setFotoPortadaParaEliminar] = useState(false);
  const [galeriaFotos, setGaleriaFotos] = useState<FileList | null>(null);
  const [galeriaFotosParaEliminar, setGaleriaFotosParaEliminar] = useState<string[]>([]);
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
        setEslogan(record.eslogan || '');
        setLocalidad(record.localidad || '');
        setDepartamento(record.departamento || '');
        setDescripcionGeneral(record.descripcion_general || '');
        setLatitud(record.latitud?.toString() || '');
        setLongitud(record.longitud?.toString() || '');
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
    if (!nombre || !localidad || !departamento) {
      setError('Nombre, localidad y departamento son obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('eslogan', eslogan);
      formData.append('localidad', localidad);
      formData.append('departamento', departamento);
      formData.append('descripcion_general', descripcionGeneral);
      if (latitud) formData.append('latitud', latitud);
      if (longitud) formData.append('longitud', longitud);
      formData.append('estado', estado);
      if (user?.id) {
        formData.append('updated_by', user.id);
      }

      if (fotoPortadaParaEliminar) {
        formData.append('foto_portada', '');
        if (!estacion?.foto_portada && estacion?.fotos?.[0]) {
          formData.append('fotos-', estacion.fotos[0]);
        }
      }

      if (fotoPortada) {
        // PocketBase may require zeroing the current single-file field before replacement.
        if (fotoPortadaActual) {
          formData.append('foto_portada', '');
        }
        formData.append('foto_portada', fotoPortada);
      }

      if (galeriaFotosParaEliminar.length > 0) {
        galeriaFotosParaEliminar.forEach(filename => {
          formData.append('galeria_fotos-', filename);
          if (estacion?.fotos?.includes(filename)) {
            formData.append('fotos-', filename);
          }
        });
      }

      if (galeriaFotos && galeriaFotos.length > 0) {
        for (let i = 0; i < galeriaFotos.length; i++) {
          formData.append('galeria_fotos+', galeriaFotos[i]);
        }
      }
      
      await updateRecordWithAudit('estaciones', id, formData, user);
      router.push('/estaciones');
    } catch (err: any) {
      console.error('Error actualizando estación:', err);
      const validationErrors = err?.response?.data;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, details]: [string, any]) => `${field}: ${details.message}`)
          .join(' | ');
        setError(`Error de validación: ${errorMessages}`);
      } else {
        setError(err?.response?.message || 'Error al actualizar la estación.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user || !canEditContent(user as any)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const fotoPortadaActual = !fotoPortadaParaEliminar
    ? estacion?.foto_portada || estacion?.fotos?.[0] || null
    : null;
  const galeriaLegacy = estacion?.fotos
    ? estacion.foto_portada
      ? estacion.fotos
      : estacion.fotos.slice(1)
    : [];
  const galeriaActual = Array.from(
    new Set([...(estacion?.galeria_fotos || []), ...galeriaLegacy])
  ).filter((foto) => !galeriaFotosParaEliminar.includes(foto));

  return (
    <div className="h-full bg-[var(--color-surface)] flex flex-col">
      <main className="mx-auto px-6 py-8 flex-1 w-full">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm shadow-md">&larr; Volver</button>
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Editar Estación
          </h2>
        </div>

        {loadingData ? (
          <div className="bg-[var(--color-surface-container)] p-8 rounded-[8px] shadow-sm text-center">
            Cargando datos...
          </div>
        ) : error ? (
          <div className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] p-6 rounded-md">
            {error}
          </div>
        ) : (
          <div className="bg-[var(--color-surface-container)] p-8 rounded-[8px]">
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
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Nombre de la estación *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="input-field w-full"
                    placeholder="Ej. Estación Belén"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Eslogan
                  </label>
                  <input
                    type="text"
                    value={eslogan}
                    onChange={(e) => setEslogan(e.target.value)}
                    className="input-field w-full"
                    placeholder="Ej. Cuna del tejido catamarqueño"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Localidad *
                  </label>
                  <input
                    type="text"
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
                    className="input-field w-full"
                    placeholder="Ej. Belén, Catamarca"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Departamento *
                  </label>
                  <select
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Selecciona un departamento</option>
                    {CATAMARCA_DEPARTAMENTOS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Descripción general
                </label>
                <textarea
                  value={descripcionGeneral}
                  onChange={(e) => setDescripcionGeneral(e.target.value)}
                  className="input-field w-full min-h-[100px] resize-y"
                  placeholder="Breve descripción de la estación..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitud}
                    onChange={(e) => setLatitud(e.target.value)}
                    className="input-field w-full"
                    placeholder="Ej. -27.0442"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitud}
                    onChange={(e) => setLongitud(e.target.value)}
                    className="input-field w-full"
                    placeholder="Ej. -67.7201"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="input-field w-full md:w-1/2"
                >
                  <option value="borrador">Borrador</option>
                  <option value="en_revision">En revisión</option>
                  {canReviewContent(user as any) && (
                    <>
                      <option value="aprobado">Aprobado</option>
                      <option value="inactivo">Inactivo</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Foto de portada
                </label>
                {fotoPortadaActual ? (
                  <div className="aspect-square w-40 bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)] group">
                    <img
                      src={pb.files.getURL(estacion!, fotoPortadaActual)}
                      alt={`Portada de ${estacion?.nombre}`}
                      className="object-contain w-full h-full p-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFotoPortadaParaEliminar(true);
                        setFotoPortada(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar portada"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <p className="text-[var(--color-on-surface-variant)] text-sm italic">
                    No hay portada guardada para esta estación.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Cambiar portada (Opcional)
                </label>
                <div className="flex flex-col gap-4">
                  {fotoPortada && (
                    <div className="aspect-square w-40 bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)] group">
                      <img
                        src={URL.createObjectURL(fotoPortada)}
                        alt="Nueva portada"
                        className="object-contain w-full h-full p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setFotoPortada(null)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar nueva portada"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div>
                    <input
                      id="file-upload-portada"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setFotoPortada(file);
                        if (file) {
                          setFotoPortadaParaEliminar(false);
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload-portada')?.click()}
                      className="btn-secondary px-4 py-2 text-sm shadow-sm"
                    >
                      {fotoPortadaActual || fotoPortada ? 'Cambiar portada' : '+ Añadir portada'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                  Selecciona una sola imagen para la portada principal de la estación.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Fotos actuales de la galería
                </label>
                {galeriaActual.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {galeriaActual.map((foto, index) => (
                      <div key={index} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)] group">
                        <img
                          src={pb.files.getURL(estacion!, foto)}
                          alt={`Foto de galería ${index + 1} de ${estacion?.nombre}`}
                          className="object-contain w-full h-full p-1"
                        />
                        <button
                          type="button"
                          onClick={() => setGaleriaFotosParaEliminar([...galeriaFotosParaEliminar, foto])}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar foto de galería"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--color-on-surface-variant)] text-sm italic">
                    No hay fotos guardadas en la galería.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Añadir nuevas fotos a la galería (Opcional)
                </label>
                <div className="flex flex-col gap-4">
                  {galeriaFotos && galeriaFotos.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                      {Array.from(galeriaFotos).map((foto, index) => (
                        <div key={index} className="aspect-square w-32 bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)] group">
                          <img
                            src={URL.createObjectURL(foto)}
                            alt={`Nueva foto de galería ${index + 1}`}
                            className="object-contain w-full h-full p-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const dt = new DataTransfer();
                              Array.from(galeriaFotos).filter((_, i) => i !== index).forEach(f => dt.items.add(f));
                              setGaleriaFotos(dt.files.length > 0 ? dt.files : null);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Eliminar nueva foto de galería"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <input
                      id="file-upload-galeria"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const currentFotosCount = galeriaActual.length;
                        const existingNewFotosCount = galeriaFotos?.length || 0;
                        const newFotosCount = e.target.files?.length || 0;

                        if (currentFotosCount + existingNewFotosCount + newFotosCount > 5) {
                          alert(`Puedes tener un máximo de 5 imágenes en la galería. Te quedan ${5 - (currentFotosCount + existingNewFotosCount)} espacios.`);
                        } else {
                          const dt = new DataTransfer();
                          if (galeriaFotos) {
                            Array.from(galeriaFotos).forEach(f => dt.items.add(f));
                          }
                          if (e.target.files) {
                            Array.from(e.target.files).forEach(f => dt.items.add(f));
                          }
                          setGaleriaFotos(dt.files);
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload-galeria')?.click()}
                      className="btn-secondary px-4 py-2 text-sm shadow-sm"
                    >
                      + Añadir foto
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                  Puedes tener hasta 5 imágenes en la galería.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Seleccionar ubicación en el mapa
                </label>
                <p className="text-sm text-[var(--color-outline)] mb-3">
                  Haz clic en el mapa para establecer las coordenadas automáticamente.
                </p>
                <MapPicker 
                  lat={latitud ? parseFloat(latitud) : null} 
                  lng={longitud ? parseFloat(longitud) : null} 
                  onLocationSelect={(lat, lng) => {
                    setLatitud(lat.toString());
                    setLongitud(lng.toString());
                  }} 
                />
              </div>

              <div className="pt-8 flex flex-col md:flex-row justify-end gap-4 border-t border-[var(--color-surface-variant)] mt-8">
                <Link
                  href="/estaciones"
                  className="btn-secondary px-6 py-2 text-sm shadow-sm text-center"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-6 py-2 text-sm shadow-md"
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
