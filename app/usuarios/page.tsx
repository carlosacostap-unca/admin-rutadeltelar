'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { User } from '@/types/user';

export default function UsuariosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [roleFilter, setRoleFilter] = useState<string>('todos');

  useEffect(() => {
    if (!isLoading && (!user || !user.roles?.includes('admin'))) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchUsers() {
      if (user?.roles?.includes('admin')) {
        try {
          const records = await pb.collection('users').getFullList<User>({
            sort: '-created',
            requestKey: null,
          });
          setUsers(records);
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setLoadingUsers(false);
        }
      }
    }
    fetchUsers();
  }, [user]);

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      await pb.collection('users').update(id, { active: !currentStatus });
      setUsers(users.map(u => u.id === id ? { ...u, active: !currentStatus } : u));
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error al cambiar el estado del usuario');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Filtro de texto (nombre o correo)
      const matchesSearch = 
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de estado
      const matchesStatus = 
        statusFilter === 'todos' ? true : 
        statusFilter === 'activo' ? u.active : !u.active;

      // Filtro de rol
      const matchesRole = 
        roleFilter === 'todos' ? true : 
        u.roles?.includes(roleFilter as any);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      // Reemplazar espacio por 'T' para asegurar compatibilidad con el formato de fecha de PocketBase
      const date = new Date(dateString.replace(' ', 'T'));
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleString('es-AR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  if (isLoading || !user || !user.roles?.includes('admin')) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-surface-dim)]">
      <main className="mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] font-display text-[var(--color-primary)]">
            Gestión de Usuarios
          </h2>
          <Link
            href="/usuarios/create"
            className="btn-primary px-4 py-2 text-sm"
          >
            + Crear Usuario
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-[var(--color-surface-container)] pl-8 pr-6 py-6 rounded-md flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full text-[var(--color-on-surface-variant)] placeholder:text-[var(--color-surface-variant)]"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field text-[var(--color-on-surface-variant)]"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field text-[var(--color-on-surface-variant)]"
            >
              <option value="todos">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="editor">Editor</option>
              <option value="revisor">Revisor</option>
              <option value="consultor">Consultor</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {loadingUsers ? (
            <p className="p-8 text-center text-[var(--color-on-surface-variant)]">Cargando usuarios...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {filteredUsers.map((u) => (
                  <Link 
                    key={u.id} 
                    href={`/usuarios/${u.id}`}
                    className={`bg-[var(--color-surface-container)] p-5 rounded-xl hover:bg-[var(--color-surface-container-low)] transition-all shadow-sm flex flex-col gap-2 cursor-pointer ${!u.active ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-[var(--color-primary)]">{u.name || '-'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.05em] shrink-0 ${u.active ? 'bg-[var(--color-secondary-container)] text-[var(--color-primary)]' : 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'}`}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--color-on-surface-variant)] flex flex-wrap items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {u.email}
                      </span>
                      {u.roles && u.roles.length > 0 && (
                        <div className="flex gap-2 flex-wrap items-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          {u.roles.map((role) => (
                            <span key={role} className="bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-[0.05em]">
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="bg-[var(--color-surface-container)] p-8 text-center text-[var(--color-on-surface-variant)] rounded-md">
                  No se encontraron usuarios con los filtros aplicados.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
