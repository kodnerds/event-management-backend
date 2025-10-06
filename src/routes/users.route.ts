import { Router } from 'express';

import { createUser, getUsers } from '../controllers';

const router = Router();

router.get('/', getUsers);
router.post('/create', createUser);

export default router;
