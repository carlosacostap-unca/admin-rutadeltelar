'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import pb from '@/lib/pocketbase';
import { createRecordWithAudit, updateRecordWithAudit } from '@/lib/audit';
import Link from 'next/link';
import { canEditContent, canReviewContent } from '@/lib/permissions';
import { Estacion } from '@/types/estacion';
import { ActorTipo, ActorEstado } from '@/types/actor';
import { Producto } from '@/types/producto';
import MapPicker from '@/components/MapPicker';
import CatalogSelect from '@/components/CatalogSelect';
import { CatalogoItem } from '@/types/catalogo';
import { buildCatalogoSort, normalizeCatalogName } from '@/lib/catalogos';

function CreateActorForm() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tiposActor, setTiposActor] = useState<CatalogoItem[]>([]);
  const [loadingEstaciones, setLoadingEstaciones] = useState(true);

  // Common Fields
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<ActorTipo>('');
  const [estacionId, setEstacionId] = useState(searchParams.get('estacion_id') || '');
  const [ubicadoEnEstacionInaugurada, setUbicadoEnEstacionInaugurada] = useState(false);
  const [productosRelacionados, setProductosRelacionados] = useState<string[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [contactoEmail, setContactoEmail] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [estado, setEstado] = useState<ActorEstado>('borrador');
  const [observaciones, setObservaciones] = useState('');

  // Specific Fields
  const [tecnicas, setTecnicas] = useState('');
  const [materiales, setMateriales] = useState('');
  const [rubroProductivo, setRubroProductivo] = useState('');
  const [escalaProduccion, setEscalaProduccion] = useState('');
  const [modalidadVenta, setModalidadVenta] = useState('');
  const [productosOfrecidos, setProductosOfrecidos] = useState('');
  const [visitasDemostraciones, setVisitasDemostraciones] = useState(false);
  const [tipoHospedaje, setTipoHospedaje] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [servicios, setServicios] = useState('');
  const [tipoPropuesta, setTipoPropuesta] = useState('');
  const [especialidades, setEspecialidades] = useState('');
  const [platosDestacados, setPlatosDestacados] = useState('');
  const [modalidadServicio, setModalidadServicio] = useState('');
  const [serviciosAdicionales, setServiciosAdicionales] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [idiomas, setIdiomas] = useState('');
  const [recorridosOfrecidos, setRecorridosOfrecidos] = useState('');
  const [duracionRecorridos, setDuracionRecorridos] = useState('');
  const [zonaCobertura, setZonaCobertura] = useState('');
  const [puntoEncuentro, setPuntoEncuentro] = useState('');
  const [acreditacion, setAcreditacion] = useState('');
  const [horarios, setHorarios] = useState('');
  const [disponibilidad, setDisponibilidad] = useState('');
  
  const [fotos, setFotos] = useState<FileList | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !canEditContent(user as any))) {
      router.push('/actores');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchEstaciones = async () => {
      try {
        const [estacionesRecords, tiposRecords, productosRecords] = await Promise.all([
          pb.collection('estaciones').getFullList<Estacion>({
            sort: 'nombre',
            requestKey: null,
          }),
          pb.collection('tipos_actor').getFullList<CatalogoItem>({
            filter: 'activo = true',
            sort: buildCatalogoSort(),
            requestKey: null,
          }),
          pb.collection('productos').getFullList<Producto>({
            sort: 'nombre',
            expand: 'estacion_id,estaciones_relacionadas',
            requestKey: null,
          }),
        ]);
        setEstaciones(estacionesRecords);
        setTiposActor(tiposRecords);
        setProductos(productosRecords);
      } catch (err) {
        console.error('Error fetching estaciones:', err);
      } finally {
        setLoadingEstaciones(false);
      }
    };
    
    if (user && canEditContent(user as any)) {
      fetchEstaciones();
    }
  }, [user]);

  const estacionSeleccionada = estaciones.find((estacion) => estacion.id === estacionId);
  const puedeIndicarEstacionInaugurada = !!estacionSeleccionada?.posee_estacion_inaugurada;

  useEffect(() => {
    if (!puedeIndicarEstacionInaugurada && ubicadoEnEstacionInaugurada) {
      setUbicadoEnEstacionInaugurada(false);
    }
  }, [puedeIndicarEstacionInaugurada, ubicadoEnEstacionInaugurada]);

  const getProductoEstaciones = (producto: Producto) => {
    if (producto.expand?.estaciones_relacionadas && producto.expand.estaciones_relacionadas.length > 0) {
      return producto.expand.estaciones_relacionadas;
    }
    if (producto.expand?.estacion_id) {
      return [producto.expand.estacion_id];
    }
    return [];
  };

  const getProductoDisplayLabel = (producto: Producto) => {
    const estacionesLabel = getProductoEstaciones(producto).map((item) => item.nombre).join(', ');
    return estacionesLabel ? `${producto.nombre} (${estacionesLabel})` : producto.nombre;
  };

  const productosDisponibles = productos.filter((producto) => {
    if (productosRelacionados.includes(producto.id)) return true;
    if (!estacionId) return true;
    const estacionesProducto = producto.estaciones_relacionadas && producto.estaciones_relacionadas.length > 0
      ? producto.estaciones_relacionadas
      : producto.estacion_id
        ? [producto.estacion_id]
        : [];
    return estacionesProducto.includes(estacionId);
  });

  const syncProductosRelacionados = async (actorId: string, selectedProductIds: string[]) => {
    const productosActualmenteRelacionados = productos.filter((producto) =>
      (producto.actores_relacionados || []).includes(actorId)
    );
    const idsActuales = productosActualmenteRelacionados.map((producto) => producto.id);

    const idsParaAgregar = selectedProductIds.filter((productId) => !idsActuales.includes(productId));
    const idsParaQuitar = idsActuales.filter((productId) => !selectedProductIds.includes(productId));

    await Promise.all([
      ...idsParaAgregar.map(async (productId) => {
        const producto = productos.find((item) => item.id === productId);
        if (!producto) return;
        const nextActores = Array.from(new Set([...(producto.actores_relacionados || []), actorId]));
        await pb.collection('productos').update(producto.id, { actores_relacionados: nextActores }, { requestKey: null });
      }),
      ...idsParaQuitar.map(async (productId) => {
        const producto = productos.find((item) => item.id === productId);
        if (!producto) return;
        const nextActores = (producto.actores_relacionados || []).filter((currentId) => currentId !== actorId);
        await pb.collection('productos').update(producto.id, { actores_relacionados: nextActores }, { requestKey: null });
      }),
    ]);
  };

  const handleSubmit = async (e: React.FormEvent, action: 'borrador' | 'continuar') => {
    e.preventDefault();
    if (!nombre || !estacionId || !tipo) {
      setError('Nombre, tipo y estación son obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('tipo', tipo);
      formData.append('estacion_id', estacionId);
      formData.append('ubicado_en_estacion_inaugurada', String(puedeIndicarEstacionInaugurada && ubicadoEnEstacionInaugurada));
      formData.append('descripcion', descripcion);
      formData.append('contacto_telefono', contactoTelefono);
      formData.append('contacto_email', contactoEmail);
      formData.append('ubicacion', ubicacion);
      if (latitud) formData.append('latitud', latitud);
      if (longitud) formData.append('longitud', longitud);
      formData.append('observaciones', observaciones);
      formData.append('estado', action === 'borrador' ? 'borrador' : estado);
      if (user?.id) {
        formData.append('created_by', user.id);
        formData.append('updated_by', user.id);
      }

      if (tipoSlug === 'artesano') {
        formData.append('tecnicas', tecnicas);
        formData.append('materiales', materiales);
        formData.append('productos_ofrecidos', productosOfrecidos);
        formData.append('visitas_demostraciones', String(visitasDemostraciones));
        formData.append('disponibilidad', disponibilidad);
      } else if (tipoSlug === 'productor') {
        formData.append('rubro_productivo', rubroProductivo);
        formData.append('escala_produccion', escalaProduccion);
        formData.append('modalidad_venta', modalidadVenta);
        formData.append('productos_ofrecidos', productosOfrecidos);
        formData.append('visitas_demostraciones', String(visitasDemostraciones));
      } else if (tipoSlug === 'hospedaje') {
        formData.append('tipo_hospedaje', tipoHospedaje);
        formData.append('capacidad', capacidad);
        formData.append('servicios', servicios);
        formData.append('horarios', horarios);
      } else if (tipoSlug === 'gastronomico') {
        formData.append('tipo_propuesta', tipoPropuesta);
        formData.append('especialidades', especialidades);
        formData.append('platos_destacados', platosDestacados);
        formData.append('modalidad_servicio', modalidadServicio);
        formData.append('servicios_adicionales', serviciosAdicionales);
        formData.append('horarios', horarios);
      } else if (tipoSlug === 'guia-de-turismo' || tipoSlug === 'guia') {
        formData.append('especialidad', especialidad);
        formData.append('idiomas', idiomas);
        formData.append('recorridos_ofrecidos', recorridosOfrecidos);
        formData.append('duracion_recorridos', duracionRecorridos);
        formData.append('zona_cobertura', zonaCobertura);
        formData.append('punto_encuentro', puntoEncuentro);
        formData.append('acreditacion', acreditacion);
        formData.append('disponibilidad', disponibilidad);
      }

      if (fotos) {
        for (let i = 0; i < fotos.length; i++) {
          formData.append('fotos', fotos[i]);
        }
      }
      
      const record = await createRecordWithAudit('actores', formData, user);
      await syncProductosRelacionados(record.id, productosRelacionados);
      
      router.push('/actores');
    } catch (err: any) {
      console.error('Error creando actor:', err);
      setError(err?.response?.message || 'Error al crear el actor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tipoSeleccionado = tiposActor.find((item) => item.id === tipo);
  const tipoSlug = normalizeCatalogName(tipoSeleccionado?.nombre || tipo);

  if (isLoading || !user || !canEditContent(user as any) || loadingEstaciones) {
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
          <h2 className="text-[32px] font-bold text-[var(--color-primary)] tracking-tight ml-4">
            Crear Actor
          </h2>
        </div>

        <div className="bg-[var(--color-surface-container)] p-8 rounded-[8px]">
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-6">
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
                  placeholder="Ej. Juan Pérez o Taller Los Telares"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Tipo de Actor *
                </label>
                <CatalogSelect
                  collectionName="tipos_actor"
                  value={tipo}
                  onChange={(value) => setTipo(value as ActorTipo)}
                  emptyLabel="Seleccionar tipo..."
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
                onChange={(e) => setEstacionId(e.target.value)}
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
                Biografía / Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="input-field w-full min-h-[100px] resize-y"
                placeholder="Breve descripción o biografía..."
              />
            </div>

            {/* CAMPOS DINÁMICOS SEGÚN TIPO */}
            <div className="p-6 bg-[var(--color-surface-container-low)] rounded-md border border-[var(--color-outline-variant)]">
              <h3 className="text-lg font-bold text-[var(--color-on-surface)] mb-4 border-b border-[var(--color-surface-variant)] pb-2 uppercase tracking-[0.05em]">
                Detalles Específicos: {tipoSeleccionado?.nombre || 'Selecciona un tipo'}
              </h3>
              <div className="space-y-4">
                
                {/* Artesano */}
                {tipoSlug === 'artesano' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Técnicas que realiza</label>
                        <input type="text" value={tecnicas} onChange={(e) => setTecnicas(e.target.value)} className="input-field w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Materiales que utiliza</label>
                        <input type="text" value={materiales} onChange={(e) => setMateriales(e.target.value)} className="input-field w-full" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Productos que ofrece</label>
                      <input type="text" value={productosOfrecidos} onChange={(e) => setProductosOfrecidos(e.target.value)} className="input-field w-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Disponibilidad</label>
                        <input type="text" value={disponibilidad} onChange={(e) => setDisponibilidad(e.target.value)} className="input-field w-full" />
                      </div>
                      <div className="flex items-center mt-6">
                        <input type="checkbox" id="visitas" checked={visitasDemostraciones} onChange={(e) => setVisitasDemostraciones(e.target.checked)} className="mr-2" />
                        <label htmlFor="visitas" className="text-sm font-medium text-[var(--color-on-surface)]">Posibilidad de visitas o demostraciones</label>
                      </div>
                    </div>
                  </>
                )}

                {/* Productor */}
                {tipoSlug === 'productor' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Rubro productivo</label>
                        <input type="text" value={rubroProductivo} onChange={(e) => setRubroProductivo(e.target.value)} className="input-field w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Escala de producción</label>
                        <input type="text" value={escalaProduccion} onChange={(e) => setEscalaProduccion(e.target.value)} className="input-field w-full" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Productos que ofrece</label>
                      <input type="text" value={productosOfrecidos} onChange={(e) => setProductosOfrecidos(e.target.value)} className="input-field w-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Modalidad de venta</label>
                        <input type="text" value={modalidadVenta} onChange={(e) => setModalidadVenta(e.target.value)} className="input-field w-full" />
                      </div>
                      <div className="flex items-center mt-6">
                        <input type="checkbox" id="visitas_prod" checked={visitasDemostraciones} onChange={(e) => setVisitasDemostraciones(e.target.checked)} className="mr-2" />
                        <label htmlFor="visitas_prod" className="text-sm font-medium text-[var(--color-on-surface)]">Posibilidad de visitas</label>
                      </div>
                    </div>
                  </>
                )}

                {/* Hospedaje */}
                {tipoSlug === 'hospedaje' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Tipo de hospedaje</label>
                        <input type="text" value={tipoHospedaje} onChange={(e) => setTipoHospedaje(e.target.value)} className="input-field w-full" placeholder="Ej. Cabaña, Posada" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Capacidad</label>
                        <input type="text" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} className="input-field w-full" placeholder="Ej. 10 personas" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Servicios disponibles</label>
                      <textarea value={servicios} onChange={(e) => setServicios(e.target.value)} className="input-field w-full min-h-[80px]" placeholder="Ej. Wi-Fi, Desayuno, Piscina" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Horarios (check-in / check-out)</label>
                      <input type="text" value={horarios} onChange={(e) => setHorarios(e.target.value)} className="input-field w-full" />
                    </div>
                  </>
                )}

                {/* Gastronómico */}
                {tipoSlug === 'gastronomico' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Tipo de propuesta</label>
                        <input type="text" value={tipoPropuesta} onChange={(e) => setTipoPropuesta(e.target.value)} className="input-field w-full" placeholder="Ej. Restaurante, Casa de té" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Modalidad de servicio</label>
                        <input type="text" value={modalidadServicio} onChange={(e) => setModalidadServicio(e.target.value)} className="input-field w-full" placeholder="Ej. A la carta, Viandas" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Especialidades</label>
                      <input type="text" value={especialidades} onChange={(e) => setEspecialidades(e.target.value)} className="input-field w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Platos o productos destacados</label>
                      <textarea value={platosDestacados} onChange={(e) => setPlatosDestacados(e.target.value)} className="input-field w-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Días y horarios de atención</label>
                        <input type="text" value={horarios} onChange={(e) => setHorarios(e.target.value)} className="input-field w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Servicios adicionales</label>
                        <input type="text" value={serviciosAdicionales} onChange={(e) => setServiciosAdicionales(e.target.value)} className="input-field w-full" />
                      </div>
                    </div>
                  </>
                )}

                {/* Guía de turismo */}
                {tipoSlug === 'guia' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Especialidad</label>
                        <input type="text" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} className="input-field w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Idiomas</label>
                        <input type="text" value={idiomas} onChange={(e) => setIdiomas(e.target.value)} className="input-field w-full" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Recorridos que ofrece</label>
                      <textarea value={recorridosOfrecidos} onChange={(e) => setRecorridosOfrecidos(e.target.value)} className="input-field w-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Duración estimada</label>
                        <input type="text" value={duracionRecorridos} onChange={(e) => setDuracionRecorridos(e.target.value)} className="input-field w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Disponibilidad</label>
                        <input type="text" value={disponibilidad} onChange={(e) => setDisponibilidad(e.target.value)} className="input-field w-full" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Zona de cobertura</label>
                        <input type="text" value={zonaCobertura} onChange={(e) => setZonaCobertura(e.target.value)} className="input-field w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Punto de encuentro habitual</label>
                        <input type="text" value={puntoEncuentro} onChange={(e) => setPuntoEncuentro(e.target.value)} className="input-field w-full" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">Matrícula, habilitación o acreditación</label>
                      <input type="text" value={acreditacion} onChange={(e) => setAcreditacion(e.target.value)} className="input-field w-full" />
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* FIN CAMPOS DINÁMICOS */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={contactoTelefono}
                  onChange={(e) => setContactoTelefono(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej. +54 9 383 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={contactoEmail}
                  onChange={(e) => setContactoEmail(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej. correo@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Ubicación / Dirección / Georreferenciación
              </label>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                className="input-field w-full"
                placeholder="Ej. Calle Principal 123 o coordenadas"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Productos relacionados
              </label>
              <div className="bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-md max-h-56 overflow-y-auto p-4 space-y-2">
                {productosDisponibles.length > 0 ? (
                  productosDisponibles.map((producto) => (
                    <label key={producto.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={productosRelacionados.includes(producto.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProductosRelacionados([...productosRelacionados, producto.id]);
                          } else {
                            setProductosRelacionados(productosRelacionados.filter((currentId) => currentId !== producto.id));
                          }
                        }}
                        className="h-4 w-4 text-[var(--color-primary)] rounded border-[var(--color-outline)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-on-surface)]">{getProductoDisplayLabel(producto)}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-[var(--color-on-surface-variant)] italic">
                    No hay productos disponibles para relacionar.
                  </p>
                )}
              </div>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
                Puedes gestionar aquí los productos vinculados a este actor, igual que desde la edición de productos.
              </p>
            </div>

            {puedeIndicarEstacionInaugurada && (
              <div className="flex items-center gap-3">
                <input
                  id="ubicado-en-estacion-inaugurada"
                  type="checkbox"
                  checked={ubicadoEnEstacionInaugurada}
                  onChange={(e) => setUbicadoEnEstacionInaugurada(e.target.checked)}
                />
                <label htmlFor="ubicado-en-estacion-inaugurada" className="text-sm font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em]">
                  Se encuentra ubicado en la estación inaugurada
                </label>
              </div>
            )}

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

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Fotos
              </label>
              <p className="text-sm text-[var(--color-outline)] mb-3">
                Selecciona hasta 5 fotos para el actor.
              </p>
              
              <div className="bg-[var(--color-surface-container)] p-4 rounded-md border border-[var(--color-outline-variant)]">
                {/* Image Previews */}
                {fotos && fotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                    {Array.from(fotos).map((file, index) => (
                      <div key={index} className="relative aspect-square bg-[var(--color-surface)] rounded-md border border-[var(--color-outline-variant)] overflow-hidden">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${index}`} 
                          className="object-contain w-full h-full p-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const dt = new DataTransfer();
                            Array.from(fotos).forEach((f, i) => {
                              if (i !== index) dt.items.add(f);
                            });
                            setFotos(dt.files);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none"
                          title="Eliminar imagen"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload Button */}
                {(!fotos || fotos.length < 5) && (
                  <div className="mt-2">
                    <input
                      type="file"
                      id="fotos-upload"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const newFiles = e.target.files;
                        if (!newFiles) return;
                        
                        const dt = new DataTransfer();
                        
                        // Añadir fotos existentes
                        if (fotos) {
                          Array.from(fotos).forEach(f => dt.items.add(f));
                        }
                        
                        // Añadir nuevas fotos hasta llegar al límite de 5
                        let added = 0;
                        const currentCount = fotos ? fotos.length : 0;
                        const remainingSlots = 5 - currentCount;
                        
                        Array.from(newFiles).forEach(file => {
                          if (added < remainingSlots) {
                            dt.items.add(file);
                            added++;
                          }
                        });
                        
                        setFotos(dt.files);
                        
                        // Reset input so the same files can be selected again if needed
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <label 
                      htmlFor="fotos-upload"
                      className="inline-flex items-center justify-center px-4 py-2 bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] rounded-md cursor-pointer hover:bg-[var(--color-outline-variant)] transition-colors text-sm font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Añadir foto
                    </label>
                  </div>
                )}
                {fotos && fotos.length >= 5 && (
                  <p className="text-xs text-amber-600 mt-2">
                    Has alcanzado el límite máximo de 5 fotos.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Observaciones Internas
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="input-field w-full min-h-[80px]"
                placeholder="Notas solo visibles para el equipo..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Estado inicial
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as ActorEstado)}
                className="input-field w-full md:w-1/2"
              >
                <option value="borrador">Borrador</option>
                <option value="en_revision">En revisión</option>
                {canReviewContent(user as any) && (
                  <option value="aprobado">Aprobado</option>
                )}
              </select>
            </div>

            <div className="pt-8 flex flex-col md:flex-row justify-end gap-4 border-t border-[var(--color-surface-variant)] mt-8">
              <Link
                href="/actores"
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

export default function CreateActorPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CreateActorForm />
    </Suspense>
  );
}
