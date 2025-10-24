import jwt from 'jsonwebtoken';

import logger from '../../utils/logger';

import type { NextFunction, Request, Response } from 'express';
import type { JwtPayload } from 'jsonwebtoken';

interface CustomRequest extends Request {
  user?: JwtPayload | string;
}

export const authenticate = (req: CustomRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'User is not authorized or token is missing' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('User is not authorized:', error);
    res.status(401).json({ message: 'User is not authorized or token is invalid' });
  }
};
