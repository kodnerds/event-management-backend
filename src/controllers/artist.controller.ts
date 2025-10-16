import { ArtistRepository } from '../repositories';
import { hashPassword } from '../utils/hash';
import logger from '../utils/logger';

import type { Request, Response } from 'express';

export const createArtist = async (req: Request, res: Response) => {
  try {
    const { name, email, password, genre, bio } = req.body;

    const artistRepository = new ArtistRepository();

    const existingArtist = await artistRepository.findOne({
      where: { email },
      select: ['id']
    });
    if (existingArtist) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const hashedPassword = await hashPassword(password);

    const newArtist = await artistRepository.create({
      name,
      email,
      password: hashedPassword,
      genre,
      bio
    });

    return res.status(201).json({
      message: 'Artist created successfully',
      data: {
        id: newArtist.id,
        name: newArtist.name
      }
    });
  } catch (error) {
    logger.error('Error creating artist:', error);
    return res.status(500).json({ message: `Server error: ${error}` });
  }
};
