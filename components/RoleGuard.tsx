'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Role, User } from '@/types/user';
import { hasAnyRole } from '@/lib/permissions';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallback?: React.ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();

  // TypeScript tip: Casteamos a User ya que AuthModel no tiene tipado estricto
  if (!hasAnyRole(user as User | null, allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
