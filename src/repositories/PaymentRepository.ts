import { handleGetRepository } from '../database';
import {
  PaymentEntity,
  PaymentProvider,
  PaymentStatus,
  type RsvpEntity,
  type ShowEntity,
  type UserEntity
} from '../entities';

import type { Repository } from 'typeorm';

export class PaymentRepository {
  private repository: Repository<PaymentEntity>;

  constructor() {
    this.repository = handleGetRepository(PaymentEntity);
  }

  async createPayment(
    user: UserEntity,
    shows: ShowEntity,
    rsvp: RsvpEntity,
    reference: string
  ): Promise<PaymentEntity> {
    const payment = this.repository.create({
      user,
      shows,
      rsvp,
      provider: PaymentProvider.PAYSTACK,
      reference,
      amount: shows.ticketPrice,
      status: PaymentStatus.PENDING
    });

    return await this.repository.save(payment);
  }

  async findByReference(reference: string): Promise<PaymentEntity | null> {
    return await this.repository.findOne({
      where: { reference },
      relations: ['rsvp', 'shows', 'user']
    });
  }

  async getUserActivePayment(userId: string, showId: string): Promise<PaymentEntity | null> {
    return await this.repository.findOne({
      where: {
        user: { id: userId },
        shows: { id: showId },
        status: PaymentStatus.PENDING
      },
      relations: ['rsvp', 'shows']
    });
  }
}
