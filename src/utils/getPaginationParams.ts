import { DEFAULT_LIMIT, DEFAULT_PAGE } from './const';

import type { Request } from 'express';

export const getPaginationParams = (query: Request['query']) => {
  const page = Math.max(DEFAULT_PAGE, parseInt(query.page as string, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, parseInt(query.limit as string, 10) || DEFAULT_LIMIT);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};
