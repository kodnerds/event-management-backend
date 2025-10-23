import jwt from 'jsonwebtoken';

import envConfig from '../config/envConfig';
import { ArtistRepository, UserRepository } from '../repositories';
import { HTTP_STATUS } from '../utils/const';
import { comparePassword } from '../utils/hash';
import logger from '../utils/logger';

import type { Request, Response } from 'express';

type Role = 'USER' | 'ARTIST' | 'ADMIN';

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const userRepository = new UserRepository();
    const artistRepository = new ArtistRepository();

    const [userRecord, artistRecord] = await Promise.all([
      userRepository.findOneBy({ email }),
      artistRepository.findOne({ where: { email } })
    ]);

    const account = userRecord ?? artistRecord;

    if (!account) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, account.password);
    if (!isMatch) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid credentials' });
    }

    const payload: AuthenticatedUser = {
      id: account.id,
      name:
        artistRecord?.name ?? (userRecord ? `${userRecord.firstName} ${userRecord.lastName}` : ''),
      email: account.email,
      role: userRecord ? userRecord.role : 'ARTIST'
    };

    const token = jwt.sign(payload, envConfig.ACCESS_TOKEN_SECRET as string, {
      expiresIn: '15d'
    });

    return res.json({
      message: 'Login successfully',
      token,
      data: payload
    });
  } catch (error) {
    logger.error('Error during login', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};
