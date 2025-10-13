import { Repository } from 'typeorm';

import { handleGetRepository } from '../database';
import { Artist } from '../entities';

export class ArtistRepository {
  private repository: Repository<Artist>;

  constructor() {
    this.repository = handleGetRepository(Artist);
  }
  
  // ✅ Save (Create or Update)
  async save(artist: Partial<Artist>): Promise<Artist> {
    const newArtist = this.repository.create(artist);
    return await this.repository.save(newArtist);
  }


  async create(artist: Partial<Artist>): Promise<Artist> {
    const newArtist = this.repository.create(artist);
    return await this.repository.save(newArtist);
  }

  async findById(id: string): Promise<Artist | null> {
    return await this.repository.findOneBy({ id });
  }

  async findAll(): Promise<Artist[]> {
    return await this.repository.find();
  }

  async findOne(email: Partial<Artist>): Promise<Artist> {
    return await this.repository.findOne(email)
  }
}
