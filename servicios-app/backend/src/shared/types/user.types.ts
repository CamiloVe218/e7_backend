export type UserRole = 'CLIENTE' | 'PROVEEDOR' | 'ADMIN';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  // Optional profile fields — present when the user has them stored.
  // Extending these is backward-compatible: consumers that only use id/email/role
  // are unaffected. Added so GET /auth/me can power address auto-fill.
  phone?: string | null;
  isSuspended?: boolean;
  pendingCancellationFee?: boolean;
  street?: string | null;
  extNumber?: string | null;
  state?: string | null;
  city?: string | null;
  zipCode?: string | null;
}
