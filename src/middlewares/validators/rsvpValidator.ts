import { param } from 'express-validator';

export const getRsvpByIdValidation = [param('id').isUUID('4').withMessage('Invalid RSVP ID')];
