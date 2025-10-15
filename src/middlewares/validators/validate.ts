import { validationResult } from 'express-validator';

import type { NextFunction, Request, Response } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Validation error',
      details: errors.array().map((err) => err.msg)
    });
  }

  next();
};
