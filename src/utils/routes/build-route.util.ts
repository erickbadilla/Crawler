const apiRouteBuilder =
  (version: number) =>
  (route: string): string =>
    `/api/v${version}/${route}`;

export const apiV1Builder = apiRouteBuilder(1);
export const apiV2Builder = apiRouteBuilder(2);
