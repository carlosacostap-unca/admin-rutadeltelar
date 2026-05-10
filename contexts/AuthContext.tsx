'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
const SESSION_STARTED_AT_KEY = 'sessionStartedAt';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

type AuthError = {
  status?: number;
  response?: {
    message?: unknown;
  };
  message?: unknown;
};

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

  const getSessionStartedAt = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const startedAt = Number(localStorage.getItem(SESSION_STARTED_AT_KEY));
    return Number.isFinite(startedAt) ? startedAt : null;
  }, []);

  const ensureSessionStartedAt = useCallback(() => {
    if (typeof window === 'undefined') return Date.now();

    const startedAt = getSessionStartedAt();
    if (startedAt) return startedAt;

    const now = Date.now();
    localStorage.setItem(SESSION_STARTED_AT_KEY, String(now));
    return now;
  }, [getSessionStartedAt]);

  const isSessionExpired = useCallback(() => {
    const startedAt = getSessionStartedAt();
    return startedAt !== null && Date.now() - startedAt >= SESSION_DURATION_MS;
  }, [getSessionStartedAt]);

  const clearSession = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
    setActiveRoleState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('activeRole');
      localStorage.removeItem(SESSION_STARTED_AT_KEY);
    }
  }, []);

  const getAuthErrorMessage = useCallback((error: unknown) => {
    const authError = error as AuthError;
    const status = authError?.status;
    const message = String(authError?.response?.message || authError?.message || '').toLowerCase();

    if (
      status === 0 ||
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('network error') ||
      message.includes('load failed')
    ) {
      return 'No se pudo conectar con el servidor de autenticación. Inténtalo nuevamente en unos minutos.';
    }

    if (status === 401 || status === 403) {
      return 'Tu sesión venció o quedó desactualizada. Vuelve a iniciar sesión.';
    }

    return 'No se pudo validar tu sesión actual. Vuelve a iniciar sesión.';
  }, []);

  useEffect(() => {
    let mounted = true;

    // Verificar si el usuario actual cumple con las condiciones (estar activo)
    const checkAndSetUser = (model: AuthModel | null) => {
      if (!mounted) return;

      if (model) {
        if (isSessionExpired()) {
          clearSession();
          setError('Tu sesión venció. Vuelve a iniciar sesión.');
          router.push('/login');
          return;
        }

        ensureSessionStartedAt();

        // Asumimos que hay un campo booleano 'active' en la colección users
        // o si es necesario un campo 'role', ajusta la condición según corresponda.
        if (model.active === true || model.active === undefined) {
          // Nota: si tu PocketBase requiere que 'active' sea estrictamente true,
          // cambia la condición a: model.active === true
          setError(null);
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
          clearSession();
          setError('Tu usuario está inactivo. Contacta a un administrador.');
        }
      } else {
        setUser(null);
        setActiveRoleState(null);
      }
    };

    const initializeAuth = async () => {
      try {
        if (pb.authStore.isValid) {
          const authData = await pb.collection('users').authRefresh();
          checkAndSetUser(authData.record);
        } else {
          checkAndSetUser(pb.authStore.model);
        }
      } catch (error) {
        console.error('No se pudo refrescar la sesión:', error);
        clearSession();
        if (mounted) {
          setError(getAuthErrorMessage(error));
          router.push('/login');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const sessionTimer = window.setInterval(() => {
      if (pb.authStore.model && isSessionExpired()) {
        clearSession();
        setError('Tu sesión venció. Vuelve a iniciar sesión.');
        router.push('/login');
      }
    }, 60 * 1000);

    // Escuchar cambios en el authStore de PocketBase
    const unsubscribe = pb.authStore.onChange((token, model) => {
      checkAndSetUser(model);
    });

    return () => {
      mounted = false;
      window.clearInterval(sessionTimer);
      unsubscribe();
    };
  }, [clearSession, ensureSessionStartedAt, getAuthErrorMessage, isSessionExpired, router]);

  const loginWithGoogle = async () => {
    try {
      setError(null);
      // Inicia el flujo de OAuth2 con Google
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
      
      // Verificamos si el usuario creado o autenticado está activo (US-02)
      if (authData.record && authData.record.active === false) {
        clearSession();
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
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_STARTED_AT_KEY, String(Date.now()));
      }
      setUser(authData.record);
      router.push('/');
    } catch (err: unknown) {
      console.error('Error de autenticación con Google:', err);
      // Si el usuario cancela o hay un error, lo mostramos
      setError('No se pudo iniciar sesión o el usuario no existe internamente.');
      clearSession();
    }
  };

  const logout = () => {
    clearSession();
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
