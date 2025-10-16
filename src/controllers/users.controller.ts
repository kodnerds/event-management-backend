import { UserRole } from '../entities';
import { UserRepository } from '../repositories';
import { hashPassword } from '../utils/hash';
import logger from '../utils/logger';

import type { Request, Response } from 'express';

export const getUsers = async (_: Request, res: Response) => {
  try {
    const userRepository = new UserRepository();
    const users = await userRepository.findAll();
    return res.send(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    return res.status(500).send({ message: 'Error fetching users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userRepository = new UserRepository();
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashed = await hashPassword(password);
    const newUser = await userRepository.create({
      firstName,
      lastName,
      email,
      password: hashed,
      role: role ?? UserRole.USER
    });

    return res.status(201).send({
      message: 'User created successfully',
      data: {
        id: newUser.id,
        name: `${newUser.firstName} ${newUser.lastName}`
      }
    });
  } catch (error) {
    logger.error('Error creating users:', error);
    return res.status(500).send({ message: 'Internal server error' });
  }
};
