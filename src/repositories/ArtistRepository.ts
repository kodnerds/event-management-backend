import { handleGetRepository } from '../database';
import { ArtistEntity } from '../entities';

import type { FindOneOptions, Repository } from 'typeorm';

export class ArtistRepository {
  private repository: Repository<ArtistEntity>;

  constructor() {
    this.repository = handleGetRepository(ArtistEntity);
  }

  async create(artist: Partial<ArtistEntity>): Promise<ArtistEntity> {
    const newArtist = this.repository.create(artist);
    return await this.repository.save(newArtist);
  }

  async findById(id: string): Promise<ArtistEntity | null> {
    return await this.repository.findOneBy({ id });
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
  }): Promise<Omit<ArtistEntity, 'password'>[]> {
    const { skip = 0, take = 10 } = options ?? {};

    const artists = await this.repository.find({
      skip,
      take,
      order: { createdAt: 'DESC' }
    });

    return artists.map(({ password, ...artist }) => artist);
  }

  async findOne(options: FindOneOptions<ArtistEntity>): Promise<ArtistEntity | null> {
    return await this.repository.findOne(options);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async findAndUpdate(id: string, update: Partial<ArtistEntity>): Promise<ArtistEntity | null> {
    await this.repository.update(id, update);
    return await this.repository.findOneBy({ id });
  }
}
