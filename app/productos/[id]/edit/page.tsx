'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';
import { Estacion } from '@/types/estacion';
import { Actor } from '@/types/actor';
import { Producto, ProductoCategoria, ProductoEstado } from '@/types/producto';

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
  const [estacionId, setEstacionId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [actoresRelacionados, setActoresRelacionados] = useState<string[]>([]);
  const [fotos, setFotos] = useState<FileList | null>(null);
  const [estado, setEstado] = useState<ProductoEstado>('borrador');
  const [producto, setProducto] = useState<Producto | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          pb.collection('productos').getOne<Producto>(id, { expand: 'estacion_id,actores_relacionados,created_by,updated_by', requestKey: null }),
          pb.collection('estaciones').getFullList<Estacion>({ sort: 'nombre', requestKey: null }),
          pb.collection('actores').getFullList<Actor>({ sort: 'nombre', requestKey: null })
        ]);
        
        setEstaciones(estacionesRecords);
        setActores(actoresRecords);

        setNombre(productoRecord.nombre);
        setCategoria(productoRecord.categoria as ProductoCategoria);
        setEstacionId(productoRecord.estacion_id);
        setDescripcion(productoRecord.descripcion || '');
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
    if (!nombre || !categoria || !estacionId) {
      setError('Nombre, categoría y estación son obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('categoria', categoria);
      formData.append('estacion_id', estacionId);
      formData.append('estado', estado);
      
      if (user?.id) {
        formData.append('updated_by', user.id);
      }

      if (descripcion) {
        formData.append('descripcion', descripcion);
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

      if (fotos && fotos.length > 0) {
        for (let i = 0; i < fotos.length; i++) {
          formData.append('fotos', fotos[i]);
        }
      }
      
      await pb.collection('productos').update(id, formData);
      router.push(`/productos/${id}`);
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
          <Link href={`/productos/${id}`} className="text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
            &larr; Volver
          </Link>
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Editar Producto
          </h2>
        </div>

        <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)]">
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
              {error}
            </div>
          )}
          
          {producto && (
            <div className="mb-8 p-4 bg-[var(--color-surface-container-low)] rounded-md border border-[var(--color-outline-variant)]">
              <h3 className="text-sm font-semibold text-[var(--color-on-surface)] mb-2">Historial Básico</h3>
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
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Categoría *
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as ProductoCategoria)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                  required
                >
                  <option value="" disabled>Seleccionar Categoría...</option>
                  <option value="textil">Textil</option>
                  <option value="ceramica">Cerámica</option>
                  <option value="madera">Madera</option>
                  <option value="metal">Metal</option>
                  <option value="cuero">Cuero</option>
                  <option value="gastronomia">Gastronomía</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Estación *
                </label>
                <select
                  value={estacionId}
                  onChange={(e) => {
                    setEstacionId(e.target.value);
                    setActoresRelacionados([]); 
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
                  Estado *
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as ProductoEstado)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                  required
                >
                  <option value="borrador">Borrador</option>
                  <option value="en_revision">En Revisión</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[100px] resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
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
                          } else {
                            setActoresRelacionados(actoresRelacionados.filter(id => id !== actor.id));
                          }
                        }}
                        className="h-4 w-4 text-[var(--color-primary)] rounded border-[var(--color-outline)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-on-surface)]">{actor.nombre} ({actor.tipo})</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                Fotos (Opcional - Nuevas imágenes se agregarán a las existentes)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFotos(e.target.files)}
                className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
              />
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                Selecciona imágenes si deseas subir nuevas fotos para este producto.
              </p>
            </div>

            <div className="pt-6 flex items-center justify-end gap-4 border-t border-[var(--color-outline-variant)]">
              <button
                type="button"
                onClick={() => router.push(`/productos/${id}`)}
                className="px-6 py-2 border border-[var(--color-outline)] rounded-full text-[var(--color-primary)] hover:bg-[var(--color-surface-variant)] transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-full hover:bg-[var(--color-primary-fixed-dim)] transition-colors font-medium text-sm shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
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
