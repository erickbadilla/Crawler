import { createLogger, format, Logger, transports } from 'winston';

import {
  T_COLORIZE_OPTIONS,
  T_ERRORS_OPTIONS,
  T_TIMESTAMP_OPTIONS,
} from '../types/index.js';

const { printf, combine, timestamp, colorize, errors } = format;

interface I_BUILD_DEV_LOGGER_OPTIONS {
  colorOptions?: T_COLORIZE_OPTIONS;
  timestampOptions?: T_TIMESTAMP_OPTIONS;
  errorsOptions?: T_ERRORS_OPTIONS;
  metadata?: object;
}

const COLORIZE_DEFAULT_OPTIONS: T_COLORIZE_OPTIONS = {};

const TIMESTAMP_DEFAULT_OPTIONS: T_TIMESTAMP_OPTIONS = {
  format: 'YYYY-MM-DD HH:mm:ss',
};
const ERRORS_DEFAULT_OPTIONS: T_ERRORS_OPTIONS = {
  stack: true,
};

const DEFAULT_DEFAULT_METADATA: object = {
  service: 'Crawler',
};

export const buildDevelopmentLogger = ({
  colorOptions = {},
  errorsOptions = {},
  timestampOptions = {},
  metadata,
}: I_BUILD_DEV_LOGGER_OPTIONS = {}): Logger => {
  const formatLog = printf(({ level, message, timestamp, stack }) => {
    return `
    Severity: ${level}
    Message: ${message}
    Occurred: ${timestamp}
    ${stack ? `Stack: ${stack}` : ''}
    `;
  });

  return createLogger({
    format: combine(
      colorize({ ...COLORIZE_DEFAULT_OPTIONS, ...colorOptions }),
      timestamp({ ...TIMESTAMP_DEFAULT_OPTIONS, ...timestampOptions }),
      errors({ ...ERRORS_DEFAULT_OPTIONS, ...errorsOptions }),
      formatLog,
    ),
    defaultMeta: DEFAULT_DEFAULT_METADATA ?? metadata,
    transports: [new transports.Console()],
  });
};
