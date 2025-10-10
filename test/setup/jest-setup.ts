import { testDatabaseConfig } from '../../src/database';

import { setupPostgresContainer } from './testcontainer';

import type { PostgresConfig } from './testcontainer';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const postgresConfig = testDatabaseConfig as PostgresConnectionOptions;

const connectionConfig: PostgresConfig = {
  username: postgresConfig.username!,
  password: postgresConfig.password as string,
  port: postgresConfig.port!,
  database: postgresConfig.database!
};

export default async () => {
  await setupPostgresContainer(connectionConfig);
};
