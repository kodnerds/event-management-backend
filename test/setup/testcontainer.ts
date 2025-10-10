import { PostgreSqlContainer } from '@testcontainers/postgresql';

import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export interface PostgresConfig {
  username: string;
  password: string;
  port: number;
  database: string;
}

let container: StartedPostgreSqlContainer | null = null;
const CONTAINER_NAME = 'test-postgres-container';
const CONTAINER_IMAGE = 'postgres:16-alpine';

export const setupPostgresContainer = async (
  config: PostgresConfig
): Promise<StartedPostgreSqlContainer> => {
  const { username, password, port, database } = config;

  container = await new PostgreSqlContainer(CONTAINER_IMAGE)
    .withName(CONTAINER_NAME)
    .withLabels({
      'test-container': CONTAINER_NAME
    })
    .withUsername(username)
    .withPassword(password)
    .withDatabase(database)
    .withExposedPorts({
      container: 5432,
      host: port
    })
    .withEnvironment({ NODE_ENV: 'test' })
    .start();

  return container;
};

export const removePostgresContainer = async (): Promise<void> => {
  if (container) {
    await container.stop();
    container = null;
  }
};
