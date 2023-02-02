import { createLogger, format, Logger, transports } from 'winston';

import { T_ERRORS_OPTIONS, T_TIMESTAMP_OPTIONS } from '../types/index.js';

const { combine, timestamp, errors, json } = format;

const TIMESTAMP_DEFAULT_OPTIONS: T_TIMESTAMP_OPTIONS = {
  format: 'YYYY-MM-DD HH:mm:ss',
};
const ERRORS_DEFAULT_OPTIONS: T_ERRORS_OPTIONS = {
  stack: true,
};

const JSON_DEFAULT_OPTIONS: Parameters<typeof json>[0] = {};

const DEFAULT_DEFAULT_METADATA: object = {
  service: 'Crawler',
};

//TODO: Change transport to be logged on database
export const buildProductionLogger = (): Logger => {
  return createLogger({
    format: combine(
      timestamp(TIMESTAMP_DEFAULT_OPTIONS),
      errors(ERRORS_DEFAULT_OPTIONS),
      json(JSON_DEFAULT_OPTIONS),
    ),
    defaultMeta: DEFAULT_DEFAULT_METADATA,
    transports: [new transports.Console()],
  });
};
