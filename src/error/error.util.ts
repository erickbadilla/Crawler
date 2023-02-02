import {
  AppError,
  IAppErrorDevelopment,
  IAppErrorProduction,
} from './error.model.js';

type AppErrorConstructorParameters = ConstructorParameters<typeof AppError>;

export const createAppErrorProduction = ([
  message,
  status,
]: AppErrorConstructorParameters): IAppErrorProduction => {
  return {
    message,
    status: `${status}`.startsWith('4') ? 'fail' : 'error',
  };
};

export const createAppErrorDevelopment = (
  options: AppErrorConstructorParameters,
): Partial<IAppErrorDevelopment> => {
  const { name, message, status, statusCode, stack } = new AppError(...options);

  return {
    name,
    message,
    status,
    statusCode,
    stack,
  };
};
