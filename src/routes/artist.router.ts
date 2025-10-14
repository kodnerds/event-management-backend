import { Router } from 'express';

import { createArtist } from '../controllers/artist.controller';
import { validateRegisterUsers } from '../validators/artistValidator';

const router = Router();

router.post('/signup', validateRegisterUsers, createArtist);

export default router;
