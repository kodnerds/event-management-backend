import { Router } from 'express';

import { createArtist } from '../controllers/artist.controller';
import { signupValidation, validate } from '../middlewares';

const router = Router();

router.post('/signup', signupValidation, validate, createArtist);

export default router;
