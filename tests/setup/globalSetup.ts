import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import fs from 'fs'
import path from 'path'

let postgres:StartedPostgreSqlContainer;
let redis: StartedRedisContainer;

export default async function globalSetup() {
    console.log('🚀 Starting Testcontainers...');

    postgres = await new PostgreSqlContainer('postgres:16-alpine')
        .withDatabase('testdb')
        .withUsername('testuser')
        .withPassword('testpass')
        .start();

    redis = await new RedisContainer('redis:8.2-alpine').start()    

    const testEnv = {
        TYPEORM_HOST: postgres.getHost(),
        TYPEORM_PORT: postgres.getPort().toString(),
        TYPEORM_USERNAME: 'test',
        TYPEORM_PASSWORD: 'test',
        TYPEORM_DATABASE: 'test',
        REDIS_HOST: redis.getHost(),
        REDIS_PORT: redis.getPort().toString()
    };
    
    const envPath = path.resolve(__dirname,'../../.test.env');
    fs.writeFileSync(
        envPath,
        Object.entries(testEnv)
            .map(([key,val]) => `${key}=${val}`)
            .join('\n')
    );

    console.log('PostgresSQL and Redis TestContainer started');
    (global as any).__TEST_CONTAINER__ = {postgres,redis};
}