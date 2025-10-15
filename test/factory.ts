import { createServer } from 'node:http';

import express from 'express';
import supertest from 'supertest';

import { TestDataSource } from '../src/database';
import routes from '../src/routes';
import logger from '../src/utils/logger';

import type { Server } from 'node:http';
import type { DataSource } from 'typeorm';

export class TestFactory {
  private _app: express.Application;
  _connection: DataSource;
  private _server: Server;

  public get app(): supertest.Agent {
    return supertest(this._app);
  }

  public async init(): Promise<void> {
    await this.startup();
  }

  public async close(): Promise<void> {
    this._server.close();
    await this._connection.destroy();
  }

  public async reset(): Promise<void> {
    if (this._connection.isInitialized) {
      await this._connection.synchronize(true);
    }
  }

  private async startup(): Promise<void> {
    try {
      this._connection = TestDataSource;
      await this._connection.initialize();
      this._app = express();
      this._app.use(express.json());
      this._app.use(express.urlencoded({ extended: true }));
      this._app.use('/', routes);
      // Use port 0 for random available port
      this._server = createServer(this._app).listen(0);
    } catch (error) {
      logger.error('testing error', error);
    }
  }
}
