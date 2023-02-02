import { ErrorRequestHandler, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from './index.js';

export const sendErrorToProduction = (
  { isOperational, statusCode, status, message }: AppError,
  request: Request,
  response: Response,
): void => {
  if (request.originalUrl.startsWith('/api')) {
    //Programing or unknown error, do not leak data to client
    if (!isOperational) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Something went wrong.',
      });
      return;
    }

    //Operational Error, Trusted Errors
    response.status(statusCode).json({
      status,
      message,
    });
  }
};

const sendErrorToDevelopment = (
  { statusCode, status, message, stack }: AppError,
  request: Request,
  response: Response,
): void => {
  if (request.originalUrl.startsWith('/api')) {
    response.status(statusCode).json({
      status,
      statusCode,
      message,
      stack,
    });
    return;
  }
};

export const globalErrorMiddleware: ErrorRequestHandler = (
  error: AppError,
  request,
  response,
  next,
) => {
  const { statusCode, status } = error;

  error.statusCode = statusCode ?? 500;
  error.status = status ?? 'error';

  switch (process.env.NODE_ENV) {
    case 'development':
      sendErrorToDevelopment(error, request, response);
      break;

    case 'production':
    default:
      sendErrorToProduction(error, request, response);
      break;
  }

  next();
};

//   //View
//   //Programing or unknown error, do not leak data to client
//   if (!isOperational) {
//     return response.status(statusCode).render('error', {
//       title: 'Something went wrong',
//       message: 'Please try again later.',
//     });
//   }

//   //Operational Error
//   response.status(statusCode).render('error', {
//     title: 'Something went wrong',
//     message,
//   });
