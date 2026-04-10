'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header';
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
          <Link href="/usuarios" className="text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
            &larr; Volver
          </Link>
          <h2 className="text-2xl font-bold font-display text-[var(--color-primary)]">
            Crear Usuario
          </h2>
        </div>

        <div className="bg-[var(--color-surface-container-lowest)] p-8 rounded-[8px] shadow-[0_12px_32px_-4px_rgba(23,28,31,0.06)]">
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error-container)] text-[var(--color-on-error-container)] rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
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
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
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
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-3">
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
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-3">
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
                  <div className={`block w-14 h-8 rounded-full transition-colors ${active ? 'bg-[var(--color-tertiary-fixed)]' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${active ? 'transform translate-x-6' : ''}`}></div>
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
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">
                Observaciones Internas
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full px-4 py-2 input-field min-h-[100px] resize-y"
                placeholder="Notas adicionales sobre este usuario..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-4 border-t border-[var(--color-surface-variant)]">
              <Link
                href="/usuarios"
                className="btn-secondary px-6 py-2"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary px-6 py-2"
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
