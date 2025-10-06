import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { PostgresConfig, setupPostgresContainer } from './testcontainer';
import { testDatabaseConfig } from '../../src/database';

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
