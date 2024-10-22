export function generateGetRequestUrl(
  platformUrl: string,
  endpoint: string,
  requestParams = {},
): string {
  const url = new URL(`${platformUrl}${endpoint}`);
  const paramsArray = Object.entries(requestParams);
  if (paramsArray.length) {
    paramsArray.forEach(([key, value]) => {
      value && url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
}
