import { Router } from 'express';

import { login } from '../controllers';
import { loginValidation, validate } from '../middlewares';

const router = Router();

router.post('/login', loginValidation, validate, login);

export default router;
