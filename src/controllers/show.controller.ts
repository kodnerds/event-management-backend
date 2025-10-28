import { ShowRepository } from '../repositories';
import { HTTP_STATUS } from '../utils/const';
import logger from '../utils/logger';

import type { Request, Response } from 'express';

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
