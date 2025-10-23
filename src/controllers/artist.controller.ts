import { ArtistRepository } from '../repositories';
import { HTTP_STATUS } from '../utils/const';
import { getPaginationParams } from '../utils/getPaginationParams';
import { hashPassword } from '../utils/hash';
import logger from '../utils/logger';

import type { ArtistEntity } from '../entities';
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

export const updateArtist = async (req: Request, res: Response) => {
  try {
    const { name, genre, bio } = req.body;
    const { id } = req.params;

    const artistRepository = new ArtistRepository();

    let existingArtist: ArtistEntity | null = null;

    try {
      existingArtist = await artistRepository.findById(id);
    } catch {
      return res.status(404).json({ message: 'Artist does not exist' });
    }
    
    if (!existingArtist) {
      return res.status(409).json({ message: 'Artist does not exist.' });
    }

    const updateData: Partial<ArtistEntity> = {};

    if (name) updateData.name = name;
    if (genre) updateData.genre = genre;
    if (bio) updateData.bio = bio;
    updateData.updatedAt = new Date();

    const updatedArtist = await artistRepository.findAndUpdate(id, updateData);

    if (!updatedArtist) {
      return res.status(500).json({ message: 'Failed to update artist' });
    }

    const { password, ...artistData } = updatedArtist;

    return res.status(202).json({
      message: 'Artist updated successfully',
      data: artistData
    });
  } catch (error) {
    logger.error('Error updating artist:', error);
    return res.status(500).json({ message: `Server error: ${error}` });
  }
};
