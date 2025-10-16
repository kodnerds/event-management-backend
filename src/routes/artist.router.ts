import { Router } from 'express';

import { createArtist, getArtists } from '../controllers/artist.controller';
import { signupValidation, validate } from '../middlewares';

const router = Router();

router.post('/signup', signupValidation, validate, createArtist);
router.get('/all', getArtists);

export default router;
