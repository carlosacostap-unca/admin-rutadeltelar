'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';

interface AuditLog {
  id: string;
  entidad: string;
  registro_id: string;
  accion: string;
  usuario: string;
  rol_usuario?: string;
  datos_anteriores: any;
  datos_nuevos: any;
  created: string;
  expand?: {
    usuario?: {
      name: string;
      email: string;
    }
  }
}

export default function AuditoriaDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [log, setLog] = useState<AuditLog | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !user.roles?.includes('admin'))) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const record = await pb.collection('auditoria').getOne<AuditLog>(id, {
          expand: 'usuario',
        });
        setLog(record);
      } catch (err: any) {
        console.error('Error fetching audit log:', err);
        setError('Error al cargar el registro de auditoría. Es posible que no exista.');
      } finally {
        setLoadingData(false);
      }
    };

    if (user && user.roles?.includes('admin') && id) {
      fetchLog();
    }
  }, [user, id]);

  if (isLoading || !user || !user.roles?.includes('admin') || loadingData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-[0.05em] animate-pulse">
          Cargando detalles...
        </p>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="h-full bg-[var(--color-surface)] flex flex-col">
        <main className="mx-auto px-6 py-8 flex-1 w-full max-w-4xl">
          <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm shadow-md mb-6">&larr; Volver</button>
          <div className="p-6 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md">
            {error || 'Registro no encontrado.'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-surface)] flex flex-col">
      <main className="mx-auto px-6 py-8 flex-1 w-full max-w-5xl">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm shadow-md">&larr; Volver</button>
          <h1 className="text-[32px] font-bold text-[var(--color-primary)] tracking-tight">
            Detalle de Auditoría
          </h1>
        </div>

        <div className="bg-[var(--color-surface-container)] rounded-2xl p-6 shadow-sm border border-[var(--color-surface-variant)] mb-8">
          <h2 className="text-xl font-bold mb-4 text-[var(--color-on-surface)]">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-[var(--color-on-surface-variant)] mb-1">Fecha</p>
              <p className="font-medium">{new Date(log.created).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-on-surface-variant)] mb-1">Usuario</p>
              <p className="font-medium">{log.expand?.usuario?.name || log.expand?.usuario?.email || log.usuario}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-on-surface-variant)] mb-1">Rol del Usuario</p>
              <p className="font-medium uppercase">{log.rol_usuario || 'sin rol'}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-on-surface-variant)] mb-1">Entidad</p>
              <p className="font-medium capitalize">{log.entidad}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-on-surface-variant)] mb-1">Acción / Flujo</p>
              <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                log.accion.includes('crear') ? 'bg-green-100 text-green-800' :
                log.accion === 'editar' ? 'bg-blue-100 text-blue-800' :
                log.accion === 'enviar_a_revision' ? 'bg-yellow-100 text-yellow-800' :
                log.accion === 'aprobado_desde_revision' ? 'bg-emerald-200 text-emerald-900' :
                log.accion === 'aprobado_directamente' ? 'bg-emerald-200 text-emerald-900' :
                log.accion === 'aprobar' ? 'bg-emerald-200 text-emerald-900' :
                log.accion === 'rechazar_a_borrador' ? 'bg-orange-200 text-orange-900' :
                log.accion === 'desactivar' ? 'bg-gray-200 text-gray-800' :
                log.accion === 'reactivar' ? 'bg-teal-100 text-teal-800' :
                log.accion.includes('cambio_estado') ? 'bg-purple-100 text-purple-800' :
                'bg-red-100 text-red-800'
              }`}>
                {log.accion.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <p className="text-sm text-[var(--color-on-surface-variant)] mb-1">ID Registro Afectado</p>
              <p className="font-mono text-sm">{log.registro_id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[var(--color-surface-container)] p-6 rounded-md shadow-sm">
            <h2 className="text-lg font-bold text-[var(--color-on-surface)] mb-4 border-b border-[var(--color-surface-variant)] pb-2">
              Datos Anteriores
            </h2>
            <div className="bg-[#1e1e1e] p-4 rounded-md overflow-x-auto">
              <pre className="text-[#d4d4d4] text-xs font-mono whitespace-pre-wrap break-all">
                {log.datos_anteriores ? JSON.stringify(log.datos_anteriores, null, 2) : 'No hay datos anteriores (ej. creación).'}
              </pre>
            </div>
          </div>

          <div className="bg-[var(--color-surface-container)] p-6 rounded-md shadow-sm">
            <h2 className="text-lg font-bold text-[var(--color-on-surface)] mb-4 border-b border-[var(--color-surface-variant)] pb-2">
              Datos Nuevos
            </h2>
            <div className="bg-[#1e1e1e] p-4 rounded-md overflow-x-auto">
              <pre className="text-[#d4d4d4] text-xs font-mono whitespace-pre-wrap break-all">
                {log.datos_nuevos ? JSON.stringify(log.datos_nuevos, null, 2) : 'No hay datos nuevos (ej. eliminación).'}
              </pre>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
