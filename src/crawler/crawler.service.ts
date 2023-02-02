import playwright, { Browser, LaunchOptions, Page, Response } from 'playwright';
import UserAgent from 'user-agents';

import { createAppError } from '../error/index.js';
import { logger } from '../logger/index.js';
import { chunkArray } from '../utils/arrays/index.js';

export type TBrowserType = 'chromium' | 'firefox' | 'webkit';

interface ICrawlerServiceConstructor {
  userAgent?: string;
  browser?: TBrowserType;
}

interface IOpenPageOptions {
  userAgent?: string;
}

interface INavigateOptions {
  timeoutMS?: number;
  waitUntil?: 'networkidle' | 'domcontentloaded' | 'load' | 'commit';
}

interface INavigateToLink {
  link: string;
  page: Page;
  options?: INavigateOptions;
}

interface INavigateStatus {
  status: number;
  link: string;
  error?: ReturnType<typeof createAppError>;
}

interface ICrawlerPageOptions {
  options: INavigateOptions & { threads: number };
}

interface ICheckLinksRedirect extends ICrawlerPageOptions {
  links: string[];
}

export interface ICheckLinkRedirectsReturn extends INavigateStatus {
  redirects: INavigateStatus[];
}

interface ICrawlWebPages extends ICrawlerPageOptions {
  links: string[];
  dataExtractorFunction: string;
  keepFalsyData: boolean;
}

interface ICrawlPagesReturn {
  data: unknown;
  link: string;
  error?: unknown;
}

interface IMatchWebPages extends ICrawlerPageOptions {
  links: string[];
  predicateFunction: string;
  keepNonMatchingPages: boolean;
}

interface IMatchWebPagesReturn {
  link: string;
  matched: boolean;
  error?: unknown;
}

export class CrawlerService {
  private static UA = new UserAgent();

  private readonly USER_AGENT: string;
  private readonly BROWSER_NAME: TBrowserType;
  private BROWSER: Browser | undefined;

  constructor({ userAgent, browser }: ICrawlerServiceConstructor) {
    this.USER_AGENT = userAgent ?? CrawlerService.UA.random().toString();
    this.BROWSER_NAME = browser ?? 'chromium';
  }

  get userAgent(): string {
    return this.USER_AGENT;
  }

  get browserName(): string {
    return this.BROWSER_NAME;
  }

  public async initService(
    options: LaunchOptions = { headless: true },
  ): Promise<void> {
    this.BROWSER = await playwright[this.BROWSER_NAME].launch(options);
  }

  public async openPage({ userAgent }: IOpenPageOptions = {}): Promise<
    Page | undefined
  > {
    return this.BROWSER?.newPage({
      userAgent: userAgent ?? this.USER_AGENT,
    });
  }

  public async closePage(page: Page): Promise<void> {
    return await page.close();
  }

  public async navigateToLink({
    link,
    page,
    options = {},
  }: INavigateToLink): Promise<Response | null> {
    return await page.goto(link, { waitUntil: 'load', ...options });
  }

  public async matchPagesByPredicate({
    links,
    predicateFunction,
    keepNonMatchingPages,
    options,
  }: IMatchWebPages): Promise<IMatchWebPagesReturn[]> {
    const linkChunks = chunkArray(links, options.threads);

    const linksToBeProcessed = linkChunks.map(async (linkBucket) => {
      const page = await this.openPage();

      if (!page) {
        throw createAppError(['Could not process links', 500]);
      }

      const pagesPerBucket: IMatchWebPagesReturn[] = new Array(
        linkBucket.length,
      );

      for (let i = 0; i < linkBucket.length; i++) {
        const link = linkBucket[i];

        try {
          await this.navigateToLink({ link, page, options });
          const match = await page.evaluate(`(${predicateFunction})()`);

          if (!(typeof match === 'boolean')) {
            pagesPerBucket.push({
              link,
              matched: false,
              error: createAppError(['Function is not a predicate.', 404]),
            });
            continue;
          }

          if (keepNonMatchingPages) {
            pagesPerBucket.push({
              link,
              matched: match,
            });
            continue;
          }

          if (!match) {
            continue;
          }

          pagesPerBucket.push({
            link,
            matched: true,
          });
        } catch (error) {
          logger.error(error);
          pagesPerBucket.push({
            link,
            matched: false,
            error: createAppError(['Could not process link.', 500]),
          });
        }
      }

      page.close();

      return pagesPerBucket;
    });

    return (await Promise.all(linksToBeProcessed)).flat();
  }

