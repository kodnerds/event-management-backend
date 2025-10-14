import { Router } from 'express';

const router = Router();
import usersRoute from './users.route';
import artistRoute from './artist.router';

router.use('/users', usersRoute);
router.use('/artists', artistRoute);

export default router;
