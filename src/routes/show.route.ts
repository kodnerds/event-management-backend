import { Router } from 'express';

import {
  createRsvp,
  createShow,
  getAllShows,
  getRsvpForShow,
  getSingleShowById
} from '../controllers';
import {
  authenticate,
  authorize,
  getShowByIdValidation,
  showValidation,
  validate
} from '../middlewares';

const router = Router();

router.get('/', getAllShows);
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
router.get(
  '/:id/rsvps',
  authenticate,
  authorize(['ARTIST', 'ADMIN']),
  getShowByIdValidation,
  validate,
  getRsvpForShow
);

export default router;
