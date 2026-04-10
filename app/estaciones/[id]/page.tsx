'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header';
import Link from 'next/link';
import { canEditContent } from '@/lib/permissions';
import { Estacion } from '@/types/estacion';
import ActoresTab from '@/components/estaciones/ActoresTab';
import ProductosTab from '@/components/estaciones/ProductosTab';
import ExperienciasTab from '@/components/estaciones/ExperienciasTab';
import ImperdiblesTab from '@/components/estaciones/ImperdiblesTab';
import ContentStatusManager from '@/components/ContentStatusManager';

export default function EstacionDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [estacion, setEstacion] = useState<Estacion | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
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
      } catch (err) {
        console.error('Error fetching estacion:', err);
        setError('No se pudo cargar la estación. Es posible que no exista.');
      } finally {
        setLoadingData(false);
      }
    }
    
    fetchEstacion();
  }, [id, user]);

  const toggleEstacionStatus = async () => {
    if (!estacion) return;
    
    try {
      const newStatus = estacion.estado === 'inactivo' ? 'borrador' : 'inactivo';
      const updatedRecord = await pb.collection('estaciones').update<Estacion>(id, { estado: newStatus });
      setEstacion(updatedRecord);
    } catch (error) {
      console.error('Error toggling estacion status:', error);
      alert('Error al cambiar el estado de la estación');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const canEdit = canEditContent(user as any);

  const tabs = [
    { id: 'general', label: 'Información general' },
    { id: 'actores', label: 'Actores' },
    { id: 'productos', label: 'Productos' },
    { id: 'experiencias', label: 'Experiencias' },
    { id: 'imperdibles', label: 'Imperdibles' },
    { id: 'historial', label: 'Historial' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Header />
      <main className="mx-auto px-6 py-8 max-w-5xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/estaciones" className="text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
            &larr; Volver al listado
          </Link>
        </div>

        {loadingData ? (
          <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px] shadow-sm text-center">
            Cargando datos...
          </div>
        ) : error ? (
          <div className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] p-6 rounded-md">
            {error}
          </div>
        ) : estacion ? (
          <>
            {/* Encabezado */}
            <div className={`bg-[var(--color-surface-container-lowest)] p-8 rounded-t-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)] mb-1 ${estacion.estado === 'inactivo' ? 'opacity-80 bg-gray-50 border-l-4 border-red-500' : ''}`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className={`text-3xl font-bold font-display ${estacion.estado === 'inactivo' ? 'text-gray-500' : 'text-[var(--color-primary)]'}`}>
                      {estacion.nombre}
                    </h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${estacion.estado === 'aprobado' ? 'bg-[#e6f4ea] text-[#137333]' : 
                        estacion.estado === 'inactivo' ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]' : 
                        estacion.estado === 'en_revision' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {estacion.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <p className="text-[var(--color-secondary)] text-lg">
                    {estacion.localidad}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 items-end">
                  <ContentStatusManager
                    collectionName="estaciones"
                    recordId={estacion.id}
                    currentState={estacion.estado}
                    observaciones={estacion.observaciones_revision}
                    user={user}
                    onStatusChange={(updated) => setEstacion(updated)}
                  />
                  {canEdit && (
                    <div className="flex gap-3">
                      <button 
                        onClick={toggleEstacionStatus}
                        className={`font-medium transition-colors px-4 py-2 border rounded-full text-sm ${estacion.estado === 'inactivo' ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                      >
                        {estacion.estado === 'inactivo' ? 'Restaurar' : 'Desactivar'}
                      </button>
                      <Link
                        href={`/estaciones/${estacion.id}/edit`}
                        className="btn-primary px-4 py-2 text-sm shadow-md"
                      >
                        Editar Estación
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-[var(--color-surface-container-lowest)] px-8 pt-4 border-b border-[var(--color-outline-variant)] shadow-[0_4px_12px_-4px_rgba(23,28,31,0.06)]">
              <div className="flex gap-6 overflow-x-auto pb-[-1px]">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id 
                        ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                        : 'border-transparent text-[var(--color-secondary)] hover:text-[var(--color-on-surface)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido de la Tab */}
            <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-b-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)] min-h-[300px]">
              {activeTab === 'general' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-2 uppercase tracking-wider">
                      Descripción General
                    </h3>
                    <p className="text-[var(--color-on-surface)] whitespace-pre-wrap">
                      {estacion.descripcion_general || 'No hay descripción disponible.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-2 uppercase tracking-wider">
                        Mapas / Referencias
                      </h3>
                      {estacion.mapas_referencias ? (
                        <a 
                          href={estacion.mapas_referencias.startsWith('http') ? estacion.mapas_referencias : `https://${estacion.mapas_referencias}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[var(--color-primary)] hover:underline break-all"
                        >
                          {estacion.mapas_referencias}
                        </a>
                      ) : (
                        <p className="text-[var(--color-outline)]">No especificado</p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-secondary)] mb-2 uppercase tracking-wider">
                        Coordenadas Generales
                      </h3>
                      <p className="text-[var(--color-on-surface)]">
                        {estacion.coordenadas_generales || <span className="text-[var(--color-outline)]">No especificadas</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'historial' && (
                <div className="space-y-6">
                  <div className="bg-[var(--color-surface-container-low)] rounded-md border border-[var(--color-outline-variant)] overflow-hidden">
                    <div className="bg-[var(--color-surface-container-highest)] px-4 py-3 border-b border-[var(--color-outline-variant)]">
                      <h3 className="text-sm font-medium text-[var(--color-on-surface)] flex items-center gap-2">
                        <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Historial Básico
                      </h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="block text-[var(--color-outline)] text-xs mb-1 uppercase tracking-wider font-semibold">Creado el</span>
                        <span className="text-[var(--color-on-surface-variant)]">{new Date(estacion.created).toLocaleString()}</span>
                        {estacion.expand?.created_by && (
                          <span className="block mt-1 text-xs text-[var(--color-outline)]">Por: {estacion.expand.created_by.name || estacion.expand.created_by.email}</span>
                        )}
                      </div>
                      <div>
                        <span className="block text-[var(--color-outline)] text-xs mb-1 uppercase tracking-wider font-semibold">Última actualización</span>
                        <span className="text-[var(--color-on-surface-variant)]">{new Date(estacion.updated).toLocaleString()}</span>
                        {estacion.expand?.updated_by && (
                          <span className="block mt-1 text-xs text-[var(--color-outline)]">Por: {estacion.expand.updated_by.name || estacion.expand.updated_by.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'actores' && (
                <ActoresTab estacionId={estacion.id} user={user} />
              )}

              {activeTab === 'productos' && (
                <ProductosTab estacionId={estacion.id} user={user} />
              )}

              {activeTab === 'experiencias' && (
                <ExperienciasTab estacionId={estacion.id} user={user} />
              )}

              {activeTab === 'imperdibles' && (
                <ImperdiblesTab estacionId={estacion.id} user={user} />
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
