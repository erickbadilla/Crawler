import { format } from 'winston';

const { timestamp, colorize, errors } = format;

export type T_COLORIZE_OPTIONS = Parameters<typeof colorize>[0];
export type T_TIMESTAMP_OPTIONS = Parameters<typeof timestamp>[0];
export type T_ERRORS_OPTIONS = Parameters<typeof errors>[0];

export interface I_BUILD_LOGGER_OPTIONS {
  colorOptions?: T_COLORIZE_OPTIONS;
  timestampOptions?: T_TIMESTAMP_OPTIONS;
  errorsOptions?: T_ERRORS_OPTIONS;
  metadata?: object;
}
