import { body } from 'express-validator';

export const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),

  body('password').notEmpty().withMessage('Password is required')
];
