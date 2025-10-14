import { Router } from 'express';

const router = Router();
import artistRoute from './artist.router';
import usersRoute from './users.route';

router.use('/users', usersRoute);
router.use('/artists', artistRoute);

export default router;
