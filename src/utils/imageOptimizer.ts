export interface ImageOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'jpg'
}

export const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect width="400" height="225" fill="%231a1a1a"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23666" font-family="sans-serif" font-size="14"%3ELoading...%3C/text%3E%3C/svg%3E'

export function getOptimizedImageUrl(url: string, options: ImageOptions = {}): string {
  if (!url) return PLACEHOLDER_SVG

  const { width, height, quality = 80, format = 'webp' } = options

  // Cloudinary optimization
  if (url.includes('cloudinary')) {
    const params = []
    if (width) params.push(`w_${width}`)
    if (height) params.push(`h_${height}`)
    params.push(`q_${quality}`)
    params.push(`f_${format}`)
    params.push('c_fill')
    
    return url.replace('/upload/', `/upload/${params.join(',')}/`)
  }

  // ImageKit optimization
  if (url.includes('imagekit')) {
    const params = new URLSearchParams()
    if (width) params.append('w', width.toString())
    if (height) params.append('h', height.toString())
    params.append('q', quality.toString())
    params.append('f', format)
    params.append('c', 'at_max')
    
    return `${url}?${params.toString()}`
  }

  // Convex storage URLs
  if (url.includes('convex.cloud')) {
    const params = new URLSearchParams()
    params.append('cache', 'public')
    params.append('max-age', '31536000')
    if (width) params.append('w', width.toString())
    params.append('q', '80')
    
    return `${url}?${params.toString()}`
  }

  // Local development
  const separator = url.includes('?') ? '&' : '?'
  const sizeParam = width ? `${separator}w=${width}` : ''
  
  return `${url}${sizeParam}`
}

export function getSrcSet(url: string, widths: number[] = [400, 800, 1200], format: 'webp' | 'jpeg' = 'webp'): string {
  return widths
    .map(width => `${getOptimizedImageUrl(url, { width, format })} ${width}w`)
    .join(', ')
}

export function getWebPFallbackSrcSet(url: string, widths = [400, 800, 1200]) {
  return {
    webp: getSrcSet(url, widths, 'webp'),
    jpeg: getSrcSet(url, widths, 'jpeg')
  }
}

export function getLqipUrl(url: string): string {
  if (!url) return PLACEHOLDER_SVG
  return getOptimizedImageUrl(url, { width: 40, height: 30, quality: 20, format: 'jpeg' })
}