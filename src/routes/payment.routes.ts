import express from 'express';

import { paystackWebook } from '../controllers/webhook.controller';

const router = express.Router();

router.post('/paystack/webhook', express.json({ type: '*/*' }), paystackWebook);

export default router;
