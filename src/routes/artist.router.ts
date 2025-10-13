import { Router } from 'express';
import { createArtist } from '../controllers/artist.controller';

const router = Router();

// router.get('/', getUsers);
router.post('/signup', createArtist);

export default router;
