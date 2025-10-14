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

  async findAll(): Promise<ArtistEntity[]> {
    return await this.repository.find();
  }

  async findOne(options: FindOneOptions<ArtistEntity>): Promise<ArtistEntity | null> {
    return await this.repository.findOne(options);
  }
}
