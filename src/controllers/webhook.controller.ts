import crypto from 'node:crypto';

import { PaymentStatus } from '../entities';
import { PaymentRepository, RsvpRepository, ShowRepository } from '../repositories';
import { HTTP_STATUS } from '../utils/const';
import logger from '../utils/logger';

import type { Request, Response } from 'express';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET!;

export const paystackWebook = async (req: Request, res: Response) => {
  try {
    const paymentRepository = new PaymentRepository();

    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature'])
      return res.status(401).json({ message: 'Invalid webhook signature' });

    const event = req.body;
    const reference = event.data.reference;

    const payment = await paymentRepository.findByReference(reference);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const rsvpRepository = new RsvpRepository();
    const showRepository = new ShowRepository();

    if (event.event === 'charge.success') {
      await paymentRepository.updateStatus(payment, PaymentStatus.SUCCESS);
      await rsvpRepository.update(payment.rsvp);
      await showRepository.update(payment.shows);
    }
  } catch (error) {
    logger.error('Webhook error', error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: 'Webhook processing failed', error });
  }
};
