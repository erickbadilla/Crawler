import { Express } from 'express';

import crawlerRouter from '../crawler/crawler.router.js';
import { apiV1Builder } from '../utils/routes/build-route.util.js';

import { T_ROUTE } from './types/index.js';

const ROUTES: T_ROUTE = [[apiV1Builder('crawler'), crawlerRouter]];

export const addV1Routes = (app: Express): void => {
  ROUTES.forEach(([route, router]) => app.use(route, router));
};
