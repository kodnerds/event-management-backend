import { Router } from "express";

import { createShow } from "../controllers";

const router = Router();

router.post('/create',createShow)

export default router;