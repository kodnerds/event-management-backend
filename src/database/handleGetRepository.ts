import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { AppDataSource, TestDataSource } from './data-source';
import envConfig from '../config/envConfig';

export const handleGetRepository = <T extends ObjectLiteral>(
  entity: EntityTarget<T>
): Repository<T> =>
  envConfig.isTest
    ? TestDataSource.manager.getRepository(entity)
    : AppDataSource.manager.getRepository(entity);
