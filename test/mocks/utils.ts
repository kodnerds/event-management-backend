import crypto from 'node:crypto';

import jwt from 'jsonwebtoken';

import envConfig from '../../src/config/envConfig';

import type { AuthenticatedUser } from '../../src/types';

export const generateTestAuthToken = (payload: AuthenticatedUser): string =>
  jwt.sign(payload, envConfig.ACCESS_TOKEN_SECRET as string, { expiresIn: '1h' });

export const generatePaystackSignature = (body: unknown) =>
  crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET! || 'test_secret')
    .update(JSON.stringify(body))
    .digest('hex');
