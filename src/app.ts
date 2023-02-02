import cookieParser, { CookieParseOptions } from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import express from 'express';
import rateLimit, { Options as RateLimitOptions } from 'express-rate-limit';
import hpp, { Options as HPPOptions } from 'hpp';
import morgan from 'morgan';
import xss from 'xss-clean';

import { AppError, globalErrorMiddleware } from './error/index.js';
import { addV1Routes } from './routes/v1.routes.js';

const app = express();

const CORS_OPTIONS: CorsOptions = {};

const RATE_LIMIT_OPTIONS: Partial<RateLimitOptions> = {
  max: 100,
  message: 'Too many request from this IP, please try again in an hour',
  windowMs: 3600000, //One hour
};

const JSON_PARSE_OPTIONS: Parameters<typeof express.json>[0] = {
  limit: '10kb',
};

const URL_ENCODED_OPTIONS: Parameters<typeof express.urlencoded>[0] = {
  extended: true,
  limit: '10kb',
};

const COOKIE_PARSER_OPTIONS: CookieParseOptions = {};

const HPP_OPTIONS: HPPOptions = {};

//Global Middleware

app.use(cors(CORS_OPTIONS));

app.use('/api', rateLimit(RATE_LIMIT_OPTIONS));

app.use(express.json(JSON_PARSE_OPTIONS));

app.use(express.urlencoded(URL_ENCODED_OPTIONS));

app.use(cookieParser(undefined, COOKIE_PARSER_OPTIONS));

app.use(hpp(HPP_OPTIONS));

app.use(xss());

app.use((req, _, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Development middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Routes
addV1Routes(app);

app.all('*', (req, _, next) =>
  next(new AppError(`Can't find ${req.originalUrl}`, 404)),
);

app.use(globalErrorMiddleware);

export default app;
