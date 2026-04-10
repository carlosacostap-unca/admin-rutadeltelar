'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';

export default function CreateUserPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [active, setActive] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [observations, setObservations] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableRoles = [
    { id: 'admin', label: 'Administrador general' },
    { id: 'editor', label: 'Editor de contenidos' },
    { id: 'revisor', label: 'Revisor o validador' },
    { id: 'consultor', label: 'Consultor' }
  ];

  useEffect(() => {
    if (!isLoading && (!user || !user.roles?.includes('admin'))) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const toggleRole = (roleId: string) => {
    setRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || roles.length === 0) {
      setError('Nombre, correo y al menos un rol son obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Generate a random password since login is via Google
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
      
      const data = {
        name,
        email,
        emailVisibility: true,
        password: randomPassword,
        passwordConfirm: randomPassword,
        active,
        roles,
        observations
      };
      
      await pb.collection('users').create(data);
      router.push('/usuarios');
    } catch (err: any) {
      console.error('Error creando usuario:', err);
      setError(err?.response?.message || 'Error al crear el usuario. Verifica que el correo no esté ya registrado.');
    } finally {
      setIsSubmitting(false);
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
    <div className="h-full bg-[var(--color-surface)] flex flex-col">
      <main className="mx-auto px-6 py-8 flex-1 w-full">
        <div className="mb-6 flex flex-col items-start gap-4">
          <button onClick={() => router.back()} className="btn-primary px-4 py-2 text-sm shadow-md">&larr; Volver</button>
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Crear Usuario
          </h2>
        </div>

        <div className="bg-[var(--color-surface-container)] p-8 rounded-[8px]">
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 input-field"
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 input-field"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-3 uppercase tracking-[0.05em]">
                Roles (selecciona al menos uno) *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableRoles.map(role => (
                  <label 
                    key={role.id} 
                    className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${roles.includes(role.id) ? 'bg-[var(--color-primary-container)] text-white border-transparent' : 'border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]'}`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={roles.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                    />
                    <span className="font-medium text-sm">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-3 uppercase tracking-[0.05em]">
                Estado
              </label>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${active ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-[var(--color-surface-container)] w-6 h-6 rounded-full transition-transform ${active ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-[var(--color-on-surface)] font-medium">
                  {active ? 'Usuario Activo' : 'Usuario Inactivo'}
                </div>
              </label>
              <p className="text-xs text-[var(--color-secondary)] mt-2">
                Los usuarios inactivos no podrán iniciar sesión en el sistema.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                Observaciones Internas
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full px-4 py-2 input-field min-h-[100px] resize-y"
                placeholder="Notas adicionales sobre este usuario..."
              />
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-[var(--color-outline-variant)] mt-8">
              <Link
                href="/usuarios"
                className="btn-secondary px-6 py-2 text-sm shadow-sm text-center w-full sm:w-auto"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary px-6 py-2 text-sm shadow-md w-full sm:w-auto"
              >
                {isSubmitting ? 'Guardando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
