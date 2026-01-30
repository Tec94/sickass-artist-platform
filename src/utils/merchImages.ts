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

export function getVariationIndexFromColor(
  product: MerchProduct,
  selectedColor?: string | null
) {
  const colors = Array.from(
    new Set(product.variants?.map((variant) => variant.color).filter(Boolean) ?? [])
  );
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
