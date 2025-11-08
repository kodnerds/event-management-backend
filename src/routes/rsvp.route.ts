import { Router } from 'express';

import { cancelRsvp } from '../controllers';
import { authenticate, getRsvpByIdValidation, validate } from '../middlewares';

const router = Router();

router.delete('/:id', authenticate, getRsvpByIdValidation, validate, cancelRsvp);

export default router;
