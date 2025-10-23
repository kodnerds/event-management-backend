import { validationResult } from 'express-validator';

import { HTTP_STATUS } from '../../utils/const';

import type { NextFunction, Request, Response } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      code: HTTP_STATUS.BAD_REQUEST,
      message: 'Validation error',
      errors: errors.array().map((err) => err.msg)
    });
  }

  next();
};
