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

  async findOneBy({ email }: { email: string }): Promise<UserEntity | null> {
    return await this.repository.findOneBy({ email });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return await this.repository.findOneBy({ id });
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
  }): Promise<Omit<UserEntity, 'password'>[]> {
    const { skip = 0, take = 10 } = options ?? {};

    const users = await this.repository.find({
      skip,
      take,
      order: { createdAt: 'DESC' }
    });

    return users.map(({ password, ...user }) => user);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}
