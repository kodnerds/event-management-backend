import { Router } from 'express';

import { createShow } from '../controllers';
import { authenticate, authorize } from '../middlewares';

const router = Router();

router.post('/create', authenticate, authorize(['ARTIST']), createShow);

export default router;
