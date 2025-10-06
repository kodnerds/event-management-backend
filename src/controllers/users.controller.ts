import { Request, Response } from 'express';

import { UserRepository } from '../repositories/UserRepository';

export const getUsers = async (_: Request, res: Response) => {
  try {
    const userRepository = new UserRepository();
    const users = await userRepository.findAll();
    return res.send(users);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching users:', error);
    return res.status(500).send({ message: 'Error fetching users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { firstName, lastName, age } = req.body;
  try {
    const userRepository = new UserRepository();
    const data = await userRepository.create({ firstName, lastName, age });
    return res.status(201).send({ message: 'User created successfully', data });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating user:', error);
    return res.status(500).send({ message: 'Error creating user' });
  }
};
