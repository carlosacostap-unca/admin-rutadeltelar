'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { canEditContent } from '@/lib/permissions';

const Map = dynamic(() => import('@/components/Map'), { ssr: false }) as React.FC<{ lat: number; lng: number; zoom?: number; label?: string }>;
import { Estacion } from '@/types/estacion';
import { Actor } from '@/types/actor';
import { Producto } from '@/types/producto';
import { Experiencia } from '@/types/experiencia';
import { Imperdible, ImperdibleTipo, ImperdiblePrioridad, ImperdibleEstado } from '@/types/imperdible';

export default function EditImperdiblePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [imperdible, setImperdible] = useState<Imperdible | null>(null);
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [actores, setActores] = useState<Actor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<ImperdibleTipo | ''>('');
  const [motivoDestaque, setMotivoDestaque] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [duracionSugerida, setDuracionSugerida] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  const [accesibilidad, setAccesibilidad] = useState('');
  const [actoresRelacionados, setActoresRelacionados] = useState<string[]>([]);
  const [productosRelacionados, setProductosRelacionados] = useState<string[]>([]);
  const [experienciasRelacionadas, setExperienciasRelacionadas] = useState<string[]>([]);
  const [horarios, setHorarios] = useState('');
  const [estacionalidad, setEstacionalidad] = useState('');
  const [prioridad, setPrioridad] = useState<ImperdiblePrioridad | ''>('');
  const [estacionId, setEstacionId] = useState('');
  const [estado, setEstado] = useState<ImperdibleEstado>('borrador');
  const [videosEnlaces, setVideosEnlaces] = useState('');
  const [fotos, setFotos] = useState<FileList | null>(null);
  const [fotosParaEliminar, setFotosParaEliminar] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !canEditContent(user as any))) {
      router.push('/imperdibles');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      
      try {
        const [imperdibleRecord, estacionesRecords, actoresRecords, productosRecords, experienciasRecords] = await Promise.all([
          pb.collection('imperdibles').getOne<Imperdible>(id, { expand: 'estacion_id,actores_relacionados,productos_relacionados,experiencias_relacionadas,created_by,updated_by', requestKey: null }),
          pb.collection('estaciones').getFullList<Estacion>({
            sort: 'nombre',
            requestKey: null,
          }),
          pb.collection('actores').getFullList<Actor>({
            sort: 'nombre',
            requestKey: null,
          }),
          pb.collection('productos').getFullList<Producto>({
            sort: 'nombre',
            requestKey: null,
          }),
          pb.collection('experiencias').getFullList<Experiencia>({
            sort: 'titulo',
            requestKey: null,
          })
        ]);
        
        setImperdible(imperdibleRecord);
        setEstaciones(estacionesRecords);
        setActores(actoresRecords);
        setProductos(productosRecords);
        setExperiencias(experienciasRecords);
        
        // Inicializar form
        setTitulo(imperdibleRecord.titulo);
        setSubtitulo(imperdibleRecord.subtitulo || '');
        setDescripcion(imperdibleRecord.descripcion || '');
        setTipo(imperdibleRecord.tipo as ImperdibleTipo);
        setMotivoDestaque(imperdibleRecord.motivo_destaque || '');
        setUbicacion(imperdibleRecord.ubicacion || '');
        setLatitud(imperdibleRecord.latitud?.toString() || '');
        setLongitud(imperdibleRecord.longitud?.toString() || '');
        setDuracionSugerida(imperdibleRecord.duracion_sugerida || '');
        setRecomendaciones(imperdibleRecord.recomendaciones || '');
        setAccesibilidad(imperdibleRecord.accesibilidad || '');
        setActoresRelacionados(imperdibleRecord.actores_relacionados || []);
        setProductosRelacionados(imperdibleRecord.productos_relacionados || []);
        setExperienciasRelacionadas(imperdibleRecord.experiencias_relacionadas || []);
        setHorarios(imperdibleRecord.horarios || '');
        setEstacionalidad(imperdibleRecord.estacionalidad || '');
        setPrioridad(imperdibleRecord.prioridad as ImperdiblePrioridad);
        setEstacionId(imperdibleRecord.estacion_id);
        setEstado(imperdibleRecord.estado);
        setVideosEnlaces(imperdibleRecord.videos_enlaces || '');
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('No se pudo cargar el imperdible para editar.');
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
    if (!titulo || !tipo || !estacionId || !prioridad) {
      setError('Título, tipo, prioridad y estación son obligatorios.');
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
      formData.append('tipo', tipo);
      formData.append('prioridad', prioridad);
      formData.append('estacion_id', estacionId);
      formData.append('estado', newEstado);
      
      if (user?.id) {
        formData.append('updated_by', user.id);
      }

      if (subtitulo) formData.append('subtitulo', subtitulo);
      else formData.append('subtitulo', '');
      
      if (descripcion) formData.append('descripcion', descripcion);
      else formData.append('descripcion', '');
      
      if (motivoDestaque) formData.append('motivo_destaque', motivoDestaque);
      else formData.append('motivo_destaque', '');
      
      if (ubicacion) formData.append('ubicacion', ubicacion);
      else formData.append('ubicacion', '');
      
      if (latitud) formData.append('latitud', latitud);
      else formData.append('latitud', '');
      
      if (longitud) formData.append('longitud', longitud);
      else formData.append('longitud', '');
      
      if (duracionSugerida) formData.append('duracion_sugerida', duracionSugerida);
      else formData.append('duracion_sugerida', '');
      
      if (recomendaciones) formData.append('recomendaciones', recomendaciones);
      else formData.append('recomendaciones', '');
      
      if (accesibilidad) formData.append('accesibilidad', accesibilidad);
      else formData.append('accesibilidad', '');
      
      // Limpiar relaciones anteriores y agregar las nuevas
      // PocketBase permite sobreescribir arreglos si los enviamos completos
      formData.delete('actores_relacionados');
      if (actoresRelacionados.length > 0) {
        actoresRelacionados.forEach(actor => formData.append('actores_relacionados', actor));
      } else {
        formData.append('actores_relacionados', '');
      }

      formData.delete('productos_relacionados');
      if (productosRelacionados.length > 0) {
        productosRelacionados.forEach(prod => formData.append('productos_relacionados', prod));
      } else {
        formData.append('productos_relacionados', '');
      }

      formData.delete('experiencias_relacionadas');
      if (experienciasRelacionadas.length > 0) {
        experienciasRelacionadas.forEach(exp => formData.append('experiencias_relacionadas', exp));
      } else {
        formData.append('experiencias_relacionadas', '');
      }
      
      if (horarios) formData.append('horarios', horarios);
      else formData.append('horarios', '');
      
      if (estacionalidad) formData.append('estacionalidad', estacionalidad);
      else formData.append('estacionalidad', '');
      
      if (videosEnlaces) formData.append('videos_enlaces', videosEnlaces);
      else formData.append('videos_enlaces', '');
      
      // Eliminar fotos seleccionadas
      if (fotosParaEliminar.length > 0) {
        fotosParaEliminar.forEach(foto => {
          formData.append('fotos-', foto); // La sintaxis 'campo-' elimina el archivo en PocketBase
        });
      }
      
      if (fotos && fotos.length > 0) {
        for (let i = 0; i < fotos.length; i++) {
          formData.append('fotos', fotos[i]);
        }
      }
      
      await pb.collection('imperdibles').update(id, formData);
      
      router.push(`/imperdibles/${id}`);
    } catch (err: any) {
      console.error('Error actualizando imperdible:', err?.message, err?.response?.data);
      const validationErrors = err?.response?.data;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, details]: [string, any]) => `${field}: ${details.message}`)
          .join(' | ');
        setError(`Error de validación: ${errorMessages}`);
      } else {
        setError(err?.response?.message || 'Error al actualizar el imperdible. Verifica la configuración en PocketBase.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const actoresFiltrados = estacionId 
    ? actores.filter(a => a.estacion_id === estacionId)
    : actores;

  const productosFiltrados = estacionId
    ? productos.filter(p => p.estacion_id === estacionId)
    : productos;
    
  const experienciasFiltradas = estacionId
    ? experiencias.filter(e => e.estacion_id === estacionId)
    : experiencias;

  if (isLoading || !user || !canEditContent(user as any) || loadingData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!imperdible && !loadingData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Imperdible no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-surface)] flex flex-col">
      <main className="mx-auto px-6 py-8 flex-1 w-full">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm shadow-md">&larr; Volver</button>
          <h1 className="text-[32px] font-bold text-[var(--color-on-surface)] tracking-tight ml-4">
            Editar Imperdible
          </h1>
        </div>

        <div className="bg-[var(--color-surface-container)] p-8 rounded-md">
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
              {error}
            </div>
          )}
          
          {imperdible && (
            <div className="mb-8 p-4 bg-[var(--color-surface-container-low)] rounded-md border border-[var(--color-outline-variant)]">
              <h3 className="text-sm font-semibold text-[var(--color-on-surface)] mb-2">Historial Básico</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--color-on-surface-variant)]">
                <div>
                  <span className="block text-[var(--color-outline)] mb-1">Fecha de creación</span>
                  <span className="block font-medium">{new Date(imperdible.created).toLocaleString()}</span>
                  {imperdible.expand?.created_by && (
                    <span className="block mt-1 text-[var(--color-outline)]">Por: {imperdible.expand.created_by.name || imperdible.expand.created_by.email}</span>
                  )}
                </div>
                <div>
                  <span className="block text-[var(--color-outline)] mb-1">Última actualización</span>
                  <span className="block font-medium">{new Date(imperdible.updated).toLocaleString()}</span>
                  {imperdible.expand?.updated_by && (
                    <span className="block mt-1 text-[var(--color-outline)]">Por: {imperdible.expand.updated_by.name || imperdible.expand.updated_by.email}</span>
                  )}
                </div>
                <div>
                  <span className="block text-[var(--color-outline)] mb-1">Estado actual</span>
                  <span className="capitalize block font-medium">{imperdible.estado.replace('_', ' ')}</span>
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
                    placeholder="Ej. Cerro de los Siete Colores"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Subtítulo Breve
                  </label>
                  <input
                    type="text"
                    value={subtitulo}
                    onChange={(e) => setSubtitulo(e.target.value)}
                    className="input-field w-full"
                    placeholder="Ej. Un paisaje único en la quebrada"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Tipo *
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as ImperdibleTipo)}
                    className="input-field w-full"
                    required
                  >
                    <option value="" disabled>Seleccionar...</option>
                    <option value="lugar">Lugar</option>
                    <option value="actividad">Actividad</option>
                    <option value="evento">Evento</option>
                    <option value="atractivo">Atractivo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Estación *
                  </label>
                  <select
                    value={estacionId}
                    onChange={(e) => {
                      setEstacionId(e.target.value);
                      setActoresRelacionados([]);
                      setProductosRelacionados([]);
                      setExperienciasRelacionadas([]);
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
                    Prioridad *
                  </label>
                  <select
                    value={prioridad}
                    onChange={(e) => setPrioridad(e.target.value as ImperdiblePrioridad)}
                    className="input-field w-full"
                    required
                  >
                    <option value="" disabled>Seleccionar...</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>
            

              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Descripción Completa
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="input-field w-full min-h-[100px] resize-y"
                  placeholder="Descripción detallada del imperdible..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Motivo de Destaque
                </label>
                <textarea
                  value={motivoDestaque}
                  onChange={(e) => setMotivoDestaque(e.target.value)}
                  className="input-field w-full min-h-[80px] resize-y"
                  placeholder="¿Por qué es un imperdible?"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Duración Sugerida
                  </label>
                  <input
                    type="text"
                    value={duracionSugerida}
                    onChange={(e) => setDuracionSugerida(e.target.value)}
                    className="input-field w-full"
                    placeholder="Ej. 2 horas, Medio día"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Accesibilidad
                  </label>
                  <input
                    type="text"
                    value={accesibilidad}
                    onChange={(e) => setAccesibilidad(e.target.value)}
                    className="input-field w-full"
                    placeholder="Ej. Apto para sillas de ruedas, dificultad media"
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
                  placeholder="Recomendaciones para los visitantes (ropa cómoda, mejor horario, etc.)..."
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
                  placeholder="Ej. Ruta 9 km 15, Centro"
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
                    placeholder="-23.7431"
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
                    placeholder="-65.4891"
                  />
                </div>
              </div>
              {(latitud && longitud && !isNaN(Number(latitud)) && !isNaN(Number(longitud))) && (
                <div className="mt-4 mb-4">
                  <Map lat={Number(latitud)} lng={Number(longitud)} label={titulo || 'Ubicación actual'} />
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Actores Relacionados (opcional)
                  </label>
                  <select
                    multiple
                    value={actoresRelacionados}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setActoresRelacionados(options);
                    }}
                    className="input-field w-full min-h-[100px]"
                    disabled={!estacionId || actoresFiltrados.length === 0}
                  >
                    {actoresFiltrados.map((actor) => (
                      <option key={actor.id} value={actor.id}>
                        {actor.nombre} ({actor.tipo})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar varios.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Productos Relacionados (opcional)
                  </label>
                  <select
                    multiple
                    value={productosRelacionados}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setProductosRelacionados(options);
                    }}
                    className="input-field w-full min-h-[100px]"
                    disabled={!estacionId || productosFiltrados.length === 0}
                  >
                    {productosFiltrados.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nombre} ({prod.categoria})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar varios.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Experiencias Relacionadas (opcional)
                  </label>
                  <select
                    multiple
                    value={experienciasRelacionadas}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setExperienciasRelacionadas(options);
                    }}
                    className="input-field w-full min-h-[100px]"
                    disabled={!estacionId || experienciasFiltradas.length === 0}
                  >
                    {experienciasFiltradas.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.titulo} ({exp.categoria})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar varios.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Estacionalidad
                  </label>
                  <input
                    type="text"
                    value={estacionalidad}
                    onChange={(e) => setEstacionalidad(e.target.value)}
                    className="input-field w-full"
                    placeholder="Ej. Todo el año, Verano, Semana Santa"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Horarios o Disponibilidad
                  </label>
                  <input
                    type="text"
                    value={horarios}
                    onChange={(e) => setHorarios(e.target.value)}
                    className="input-field w-full"
                    placeholder="Ej. Lunes a Viernes de 9 a 18hs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Videos o Enlaces (URLs)
                  </label>
                  <input
                    type="text"
                    value={videosEnlaces}
                    onChange={(e) => setVideosEnlaces(e.target.value)}
                    className="input-field w-full"
                    placeholder="Ej. https://youtube.com/..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as ImperdibleEstado)}
                  className="input-field w-full md:w-1/2"
                >
                  <option value="borrador">Borrador</option>
                  <option value="en_revision">En Revisión</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            

              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Fotos Actuales
                </label>
                {imperdible?.fotos && imperdible.fotos.length > 0 && imperdible.fotos.filter(f => !fotosParaEliminar.includes(f)).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {imperdible.fotos.filter(f => !fotosParaEliminar.includes(f)).map((foto, index) => (
                      <div key={index} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)] group">
                        <img 
                          src={pb.files.getURL(imperdible, foto)} 
                          alt={`Foto de ${imperdible.titulo}`}
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
                    No hay fotos guardadas para este imperdible.
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
                        const currentFotosCount = (imperdible?.fotos?.length || 0) - fotosParaEliminar.length;
                        const existingNewFotosCount = fotos?.length || 0;
                        const newFotosCount = e.target.files?.length || 0;
                        
                        if (currentFotosCount + existingNewFotosCount + newFotosCount > 5) {
                          alert(`Puedes tener un máximo de 5 imágenes por imperdible. Te quedan ${5 - (currentFotosCount + existingNewFotosCount)} espacios.`);
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
                  Selecciona imágenes si deseas subir nuevas fotos para este imperdible. Puedes tener hasta 5 imágenes en total.
                </p>
              </div>
            

            <div className="pt-8 flex flex-col md:flex-row justify-end gap-4 border-t border-[var(--color-surface-variant)] mt-8">
              <Link
                href={`/imperdibles/${id}`}
                className="btn-secondary px-6 py-2 text-sm shadow-sm text-center"
              >
                Cancelar
              </Link>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'guardar')}
                disabled={isSubmitting}
                className="btn-secondary px-6 py-2 text-sm shadow-sm"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              
              {estado !== 'aprobado' && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'publicar')}
                  disabled={isSubmitting}
                  className="btn-primary px-6 py-2 text-sm shadow-md"
                >
                  {isSubmitting ? 'Guardando...' : 'Publicar Imperdible'}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
