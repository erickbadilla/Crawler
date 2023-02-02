import dotenv from 'dotenv';
dotenv.config();

import {
  createAppErrorDevelopment,
  createAppErrorProduction,
} from './error.util.js';

export { globalErrorMiddleware } from './error.controller.js';
export { sendErrorToProduction } from './error.controller.js';
export { AppError } from './error.model.js';

export const createAppError =
  process.env.NODE_ENV === 'development'
    ? createAppErrorDevelopment
    : createAppErrorProduction;
