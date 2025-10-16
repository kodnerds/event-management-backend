import { body } from 'express-validator';

import { UserRole } from '../../entities';

export const signUpValidation = [
  body('firstName').trim().notEmpty().withMessage('firstName is required'),

  body('lastName').trim().notEmpty().withMessage('lastName is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('location').optional().isString().isLength({ min: 2 }),

  body('role').optional().isString().isIn(Object.values(UserRole)).default(UserRole.USER),

  body('favouriteGenres').optional().isArray().withMessage('favouriteGenres must be an array'),

  body('favouriteGenres.*').optional().isString().withMessage('Each genre must be a string'),

  body('favouriteArtists').optional().isArray().withMessage('favouriteArtists must be an array'),

  body('favouriteArtists.*').optional().isUUID().withMessage('Each artist ID must be a valid UUID')
];
