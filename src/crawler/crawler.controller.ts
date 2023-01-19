import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import {
  UrlsRedirectReportSchemaRequest,
  UrlsWebCrawlReportSchemaRequest,
} from './crawler.model.js';
import { CrawelerService } from './crawler.service.js';

export const createRedirectUrlsReport: RequestHandler = async (req, res) => {
  const { links, userAgent, browser } =
    await UrlsRedirectReportSchemaRequest.parseAsync(req.body);

  const crawlerService = new CrawelerService({ browser, userAgent });

  await crawlerService.initService();

  const linksReport = await crawlerService.checkLinksRedirects({
    links,
    threads: 4, //Threads make it optimal for the length of the array.
  });

  await crawlerService.closeBrowser();

  return res.status(StatusCodes.OK).json({
    linksReport,
    userAgent,
    browser,
  });
};

export const createWebScrawlReport: RequestHandler = async (req, res) => {
  const { browser, links, userAgent, evaluatorFunction } =
    await UrlsWebCrawlReportSchemaRequest.parseAsync(req.body);

  const crawlerService = new CrawelerService({ browser, userAgent });

  await crawlerService.initService();

  const linksReport = await crawlerService.crawlPages({
    links,
    evaluatorFunction,
    threads: 8,
  });

  return res.status(StatusCodes.OK).json({
    linksReport,
    userAgent,
    browser,
  });
};

export const createUrlsExcelReport: RequestHandler = async (req, res) => {
  const { links, userAgent, browser } =
    await UrlsRedirectReportSchemaRequest.parseAsync(req.body);

  //Generate excel stream;

  return res.status(StatusCodes.OK).json({
    links,
    userAgent,
    browser,
  });
};
