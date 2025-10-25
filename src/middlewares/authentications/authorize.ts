import { HTTP_STATUS } from '../../utils/const';
import logger from '../../utils/logger';

import type { ExtendedRequest } from '../../types';
import type { NextFunction, Response } from 'express';

export const authorize =
  (allowedRoles: string[]) =>
  (req: ExtendedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: 'Unauthorized: No user found in request' });
      }

      const userRole = req.user!.role;
      if (!allowedRoles.includes(userRole)) {
        res
          .status(HTTP_STATUS.FORBIDDEN)
          .json({ message: 'Forbidden: You do not have permission to access this resource.' });
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Authorization error' });
    }
  };
