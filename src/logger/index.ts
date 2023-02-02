import { buildDevelopmentLogger } from './development/development-logger.js';
import { buildProductionLogger } from './production/production-logger.js';

export const logger =
  process.env.NODE_ENV === 'development'
    ? buildDevelopmentLogger()
    : buildProductionLogger();
