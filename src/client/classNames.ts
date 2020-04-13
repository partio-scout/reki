export function classNames(...input: readonly ([string, boolean] | string | undefined)[]): string {
  return input.map(x => Array.isArray(x) ? x[1] ? x[0] : undefined : x).filter(isNotUndefined).join(' ');
}

function isNotUndefined<T>(input: T | undefined): input is T {
  return input !== undefined;
}
