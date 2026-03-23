export const slugifyCatalogText = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

export const buildProductSearchText = (
  name: string,
  description: string,
  tags: string[],
  extras: Array<string | undefined> = [],
) =>
  [name, description, ...tags, ...extras]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .toLowerCase()
