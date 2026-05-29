export type UserRole = 'CLIENTE' | 'PROVEEDOR' | 'ADMIN';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
