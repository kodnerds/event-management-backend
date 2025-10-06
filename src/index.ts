import express, { Request, Response } from 'express';
import 'dotenv/config';

const PORT = process.env.PORT ?? 3001;

export const main = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (_: Request, res: Response) =>
    res.send({ message: 'Welcome to Event management API' })
  );

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.info(`Server listening on port http://localhost:${PORT}`);
  });
};

main();
