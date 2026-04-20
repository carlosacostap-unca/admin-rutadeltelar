'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import pb from '@/lib/pocketbase';
import { createRecordWithAudit, updateRecordWithAudit } from '@/lib/audit';
import Link from 'next/link';
import { canEditContent, canReviewContent } from '@/lib/permissions';
import { Estacion } from '@/types/estacion';
import { Actor } from '@/types/actor';
import { Producto } from '@/types/producto';
import { Experiencia } from '@/types/experiencia';
import { ImperdibleTipo, ImperdiblePrioridad, ImperdibleEstado } from '@/types/imperdible';
import { CatalogoItem } from '@/types/catalogo';
import dynamic from 'next/dynamic';
import CatalogSelect from '@/components/CatalogSelect';
import { buildCatalogoSort, normalizeCatalogName } from '@/lib/catalogos';
import { getBrowserTimeZoneLabel, localDateTimeInputToUtc } from '@/lib/datetime';

const Map = dynamic(() => import('@/components/Map'), { ssr: false }) as React.FC<{ lat: number; lng: number; zoom?: number; label?: string }>;

function CreateImperdibleForm() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [actores, setActores] = useState<Actor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [tiposImperdible, setTiposImperdible] = useState<CatalogoItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<ImperdibleTipo | ''>('');
  const [fechaHoraEvento, setFechaHoraEvento] = useState('');
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
  const [estacionId, setEstacionId] = useState(searchParams.get('estacion_id') || '');
  const [estado, setEstado] = useState<ImperdibleEstado>('borrador');
  const [videosEnlaces, setVideosEnlaces] = useState('');
  const [fotos, setFotos] = useState<FileList | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !canEditContent(user as any))) {
      router.push('/imperdibles');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [estacionesRecords, actoresRecords, productosRecords, experienciasRecords, tiposImperdibleRecords] = await Promise.all([
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
          }),
          pb.collection('tipos_imperdible').getFullList<CatalogoItem>({
            filter: 'activo = true',
            sort: buildCatalogoSort(),
            requestKey: null,
          })
        ]);
        setEstaciones(estacionesRecords);
        setActores(actoresRecords);
        setProductos(productosRecords);
        setExperiencias(experienciasRecords);
        setTiposImperdible(tiposImperdibleRecords);
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

  const tipoSeleccionado = tiposImperdible.find((item) => item.id === tipo);
  const esEvento = normalizeCatalogName(tipoSeleccionado?.nombre || tipo) === 'evento';
  const gmtLabel = getBrowserTimeZoneLabel(fechaHoraEvento || undefined);

  useEffect(() => {
    if (!esEvento && fechaHoraEvento) {
      setFechaHoraEvento('');
    }
  }, [esEvento, fechaHoraEvento]);

  const handleSubmit = async (e: React.FormEvent, action: 'borrador' | 'continuar') => {
    e.preventDefault();
    if (!titulo || !tipo || !estacionId || !prioridad) {
      setError('Título, tipo, prioridad y estación son obligatorios.');
      return;
    }
    if (esEvento && !fechaHoraEvento) {
      setError('Para los imperdibles de tipo evento, la fecha y hora son obligatorias.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('tipo', tipo);
      formData.append('prioridad', prioridad);
      formData.append('estacion_id', estacionId);
      formData.append('estado', action === 'borrador' ? 'borrador' : estado);
      
      if (user?.id) {
        formData.append('created_by', user.id);
        formData.append('updated_by', user.id);
      }

      if (subtitulo) formData.append('subtitulo', subtitulo);
      if (descripcion) formData.append('descripcion', descripcion);
      if (esEvento && fechaHoraEvento) formData.append('fecha_hora_evento', localDateTimeInputToUtc(fechaHoraEvento));
      if (ubicacion) formData.append('ubicacion', ubicacion);
      if (latitud) formData.append('latitud', latitud);
      if (longitud) formData.append('longitud', longitud);
      if (duracionSugerida) formData.append('duracion_sugerida', duracionSugerida);
      if (recomendaciones) formData.append('recomendaciones', recomendaciones);
      if (accesibilidad) formData.append('accesibilidad', accesibilidad);
      actoresRelacionados.forEach(actor => formData.append('actores_relacionados', actor));
      productosRelacionados.forEach(prod => formData.append('productos_relacionados', prod));
      experienciasRelacionadas.forEach(exp => formData.append('experiencias_relacionadas', exp));
      if (horarios) formData.append('horarios', horarios);
      if (estacionalidad) formData.append('estacionalidad', estacionalidad);
      if (videosEnlaces) formData.append('videos_enlaces', videosEnlaces);
      
      if (fotos) {
        for (let i = 0; i < fotos.length; i++) {
          formData.append('fotos', fotos[i]);
        }
      }
      
      const record = await createRecordWithAudit('imperdibles', formData, user);
      
      router.push('/imperdibles');
    } catch (err: any) {
      console.error('Error creando imperdible:', err?.message, err?.response?.data);
      const validationErrors = err?.response?.data;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, details]: [string, any]) => `${field}: ${details.message}`)
          .join(' | ');
        setError(`Error de validación: ${errorMessages}`);
      } else {
        setError(err?.response?.message || 'Error al crear el imperdible. Verifica que la colección "imperdibles" esté correctamente configurada en PocketBase.');
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

  return (
    <div className="h-full bg-[var(--color-surface)] flex flex-col">
      <main className="mx-auto px-6 py-8 flex-1 w-full">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm shadow-md">&larr; Volver</button>
          <h1 className="text-[32px] font-bold text-[var(--color-primary)] tracking-tight ml-4">
            Crear Imperdible
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
                  <CatalogSelect
                    collectionName="tipos_imperdible"
                    value={tipo}
                    onChange={(value) => setTipo(value as ImperdibleTipo)}
                    emptyLabel="Seleccionar..."
                    className="input-field w-full"
                    required
                  />
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
                  <CatalogSelect
                    collectionName="prioridades_imperdible"
                    value={prioridad}
                    onChange={(value) => setPrioridad(value as ImperdiblePrioridad)}
                    emptyLabel="Seleccionar..."
                    className="input-field w-full"
                    required
                  />
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

              {esEvento && (
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Fecha y hora del evento *
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaHoraEvento}
                    onChange={(e) => setFechaHoraEvento(e.target.value)}
                    className="input-field w-full md:w-1/2"
                    required={esEvento}
                  />
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                    Se usa el huso horario del navegador ({gmtLabel}) y se guarda en UTC/GMT 0.
                  </p>
                </div>
              )}

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
                <div>
                  <Map lat={Number(latitud)} lng={Number(longitud)} label={titulo || 'Nueva ubicación'} />
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Actores Relacionados (opcional)
                  </label>
                  <div className={`bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-md p-3 max-h-48 overflow-y-auto space-y-2 ${!estacionId || actoresFiltrados.length === 0 ? 'opacity-60 bg-gray-50' : ''}`}>
                    {!estacionId ? (
                      <p className="text-sm text-[var(--color-on-surface-variant)] italic">Selecciona una estación primero.</p>
                    ) : actoresFiltrados.length === 0 ? (
                      <p className="text-sm text-[var(--color-on-surface-variant)] italic">No hay actores en esta estación.</p>
                    ) : (
                      actoresFiltrados.map((actor) => (
                        <label key={actor.id} className="flex items-center gap-3 cursor-pointer hover:bg-[var(--color-surface-container)] p-1.5 rounded transition-colors">
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
                            className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-outline)] rounded focus:ring-[var(--color-primary)]"
                          />
                          <span className="text-sm text-[var(--color-on-surface)]">
                            {actor.nombre} <span className="text-xs text-[var(--color-on-surface-variant)]">({actor.tipo})</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Productos Relacionados (opcional)
                  </label>
                  <div className={`bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-md p-3 max-h-48 overflow-y-auto space-y-2 ${!estacionId || productosFiltrados.length === 0 ? 'opacity-60 bg-gray-50' : ''}`}>
                    {!estacionId ? (
                      <p className="text-sm text-[var(--color-on-surface-variant)] italic">Selecciona una estación primero.</p>
                    ) : productosFiltrados.length === 0 ? (
                      <p className="text-sm text-[var(--color-on-surface-variant)] italic">No hay productos en esta estación.</p>
                    ) : (
                      productosFiltrados.map((prod) => (
                        <label key={prod.id} className="flex items-center gap-3 cursor-pointer hover:bg-[var(--color-surface-container)] p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={productosRelacionados.includes(prod.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProductosRelacionados([...productosRelacionados, prod.id]);
                              } else {
                                setProductosRelacionados(productosRelacionados.filter(id => id !== prod.id));
                              }
                            }}
                            className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-outline)] rounded focus:ring-[var(--color-primary)]"
                          />
                          <span className="text-sm text-[var(--color-on-surface)]">
                            {prod.nombre} <span className="text-xs text-[var(--color-on-surface-variant)]">({prod.categoria})</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                    Experiencias Relacionadas (opcional)
                  </label>
                  <div className={`bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-md p-3 max-h-48 overflow-y-auto space-y-2 ${!estacionId || experienciasFiltradas.length === 0 ? 'opacity-60 bg-gray-50' : ''}`}>
                    {!estacionId ? (
                      <p className="text-sm text-[var(--color-on-surface-variant)] italic">Selecciona una estación primero.</p>
                    ) : experienciasFiltradas.length === 0 ? (
                      <p className="text-sm text-[var(--color-on-surface-variant)] italic">No hay experiencias en esta estación.</p>
                    ) : (
                      experienciasFiltradas.map((exp) => (
                        <label key={exp.id} className="flex items-center gap-3 cursor-pointer hover:bg-[var(--color-surface-container)] p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={experienciasRelacionadas.includes(exp.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExperienciasRelacionadas([...experienciasRelacionadas, exp.id]);
                              } else {
                                setExperienciasRelacionadas(experienciasRelacionadas.filter(id => id !== exp.id));
                              }
                            }}
                            className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-outline)] rounded focus:ring-[var(--color-primary)]"
                          />
                          <span className="text-sm text-[var(--color-on-surface)]">
                            {exp.titulo} <span className="text-xs text-[var(--color-on-surface-variant)]">({exp.categoria})</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
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
                  Fotos (Opcional)
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
                      id="file-upload-create"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const existingFotosCount = fotos?.length || 0;
                        const newFotosCount = e.target.files?.length || 0;
                        
                        if (existingFotosCount + newFotosCount > 5) {
                          alert(`Puedes tener un máximo de 5 imágenes. Te quedan ${5 - existingFotosCount} espacios.`);
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
                      onClick={() => document.getElementById('file-upload-create')?.click()}
                      className="btn-secondary px-4 py-2 text-sm shadow-sm"
                    >
                      + Añadir foto
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                  Puedes seleccionar hasta 5 imágenes.
                </p>
              </div>
            
            <div className="pt-8 flex flex-col md:flex-row justify-end gap-4 border-t border-[var(--color-surface-variant)] mt-8">
              <Link
                href="/imperdibles"
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

export default function CreateImperdiblePage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center">Cargando...</div>}>
      <CreateImperdibleForm />
    </Suspense>
  );
}
