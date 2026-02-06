import type { Doc } from '../../convex/_generated/dataModel';
import type { MerchImageManifest } from '../types/merch';

type MerchProduct = Pick<
  Doc<'merchProducts'>,
  'name' | 'imageUrls' | 'thumbnailUrl' | 'category' | 'tags'
> & {
  variants?: Array<Pick<Doc<'merchVariants'>, 'color'>>;
};

type ManifestEntry = MerchImageManifest[keyof MerchImageManifest];

const SLUG_FROM_FILENAME = /\/([^/]+)-\d+(?:-\d+)?\.[a-z0-9]+$/i;
const SLUG_FROM_MERCH_PATH = /\/merch\/[^/]+\/([^/]+)\/\1-\d+-\d+\.[a-z0-9]+$/i;

const COLOR_ORDER_OVERRIDES: Record<string, string[]> = {
  'private-suit-varsity-jacket': ['Navy/Cream', 'Black'],
  'wolfpack-bomber-jacket': ['Navy/Cream', 'Black'],
  'private-suit-windbreaker': ['White', 'Blue/White/Black'],
  'wolfpack-windbreaker': ['White', 'Blue/White/Black'],
  'windbreaker': ['White', 'Blue/White/Black'],
  'coated-stack-denim': ['Black Wax-Coated', 'Bleached Light Blue'],
  'elite-fit-denim': ['Black Wax-Coated', 'Bleached Light Blue'],
  'jeans1': ['Black Wax-Coated', 'Bleached Light Blue'],
  'jetski-motion-tee': ['Black', 'White'],
  'signature-wolf-logo-t-shirt': ['Black', 'White'],
};

export function slugifyMerchName(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractSlugFromUrl(url?: string | null) {
  if (!url) return null;
  const match = SLUG_FROM_MERCH_PATH.exec(url) || SLUG_FROM_FILENAME.exec(url);
  return match?.[1] ?? null;
}

export function getMerchSlugCandidates(product: MerchProduct) {
  const candidates: string[] = [];
  const nameSlug = slugifyMerchName(product.name);
  const urlSlug =
    extractSlugFromUrl(product.thumbnailUrl) ||
    product.imageUrls.map((url) => extractSlugFromUrl(url)).find(Boolean) ||
    null;
  if (urlSlug) candidates.push(urlSlug);

  const tagSlugs = product.tags
    ?.map((tag) => slugifyMerchName(tag))
    .filter(Boolean) ?? [];
  candidates.push(...tagSlugs);
  candidates.push(nameSlug);

  return Array.from(new Set(candidates));
}

function resolveProductSlug(product: MerchProduct, manifest?: MerchImageManifest | null) {
  const candidates = getMerchSlugCandidates(product);
  if (manifest) {
    for (const candidate of candidates) {
      if (manifest[candidate as keyof MerchImageManifest]) {
        return candidate;
      }
    }
  }

  return slugifyMerchName(product.name);
}

export function getOrderedColors(product: MerchProduct) {
  const colors = Array.from(
    new Set(
      product.variants
        ?.map((variant) => variant.color)
        .filter((color): color is string => Boolean(color)) ?? []
    )
  );

  if (colors.length <= 1) return colors;

  const candidates = getMerchSlugCandidates(product);
  const override = candidates
    .map((candidate) => COLOR_ORDER_OVERRIDES[candidate])
    .find(Boolean);

  if (!override) return colors;

  const normalizeColor = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '');
  const colorMap = new Map<string, string>();
  for (const color of colors) {
    colorMap.set(normalizeColor(color), color);
  }

  const ordered: string[] = [];
  for (const color of override) {
    const resolved = colorMap.get(normalizeColor(color));
    if (resolved && !ordered.includes(resolved)) ordered.push(resolved);
  }
  for (const color of colors) {
    if (!ordered.includes(color)) ordered.push(color);
  }

  return ordered;
}

export function getVariationIndexFromColor(
  product: MerchProduct,
  selectedColor?: string | null
) {
  const colors = getOrderedColors(product);
  if (colors.length === 0) return 1;
  if (!selectedColor) return 1;
  const index = colors.findIndex((color) => color === selectedColor);
  return index >= 0 ? index + 1 : 1;
}

export function getMerchImagesForVariation(
  product: MerchProduct,
  variationIndex: number,
  manifest?: MerchImageManifest | null
) {
  const slug = resolveProductSlug(product, manifest);
  const entry = manifest?.[slug as keyof MerchImageManifest] as ManifestEntry | undefined;

  if (entry) {
    const images =
      entry.variations[String(variationIndex) as keyof typeof entry.variations] ??
      entry.variations['1' as keyof typeof entry.variations] ??
      [];
    if (images.length > 0) return images;
  }

  if (!manifest) {
    const fallback = product.imageUrls?.length
      ? product.imageUrls
      : [product.thumbnailUrl].filter(Boolean);
    return fallback.length > 0 ? fallback : ['/images/placeholder.jpg'];
  }

  if (import.meta.env.DEV) {
    console.warn('[merch-images] No manifest match for', {
      product: product.name,
      slug,
      variationIndex,
    });
  }

  const fallback = product.imageUrls?.length
    ? product.imageUrls
    : [product.thumbnailUrl].filter(Boolean);
  return fallback.length > 0 ? fallback : ['/images/placeholder.jpg'];
}

export function getMerchPrimaryImages(product: MerchProduct, manifest?: MerchImageManifest | null) {
  const slug = resolveProductSlug(product, manifest);
  const entry = manifest?.[slug as keyof MerchImageManifest] as ManifestEntry | undefined;

  if (entry) {
    const variation1 =
      entry.variations['1' as keyof typeof entry.variations] ??
      Object.values(entry.variations)[0];
    if (variation1 && variation1.length > 0) return variation1;
  }

  if (!manifest) {
    const fallback = product.imageUrls?.length
      ? product.imageUrls
      : [product.thumbnailUrl].filter(Boolean);
    return fallback.length > 0 ? fallback : ['/images/placeholder.jpg'];
  }

  if (import.meta.env.DEV) {
    console.warn('[merch-images] No manifest match for', {
      product: product.name,
      slug,
    });
  }

  const fallback = product.imageUrls?.length
    ? product.imageUrls
    : [product.thumbnailUrl].filter(Boolean);
  return fallback.length > 0 ? fallback : ['/images/placeholder.jpg'];
}
