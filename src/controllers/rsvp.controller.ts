import { RsvpRepository, ShowRepository } from '../repositories';
import { HTTP_STATUS } from '../utils/const';
import { getPaginationParams } from '../utils/getPaginationParams';
import logger from '../utils/logger';

import type { Request, Response } from 'express';

const validateShowAndTickets = async (showId: string, showRepository: ShowRepository) => {
  const show = await showRepository.findOne({
    where: { id: showId },
    relations: ['rsvps']
  });

  if (!show) {
    return { error: 'Show does not exist', show: null };
  }

  if (typeof show.availableTickets === 'number' && show.availableTickets <= 0) {
    return { error: 'Show is sold out', show: null };
  }

  return { error: null, show };
};

export const createRsvp = async (req: Request, res: Response) => {
  try {
    const { showId } = req.params;
    const user = req.user!;

    const showRepository = new ShowRepository();
    const rsvpRepository = new RsvpRepository();

    const { error: showError, show } = await validateShowAndTickets(showId, showRepository);
    if (showError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: showError });
    }

    const existingRsvp = await rsvpRepository.findOne({
      where: { userId: user.id, showId }
    });

    if (existingRsvp) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        message: 'User already registered for this show'
      });
    }

    if (typeof show!.availableTickets === 'number') {
      await showRepository.update(show!.id, {
        availableTickets: show!.availableTickets - 1
      });
    }

    const newRsvp = await rsvpRepository.create({
      userId: user.id,
      showId,
      status: 'REGISTERED'
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'RSVP successful',
      data: {
        id: newRsvp.id,
        userId: newRsvp.userId,
        showId: newRsvp.showId,
        status: newRsvp.status
      }
    });
  } catch (error) {
    logger.error('Error creating RSVP', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Server error'
    });
  }
};

export const getRsvpForShow = async (req: Request, res: Response) => {
  try {
    const showRepository = new ShowRepository();
    const rsvpRepository = new RsvpRepository();

    const { page, limit, offset } = getPaginationParams(req.query);
    const showId = req.params.id;

    const [show, [rsvped, totalCount]] = await Promise.all([
      showRepository.findOne({
        where: { id: showId },
        relations: ['artist']
      }),
      rsvpRepository.findAndCount({
        where: { show: { id: showId } },
        relations: ['user'],
        skip: offset,
        take: limit,
        order: { createdAt: 'DESC' }
      })
    ]);

    if (!show) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Show not found' });

    if (rsvped.length === 0)
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'No RSVPs found for this show' });

    const formattedResponse = rsvped.map((rsvp) => ({
      id: rsvp.id,
      user: {
        id: rsvp.user.id,
        name: `${rsvp.user.firstName} ${rsvp.user.lastName}`,
        email: rsvp.user.email
      },
      status: rsvp.status,
      createdAt: rsvp.createdAt
    }));

    return res.status(HTTP_STATUS.OK).json({
      message: 'RSVPs fetched successfully',
      data: {
        page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        records: formattedResponse
      }
    });
  } catch (error) {
    logger.error('Error fetching RSVPs:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};
