import { User, Role } from '@/types/user';

export const hasAnyRole = (user: User | null | undefined, roles: Role[]): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some((role) => roles.includes(role as Role));
};

export const canManageUsers = (user: User | null | undefined): boolean => {
  return hasAnyRole(user, ['admin']);
};

export const canEditContent = (user: User | null | undefined): boolean => {
  return hasAnyRole(user, ['admin', 'editor']);
};

export const canReviewContent = (user: User | null | undefined): boolean => {
  return hasAnyRole(user, ['admin', 'revisor']);
};

// Si el usuario es consultor pero NO tiene otros roles superiores
export const isConsultantOnly = (user: User | null | undefined): boolean => {
  if (!user || !user.roles) return false;
  const isConsultant = user.roles.includes('consultor');
  const hasHigherRole = hasAnyRole(user, ['admin', 'editor', 'revisor']);
  return isConsultant && !hasHigherRole;
};
