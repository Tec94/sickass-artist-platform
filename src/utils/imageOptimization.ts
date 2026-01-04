export const generateSrcSet = (url: string): string => {
  // Check if URL supports query params (Convex/CDN)
  const separator = url.includes('?') ? '&' : '?'

  return [
    `${url}${separator}w=400 400w`,
    `${url}${separator}w=800 800w`,
    `${url}${separator}w=1200 1200w`,
    `${url}${separator}w=1600 1600w`,
  ].join(', ')
}

// Generate LQIP (Low Quality Image Placeholder)
export const generateLQIP = (): string => {
  // Return a 10x10 gray SVG as placeholder while real image loads
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"%3E%3Crect fill="%23888" width="10" height="10"/%3E%3C/svg%3E'
}

// Calculate image aspect ratio
export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height
}

// Detect WebP support
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').includes('webp')
}

// Determine optimal image format
export const getOptimalFormat = (url: string): string => {
  if (supportsWebP()) {
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp')
  }
  return url
}

// Parse image dimensions from URL or attributes
export const getImageDimensions = (
  url: string,
  attr?: { width?: number; height?: number }
): { width: number; height: number } | null => {
  if (attr?.width && attr?.height) {
    return { width: attr.width, height: attr.height }
  }

  // Try to extract from URL (if stored as query params)
  const match = url.match(/[?&]w[h]?=(\d+)[&]?h[w]?=(\d+)/)
  if (match) {
    return { width: parseInt(match[1]), height: parseInt(match[2]) }
  }

  return null
}
