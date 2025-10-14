import { body, validationResult } from 'express-validator';

import type { NextFunction, Request, Response } from 'express';
import type { ValidationChain } from 'express-validator';

export const validateRegisterUsers: (
  | ValidationChain
  | ((req: Request, res: Response, next: NextFunction) => void)
)[] = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name should be in String only')
    .trim()
    .escape(),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .isStrongPassword()
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one sign, and one number'
    ),

  body('genre').isArray().withMessage('Genre should be an array'),

  body('bio').isString().withMessage('Bio should be in String only'),

  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((error) => ({
        message: error.msg
      }));

      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: formattedErrors
      });
      return;
    }
    next();
  }
];
