'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import { createRecordWithAudit, updateRecordWithAudit } from '@/lib/audit';
import Link from 'next/link';
import { canEditContent, canReviewContent } from '@/lib/permissions';
import { Estacion } from '@/types/estacion';
import { Actor } from '@/types/actor';
import { Producto, ProductoCategoria, ProductoEstado } from '@/types/producto';
import CatalogSelect from '@/components/CatalogSelect';
import CatalogTagSelector from '@/components/CatalogTagSelector';

export default function EditProductoPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [actores, setActores] = useState<Actor[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<ProductoCategoria | ''>('');
  const [tecnicas, setTecnicas] = useState<string[]>([]);
  const [estacionesRelacionadas, setEstacionesRelacionadas] = useState<string[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [actoresRelacionados, setActoresRelacionados] = useState<string[]>([]);
  const [fotos, setFotos] = useState<FileList | null>(null);
  const [fotosParaEliminar, setFotosParaEliminar] = useState<string[]>([]);
  const [estado, setEstado] = useState<ProductoEstado>('borrador');
  const [producto, setProducto] = useState<Producto | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActorDisplayLabel = (actor: Actor) => {
    const estacionNombre = actor.expand?.estacion_id?.nombre || '';
    return `${actor.nombre} (${estacionNombre})`;
  };

  useEffect(() => {
    if (!isLoading && (!user || !canEditContent(user as any))) {
      router.push('/productos');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;

      try {
        const [productoRecord, estacionesRecords, actoresRecords] = await Promise.all([
          pb.collection('productos').getOne<Producto>(id, { expand: 'estacion_id,estaciones_relacionadas,categoria,tecnicas,actores_relacionados,actores_relacionados.estacion_id,created_by,updated_by', requestKey: null }),
          pb.collection('estaciones').getFullList<Estacion>({ sort: 'nombre', requestKey: null }),
          pb.collection('actores').getFullList<Actor>({ sort: 'nombre', expand: 'estacion_id', requestKey: null })
        ]);
        
        setEstaciones(estacionesRecords);
        setActores(actoresRecords);

        setNombre(productoRecord.nombre);
        setCategoria(productoRecord.categoria as ProductoCategoria);
        setEstacionesRelacionadas(
          productoRecord.estaciones_relacionadas && productoRecord.estaciones_relacionadas.length > 0
            ? productoRecord.estaciones_relacionadas
            : productoRecord.estacion_id
              ? [productoRecord.estacion_id]
              : []
        );
        setDescripcion(productoRecord.descripcion || '');
        setTecnicas(productoRecord.tecnicas || []);
        setActoresRelacionados(productoRecord.actores_relacionados || []);
        setEstado(productoRecord.estado);
        setProducto(productoRecord);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('No se pudo cargar el producto.');
      } finally {
        setLoadingData(false);
      }
    };
    
    if (user && canEditContent(user as any)) {
      fetchData();
    }
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !categoria) {
      setError('Nombre y categoría son obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('categoria', categoria);
      if (estacionesRelacionadas.length > 0) {
        estacionesRelacionadas.forEach((estacionId) => {
          formData.append('estaciones_relacionadas', estacionId);
        });
        formData.append('estacion_id', estacionesRelacionadas[0]);
      } else {
        formData.append('estaciones_relacionadas', '');
        formData.append('estacion_id', '');
      }
      formData.append('estado', estado);
      
      if (user?.id) {
        formData.append('updated_by', user.id);
      }

      if (descripcion) {
        formData.append('descripcion', descripcion);
      }

      if (tecnicas.length > 0) {
        tecnicas.forEach((tecnicaId) => {
          formData.append('tecnicas', tecnicaId);
        });
      } else {
        formData.append('tecnicas', '');
      }

      // PocketBase elimina las relaciones anteriores si mandamos una lista nueva, 
      // y si está vacío, enviamos null o array vacío.
      if (actoresRelacionados.length > 0) {
        actoresRelacionados.forEach(actorId => {
          formData.append('actores_relacionados', actorId);
        });
      } else {
        formData.append('actores_relacionados', ''); // Para borrar relaciones
      }

      if (fotosParaEliminar.length > 0) {
        fotosParaEliminar.forEach(filename => {
          formData.append('fotos-', filename);
        });
      }

      if (fotos && fotos.length > 0) {
        for (let i = 0; i < fotos.length; i++) {
          // Usamos "fotos+" para añadir las nuevas sin borrar las que ya estaban
          formData.append('fotos+', fotos[i]);
        }
      }
      
      await updateRecordWithAudit('productos', id, formData, user);
      router.push('/productos');
    } catch (err: any) {
      console.error('Error actualizando producto:', err?.message, err?.response?.data);
      const validationErrors = err?.response?.data;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, details]: [string, any]) => `${field}: ${details.message}`)
          .join(' | ');
        setError(`Error de validación: ${errorMessages}`);
      } else {
        setError(err?.response?.message || 'Error al actualizar el producto. Verifica la configuración en PocketBase.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const actoresFiltrados = estacionesRelacionadas.length > 0
    ? actores.filter(a => estacionesRelacionadas.includes(a.estacion_id))
    : actores;

  if (isLoading || !user || !canEditContent(user as any) || loadingData) {
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
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Editar Producto
          </h2>
        </div>

        <div className="bg-[var(--color-surface-container)] p-8 rounded-[8px]">
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
              {error}
            </div>
          )}
          
          {producto && (
            <div className="mb-8 p-4 bg-[var(--color-surface-container-low)] rounded-md border border-[var(--color-outline-variant)]">
              <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Historial Básico</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--color-secondary)]">
                <div>
                  <span className="block text-[var(--color-outline)] mb-1">Fecha de creación</span>
                  <span className="block font-medium">{new Date(producto.created).toLocaleString()}</span>
                  {producto.expand?.created_by && (
                    <span className="block mt-1 text-[var(--color-outline)]">Por: {producto.expand.created_by.name || producto.expand.created_by.email}</span>
                  )}
                </div>
                <div>
                  <span className="block text-[var(--color-outline)] mb-1">Última actualización</span>
                  <span className="block font-medium">{new Date(producto.updated).toLocaleString()}</span>
                  {producto.expand?.updated_by && (
                    <span className="block mt-1 text-[var(--color-outline)]">Por: {producto.expand.updated_by.name || producto.expand.updated_by.email}</span>
                  )}
                </div>
                <div>
                  <span className="block text-[var(--color-outline)] mb-1">Estado actual</span>
                  <span className="capitalize block font-medium">{producto.estado.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input-field w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Categoría *
                </label>
                <CatalogSelect
                  collectionName="categorias_producto"
                  value={categoria}
                  onChange={(value) => setCategoria(value as ProductoCategoria)}
                  emptyLabel="Seleccionar categoría..."
                  className="input-field w-full"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Estaciones relacionadas
                </label>
                <div className="bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-md max-h-48 overflow-y-auto p-4 space-y-2">
                  {estaciones.map((estacion) => (
                    <label key={estacion.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={estacionesRelacionadas.includes(estacion.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEstacionesRelacionadas([...estacionesRelacionadas, estacion.id]);
                          } else {
                            const nextEstaciones = estacionesRelacionadas.filter((id) => id !== estacion.id);
                            setEstacionesRelacionadas(nextEstaciones);
                            setActoresRelacionados((current) =>
                              current.filter((actorId) => {
                                const actor = actores.find((item) => item.id === actorId);
                                return actor ? nextEstaciones.includes(actor.estacion_id) : false;
                              })
                            );
                          }
                        }}
                        className="h-4 w-4 text-[var(--color-primary)] rounded border-[var(--color-outline)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-on-surface)]">
                        {estacion.nombre} - {estacion.localidad}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                  Puedes relacionar el producto con ninguna, una o varias estaciones.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Estado *
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as ProductoEstado)}
                  className="input-field w-full"
                  required
                >
                  <option value="borrador">Borrador</option>
                  <option value="en_revision">En Revisión</option>
                  {canReviewContent(user as any) && (
                    <>
                      <option value="aprobado">Aprobado</option>
                      <option value="inactivo">Inactivo</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="input-field w-full min-h-[100px] resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Técnicas (opcional)
              </label>
              <CatalogTagSelector
                collectionName="tecnicas_producto"
                value={tecnicas}
                onChange={setTecnicas}
                emptyLabel="No hay técnicas cargadas todavía."
              />
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                Selecciona una o varias técnicas para etiquetar el producto.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Actores Relacionados (opcional)
              </label>
              <div className="bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-md max-h-48 overflow-y-auto p-4 space-y-2">
                {actoresFiltrados.length === 0 ? (
                  <p className="text-sm text-[var(--color-on-surface-variant)]">No hay actores disponibles para la estación seleccionada.</p>
                ) : (
                  actoresFiltrados.map(actor => (
                    <label key={actor.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={actoresRelacionados.includes(actor.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActoresRelacionados([...actoresRelacionados, actor.id]);
                            if (!estacionesRelacionadas.includes(actor.estacion_id)) {
                              setEstacionesRelacionadas([...estacionesRelacionadas, actor.estacion_id]);
                            }
                          } else {
                            setActoresRelacionados(actoresRelacionados.filter(id => id !== actor.id));
                          }
                        }}
                        className="h-4 w-4 text-[var(--color-primary)] rounded border-[var(--color-outline)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-on-surface)]">{getActorDisplayLabel(actor)}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Fotos Actuales
                </label>
                {producto?.fotos && producto.fotos.length > 0 && producto.fotos.filter(f => !fotosParaEliminar.includes(f)).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {producto.fotos.filter(f => !fotosParaEliminar.includes(f)).map((foto, index) => (
                      <div key={index} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)] group">
                        <img 
                          src={pb.files.getURL(producto, foto)} 
                          alt={`Foto de ${producto.nombre}`}
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
                    No hay fotos guardadas para este producto.
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
                        const currentFotosCount = (producto?.fotos?.length || 0) - fotosParaEliminar.length;
                        const existingNewFotosCount = fotos?.length || 0;
                        const newFotosCount = e.target.files?.length || 0;
                        
                        if (currentFotosCount + existingNewFotosCount + newFotosCount > 5) {
                          alert(`Puedes tener un máximo de 5 imágenes por producto. Te quedan ${5 - (currentFotosCount + existingNewFotosCount)} espacios.`);
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
                        // Reset input so the same file can be selected again if needed
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
                  Selecciona imágenes si deseas subir nuevas fotos para este producto. Puedes tener hasta 5 imágenes en total.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as ProductoEstado)}
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

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-[var(--color-outline-variant)] mt-8">
              <button
                type="button"
                onClick={() => router.push(`/productos/${id}`)}
                className="btn-secondary px-6 py-2 text-sm shadow-sm text-center"
              >
                Cancelar
              </button>
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
      </main>
    </div>
  );
}
