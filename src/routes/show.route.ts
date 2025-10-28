import { Router } from 'express';

import { createShow } from '../controllers';
import { authenticate, authorize, showValidation, validate } from '../middlewares';

const router = Router();

router.post('/create', authenticate, authorize(['ARTIST']), showValidation, validate, createShow);

export default router;
