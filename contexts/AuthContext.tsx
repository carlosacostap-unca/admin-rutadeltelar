'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';
import { AuthModel } from 'pocketbase';

interface AuthContextType {
  user: AuthModel | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  error: string | null;
  activeRole: string | null;
  setActiveRole: (role: string) => void;
  allRoles: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRoleState] = useState<string | null>(null);
  const router = useRouter();

  const setActiveRole = (role: string) => {
    setActiveRoleState(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeRole', role);
    }
  };

  useEffect(() => {
    // Verificar si el usuario actual cumple con las condiciones (estar activo)
    const checkAndSetUser = (model: AuthModel | null) => {
      if (model) {
        // Asumimos que hay un campo booleano 'active' en la colección users
        // o si es necesario un campo 'role', ajusta la condición según corresponda.
        if (model.active === true || model.active === undefined) {
          // Nota: si tu PocketBase requiere que 'active' sea estrictamente true,
          // cambia la condición a: model.active === true
          setUser(model);
          
          if (model.roles && model.roles.length > 0) {
            const savedRole = typeof window !== 'undefined' ? localStorage.getItem('activeRole') : null;
            if (savedRole && model.roles.includes(savedRole)) {
              setActiveRoleState(savedRole);
            } else {
              setActiveRoleState(model.roles[0]);
              if (typeof window !== 'undefined') {
                localStorage.setItem('activeRole', model.roles[0]);
              }
            }
          } else {
            setActiveRoleState(null);
          }
        } else {
          // El usuario existe pero está inactivo
          pb.authStore.clear();
          setUser(null);
          setActiveRoleState(null);
          setError('Tu usuario está inactivo. Contacta a un administrador.');
        }
      } else {
        setUser(null);
        setActiveRoleState(null);
      }
    };

    // Inicializar el estado de usuario basado en el authStore actual
    checkAndSetUser(pb.authStore.model);
    setIsLoading(false);

    // Escuchar cambios en el authStore de PocketBase
    const unsubscribe = pb.authStore.onChange((token, model) => {
      checkAndSetUser(model);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      setError(null);
      // Inicia el flujo de OAuth2 con Google
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
      
      // Verificamos si el usuario creado o autenticado está activo (US-02)
      if (authData.record && authData.record.active === false) {
        pb.authStore.clear();
        setUser(null);
        setError('Acceso denegado: Usuario inactivo o no autorizado.');
        return;
      }

      // Actualizar last_login tras inicio de sesión exitoso
      if (authData.record) {
        try {
          const now = new Date().toISOString();
          await pb.collection('users').update(authData.record.id, { last_login: now });
          authData.record.last_login = now;
        } catch (updateErr) {
          console.error('No se pudo actualizar last_login:', updateErr);
        }
      }
      
      setUser(authData.record);
      router.push('/');
    } catch (err: any) {
      console.error('Error de autenticación con Google:', err);
      // Si el usuario cancela o hay un error, lo mostramos
      setError('No se pudo iniciar sesión o el usuario no existe internamente.');
      pb.authStore.clear();
      setUser(null);
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
    router.push('/login');
  };

  const userWithActiveRole = React.useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      roles: activeRole ? [activeRole] : user.roles,
      allRoles: user.roles // Keep the original roles in case it's needed
    } as AuthModel;
  }, [user, activeRole]);

  return (
    <AuthContext.Provider value={{ 
      user: userWithActiveRole, 
      isLoading, 
      loginWithGoogle, 
      logout, 
      error, 
      activeRole, 
      setActiveRole,
      allRoles: user?.roles || []
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
