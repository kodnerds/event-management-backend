import { handleGetRepository } from '../database';
import { ShowEntity } from '../entities/ShowEntity';

import type { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';

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

  async findAndCount(
    filters: FindOptionsWhere<ShowEntity>,
    page: number,
    limit: number
  ): Promise<[ShowEntity[], number]> {
    return await this.repository.findAndCount({
      where: filters,
      relations: ['artist'],
      order: { date: 'ASC' },
      skip: (page - 1) * limit,
      take: limit
    });
  }

  async countRsvps(showId: string): Promise<number> {
    const show = await this.repository.findOne({
      where: { id: showId },
      relations: ['rsvps']
    });
    return show?.rsvps.length ?? 0;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
