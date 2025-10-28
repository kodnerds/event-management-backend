import jwt from 'jsonwebtoken';

import envConfig from '../../config/envConfig';
import { HTTP_STATUS } from '../../utils/const';
import logger from '../../utils/logger';

import type { AuthenticatedUser } from '../../types';
import type { NextFunction, Request, Response } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: 'User is not authorized or token is missing' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: 'User is not authorized or token is missing' });
      return;
    }

    const decoded = jwt.verify(token, envConfig.ACCESS_TOKEN_SECRET as string);
    req.user = decoded as unknown as AuthenticatedUser;
    next();
  } catch (error) {
    logger.error('User is not authorized:', error);
    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: 'User is not authorized or token is invalid' });
  }
};
