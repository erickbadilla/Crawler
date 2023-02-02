import { z } from 'zod';

export const UrlsRedirectReportSchemaRequest = z.object({
  links: z.array(
    z
      .string({
        description: 'List of links to process.',
        required_error: 'Please provide links.',
        invalid_type_error: 'Please provide a valid list of links.',
      })
      .refine((value) => value.length > 0),
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

  options: z.object({
    timeoutMS: z.number().optional(),
    waitUntil: z
      .enum(['networkidle', 'domcontentloaded', 'load', 'commit'])
      .optional(),
    threads: z
      .number({
        required_error: 'Please provide threads to work with',
      })
      .refine(
        (number) => number > 0 && number <= 10,
        'Threads must be between 1 and 10',
      ),
  }),
});

export const UrlsWebCrawlDataReportSchemaRequest =
  UrlsRedirectReportSchemaRequest.extend({
    dataExtractorFunction: z.string({
      description: 'Function for extracting data from pages.',
      required_error: 'Please provide a data extractor function.',
      invalid_type_error: 'Please provide function as string',
    }),
    keepFalsyData: z.boolean().default(false),
  });

export const MatchWebPagesByPredicateSchemaRequest =
  UrlsRedirectReportSchemaRequest.extend({
    predicateFunction: z.string({
      description: 'Function for matching pages.',
      required_error: 'Please provide a predicate function.',
      invalid_type_error: 'Please provide function as string',
    }),

    keepNonMatchingPages: z.boolean().default(false),
  });
