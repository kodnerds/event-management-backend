import { handleGetRepository } from '../database';
import { RsvpEntity } from '../entities';

import type { FindOneOptions, Repository } from 'typeorm';

export class RsvpRepository {
  private repository: Repository<RsvpEntity>;

  constructor() {
    this.repository = handleGetRepository(RsvpEntity);
  }

  async create(rsvp: Partial<RsvpEntity>): Promise<RsvpEntity> {
    const newRsvp = this.repository.create(rsvp);
    return await this.repository.save(newRsvp);
  }

  async findOne(options: FindOneOptions<RsvpEntity>): Promise<RsvpEntity | null> {
    return await this.repository.findOne(options);
  }
}
