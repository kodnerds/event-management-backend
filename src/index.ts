import express from 'express';
import {Request, Response} from 'express';
import 'dotenv/config';

const PORT = process.env.PORT || 3001;

export const main = async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (_: Request, res: Response) => {
    return res.send({message: 'Welcome to Event management API'})
  })

  app.listen(PORT, () => {
    console.info(`Server listening on port http://localhost:${PORT}`);
  });
}

main();
