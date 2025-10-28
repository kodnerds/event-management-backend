import { Router } from 'express';

import artistRoute from './artist.router';
import authRouter from './auth.router';
import showRoute from './show.route';
import usersRoute from './users.route';

const router = Router();
router.use('/users', usersRoute);
router.use('/artists', artistRoute);
router.use('/auth', authRouter);
router.use('/shows', showRoute);

export default router;
