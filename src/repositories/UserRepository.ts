import { handleGetRepository } from '../database';
import { UserEntity } from '../entities';

import type { Repository } from 'typeorm';

export class UserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = handleGetRepository(UserEntity);
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    const newUser = this.repository.create(user);
    return await this.repository.save(newUser);
  }

  async findByEmail(email:string):Promise<UserEntity | null>{
    return await this.repository.findOne({where:{email}})
  }

  async findById(id: string): Promise<UserEntity | null> {
    return await this.repository.findOneBy({ id });
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.repository.find();
  }
}
