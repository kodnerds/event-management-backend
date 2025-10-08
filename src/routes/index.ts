import { Router } from 'express';

const router = Router();
import usersRoute from './users.route';

router.use('/users', usersRoute);

export default router;
