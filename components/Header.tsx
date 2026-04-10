'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout, allRoles, activeRole, setActiveRole } = useAuth();
  const pathname = usePathname();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  // Simple title generation based on path
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/estaciones')) return 'Gestión de Estaciones';
    if (pathname.startsWith('/actores')) return 'Gestión de Actores';
    if (pathname.startsWith('/productos')) return 'Gestión de Productos';
    if (pathname.startsWith('/experiencias')) return 'Gestión de Experiencias';
    if (pathname.startsWith('/imperdibles')) return 'Gestión de Imperdibles';
    if (pathname.startsWith('/usuarios')) return 'Administración de Usuarios';
    if (pathname.startsWith('/carga-masiva')) return 'Carga Masiva';
    return '';
  };

  return (
    <header className="bg-[var(--color-surface-container)] border-b border-[var(--color-surface-variant)] sticky top-0 z-10">
      <div className="px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)] transition-colors"
            aria-label="Abrir menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-[var(--color-primary)] uppercase tracking-[0.05em] hidden sm:block">
            {getPageTitle()}
          </h2>
        </div>
        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-[0.05em]">
              {user.name || 'Usuario'}
            </span>
            {allRoles && allRoles.length > 1 ? (
              <div className="relative" ref={roleMenuRef}>
                <button 
                  className="text-xs font-medium text-[var(--color-on-surface-variant)] bg-transparent border-none outline-none cursor-pointer text-right flex items-center justify-end gap-1 hover:opacity-80 transition-opacity"
                  onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                  title="Cambiar de rol"
                >
                  {activeRole ? activeRole.charAt(0).toUpperCase() + activeRole.slice(1) : 'Sin rol'}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isRoleMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 min-w-max bg-[var(--color-surface-container)] rounded-md shadow-lg overflow-hidden z-50 border border-[var(--color-surface-variant)]">
                    {allRoles.map((role: string) => (
                      <button
                        key={role}
                        className={`w-full text-right px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] flex justify-between items-center gap-3`}
                        onClick={() => {
                          setActiveRole(role);
                          setIsRoleMenuOpen(false);
                        }}
                      >
                        <span className="text-[10px]">{activeRole === role ? '✓' : ''}</span>
                        <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">
                {activeRole ? activeRole.charAt(0).toUpperCase() + activeRole.slice(1) : 'Sin rol'}
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="btn-secondary px-4 py-2 text-sm text-[var(--color-primary)]"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
