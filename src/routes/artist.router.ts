import { Router } from 'express';

import { getCurrentArtist } from '../controllers';
import { authenticate, authorize, signupValidation, validate } from '../middlewares';
import { createArtist, getArtists, updateArtist } from '../controllers';
import { signupValidation, validate } from '../middlewares';

const router = Router();

router.post('/signup', signupValidation, validate, createArtist);
router.get('/', getArtists);
router.get('/me', authenticate, authorize(['ARTIST']), getCurrentArtist);
router.patch('/update', updateArtist);

export default router;
