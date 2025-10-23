import { Router } from 'express';

import { createArtist, getArtists } from '../controllers';
import { signupValidation, validate } from '../middlewares';

const router = Router();

router.post('/signup', signupValidation, validate, createArtist);
router.get('/', getArtists);

export default router;
