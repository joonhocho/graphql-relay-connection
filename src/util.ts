export type Base64String = string;

export const base64 = (i: string): Base64String =>
  new Buffer(i, 'ascii').toString('base64');

export const unbase64 = (i: Base64String): string =>
  new Buffer(i, 'base64').toString('ascii');

export const startsWith = (str: string, prefix: string): boolean =>
  str.lastIndexOf(prefix, 0) === 0;
