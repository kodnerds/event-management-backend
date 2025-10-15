import { body } from 'express-validator';

export const signupValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  body('genre')
    .notEmpty()
    .withMessage('Genre is required')
    .isArray({ min: 1 })
    .withMessage('Genre must be a non-empty array'),

  body('genre.*')
    .isString()
    .withMessage('Each genre must be a string')
    .notEmpty()
    .withMessage('Genre items cannot be empty'),

  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters')
];
