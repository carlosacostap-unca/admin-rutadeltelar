'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { User } from '@/types/user';

export default function UserDetailPage() {
  const { user: currentUser, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [userRecord, setUserRecord] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableRoles: Record<string, string> = {
    admin: 'Administrador general',
    editor: 'Editor de contenidos',
    revisor: 'Revisor o validador',
    consultor: 'Consultor'
  };

  useEffect(() => {
    if (!isLoading && (!currentUser || !currentUser.roles?.includes('admin'))) {
      router.push('/');
    }
  }, [currentUser, isLoading, router]);

  useEffect(() => {
    async function fetchUser() {
      if (!userId || !currentUser?.roles?.includes('admin')) return;
      
      try {
        const record = await pb.collection('users').getOne<User>(userId, {
          requestKey: null,
        });
        setUserRecord(record);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('No se pudo cargar la información del usuario.');
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, [userId, currentUser]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString.replace(' ', 'T'));
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  if (isLoading || !currentUser || !currentUser.roles?.includes('admin') || loadingUser) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--color-surface)]">
        <p className="text-[var(--color-secondary)]">Cargando...</p>
      </div>
    );
  }

  if (error || !userRecord) {
    return (
      <div className="h-full bg-[var(--color-surface)] flex flex-col">
        <main className="mx-auto px-6 py-8 max-w-3xl flex-1 w-full text-center">
          <p className="text-[var(--color-error)] mb-4">{error || 'Usuario no encontrado'}</p>
          <button onClick={() => router.back()} className="btn-secondary px-4 py-2">&larr; Volver</button>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-surface)] flex flex-col">
      <main className="mx-auto px-6 py-8 flex-1 w-full">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm shadow-md">&larr; Volver</button>
          <div className="flex justify-between items-center w-full">
            <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
              Detalle de Usuario
            </h2>
            <Link
              href={`/usuarios/${userId}/edit`}
              className="btn-primary px-4 py-2"
            >
              Editar Usuario
            </Link>
          </div>
        </div>

        <div className="bg-[var(--color-surface-container)] rounded-[8px] overflow-hidden">
          
          {/* Encabezado del Detalle */}
          <div className="bg-[var(--color-surface-container-low)] p-6 border-b border-[var(--color-outline-variant)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[var(--color-on-surface)]">{userRecord.name || 'Sin nombre'}</h3>
              <p className="text-[var(--color-secondary)] mt-1">{userRecord.email}</p>
            </div>
            <div>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${userRecord.active ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'}`}>
                {userRecord.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Cuerpo del Detalle */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Columna Izquierda */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-[0.05em] mb-3">Roles Asignados</h4>
                {userRecord.roles && userRecord.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userRecord.roles.map(role => (
                      <span key={role} className="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] px-3 py-1 rounded-full text-sm font-medium">
                        {availableRoles[role] || role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-on-surface-variant)] italic">No tiene roles asignados</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-[0.05em] mb-2">Permisos Efectivos</h4>
                <p className="text-sm text-[var(--color-on-surface)] bg-[var(--color-surface-container)] p-3 rounded-md border border-[var(--color-outline-variant)]">
                  {userRecord.roles?.includes('admin') ? 'Acceso total al sistema.' : 
                   userRecord.roles?.includes('editor') ? 'Puede gestionar contenidos, estaciones y actores.' :
                   userRecord.roles?.includes('revisor') ? 'Puede revisar y aprobar/rechazar contenidos.' :
                   userRecord.roles?.includes('consultor') ? 'Acceso de solo lectura a los contenidos.' :
                   'Sin permisos específicos.'}
                </p>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-[0.05em] mb-3">Información del Sistema</h4>
                <div className="bg-[var(--color-surface-container)] rounded-md border border-[var(--color-outline-variant)] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--color-outline-variant)] flex justify-between items-center">
                    <span className="text-sm text-[var(--color-secondary)] font-medium">Fecha de Alta</span>
                    <span className="text-sm text-[var(--color-on-surface)]">{formatDate(userRecord.created)}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-sm text-[var(--color-secondary)] font-medium">Último Acceso</span>
                    <span className="text-sm text-[var(--color-on-surface)]">{formatDate(userRecord.last_login)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-[0.05em] mb-2">Observaciones Internas</h4>
                {userRecord.observations ? (
                  <div className="text-sm text-[var(--color-on-surface)] bg-[var(--color-surface-variant)] p-4 rounded-md border border-[var(--color-outline-variant)] whitespace-pre-wrap">
                    {userRecord.observations}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-on-surface-variant)] italic p-4 bg-[var(--color-surface-container)] rounded-md border border-[var(--color-outline-variant)] border-dashed">
                    Sin observaciones registradas.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}