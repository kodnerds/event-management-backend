import { body } from 'express-validator';

export const showValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Length must be between 2 and 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 2, max: 300 })
    .withMessage('Descrition length must be between 2 and 300 characters '),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isString()
    .withMessage('Location must be a string')
    .isLength({ min: 2, max: 300 })
    .withMessage('Descrition length must be between 2 and 300 characters '),

  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
    .custom((value) => {
      const showDate = new Date(value);
      const now = new Date();
      if (isNaN(showDate.getTime())) {
        throw new Error('Invalid date');
      }
      if (showDate < now) {
        throw new Error('Show date cannot be in the past');
      }
      return true;
    }),
  body('ticketPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Ticket price must be a positive number'),

  body('availablePrice')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available price must be a positive number')
];
