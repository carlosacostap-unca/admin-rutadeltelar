export type Role = 'admin' | 'editor' | 'revisor' | 'consultor';

export interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roles: Role[];
  observations?: string;
  created: string;
  updated: string;
  last_login?: string;
}
