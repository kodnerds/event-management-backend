import { handleGetRepository } from '../database';
import { ShowEntity } from '../entities/ShowEntity';

import type { FindOneOptions, Repository } from 'typeorm';

export class ShowRepository {
  private repository: Repository<ShowEntity>;

  constructor() {
    this.repository = handleGetRepository(ShowEntity);
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
}
