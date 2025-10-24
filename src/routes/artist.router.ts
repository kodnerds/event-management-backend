import { Router } from 'express';

import { createArtist, getArtists } from '../controllers';
import { signupValidation, validate } from '../middlewares';
import { authenticate } from '../middlewares/authentications/authenticate';
import { authorize } from '../middlewares/authentications/authorize';

const router = Router();

router.post('/signup', signupValidation, validate, createArtist);
router.get('/', authenticate, authorize(['ARTIST']), getArtists);

export default router;
