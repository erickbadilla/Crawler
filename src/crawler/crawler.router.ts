import { Router } from 'express';

import * as crawlController from './crawler.controller.js';

const router = Router();

router.post('/scan', crawlController.createWebScrawlDataReport);

router.post('/status', crawlController.createRedirectUrlsReport);

router.post('/status-report', crawlController.createRedirectUrlsExcelReport);

router.post('/match', crawlController.matchWebPagesByPredicateReport);

export default router;
