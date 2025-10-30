import { Router } from 'express';

import { createRsvp, createShow, getSingleShowById } from '../controllers';
import {
  authenticate,
  authorize,
  getShowByIdValidation,
  showValidation,
  validate
} from '../middlewares';

const router = Router();

router.post(
  '/create',
  authenticate,
  authorize(['ARTIST', 'ADMIN']),
  showValidation,
  validate,
  createShow
);
router.post('/:showId/rsvp', authenticate, authorize(['USER']), createRsvp);
router.get('/:id', getShowByIdValidation, validate, getSingleShowById);

export default router;
