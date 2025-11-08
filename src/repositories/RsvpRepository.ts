import { handleGetRepository } from '../database';
import { RsvpEntity } from '../entities';

import type { FindManyOptions, FindOneOptions, Repository, UpdateResult } from 'typeorm';

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

  async findAndCount(options: FindManyOptions<RsvpEntity>): Promise<[RsvpEntity[], number]> {
    const [records, count] = await this.repository.findAndCount(options);
    return [records, count];
  }

  async update(id: string, data: Partial<RsvpEntity>): Promise<UpdateResult> {
    return await this.repository.update(id, data);
  }
}
