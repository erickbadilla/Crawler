import dotenv from 'dotenv';

dotenv.config();

import { logger } from './logger/index.js';
import app from './app.js';

process.on('uncaughtException', ({ name, message, stack }) => {
  logger.info(`
  Uncaught Exception 
  Shutting server down...`);

  logger.error(`
  Error: ${name}
  Message: ${message},
  Stack: ${stack}
  `);

  process.exit(1);
});

//Constants
const PORT = parseInt(process.env.PORT || '4000', 10);
const HOSTNAME = process.env.HOST_NAME || '127.0.0.1';
const ENVIRONMENT = process.env.NODE_ENV;

const server = app.listen(PORT, HOSTNAME, () => {
  logger.info(`
  Starting server on port: ${PORT} in ${HOSTNAME} on ${ENVIRONMENT}
  `);
});

process.on('SIGINT', () => {
  logger.info('Shutting down server');
  server.close(() => process.exit(1));
});

process.on('unhandledRejection', ({ name, message, stack }) => {
  logger.info(`
  Unhandled Rejection
  Shutting server down...
  `);

  logger.error(`
  Error: ${name}
  Message: ${message},
  Stack: ${stack}
  `);

  server.close(() => process.exit(1));
});
