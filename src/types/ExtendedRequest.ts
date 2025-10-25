import type { AuthenticatedUser } from './AuthenticatedUser';
import type { Request } from 'express';

export interface ExtendedRequest extends Request {
  user?: AuthenticatedUser;
}
