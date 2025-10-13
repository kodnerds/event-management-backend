import { UserRepository } from '../repositories/UserRepository';
import { hashPassword } from "../utils/hash";
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
    const { firstName, lastName, email, password,role} = req.body;
    if (!firstName || !lastName || !email || !password) {
         return errorResponse(res,400,"Firstname,lastname,email and password are required")
    }

    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      return errorResponse(res,409,"Email already exists");
    }

    const hashed = await hashPassword(password);
    const newUser = await userRepository.create({
         firstName,lastName,email,
         password:hashed,
         role:role ?? UserRole.USER
     })

    return successResponse(res,201,"User created successfully",{
      id:newUser.id,
      name:`${newUser.firstName} ${newUser.lastName}`,
      role:newUser.role,
    })
  } catch (error) {
    logger.error('Error creating users:', error);
    return errorResponse(res,500,"Internal server error")
  }
};
