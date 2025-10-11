import { Router } from 'express';

import artistRoute from './artist.router';
import usersRoute from './users.route';

const router = Router();
router.use('/users', usersRoute);
router.use('/artists', artistRoute);

export default router;
