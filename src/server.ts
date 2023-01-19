import { CrawelerService } from './crawler/crawler.service.js';

const PAGES: string[] = [
  'https://zellwk.com/blog/async-await-in-loops/',
  'https://dev.to/captainyossarian/typescript-type-inference-on-function-arguments-2n93',
  'https://www.npmjs.com/package/user-agents',
  'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/group#:~:text=The%20group()%20method%20groups,can%20be%20represented%20by%20strings.',
  // 'https://quickbooks.intuit.com/accountants/offers/',
  // 'https://quickbooks.intuit.com/accountants/sandbox/aag-modal-content/',
];

const crawlerService = new CrawelerService({ browser: 'chromium' });

await crawlerService.initService({
  headless: false,
});

const getDataFromPage = (): string => document.title;

const pages = await crawlerService.crawlPages({
  links: PAGES,
  threads: 4,
  evaluatorFunction: getDataFromPage,
});

console.log(JSON.stringify(pages));

// const linkChunks = chunkifyArray(PAGES, 2);
// console.log(linkChunks);

// pages.forEach(async (page) => {
//   const p = await page;
//   console.log(await p);
// });

// crawlerService.openPage().then((page) => {
//   crawlerService
//     .navigateToLink({
//       link: 'https://zellwk.com/blog/async-await-in-loops/',
//       page: page,
//     })
//     .then(console.log);
// });
