import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entity/User";
import { createClient,RedisClientType } from "redis";

describe('User caching (PostgreSQL + Redis)', () => {
  let redisClient:RedisClientType;

  beforeAll(async () => {
    await AppDataSource.initialize();

    redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    await redisClient.connect();
  });

  afterAll(async () => {
    await redisClient.quit()
    await AppDataSource.destroy();
  });

  it('should store and retrieve a cached user', async () => {
    const repo = AppDataSource.getRepository(User);

    const newUser = repo.create({firstName: 'Craven', lastName: 'Hunter',age:4});
    await repo.save(newUser);

    await redisClient.set(`user:${newUser.id}`, JSON.stringify(newUser));

    const cached = await redisClient.get(`user:${newUser.id}`);
    const parsed = cached ? JSON.parse(cached) : null;

    expect(parsed).toBeDefined();
    expect(parsed.email).toBe('jane@example.com');
  });
});