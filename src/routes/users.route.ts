import { Router } from 'express';

import { createUser, getUsers } from '../controllers';
import { signUpValidation, validate } from '../middlewares';
import { authenticate } from '../middlewares/authentications/authenticate';
import { authorize } from '../middlewares/authentications/authorize';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN']), getUsers);
router.post('/signup', signUpValidation, validate, createUser);

export default router;
