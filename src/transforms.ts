export const camelize = (str: string): string =>
  str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word: string, index: number) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/[\s-_]+/g, '');

export const pascalize = (str: string): string =>
  str
    .replace(/[-_]+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(
      /\s+(.)(\w+)/g,
      (_$1, $2, $3) => $2.toUpperCase() + $3.toLowerCase()
    )
    .replace(/\s/g, '')
    .replace(/\w/, (s) => s.toUpperCase());

export const kebablize = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

export const snakelize = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, '$1-$2') 
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
