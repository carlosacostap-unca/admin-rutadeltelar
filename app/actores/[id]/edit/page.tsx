'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';
import { Estacion } from '@/types/estacion';
import { Actor, ActorTipo, ActorEstado } from '@/types/actor';

export default function EditActorPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [actor, setActor] = useState<Actor | null>(null);
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Common Fields
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<ActorTipo>('artesano');
  const [estacionId, setEstacionId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [contactoEmail, setContactoEmail] = useState('');
  const [ubicacion, setUbicacion] = useState('');
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !canEditContent(user as any))) {
      router.push('/actores');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!id || !user || !canEditContent(user as any)) return;
      
      try {
        const [actorRecord, estacionesRecords] = await Promise.all([
          pb.collection('actores').getOne<Actor>(id, { expand: 'estacion_id,created_by,updated_by', requestKey: null }),
          pb.collection('estaciones').getFullList<Estacion>({ sort: 'nombre', requestKey: null })
        ]);
        
        setActor(actorRecord);
        setEstaciones(estacionesRecords);
        
        // Initialize form fields
        setNombre(actorRecord.nombre || '');
        setTipo(actorRecord.tipo || 'artesano');
        setEstacionId(actorRecord.estacion_id || '');
        setDescripcion(actorRecord.descripcion || '');
        setContactoTelefono(actorRecord.contacto_telefono || '');
        setContactoEmail(actorRecord.contacto_email || '');
        setUbicacion(actorRecord.ubicacion || '');
        setEstado(actorRecord.estado || 'borrador');
        setObservaciones(actorRecord.observaciones || '');

        setTecnicas(actorRecord.tecnicas || '');
        setMateriales(actorRecord.materiales || '');
        setRubroProductivo(actorRecord.rubro_productivo || '');
        setEscalaProduccion(actorRecord.escala_produccion || '');
        setModalidadVenta(actorRecord.modalidad_venta || '');
        setProductosOfrecidos(actorRecord.productos_ofrecidos || '');
        setVisitasDemostraciones(actorRecord.visitas_demostraciones || false);
        setTipoHospedaje(actorRecord.tipo_hospedaje || '');
        setCapacidad(actorRecord.capacidad || '');
        setServicios(actorRecord.servicios || '');
        setTipoPropuesta(actorRecord.tipo_propuesta || '');
        setEspecialidades(actorRecord.especialidades || '');
        setPlatosDestacados(actorRecord.platos_destacados || '');
        setModalidadServicio(actorRecord.modalidad_servicio || '');
        setServiciosAdicionales(actorRecord.servicios_adicionales || '');
        setEspecialidad(actorRecord.especialidad || '');
        setIdiomas(actorRecord.idiomas || '');
        setRecorridosOfrecidos(actorRecord.recorridos_ofrecidos || '');
        setDuracionRecorridos(actorRecord.duracion_recorridos || '');
        setZonaCobertura(actorRecord.zona_cobertura || '');
        setPuntoEncuentro(actorRecord.punto_encuentro || '');
        setAcreditacion(actorRecord.acreditacion || '');
        setHorarios(actorRecord.horarios || '');
        setDisponibilidad(actorRecord.disponibilidad || '');
        
      } catch (err) {
        console.error('Error fetching data for edit:', err);
        setError('No se pudo cargar la información del actor. Es posible que no exista.');
      } finally {
        setLoadingData(false);
      }
    }
    
    fetchData();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !estacionId || !tipo) {
      setError('Nombre, tipo y estación son obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      let data: any = {
        nombre,
        tipo,
        estacion_id: estacionId,
        descripcion,
        contacto_telefono: contactoTelefono,
        contacto_email: contactoEmail,
        ubicacion,
        observaciones,
        estado,
        updated_by: user?.id,
      };

      if (tipo === 'artesano') {
        data = { ...data, tecnicas, materiales, productos_ofrecidos: productosOfrecidos, visitas_demostraciones: visitasDemostraciones, disponibilidad };
      } else if (tipo === 'productor') {
        data = { ...data, rubro_productivo: rubroProductivo, escala_produccion: escalaProduccion, modalidad_venta: modalidadVenta, productos_ofrecidos: productosOfrecidos, visitas_demostraciones: visitasDemostraciones };
      } else if (tipo === 'hospedaje') {
        data = { ...data, tipo_hospedaje: tipoHospedaje, capacidad, servicios, horarios };
      } else if (tipo === 'gastronomico') {
        data = { ...data, tipo_propuesta: tipoPropuesta, especialidades, platos_destacados: platosDestacados, modalidad_servicio: modalidadServicio, servicios_adicionales: serviciosAdicionales, horarios };
      } else if (tipo === 'guia') {
        data = { ...data, especialidad, idiomas, recorridos_ofrecidos: recorridosOfrecidos, duracion_recorridos: duracionRecorridos, zona_cobertura: zonaCobertura, punto_encuentro: puntoEncuentro, acreditacion, disponibilidad };
      }
      
      await pb.collection('actores').update(id, data);
      router.push(`/actores/${id}`);
    } catch (err: any) {
      console.error('Error actualizando actor:', err);
      setError(err?.response?.message || 'Error al actualizar el actor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user || !canEditContent(user as any)) {
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
          <Link href={`/actores/${id}`} className="text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
            &larr; Volver al detalle
          </Link>
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Editar Actor
          </h2>
        </div>

        {loadingData ? (
          <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px] shadow-sm text-center">
            Cargando datos...
          </div>
        ) : error && !actor ? (
          <div className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] p-6 rounded-md">
            {error}
          </div>
        ) : (
          <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)]">
            {error && (
              <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
                {error}
              </div>
            )}
            
            {actor && (
                <div className="mb-8 p-4 bg-[var(--color-surface-container-low)] rounded-md border border-[var(--color-outline-variant)]">
                  <h3 className="text-sm font-semibold text-[var(--color-on-surface)] mb-2">Historial Básico</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--color-secondary)]">
                    <div>
                      <span className="block text-[var(--color-outline)] mb-1">Fecha de creación</span>
                      <span className="block font-medium">{new Date(actor.created).toLocaleString()}</span>
                      {actor.expand?.created_by && (
                        <span className="block mt-1 text-[var(--color-outline)]">Por: {actor.expand.created_by.name || actor.expand.created_by.email}</span>
                      )}
                    </div>
                    <div>
                      <span className="block text-[var(--color-outline)] mb-1">Última actualización</span>
                      <span className="block font-medium">{new Date(actor.updated).toLocaleString()}</span>
                      {actor.expand?.updated_by && (
                        <span className="block mt-1 text-[var(--color-outline)]">Por: {actor.expand.updated_by.name || actor.expand.updated_by.email}</span>
                      )}
                    </div>
                    <div>
                      <span className="block text-[var(--color-outline)] mb-1">Estado actual</span>
                      <span className="capitalize block font-medium">{actor.estado.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="Ej. Juan Pérez o Taller Los Telares"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Tipo de Actor *
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as ActorTipo)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    required
                  >
                    <option value="artesano">Artesano</option>
                    <option value="productor">Productor</option>
                    <option value="hospedaje">Hospedaje</option>
                    <option value="gastronomico">Gastronómico</option>
                    <option value="guia">Guía</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Estación *
                </label>
                <select
                  value={estacionId}
                  onChange={(e) => setEstacionId(e.target.value)}
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
                  placeholder="Breve descripción del actor..."
                />
              </div>

              {/* CAMPOS DINÁMICOS SEGÚN TIPO */}
              <div className="p-6 bg-[var(--color-surface-container-low)] rounded-md border border-[var(--color-outline-variant)]">
                <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-4 border-b border-[var(--color-outline-variant)] pb-2">
                  Detalles Específicos: {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </h3>
                <div className="space-y-4">
                  
                  {/* Artesano */}
                  {tipo === 'artesano' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Técnicas que realiza</label>
                          <input type="text" value={tecnicas} onChange={(e) => setTecnicas(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Materiales que utiliza</label>
                          <input type="text" value={materiales} onChange={(e) => setMateriales(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Productos que ofrece</label>
                        <input type="text" value={productosOfrecidos} onChange={(e) => setProductosOfrecidos(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Disponibilidad</label>
                          <input type="text" value={disponibilidad} onChange={(e) => setDisponibilidad(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div className="flex items-center mt-6">
                          <input type="checkbox" id="visitas" checked={visitasDemostraciones} onChange={(e) => setVisitasDemostraciones(e.target.checked)} className="mr-2" />
                          <label htmlFor="visitas" className="text-sm font-medium text-[var(--color-on-surface)]">Posibilidad de visitas o demostraciones</label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Productor */}
                  {tipo === 'productor' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Rubro productivo</label>
                          <input type="text" value={rubroProductivo} onChange={(e) => setRubroProductivo(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Escala de producción</label>
                          <input type="text" value={escalaProduccion} onChange={(e) => setEscalaProduccion(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Productos que ofrece</label>
                        <input type="text" value={productosOfrecidos} onChange={(e) => setProductosOfrecidos(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Modalidad de venta</label>
                          <input type="text" value={modalidadVenta} onChange={(e) => setModalidadVenta(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div className="flex items-center mt-6">
                          <input type="checkbox" id="visitas_prod" checked={visitasDemostraciones} onChange={(e) => setVisitasDemostraciones(e.target.checked)} className="mr-2" />
                          <label htmlFor="visitas_prod" className="text-sm font-medium text-[var(--color-on-surface)]">Posibilidad de visitas</label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Hospedaje */}
                  {tipo === 'hospedaje' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Tipo de hospedaje</label>
                          <input type="text" value={tipoHospedaje} onChange={(e) => setTipoHospedaje(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Ej. Cabaña, Posada" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Capacidad</label>
                          <input type="text" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Ej. 10 personas" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Servicios disponibles</label>
                        <textarea value={servicios} onChange={(e) => setServicios(e.target.value)} className="w-full px-3 py-2 border rounded-md min-h-[80px]" placeholder="Ej. Wi-Fi, Desayuno, Piscina" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Horarios (check-in / check-out)</label>
                        <input type="text" value={horarios} onChange={(e) => setHorarios(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                      </div>
                    </>
                  )}

                  {/* Gastronómico */}
                  {tipo === 'gastronomico' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Tipo de propuesta</label>
                          <input type="text" value={tipoPropuesta} onChange={(e) => setTipoPropuesta(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Ej. Restaurante, Casa de té" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Modalidad de servicio</label>
                          <input type="text" value={modalidadServicio} onChange={(e) => setModalidadServicio(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Ej. A la carta, Viandas" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Especialidades</label>
                        <input type="text" value={especialidades} onChange={(e) => setEspecialidades(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Platos o productos destacados</label>
                        <textarea value={platosDestacados} onChange={(e) => setPlatosDestacados(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Días y horarios de atención</label>
                          <input type="text" value={horarios} onChange={(e) => setHorarios(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Servicios adicionales</label>
                          <input type="text" value={serviciosAdicionales} onChange={(e) => setServiciosAdicionales(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Guía de turismo */}
                  {tipo === 'guia' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Especialidad</label>
                          <input type="text" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Idiomas</label>
                          <input type="text" value={idiomas} onChange={(e) => setIdiomas(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Recorridos que ofrece</label>
                        <textarea value={recorridosOfrecidos} onChange={(e) => setRecorridosOfrecidos(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Duración estimada</label>
                          <input type="text" value={duracionRecorridos} onChange={(e) => setDuracionRecorridos(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Disponibilidad</label>
                          <input type="text" value={disponibilidad} onChange={(e) => setDisponibilidad(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Zona de cobertura</label>
                          <input type="text" value={zonaCobertura} onChange={(e) => setZonaCobertura(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Punto de encuentro habitual</label>
                          <input type="text" value={puntoEncuentro} onChange={(e) => setPuntoEncuentro(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Matrícula, habilitación o acreditación</label>
                        <input type="text" value={acreditacion} onChange={(e) => setAcreditacion(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* FIN CAMPOS DINÁMICOS */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={contactoTelefono}
                    onChange={(e) => setContactoTelefono(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Ej. +54 9 383 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={contactoEmail}
                    onChange={(e) => setContactoEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                    placeholder="Ej. correo@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Ubicación / Dirección
                </label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                  placeholder="Ej. Calle Principal 123, Barrio Centro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                  Observaciones Internas
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)] min-h-[80px]"
                  placeholder="Notas solo visibles para el equipo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-3">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as ActorEstado)}
                  className="w-full md:w-1/2 px-4 py-2 border border-[var(--color-outline)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
                >
                  <option value="borrador">Borrador</option>
                  <option value="en_revision">En revisión</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-4 border-t border-[var(--color-surface-variant)]">
                <Link
                  href={`/actores/${id}`}
                  className="px-6 py-2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-6 py-2"
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
