import { Role } from '@/types/user';

type UserWithRoles = {
  roles?: unknown;
};

const getRoles = (user: unknown): string[] => {
  if (!user || typeof user !== 'object') return [];

  const roles = (user as UserWithRoles).roles;
  return Array.isArray(roles) ? roles.filter((role): role is string => typeof role === 'string') : [];
};

export const hasAnyRole = (user: unknown, roles: Role[]): boolean => {
  return getRoles(user).some((role) => roles.includes(role as Role));
};

export const canManageUsers = (user: unknown): boolean => {
  return hasAnyRole(user, ['admin']);
};

export const canEditContent = (user: unknown): boolean => {
  return hasAnyRole(user, ['admin', 'editor']);
};

export const canReviewContent = (user: unknown): boolean => {
  return hasAnyRole(user, ['admin', 'revisor']);
};

// Si el usuario es consultor pero NO tiene otros roles superiores
export const isConsultantOnly = (user: unknown): boolean => {
  const userRoles = getRoles(user);
  const isConsultant = userRoles.includes('consultor');
  const hasHigherRole = hasAnyRole(user, ['admin', 'editor', 'revisor']);
  return isConsultant && !hasHigherRole;
};
