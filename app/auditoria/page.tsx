'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';

interface AuditLog {
  id: string;
  entidad: string;
  registro_id: string;
  accion: string;
  usuario: string;
  rol_usuario?: string;
  created: string;
  expand?: {
    usuario?: {
      name: string;
      email: string;
    }
  }
}

export default function AuditoriaPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    if (!isLoading && (!user || !user.roles?.includes('admin'))) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingData(true);
      try {
        const records = await pb.collection('auditoria').getList<AuditLog>(page, ITEMS_PER_PAGE, {
          sort: '-created',
          expand: 'usuario',
        });
        setLogs(records.items);
        setTotalPages(records.totalPages || 1);
      } catch (err: any) {
        console.error('Error fetching audit logs:', err);
        setError('Error al cargar los registros de auditoría. Asegúrate de que la colección "auditoria" exista en PocketBase.');
      } finally {
        setLoadingData(false);
      }
    };

    if (user && user.roles?.includes('admin')) {
      fetchLogs();
    }
  }, [user, page]);

  if (isLoading || !user || !user.roles?.includes('admin') || loadingData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-[0.05em] animate-pulse">
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-surface)] flex flex-col">
      <main className="mx-auto px-6 py-8 flex-1 w-full max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-[32px] font-bold text-[var(--color-primary)] tracking-tight">
            Auditoría de Cambios
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="bg-[var(--color-surface-container)] rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-[0.05em] text-xs">Fecha</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-[0.05em] text-xs">Usuario / Rol</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-[0.05em] text-xs">Entidad</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-[0.05em] text-xs">Acción / Flujo</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-[0.05em] text-xs">ID Registro</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-[0.05em] text-xs text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-variant)]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[var(--color-on-surface-variant)]">
                      No hay registros de auditoría.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--color-surface-container-high)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(log.created).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{log.expand?.usuario?.name || log.expand?.usuario?.email || log.usuario}</div>
                        <div className="text-xs text-[var(--color-on-surface-variant)] uppercase">{log.rol_usuario || 'sin rol'}</div>
                      </td>
                      <td className="px-6 py-4 capitalize font-medium">
                        {log.entidad}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap ${
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
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[var(--color-on-surface-variant)]">
                        {log.registro_id}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/auditoria/${log.id}`}
                          className="text-[var(--color-primary)] hover:underline font-bold text-sm"
                        >
                          Ver Detalles
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[var(--color-surface-variant)] flex items-center justify-between">
              <p className="text-sm text-[var(--color-on-surface-variant)]">
                Página <span className="font-bold">{page}</span> de <span className="font-bold">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm rounded-md border border-[var(--color-outline)] text-[var(--color-on-surface)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-surface-variant)] transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm rounded-md border border-[var(--color-outline)] text-[var(--color-on-surface)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-surface-variant)] transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
