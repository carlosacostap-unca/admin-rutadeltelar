'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import { User } from '@/types/user';
import Header from '@/components/Header';

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
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Header />
      <main className="mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Gestión de Usuarios
          </h2>
          <Link
            href="/usuarios/create"
            className="btn-primary px-4 py-2 text-sm shadow-md"
          >
            + Crear Usuario
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-t-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)] flex flex-col md:flex-row gap-4 border-b border-[var(--color-outline-variant)]">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="todos">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="editor">Editor</option>
              <option value="revisor">Revisor</option>
              <option value="consultor">Consultor</option>
            </select>
          </div>
        </div>

        <div className="bg-[var(--color-surface-container-lowest)] rounded-b-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)] overflow-hidden">
          {loadingUsers ? (
            <p className="p-8 text-center text-[var(--color-secondary)]">Cargando usuarios...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] text-[var(--color-secondary)] text-sm">
                    <th className="py-3 px-6 font-semibold">Nombre</th>
                    <th className="py-3 px-6 font-semibold">Correo</th>
                    <th className="py-3 px-6 font-semibold">Roles</th>
                    <th className="py-3 px-6 font-semibold">Estado</th>
                    <th className="py-3 px-6 font-semibold">Último Acceso</th>
                    <th className="py-3 px-6 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--color-surface-variant)] hover:bg-[var(--color-surface-container-lowest)] transition-colors">
                      <td className="py-4 px-6 text-sm text-[var(--color-on-surface)]">{u.name || '-'}</td>
                      <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">{u.email}</td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex gap-2 flex-wrap">
                          {u.roles?.map((role) => (
                            <span key={role} className="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] px-2 py-1 rounded-full text-xs capitalize">
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.active ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'}`}>
                          {u.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--color-secondary)]">
                        {formatDate(u.last_login || u.updated)}
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex justify-end gap-3">
                          <Link href={`/usuarios/${u.id}`} className="text-[var(--color-primary)] hover:text-[var(--color-on-primary-container)] font-medium transition-colors">
                            Ver
                          </Link>
                          <Link href={`/usuarios/${u.id}/edit`} className="text-[var(--color-tertiary-fixed)] hover:text-[var(--color-on-tertiary-fixed-variant)] font-medium transition-colors">
                            Editar
                          </Link>
                          <button 
                            onClick={() => toggleUserStatus(u.id, u.active)}
                            className={`font-medium transition-colors ${u.active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                          >
                            {u.active ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--color-secondary)]">
                        No se encontraron usuarios con los filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
