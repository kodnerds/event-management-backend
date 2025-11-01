import { handleGetRepository } from '../database';
import { ShowEntity } from '../entities/ShowEntity';

import type { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';

export class ShowRepository {
  private repository: Repository<ShowEntity>;

  constructor() {
    this.repository = handleGetRepository(ShowEntity);
  }

  getRepository(): Repository<ShowEntity> {
    return this.repository;
  }

  async create(show: Partial<ShowEntity>): Promise<ShowEntity> {
    const newShow = this.repository.create(show);
    return await this.repository.save(newShow);
  }

  async findOne(options: FindOneOptions<ShowEntity>): Promise<ShowEntity | null> {
    return await this.repository.findOne(options);
  }

  async update(id: string, data: Partial<ShowEntity>): Promise<void> {
    await this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByIdWithRelations(id: string): Promise<ShowEntity | null> {
    return await this.repository.findOne({ where: { id }, relations: ['artist', 'rsvps'] });
  }

  async hasRsvpsOrPayments(id: string): Promise<boolean> {
    // Payments not yet implemented; check RSVPs only
    const show = await this.repository.findOne({ where: { id }, relations: ['rsvps'] });
    return !!show && Array.isArray(show.rsvps) && show.rsvps.length > 0;
  }

  async softCancel(id: string): Promise<void> {
    await this.repository.update(id, { isCancelled: true });
  }

  async hardDelete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
