// src/middlewares/validateRegisterUsers.ts
import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

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

  body('genre')
    .notEmpty()
    .withMessage('Genre is required')
    .isString()
    .withMessage('Genre should be in String only')
    .isArray()
    .trim()
    .escape(),

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
