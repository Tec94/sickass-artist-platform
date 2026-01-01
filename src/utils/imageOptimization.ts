export function optimizeImageUrl(
  originalUrl: string,
  width: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  quality: 'low' | 'medium' | 'high' = 'medium'
): string {
  // If URL is already optimized (Cloudinary/ImageKit), return as-is
  if (originalUrl.includes('cloudinary') || originalUrl.includes('imagekit')) {
    return originalUrl
  }

  // If Convex storage URL, add cache headers
  if (originalUrl.includes('convex.cloud')) {
    return `${originalUrl}?cache=public&max-age=31536000`
  }

  // Fallback: return original
  return originalUrl
}

export function getThumbnailUrl(
  imageUrl: string,
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  const sizeMap = {
    sm: 200,
    md: 400,
    lg: 800,
  }

  return optimizeImageUrl(imageUrl, sizeMap[size], 'medium')
}

export function createSrcSet(
  imageUrl: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  format: 'jpg' | 'webp' = 'jpg'
): string {
  const widths = [400, 800, 1200]

  return widths
    .map((width) => `${optimizeImageUrl(imageUrl, width)} ${width}w`)
    .join(', ')
}

export function getImageDimensions(
  aspectRatio: 'square' | '16:9' | '4:3' = '16:9'
): { width: number; height: number } {
  const ratios = {
    square: { width: 1, height: 1 },
    '16:9': { width: 16, height: 9 },
    '4:3': { width: 4, height: 3 },
  }

  return ratios[aspectRatio]
}

export function formatImageSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
