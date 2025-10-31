import { Router } from 'express';

import { createRsvp, createShow, deleteShow, getAllShows } from '../controllers';
import { authenticate, authorize, showValidation, validate } from '../middlewares';

const router = Router();

router.post('/create', authenticate, authorize(['ARTIST']), showValidation, validate, createShow);
router.get('/', getAllShows);
router.delete('/:id', authenticate, authorize(['ARTIST', 'ADMIN']), deleteShow);
router.post('/:showId/rsvp', authenticate, createRsvp);

export default router;
