import { UserRole } from '../entities';
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
         return res.send(400).json({message:"Firstname,lastname,email and password are required"})
    }

    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      return res.send(409).json({message:"Email already exists"});
    }

    const hashed = await hashPassword(password);
    const newUser = await userRepository.create({
         firstName,lastName,email,
         password:hashed,
         role:role ?? UserRole.USER
     })

    return res.send(201).json({message:"User created succesffully",data:newUser })
  } catch (error) {
    logger.error('Error creating users:', error);
    return errorResponse(res,500,"Internal server error")
  }
};
