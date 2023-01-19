import playwright, { Browser, LaunchOptions, Page, Response } from 'playwright';
import UserAgent from 'user-agents';

import { chunkifyArray } from '../utils/arrays/chunk.js';
import type { Range } from '../utils/typescript/numbers/range.js';

export type TBrowserType = 'chromium' | 'firefox' | 'webkit';

interface ICrawelerServiceConstructor {
  userAgent?: string;
  browser?: TBrowserType;
}

interface IOpenPageOptions {
  userAgent?: string;
}

interface INavigateToLinkOptions {
  link: string;
  page: Page;
  options?: {
    timeoutMS?: number;
    waitUntil?: 'networkidle' | 'domcontentloaded' | 'load' | 'commit';
  };
}

interface INavigateMultiplePagesOptions {
  links: string[];
  userAgent?: string;
  threads: Range<2, 26>;
}

interface INavigateStatus {
  status: number;
  link: string;
  error?: Error;
}

interface ICheckLinkRedirects extends INavigateStatus {
  redirects: INavigateStatus[];
}

interface ICrawlWebPagesOptions {
  links: string[];
  threads: Range<2, 26>;
  evaluatorFunction: () => unknown;
}

interface ICrawlPages {
  data: unknown;
  error?: Error;
}

export class CrawelerService {
  private static UA = new UserAgent();

  private readonly USER_AGENT: string;
  private readonly BROWSER_NAME: TBrowserType;
  private BROWSER: Browser;

  constructor({ userAgent, browser }: ICrawelerServiceConstructor) {
    this.USER_AGENT = userAgent ?? CrawelerService.UA.random().toString();
    this.BROWSER_NAME = browser ?? 'chromium';
  }

  public async initService(
    options: LaunchOptions = { headless: true },
  ): Promise<void> {
    this.BROWSER = await playwright[this.BROWSER_NAME].launch(options);
  }

  public async openPage({ userAgent }: IOpenPageOptions = {}): Promise<Page> {
    return this.BROWSER.newPage({
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
  }: INavigateToLinkOptions): Promise<Response> {
    return await page.goto(link, { waitUntil: 'networkidle', ...options });
  }

  public async crawlPages({
    links,
    threads,
    evaluatorFunction: evaluateFunction,
  }: ICrawlWebPagesOptions): Promise<ICrawlPages[]> {
    const linkChunks = chunkifyArray(links, threads);

    const linksToBeProcessed = linkChunks.map(async (linkBucket) => {
      const page = await this.openPage();
      const pagesPerBucket: ICrawlPages[] = [];

      for (let i = 0; i < linkBucket.length; i++) {
        const link = linkBucket[i];

        try {
          await this.navigateToLink({ link, page });
          const data = await page.evaluate(evaluateFunction);

          pagesPerBucket.push({
            data,
          });
        } catch (error) {
          pagesPerBucket.push({ data: null, error });
        }
      }

      page.close();

      return pagesPerBucket;
    });

    return (await Promise.all(linksToBeProcessed)).flat();
  }

  public async checkLinksRedirects({
    links,
    threads,
  }: INavigateMultiplePagesOptions): Promise<ICheckLinkRedirects[]> {
    const linkChunks = chunkifyArray(links, threads);

    const linksToBeProcessed = linkChunks.map(async (linkBucket) => {
      const page = await this.openPage();

      const pagesPerBucket: ICheckLinkRedirects[] = [];

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
          });

          pagesPerBucket.push({
            status: linkStatus ?? navigationStatus.status(),
            link,
            error: null,
            redirects,
          });
        } catch (error) {
          //Add status when something breaks
          pagesPerBucket.push({ status: 500, link, error, redirects: [] });
        }
      }

      page.close();

      return pagesPerBucket;
    });
    return (await Promise.all(linksToBeProcessed)).flat();
  }

  public async closeBrowser(): Promise<void> {
    await this.BROWSER.close();
  }
}
