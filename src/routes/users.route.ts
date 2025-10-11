import { Router } from 'express';

import { createUser, getUsers } from '../controllers';
import { signUpSchema, validate } from '../middlewares/validation';

const router = Router();

router.get('/', getUsers);
router.post('/signup',validate(signUpSchema),createUser);

export default router;
