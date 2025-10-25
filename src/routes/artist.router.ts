import { Router } from 'express';

import { createArtist, getArtists, getCurrentArtist, updateArtist } from '../controllers';
import {
  authenticate,
  authorize,
  signupValidation,
  updateValidation,
  validate
} from '../middlewares';

const router = Router();

router.post('/signup', signupValidation, validate, createArtist);
router.get('/', getArtists);
router.get('/me', authenticate, authorize(['ARTIST']), getCurrentArtist);
router.patch(
  '/update',
  authenticate,
  authorize(['ARTIST', 'ADMIN']),
  updateValidation,
  validate,
  updateArtist
);

export default router;
