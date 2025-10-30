import { Router } from 'express';

import { createRsvp, createShow, getSingleShowById } from '../controllers';
import { authenticate, authorize, showValidation, validate } from '../middlewares';

const router = Router();

router.post('/create', authenticate, authorize(['ARTIST']), showValidation, validate, createShow);
router.post('/:showId/rsvp', authenticate, createRsvp);
router.get('/shows/:id', getSingleShowById);

export default router;
