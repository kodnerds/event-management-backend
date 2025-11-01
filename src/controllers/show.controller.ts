import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { ArtistRepository, ShowRepository } from '../repositories';
import { HTTP_STATUS } from '../utils/const';
import { getPaginationParams } from '../utils/getPaginationParams';
import logger from '../utils/logger';

import type { ShowEntity } from '../entities/ShowEntity';
import type { Request, Response } from 'express';
import type { FindOptionsWhere } from 'typeorm';

interface FormattedShow {
  id: string;
  artistId: string;
  title: string;
  location: string;
  date: Date;
  ticketPrice: number;
  availableTickets: number | null;
  artist: {
    name: string;
    genre: string | null;
  };
}

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

export const getAllShows = async (req: Request, res: Response): Promise<void> => {
  try {
    const showRepo = new ShowRepository();
    const artistRepo = new ArtistRepository();

    const { page = '1', limit = '10', artistId, from, to } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (isInvalidPagination(pageNum, limitNum)) {
      res.status(400).json({ message: 'Invalid pagination parameters' });
      return;
    }

    const filters = await buildFilters({
      artistRepo,
      artistId: artistId as string,
      from: from as string,
      to: to as string,
      res
    });

    if (!filters) return;

    const repository = showRepo.getRepository();
    const totalItems = await repository.count({ where: filters });

    const shows = await repository.find({
      where: filters,
      relations: ['artist'],
      order: { date: 'ASC' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum
    });

    const formatted: FormattedShow[] = shows.map((show: ShowEntity) => formatShow(show));

    res.status(200).json({
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

const isInvalidPagination = (pageNum: number, limitNum: number): boolean =>
  isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1;

interface BuildFiltersParams {
  artistRepo: ArtistRepository;
  artistId?: string;
  from?: string;
  to?: string;
  res?: Response;
}

const buildFilters = async ({
  artistRepo,
  artistId,
  from,
  to,
  res
}: BuildFiltersParams): Promise<FindOptionsWhere<ShowEntity> | null> => {
  const filters: FindOptionsWhere<ShowEntity> = {};

  if (artistId) {
    const artistExists = await artistRepo.findById(artistId);
    if (!artistExists) {
      res?.status(400).json({ message: 'Artist not found' });
      return null;
    }
    filters.artist = { id: artistId };
  }

  if (from && to) filters.date = Between(new Date(from), new Date(to));
  else if (from) filters.date = MoreThanOrEqual(new Date(from));
  else if (to) filters.date = LessThanOrEqual(new Date(to));

  return filters;
};

const formatShow = (show: ShowEntity): FormattedShow => ({
  id: show.id,
  artistId: show.artist.id,
  title: show.title,
  location: show.location,
  date: show.date,
  ticketPrice: show.ticketPrice ?? 0,
  availableTickets: show.availableTickets ?? null,
  artist: {
    name: show.artist.name,
    genre: show.artist.genre.join(', ')
  }
});

export const deleteShow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidV4Regex.test(id)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid show id' });
      return;
    }

    const showRepository = new ShowRepository();
    const show = await showRepository.findByIdWithRelations(id);
    if (!show) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Show not found' });
      return;
    }

    const isOwner = show.artistId === user.id;
    const isAdmin = user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ message: 'Forbidden' });
      return;
    }

    const hasRsvps = await showRepository.hasRsvpsOrPayments(id);
    if (hasRsvps) {
      await showRepository.softCancel(id);
      res.status(HTTP_STATUS.OK).json({
        message: 'Show cancelled successfully',
        data: {
          id: show.id,
          title: show.title,
          isCancelled: true
        }
      });
      return;
    }

    await showRepository.hardDelete(id);
    res.status(HTTP_STATUS.OK).json({ message: 'Show deleted successfully' });
  } catch (error) {
    logger.error('Error deleting show:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};
