import logger from '../../utils/logger';

import type { NextFunction, Request, Response } from 'express';
import type { JwtPayload } from 'jsonwebtoken';

interface CustomRequest extends Request {
  user?: JwtPayload & { role?: string };
}

export const authorize =
  (allowedRoles: string[]) =>
  (req: CustomRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized: No user found in request' });
      }

      const userRole = req.user?.role;
      if (!allowedRoles.includes(userRole ?? '')) {
        res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource.' });
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
