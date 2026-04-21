'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import pb from '@/lib/pocketbase';
import ContentStatusManager from '@/components/ContentStatusManager';
import Link from 'next/link';
import { canEditContent, hasAnyRole } from '@/lib/permissions';
import { Actor, ActorTipo } from '@/types/actor';
import { Producto } from '@/types/producto';
import Map from '@/components/Map';
import { getCatalogoLabel, normalizeCatalogName } from '@/lib/catalogos';
import EntityFeedbackSection from '@/components/EntityFeedbackSection';
import { deleteRecordWithAudit } from '@/lib/audit';

export default function ActorDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [actor, setActor] = useState<Actor | null>(null);
  const [productosRelacionados, setProductosRelacionados] = useState<Producto[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchActor() {
      if (!id || !user) return;
      
      try {
        const [record, productosRecords] = await Promise.all([
          pb.collection('actores').getOne<Actor>(id, {
            expand: 'estacion_id,tipo,created_by,updated_by',
            requestKey: null
          }),
          pb.collection('productos').getFullList<Producto>({
            sort: 'nombre',
            expand: 'estacion_id,estaciones_relacionadas,categoria,subcategoria',
            requestKey: null,
          }),
        ]);
        setActor(record);
        setProductosRelacionados(
          productosRecords.filter((producto) => (producto.actores_relacionados || []).includes(id))
        );
      } catch (err) {
        console.error('Error fetching actor:', err);
        setError('No se pudo cargar el actor. Es posible que no exista.');
      } finally {
        setLoadingData(false);
      }
    }
    
    fetchActor();
  }, [id, user]);

  const toggleActorStatus = async () => {
    if (!actor) return;
    
    try {
      const newStatus = actor.estado === 'inactivo' ? 'borrador' : 'inactivo';
      const updatedRecord = await pb.collection('actores').update<Actor>(id, { estado: newStatus });
      setActor({ ...actor, estado: updatedRecord.estado });
    } catch (error) {
      console.error('Error toggling actor status:', error);
      alert('Error al cambiar el estado del actor');
    }
  };

  const handleDelete = async () => {
    if (!actor || !hasAnyRole(user as any, ['admin'])) return;
    const confirmed = window.confirm(`¿Seguro que deseas eliminar el actor "${actor.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      await deleteRecordWithAudit('actores', actor.id, user);
      router.push('/actores');
    } catch (error) {
      console.error('Error deleting actor:', error);
      alert('Error al eliminar el actor');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const canEdit = canEditContent(user as any);
  const canDelete = hasAnyRole(user as any, ['admin']);
  const tipoSlug = normalizeCatalogName(actor?.expand?.tipo?.nombre || actor?.tipo);
  const getProductoEstaciones = (producto: Producto) => {
    if (producto.expand?.estaciones_relacionadas && producto.expand.estaciones_relacionadas.length > 0) {
      return producto.expand.estaciones_relacionadas.map((item) => item.nombre).join(', ');
    }
    return producto.expand?.estacion_id?.nombre || '';
  };
  const productosAgrupados = useMemo(() => {
    const grouped: Array<{
      categoriaKey: string;
      categoriaLabel: string;
      subcategorias: Array<{
        subcategoriaKey: string;
        subcategoriaLabel: string;
        productos: Producto[];
      }>;
    }> = [];

    productosRelacionados.forEach((producto) => {
      const categoriaLabel = getCatalogoLabel(producto.expand?.categoria, producto.categoria);
      const subcategoriaLabel = getCatalogoLabel(producto.expand?.subcategoria, producto.subcategoria || 'Sin subcategoría');
      const categoriaKey = producto.categoria || categoriaLabel;
      const subcategoriaKey = producto.subcategoria || '__sin_subcategoria__';

      let categoriaGroup = grouped.find((item) => item.categoriaKey === categoriaKey);
      if (!categoriaGroup) {
        categoriaGroup = {
          categoriaKey,
          categoriaLabel,
          subcategorias: [],
        };
        grouped.push(categoriaGroup);
      }

      let subcategoriaGroup = categoriaGroup.subcategorias.find((item) => item.subcategoriaKey === subcategoriaKey);
      if (!subcategoriaGroup) {
        subcategoriaGroup = {
          subcategoriaKey,
          subcategoriaLabel,
          productos: [],
        };
        categoriaGroup.subcategorias.push(subcategoriaGroup);
      }

      subcategoriaGroup.productos.push(producto);
    });

    return grouped.map((categoriaGroup) => ({
      categoriaLabel: categoriaGroup.categoriaLabel,
      subcategorias: categoriaGroup.subcategorias.map((subcategoriaGroup) => ({
        subcategoriaLabel: subcategoriaGroup.subcategoriaLabel,
        productos: subcategoriaGroup.productos,
      })),
    }));
  }, [productosRelacionados]);

  return (
    <div className="h-full bg-[var(--color-surface)]">
      <main className="mx-auto px-6 py-8">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button 
            onClick={() => router.back()}
            className="btn-primary px-4 py-2 text-sm shadow-md"
          >
            &larr; Volver
          </button>
        </div>

        {loadingData ? (
          <div className="bg-[var(--color-surface-container)] p-8 rounded-[8px] shadow-sm text-center">
            Cargando datos...
          </div>
        ) : error ? (
          <div className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] p-6 rounded-md">
            {error}
          </div>
        ) : actor ? (
          <>
            <ContentStatusManager
              collectionName="actores"
              recordId={actor.id}
              currentState={actor.estado}
              observaciones={actor.observaciones_revision}
              user={user}
              onStatusChange={(updatedRecord) => setActor(updatedRecord as Actor)}
            />
            
            <div className="bg-[var(--color-surface-container)] p-8 rounded-[8px]">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8 pb-6 border-b border-[var(--color-surface-variant)]">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold font-display text-[var(--color-primary)]">
                    {actor.nombre}
                  </h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${actor.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                      actor.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                      actor.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {actor.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[var(--color-secondary)]">
                  <span className="bg-[var(--color-surface-container)] px-3 py-1 rounded-full text-sm">
                    {getCatalogoLabel(actor.expand?.tipo, actor.tipo)}
                  </span>
                  {actor.expand?.estacion_id && (
                    <Link href={`/estaciones/${actor.expand.estacion_id.id}`} className="hover:text-[var(--color-primary)] transition-colors">
                      📍 {actor.expand.estacion_id.nombre}
                    </Link>
                  )}
                </div>
              </div>
              
              {canEdit && (
                <div className="flex gap-3">
                  <button 
                    onClick={toggleActorStatus}
                    className={`font-medium transition-colors px-4 py-2 border rounded-full text-sm ${actor.estado === 'inactivo' ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                  >
                    {actor.estado === 'inactivo' ? 'Restaurar' : 'Desactivar'}
                  </button>
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="font-medium transition-colors px-4 py-2 border rounded-full text-sm border-red-700 text-red-700 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  )}
                  <Link
                    href={`/actores/${actor.id}/edit`}
                    className="btn-primary px-4 py-2 text-sm shadow-md"
                  >
                    Editar Actor
                  </Link>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                  Información de Contacto
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Teléfono</span>
                    <span className="text-[var(--color-on-surface)]">{actor.contacto_telefono || 'No especificado'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Email</span>
                    <span className="text-[var(--color-on-surface)]">{actor.contacto_email || 'No especificado'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Ubicación / Dirección</span>
                    <span className="text-[var(--color-on-surface)]">{actor.ubicacion || 'No especificada'}</span>
                  </div>
                  {actor.expand?.estacion_id?.posee_estacion_inaugurada && (
                    <div>
                      <span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Estación inaugurada</span>
                      <span className="text-[var(--color-on-surface)]">
                        {actor.ubicado_en_estacion_inaugurada ? 'Sí, se ubica en la estación inaugurada' : 'No'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-3 uppercase tracking-[0.05em]">
                    Ubicación
                  </h3>
                  {actor.latitud !== undefined && actor.latitud !== null && actor.longitud !== undefined && actor.longitud !== null ? (
                    <div className="w-full">
                      <Map lat={actor.latitud} lng={actor.longitud} label={actor.nombre} />
                      <p className="text-xs text-[var(--color-outline)] mt-2">
                        Latitud: {actor.latitud} | Longitud: {actor.longitud}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[var(--color-outline)] text-sm">Coordenadas no especificadas</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                  Descripción
                </h3>
                <p className="text-[var(--color-on-surface)] whitespace-pre-wrap">
                  {actor.descripcion || 'No hay descripción disponible.'}
                </p>

                {actor.observaciones && canEdit && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                      Observaciones Internas
                    </h3>
                    <p className="text-[var(--color-on-surface)] whitespace-pre-wrap bg-[var(--color-surface-container)] p-3 rounded-md text-sm">
                      {actor.observaciones}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--color-surface-variant)]">
              <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                Detalles Específicos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {tipoSlug === 'artesano' && (
                  <>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Técnicas</span><span className="font-medium">{actor.tecnicas || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Materiales</span><span className="font-medium">{actor.materiales || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Disponibilidad</span><span className="font-medium">{actor.disponibilidad || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Visitas/Demostraciones</span><span className="font-medium">{actor.visitas_demostraciones ? 'Sí' : 'No'}</span></div>
                  </>
                )}
                {tipoSlug === 'productor' && (
                  <>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Rubro productivo</span><span className="font-medium">{actor.rubro_productivo || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Escala de producción</span><span className="font-medium">{actor.escala_produccion || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Modalidad de venta</span><span className="font-medium">{actor.modalidad_venta || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Posibilidad de visitas</span><span className="font-medium">{actor.visitas_demostraciones ? 'Sí' : 'No'}</span></div>
                  </>
                )}
                {tipoSlug === 'hospedaje' && (
                  <>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Tipo de hospedaje</span><span className="font-medium">{actor.tipo_hospedaje || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Capacidad</span><span className="font-medium">{actor.capacidad || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Servicios</span><span className="font-medium">{actor.servicios || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Horarios</span><span className="font-medium">{actor.horarios || '-'}</span></div>
                  </>
                )}
                {tipoSlug === 'gastronomico' && (
                  <>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Tipo de propuesta</span><span className="font-medium">{actor.tipo_propuesta || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Modalidad de servicio</span><span className="font-medium">{actor.modalidad_servicio || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Especialidades</span><span className="font-medium">{actor.especialidades || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Platos destacados</span><span className="font-medium">{actor.platos_destacados || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Servicios adicionales</span><span className="font-medium">{actor.servicios_adicionales || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Días y horarios</span><span className="font-medium">{actor.horarios || '-'}</span></div>
                  </>
                )}
                {(tipoSlug === 'guia' || tipoSlug === 'guia-de-turismo') && (
                  <>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Especialidad</span><span className="font-medium">{actor.especialidad || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Idiomas</span><span className="font-medium">{actor.idiomas || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Recorridos ofrecidos</span><span className="font-medium">{actor.recorridos_ofrecidos || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Duración estimada</span><span className="font-medium">{actor.duracion_recorridos || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Zona de cobertura</span><span className="font-medium">{actor.zona_cobertura || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Punto de encuentro</span><span className="font-medium">{actor.punto_encuentro || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Acreditación</span><span className="font-medium">{actor.acreditacion || '-'}</span></div>
                    <div><span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Disponibilidad</span><span className="font-medium">{actor.disponibilidad || '-'}</span></div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--color-surface-variant)]">
              <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                Productos Relacionados
              </h3>
              {productosRelacionados.length > 0 ? (
                <div className="space-y-6">
                  {productosAgrupados.map((categoria) => (
                    <div key={categoria.categoriaLabel} className="space-y-4">
                      <h4 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-[0.05em]">
                        {categoria.categoriaLabel}
                      </h4>
                      <div className="space-y-4">
                        {categoria.subcategorias.map((subcategoria) => (
                          <div key={`${categoria.categoriaLabel}-${subcategoria.subcategoriaLabel}`} className="space-y-3">
                            <p className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em]">
                              {subcategoria.subcategoriaLabel}
                            </p>
                            <div className="space-y-3">
                              {subcategoria.productos.map((producto) => (
                                <Link
                                  key={producto.id}
                                  href={`/productos/${producto.id}`}
                                  className="block bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-md p-4 hover:bg-[var(--color-surface)] transition-colors"
                                >
                                  <div className="font-medium text-[var(--color-primary)]">{producto.nombre}</div>
                                  {getProductoEstaciones(producto) && (
                                    <div className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                                      {getProductoEstaciones(producto)}
                                    </div>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--color-on-surface-variant)] italic">
                  No hay productos relacionados con este actor.
                </p>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--color-surface-variant)]">
              <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                Fotos
              </h3>
              {actor.fotos && actor.fotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {actor.fotos.map((foto, index) => (
                    <div key={index} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
                      <img 
                        src={pb.files.getURL(actor, foto)} 
                        alt={`Foto de ${actor.nombre}`}
                        className="object-contain w-full h-full p-1"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--color-on-surface-variant)] italic">
                  No hay fotos disponibles para este actor.
                </p>
              )}
            </div>

            <EntityFeedbackSection entityType="actores" entityId={actor.id} />

            <div className="mt-8 pt-6 border-t border-[var(--color-surface-variant)]">
              <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
                Historial
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--color-secondary)]">
                <div>
                  <span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Creado el</span> 
                  {new Date(actor.created).toLocaleString()}
                  {actor.expand?.created_by && (
                    <span className="block mt-1 text-xs">Por: {actor.expand.created_by.name || actor.expand.created_by.email}</span>
                  )}
                </div>
                <div>
                  <span className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-[0.05em] mb-1">Última actualización</span> 
                  {new Date(actor.updated).toLocaleString()}
                  {actor.expand?.updated_by && (
                    <span className="block mt-1 text-xs">Por: {actor.expand.updated_by.name || actor.expand.updated_by.email}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
