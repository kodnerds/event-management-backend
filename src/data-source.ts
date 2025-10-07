import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: path.resolve(__dirname, "../.test.env") });
} else {
  dotenv.config();
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host:  process.env.TYPEORM_HOST || 'localhost',
  port: Number(process.env.TYPEORM_PORT) || 5432,
  username: process.env.TYPEORM_USERNAME || 'test',
  password: process.env.TYPEORM_PASSWORD || 'test',
  database: process.env.TYPEORM_DATABASE || 'test',
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: []
});
