import { Router } from 'express';

import { createArtist, getArtists, getCurrentArtist } from '../controllers';
import { authenticate, authorize, signupValidation, validate } from '../middlewares';

const router = Router();

router.post('/signup', signupValidation, validate, createArtist);
router.get('/', getArtists);
router.get('/me', authenticate, authorize(['ARTIST']), getCurrentArtist);

export default router;