  public async crawlPagesForData({
    links,
    dataExtractorFunction,
    keepFalsyData,
    options,
  }: ICrawlWebPages): Promise<ICrawlPagesReturn[]> {
    const linkChunks = chunkArray(links, options.threads);

    const linksToBeProcessed = linkChunks.map(async (linkBucket) => {
      const page = await this.openPage();

      if (!page) {
        throw createAppError(['Could not process links', 500]);
      }

      const pagesPerBucket: ICrawlPagesReturn[] = new Array(linkBucket.length);

      for (let i = 0; i < linkBucket.length; i++) {
        const link = linkBucket[i];

        try {
          await this.navigateToLink({ link, page, options });
          const data = await page.evaluate(`(${dataExtractorFunction})()`);

          if (keepFalsyData) {
            pagesPerBucket.push({
              data,
              link,
            });
            continue;
          }

          if (!data) {
            continue;
          }

          pagesPerBucket.push({
            data,
            link,
          });
        } catch (error) {
          logger.error(error);
          pagesPerBucket.push({
            data: null,
            error: createAppError(['Could not process link.', 500]),
            link,
          });
        }
      }

      page.close();

      return pagesPerBucket;
    });

    return (await Promise.all(linksToBeProcessed)).flat();
  }

  public async checkLinksRedirects({
    links,
    options: { threads, ...navigationOptions },
  }: ICheckLinksRedirect): Promise<ICheckLinkRedirectsReturn[]> {
    const linkChunks = chunkArray(links, threads);

    const linksToBeProcessed = linkChunks.map(async (linkBucket) => {
      const page = await this.openPage();

      if (!page) {
        throw createAppError(['Could not process links', 500]);
      }

      const pagesPerBucket: ICheckLinkRedirectsReturn[] = [];

      for (let i = 0; i < linkBucket.length; i++) {
        const link = linkBucket[i];

        try {
          const redirects: INavigateStatus[] = [];
          let linkStatus: number | undefined = undefined;

          page.on('response', (response) => {
            const pageStatus = response.status();
            const pageUrl = response.url();

            const originalLinkHostname = new URL(link).hostname;
            const linkHostname = new URL(pageUrl).hostname;

            if (
              originalLinkHostname === linkHostname &&
              (pageStatus === 200 || (pageStatus >= 300 && pageStatus < 400)) &&
              response.request().resourceType() === 'document'
            ) {
              //Avoid's the adding the first link, but keep the status
              if (link === pageUrl) {
                linkStatus = pageStatus;
                return;
              }

              redirects.push({
                link: pageUrl,
                status: pageStatus,
              });
            }
          });

          const navigationStatus = await this.navigateToLink({
            link,
            page,
            options: navigationOptions,
          });

          if (!navigationStatus) {
            throw createAppError(['Could not process link.', 500]);
          }

          pagesPerBucket.push({
            status: linkStatus ?? navigationStatus.status(),
            link,
            redirects,
          });
        } catch (error) {
          logger.error(error);
          pagesPerBucket.push({
            status: 500,
            link,
            error: createAppError(['Could not process link.', 500]),
            redirects: [],
          });
        }
      }

      page.close();

      return pagesPerBucket;
    });
    return (await Promise.all(linksToBeProcessed)).flat();
  }

  public async closeBrowser(): Promise<void> {
    await this.BROWSER?.close();
  }
}
