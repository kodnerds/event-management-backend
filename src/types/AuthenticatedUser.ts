export type Role = 'USER' | 'ARTIST' | 'ADMIN';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
