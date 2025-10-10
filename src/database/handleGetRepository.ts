import envConfig from '../config/envConfig';

import { AppDataSource, TestDataSource } from './data-source';

import type { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export const handleGetRepository = <T extends ObjectLiteral>(
  entity: EntityTarget<T>
): Repository<T> =>
  envConfig.isTest
    ? TestDataSource.manager.getRepository(entity)
    : AppDataSource.manager.getRepository(entity);
