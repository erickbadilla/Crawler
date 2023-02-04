import { StatusCodes } from 'http-status-codes';

import {
  createRedirectReportStream,
  createMatchReport,
} from '../report/index.js';

import { catchAsync } from '../utils/errors/index.js';

import {
  MatchWebPagesByPredicateSchemaRequest,
  UrlsRedirectReportSchemaRequest,
  UrlsWebCrawlDataReportSchemaRequest,
} from './crawler.model.js';
import { CrawlerService } from './crawler.service.js';

export const createRedirectUrlsReport = catchAsync(async (req, res) => {
  const { links, userAgent, browser, options } =
    await UrlsRedirectReportSchemaRequest.parseAsync(req.body);

  const crawlerService = new CrawlerService({ browser, userAgent });

  await crawlerService.initService();

  const linksReport = await crawlerService.checkLinksRedirects({
    links,
    options,
  });

  await crawlerService.closeBrowser();

  return res.status(StatusCodes.OK).json({
    linksReport,
    userAgent,
    browser,
  });
});

export const createRedirectUrlsExcelReport = catchAsync(async (req, res) => {
  const { links, userAgent, browser, options } =
    await UrlsRedirectReportSchemaRequest.parseAsync(req.body);

  const crawlerService = new CrawlerService({ browser, userAgent });

  await crawlerService.initService();

  const linksReport = await crawlerService.checkLinksRedirects({
    links,
    options,
  });

  const { filename, stream } = await createRedirectReportStream(linksReport);

  await crawlerService.closeBrowser();

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${encodeURIComponent(
      filename.replaceAll(/ /g, '_'),
    )}`,
  );

  stream.pipe(res).on('finish', () => {
    res.status(StatusCodes.OK).end();
  });
});

export const createWebScrawlDataReport = catchAsync(async (req, res) => {
  const {
    browser,
    links,
    userAgent,
    dataExtractorFunction,
    keepFalsyData,
    options,
  } = await UrlsWebCrawlDataReportSchemaRequest.parseAsync(req.body);

  const crawlerService = new CrawlerService({ browser, userAgent });

  await crawlerService.initService();

  const report = await crawlerService.crawlPagesForData({
    links,
    dataExtractorFunction,
    keepFalsyData,
    options,
  });

  await crawlerService.closeBrowser();

  return res.status(StatusCodes.OK).json({
    browser: crawlerService.browserName,
    userAgent: crawlerService.userAgent,
    report,
  });
});

export const matchWebPagesByPredicateReport = catchAsync(async (req, res) => {
  const {
    browser,
    links,
    userAgent,
    predicateFunction,
    keepNonMatchingPages,
    options,
  } = await MatchWebPagesByPredicateSchemaRequest.parseAsync(req.body);

  const crawlerService = new CrawlerService({ browser, userAgent });

  await crawlerService.initService();

  const report = await crawlerService.matchPagesByPredicate({
    links,
    predicateFunction,
    keepNonMatchingPages,
    options,
  });

  return res.status(StatusCodes.OK).json({
    browser: crawlerService.browserName,
    userAgent: crawlerService.userAgent,
    report,
  });
});

export const matchWebPagesByPredicateExcelReport = catchAsync(
  async (req, res) => {
    const {
      links,
      userAgent,
      browser,
      predicateFunction,
      keepNonMatchingPages,
      options,
    } = await MatchWebPagesByPredicateSchemaRequest.parseAsync(req.body);

    const crawlerService = new CrawlerService({ browser, userAgent });

    await crawlerService.initService();

    const linksReport = await crawlerService.matchPagesByPredicate({
      links,
      predicateFunction,
      keepNonMatchingPages,
      options,
    });

    const { filename, stream } = await createMatchReport(linksReport);

    await crawlerService.closeBrowser();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(
        filename.replaceAll(/ /g, '_'),
      )}`,
    );

    stream.pipe(res).on('finish', () => {
      res.status(StatusCodes.EXPECTATION_FAILED).end();
    });
  },
);
