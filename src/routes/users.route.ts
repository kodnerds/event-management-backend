import { Router } from 'express';

import { createUser, getUsers } from '../controllers';
import { signUpValidation, validate } from '../middlewares';

const router = Router();

router.get('/', getUsers);
router.post('/signup', signUpValidation, validate, createUser);

export default router;
