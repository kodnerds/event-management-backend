import crypto from 'node:crypto';

import { RsvpStatus } from '../enums';
import { PaymentRepository, RsvpRepository, ShowRepository, UserRepository } from '../repositories';
import { PaystackService } from '../services';
import { HTTP_STATUS } from '../utils/const';
import logger from '../utils/logger';

import type { AuthenticatedUser } from '../types';
import type { Request, Response } from 'express';

export const initiateShowPayment = async (req: Request, res: Response) => {
  try {
    const user = req.user as AuthenticatedUser;
    const { showId } = req.params;

    const showRepository = new ShowRepository();
    const rsvpRepository = new RsvpRepository();
    const paymentRepository = new PaymentRepository();
    const userRepository = new UserRepository();
    const paystackService = new PaystackService();

    const userEntity = await userRepository.findById(user.id);
    const show = await showRepository.findOne({ where: { id: showId } });

    if (!show) return res.status(404).json({ message: 'Show not found' });

    if (show.ticketPrice! <= 0)
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: 'This show is free,no payment required' });

    const rsvp = await rsvpRepository.findOne({
      where: { user: { id: user.id }, show: { id: show.id } },
      relations: ['payment']
    });

    if (rsvp?.status === RsvpStatus.REGISTERED) {
      return res.status(HTTP_STATUS.CONFLICT).json({ message: 'Already registered and paid.' });
    }

    if (!userEntity) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'No user found' });

    const existingPayment = await paymentRepository.getUserActivePayment(user.id, show.id);
    if (existingPayment) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .json({ message: 'An active payment already exists for this RSVP.' });
    }

    const reference = `RSVP_${crypto.randomBytes(6).toString('hex')}`;

    const rsvpRecord = rsvp ?? (await rsvpRepository.create(userEntity));

    const payment = await paymentRepository.createPayment(userEntity, show, rsvpRecord, reference);

    const callbackUrl = `${process.env.BASE_URL}/api/v1/payments/paystack/webhook`;
    const paystackResponse = await paystackService.initializePayment(
      user.email,
      show.ticketPrice!,
      reference,
      callbackUrl
    );

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Payment initialized successfully',
      authorizationUrl: paystackResponse.authorization_url,
      reference: payment.reference
    });
  } catch (error) {
    logger.error(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: 'Payment initialization failed', error });
  }
};
