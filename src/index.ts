import express, { Request, Response } from 'express';

import envConfig from './config/envConfig';
import { AppDataSource } from './database';
import appRoutes from './routes';
import logger from './utils/logger';

const PORT = envConfig.PORT;

export const main = async () => {
  try {
    await AppDataSource.initialize();
    // eslint-disable-next-line no-console
    console.info('Database connection established successfully 🚀');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize AppDataSource:', error);
  }
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (_: Request, res: Response) =>
    res.send({ message: 'Welcome to Event management API' })
  );

  app.use('/api/v1', appRoutes);

  app.listen(PORT, () => {
    logger.info(`Server listening on port http://localhost:${PORT}`);
  });
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});
