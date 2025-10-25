import { ArtistRepository } from '../repositories';
import { HTTP_STATUS } from '../utils/const';
import { getPaginationParams } from '../utils/getPaginationParams';
import { hashPassword } from '../utils/hash';
import logger from '../utils/logger';

import type { ExtendedRequest } from '../types';
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
      return res.status(HTTP_STATUS.CONFLICT).json({ message: 'Email already exists.' });
    }

    const hashedPassword = await hashPassword(password);

    const newArtist = await artistRepository.create({
      name,
      email,
      password: hashedPassword,
      genre,
      bio
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Artist created successfully',
      data: {
        id: newArtist.id,
        name: newArtist.name,
        email: newArtist.email
      }
    });
  } catch (error) {
    logger.error('Error creating artist:', error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: `Server error: ${error}` });
  }
};

export const getArtists = async (req: Request, res: Response) => {
  try {
    const artistRepository = new ArtistRepository();
    const { page, limit, offset } = getPaginationParams(req.query);

    const [artists, total] = await Promise.all([
      artistRepository.findAll({ skip: offset, take: limit }),
      artistRepository.count()
    ]);

    return res.status(HTTP_STATUS.OK).json({
      message: 'Artists retrieved successfully',
      data: artists,
      pagination: {
        currentPage: page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error retrieving artists:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

export const getCurrentArtist = (req: ExtendedRequest, res: Response) =>
  res.send({ message: 'Current artist', data: req.user });
