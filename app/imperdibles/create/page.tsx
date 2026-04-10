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
import { Producto } from '@/types/producto';
import { Experiencia } from '@/types/experiencia';
import { ImperdibleTipo, ImperdiblePrioridad, ImperdibleEstado } from '@/types/imperdible';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false }) as React.FC<{ lat: number; lng: number; zoom?: number; label?: string }>;

function CreateImperdibleForm() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
        const [estacionesRecords, actoresRecords, productosRecords, experienciasRecords] = await Promise.all([
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
        setEstaciones(estacionesRecords);
        setActores(actoresRecords);
        setProductos(productosRecords);
        setExperiencias(experienciasRecords);
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
    if (!titulo || !tipo || !estacionId || !prioridad) {
      setError('Título, tipo, prioridad y estación son obligatorios.');
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
      if (motivoDestaque) formData.append('motivo_destaque', motivoDestaque);
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
      
      const record = await pb.collection('imperdibles').create(formData);
      
      if (action === 'borrador') {
        router.push('/imperdibles');
      } else {
        router.push(`/imperdibles/${record.id}/edit`);
      }
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
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Header />
      <main className="mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/imperdibles" className="text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
            &larr; Volver
          </Link>
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Crear Imperdible
          </h2>
        </div>

        <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)]">
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-6">
            {/* Información Principal */}
            <div className="border-b border-[var(--color-outline-variant)] pb-4">
              <h3 className="text-lg font-semibold text-[var(--color-on-surface)] mb-4">Información Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Ej. Cerro de los Siete Colores"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Subtítulo Breve
                  </label>
                  <input
                    type="text"
                    value={subtitulo}
                    onChange={(e) => setSubtitulo(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Ej. Un paisaje único en la quebrada"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Tipo *
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as ImperdibleTipo)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
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
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
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
                    Prioridad *
                  </label>
                  <select
                    value={prioridad}
                    onChange={(e) => setPrioridad(e.target.value as ImperdiblePrioridad)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    required
                  >
                    <option value="" disabled>Seleccionar...</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Descripciones */}
            <div className="border-b border-[var(--color-outline-variant)] pb-4">
              <h3 className="text-lg font-semibold text-[var(--color-on-surface)] mb-4">Descripciones y Detalles</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Descripción Completa
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[100px] resize-y"
                  placeholder="Descripción detallada del imperdible..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Motivo de Destaque
                </label>
                <textarea
                  value={motivoDestaque}
                  onChange={(e) => setMotivoDestaque(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[80px] resize-y"
                  placeholder="¿Por qué es un imperdible?"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Duración Sugerida
                  </label>
                  <input
                    type="text"
                    value={duracionSugerida}
                    onChange={(e) => setDuracionSugerida(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Ej. 2 horas, Medio día"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Accesibilidad
                  </label>
                  <input
                    type="text"
                    value={accesibilidad}
                    onChange={(e) => setAccesibilidad(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Ej. Apto para sillas de ruedas, dificultad media"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Recomendaciones
                </label>
                <textarea
                  value={recomendaciones}
                  onChange={(e) => setRecomendaciones(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[80px] resize-y"
                  placeholder="Recomendaciones para los visitantes (ropa cómoda, mejor horario, etc.)..."
                />
              </div>
            </div>

            {/* Ubicación y Extras */}
            <div className="border-b border-[var(--color-outline-variant)] pb-4">
              <h3 className="text-lg font-semibold text-[var(--color-on-surface)] mb-4">Ubicación y Relaciones</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                  placeholder="Ej. Ruta 9 km 15, Centro"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitud}
                    onChange={(e) => setLatitud(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="-23.7431"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitud}
                    onChange={(e) => setLongitud(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="-65.4891"
                  />
                </div>
              </div>

              {(latitud && longitud && !isNaN(Number(latitud)) && !isNaN(Number(longitud))) && (
                <div className="mb-4">
                  <Map lat={Number(latitud)} lng={Number(longitud)} label={titulo || 'Nueva ubicación'} />
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Actores Relacionados (opcional)
                  </label>
                  <select
                    multiple
                    value={actoresRelacionados}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setActoresRelacionados(options);
                    }}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[100px]"
                    disabled={!estacionId || actoresFiltrados.length === 0}
                  >
                    {actoresFiltrados.map((actor) => (
                      <option key={actor.id} value={actor.id}>
                        {actor.nombre} ({actor.tipo})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--color-secondary)] mt-1">Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar varios.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Productos Relacionados (opcional)
                  </label>
                  <select
                    multiple
                    value={productosRelacionados}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setProductosRelacionados(options);
                    }}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[100px]"
                    disabled={!estacionId || productosFiltrados.length === 0}
                  >
                    {productosFiltrados.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nombre} ({prod.categoria})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--color-secondary)] mt-1">Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar varios.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Experiencias Relacionadas (opcional)
                  </label>
                  <select
                    multiple
                    value={experienciasRelacionadas}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setExperienciasRelacionadas(options);
                    }}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[100px]"
                    disabled={!estacionId || experienciasFiltradas.length === 0}
                  >
                    {experienciasFiltradas.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.titulo} ({exp.categoria})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--color-secondary)] mt-1">Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar varios.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Estacionalidad
                  </label>
                  <input
                    type="text"
                    value={estacionalidad}
                    onChange={(e) => setEstacionalidad(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Ej. Todo el año, Verano, Semana Santa"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Horarios o Disponibilidad
                  </label>
                  <input
                    type="text"
                    value={horarios}
                    onChange={(e) => setHorarios(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Ej. Lunes a Viernes de 9 a 18hs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Videos o Enlaces (URLs)
                  </label>
                  <input
                    type="text"
                    value={videosEnlaces}
                    onChange={(e) => setVideosEnlaces(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Ej. https://youtube.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Multimedia */}
            <div className="border-b border-[var(--color-outline-variant)] pb-4">
              <h3 className="text-lg font-semibold text-[var(--color-on-surface)] mb-4">Multimedia</h3>
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
            </div>

            <div className="pt-6 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/imperdibles')}
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

export default function CreateImperdiblePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <CreateImperdibleForm />
    </Suspense>
  );
}
