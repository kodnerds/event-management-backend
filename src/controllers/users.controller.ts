import { UserRole } from '../entities';
import { UserRepository } from '../repositories';
import { HTTP_STATUS } from '../utils/const';
import { getPaginationParams } from '../utils/getPaginationParams';
import { hashPassword } from '../utils/hash';
import logger from '../utils/logger';

import type { Request, Response } from 'express';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const userRepository = new UserRepository();
    const { page, limit, offset } = getPaginationParams(req.query);

    const [users, total] = await Promise.all([
      userRepository.findAll({ skip: offset, take: limit }),
      userRepository.count()
    ]);

    return res.status(HTTP_STATUS.OK).json({
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        currentPage: page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userRepository = new UserRepository();
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({ message: 'Email already exists' });
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
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error' });
  }
};
