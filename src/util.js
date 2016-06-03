/* @flow */
export type Base64String = string;


export function base64(i: string): Base64String {
  return ((new Buffer(i, 'ascii')).toString('base64'));
}


export function unbase64(i: Base64String): string {
  return ((new Buffer(i, 'base64')).toString('ascii'));
}


export function startsWith(str: string, prefix: string): boolean {
  return str.lastIndexOf(prefix, 0) === 0;
}
