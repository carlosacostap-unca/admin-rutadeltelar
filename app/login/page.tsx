'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { loginWithGoogle, user, isLoading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--color-surface)]">
        <p className="font-sans text-[var(--color-on-surface-variant)] text-sm">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="flex h-full items-center justify-center p-4 bg-[var(--color-surface)]">
      {/* Container - using surface_container_low for related content grouping as per "Surface Hierarchy" */}
      <div className="w-full max-w-md rounded-lg p-10 bg-[var(--color-surface-container-low)] shadow-[0_8px_24px_rgba(38,25,6,0.06)] border-none">
        
        {/* Header Section */}
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[var(--color-surface-variant)] rounded-full mb-6 flex items-center justify-center shadow-[0_4px_12px_rgba(38,25,6,0.04)]">
             <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-[var(--color-primary)] tracking-[-0.02em] leading-tight mb-2">
            Ruta del Telar
          </h1>
          <p className="text-sm font-sans text-[var(--color-primary)] uppercase tracking-[0.05em] font-bold">
            Sistema de Gestión Territorial
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-full bg-[var(--color-error-container)] px-6 py-3 text-sm font-bold text-[var(--color-on-error-container)] text-center tracking-wide">
            {error}
          </div>
        )}

        {/* Action Section */}
        <div className="pt-2">
          <button
            onClick={loginWithGoogle}
            className="flex w-full items-center justify-center px-6 py-4 rounded-md text-[var(--color-surface)] font-semibold text-sm transition-all duration-300 ease-out hover:-translate-y-[2px]"
            style={{ 
              background: 'linear-gradient(135deg, var(--color-primary-container) 0%, var(--color-primary) 100%)',
              boxShadow: '0 4px 12px rgba(38, 25, 6, 0.08)'
            }}
          >
            <svg
              className="mr-3 h-5 w-5 bg-white rounded-full p-0.5"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Iniciar sesión con Google
        </button>
        </div>
      </div>
    </main>
  );
}
