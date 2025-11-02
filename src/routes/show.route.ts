import { Router } from 'express';

import { createRsvp, createShow, initiateShowPayment } from '../controllers';
import { authenticate, authorize, showValidation, validate } from '../middlewares';

const router = Router();

router.post('/create', authenticate, authorize(['ARTIST']), showValidation, validate, createShow);
router.post('/:showId/rsvp', authenticate, createRsvp);
router.post('/:showId/rsvp/pay', authenticate, initiateShowPayment);

export default router;
