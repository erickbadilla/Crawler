import { z } from 'zod';

export const UrlsRedirectReportSchemaRequest = z.object({
  links: z.array(
    z.string({
      description: 'List of links to process.',
      required_error: 'Please provide links.',
      invalid_type_error: 'Please provide a valid list of links.',
    }),
  ),
  userAgent: z
    .string({
      description: 'User agent to use.',
      required_error: 'Please provide user agent to use.',
      invalid_type_error: 'Please provide a valid user agent.',
    })
    .optional(),
  browser: z
    .enum(['chromium', 'firefox', 'webkit'], {
      description: 'Browser to use.',
      required_error: 'Please provide a browser to use.',
      invalid_type_error: 'Please enter a valid browser.',
    })
    .optional(),
});

export type TCreateUrlsReportRequest = z.infer<
  typeof UrlsRedirectReportSchemaRequest
>;
export type TCreateUrlsReportResponse = TCreateUrlsReportRequest;

export const UrlsWebCrawlReportSchemaRequest =
  UrlsRedirectReportSchemaRequest.extend({
    evaluatorFunction: z.function(),
  });
