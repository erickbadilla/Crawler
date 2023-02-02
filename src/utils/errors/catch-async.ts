import { NextFunction, Request, RequestHandler, Response } from 'express';

type T_ASYNC_REQUEST_HANDLER = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<Response | void>;

export const catchAsync =
  (callback: T_ASYNC_REQUEST_HANDLER): RequestHandler =>
  (req, res, next) =>
    callback(req, res, next).catch(next);
