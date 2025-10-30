import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { ArtistRepository, ShowRepository } from '../repositories';
import { HTTP_STATUS } from '../utils/const';
import { getPaginationParams } from '../utils/getPaginationParams';
import logger from '../utils/logger';

import type { ShowEntity } from '../entities/ShowEntity';
import type { Request, Response } from 'express';
import type { FindOptionsWhere } from 'typeorm';

export const createShow = async (req: Request, res: Response) => {
  try {
    const { title, description, location, date, ticketPrice, availableTickets } = req.body;

    const user = req.user!;
    const showDate = new Date(date);

    const showRepository = new ShowRepository();

    const existingShow = await showRepository.findOne({
      where: { title, artist: { id: user.id } },
      select: ['id']
    });

    if (existingShow) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .json({ message: 'A show with this title already exists' });
    }

    const newShow = await showRepository.create({
      title,
      description,
      location,
      date: showDate,
      ticketPrice: ticketPrice ?? 0,
      availableTickets: availableTickets ?? null,
      artistId: user.id
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Show created successfully',
      data: {
        id: newShow.id,
        title: newShow.title,
        date: newShow.date,
        artistId: user.id
      }
    });
  } catch (error) {
    logger.error('Error creating show', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: `Server error` });
  }
};

export const getSingleShowById = async (req: Request, res: Response) => {
  try {
    const showId = req.params.id;
    const showRepository = new ShowRepository();

    const show = await showRepository.findOne({
      where: { id: showId },
      relations: ['artist', 'rsvps']
    });

    if (!show) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Show not found'
      });
    }

    const responseData = {
      id: show.id,
      title: show.title,
      description: show.description,
      location: show.location,
      date: show.date,
      ticketPrice: show.ticketPrice,
      availableTickets: show.availableTickets,
      artist: {
        id: show.artist.id,
        name: show.artist.name,
        genre: show.artist.genre,
        bio: show.artist.bio
      },
      rsvpCount: show.rsvps.length,
      createdAt: show.createdAt,
      updatedAt: show.updatedAt
    };

    return res.json({
      message: 'Show details fetched successfully',
      data: responseData
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error'
    });
  }
};

export const getAllShows = async (req: Request, res: Response): Promise<void> => {
  try {
    const showRepo = new ShowRepository();
    const artistRepo = new ArtistRepository();

    const { page: pageNum, limit: limitNum } = getPaginationParams(req.query);
    const { artistId, from, to } = req.query;

    const filters: FindOptionsWhere<ShowEntity> = {};

    if (artistId) {
      const artistExists = await artistRepo.findById(artistId as string);
      if (!artistExists) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Artist not found' });
        return;
      }
      filters.artist = { id: artistId as string };
    }

    if (from && to) {
      filters.date = Between(new Date(from as string), new Date(to as string));
    } else if (from) {
      filters.date = MoreThanOrEqual(new Date(from as string));
    } else if (to) {
      filters.date = LessThanOrEqual(new Date(to as string));
    }

    const [shows, totalItems] = await showRepo.findAndCount(filters, pageNum, limitNum);

    const formatted = shows.map((show) => ({
      id: show.id,
      artistId: show.artist.id,
      title: show.title,
      location: show.location,
      date: show.date,
      ticketPrice: show.ticketPrice,
      availableTickets: show.availableTickets,
      artist: {
        name: show.artist.name,
        genre: show.artist.genre
      }
    }));

    res.json({
      message: 'Shows fetched successfully',
      data: {
        items: formatted,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalItems / limitNum),
          totalItems
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching shows:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};
