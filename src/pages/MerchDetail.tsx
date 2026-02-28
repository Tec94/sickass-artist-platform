import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { Doc, Id } from '../../convex/_generated/dataModel'
import { MerchErrorBoundary } from '../components/Merch/ErrorBoundary'
import { useAutoRetry } from '../hooks/useAutoRetry'
import { parseConvexError, logError } from '../utils/convexErrorHandler'
import { showToast } from '../lib/toast'
import { FreeShippingBanner } from '../components/Merch/FreeShippingBanner'
import { useUser } from '../contexts/UserContext'
import { ImageGallery } from '../components/Merch/ImageGallery'
import { getMerchImagesForVariation, getMerchSlugCandidates, getOrderedColors, getVariationIndexFromColor } from '../utils/merchImages'
import { resolveMerchManifestEntries } from '../utils/merchManifestClient'

export function MerchDetail() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const product = useQuery(api.merch.getProductDetail, productId ? { productId: productId as Doc<'merchProducts'>['_id'] } : 'skip')
  const manifestSlugs = useMemo(() => {
    if (!product) return []
    return getMerchSlugCandidates({
      name: product.name,
      imageUrls: product.imageUrls,
      thumbnailUrl: product.thumbnailUrl,
      category: product.category,
      tags: product.tags,
      variants: product.variants,
    })
  }, [product])
  const merchManifestEntries = useQuery(
    api.merchManifest.getMerchImageManifestEntries,
    manifestSlugs.length ? { slugs: manifestSlugs } : 'skip'
  )
  const resolvedManifestEntries = useMemo(
    () => resolveMerchManifestEntries(manifestSlugs, merchManifestEntries?.entries ?? null),
    [manifestSlugs, merchManifestEntries?.entries]
  )
  const { isSignedIn, userProfile } = useUser()
  const wishlist = useQuery(api.merch.getWishlist, isSignedIn && userProfile ? {} : 'skip')

  const { retryWithBackoff } = useAutoRetry()
  const addToCartMutation = useMutation(api.cart.addToCart)
  const toggleWishlistMutation = useMutation(api.merch.toggleWishlist)

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelError, setModelError] = useState(false)
  const modelViewerRef = useRef<HTMLElement | null>(null)

  const selectedVariant = useMemo(() => {
    if (!product) return null
    if (selectedVariantId) return product.variants.find((variant) => variant._id === selectedVariantId) || null

    const orderedColors = getOrderedColors({
      name: product.name,
      imageUrls: product.imageUrls,
      thumbnailUrl: product.thumbnailUrl,
      category: product.category,
      tags: product.tags,
      variants: product.variants,
    })
    const preferredColor = orderedColors[0]
    if (preferredColor) {
      const preferredVariant = product.variants.find((variant) => variant.color === preferredColor && variant.stock > 0)
      if (preferredVariant) return preferredVariant
    }

    return product.variants.find((variant) => variant.stock > 0) || product.variants[0] || null
  }, [product, selectedVariantId])

  const isInWishlist = wishlist?.some((item) => item._id === productId)

  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant) {
      showToast('Please select an option', { type: 'error' })
      return
    }

    setIsLoading(true)
    try {
      await retryWithBackoff(() => addToCartMutation({ variantId: selectedVariant._id, quantity }))
      showToast('Added to cart!', { type: 'success' })
    } catch (error) {
      const parsed = parseConvexError(error)
      logError(parsed, { component: 'MerchDetail', action: 'add_to_cart', metadata: { productId } })
      showToast(parsed.userMessage, { type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [addToCartMutation, productId, quantity, retryWithBackoff, selectedVariant])

  const handleToggleWishlist = useCallback(async () => {
    if (!productId) return
    try {
      await toggleWishlistMutation({ productId: productId as Id<'merchProducts'> })
      showToast(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist', { type: 'success' })
    } catch {
      showToast('Login to wishlist items', { type: 'error' })
    }
  }, [isInWishlist, productId, toggleWishlistMutation])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(media.matches)
    update()
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }
    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  useEffect(() => {
    if (!product?.model3dUrl) {
      setModelLoaded(false)
      setModelError(false)
      return
    }

    setModelLoaded(false)
    setModelError(false)

    const element = modelViewerRef.current
    if (!element) return

    const handleLoad = () => setModelLoaded(true)
    const handleError = () => setModelError(true)

    element.addEventListener('load', handleLoad)
    element.addEventListener('error', handleError)
    return () => {
      element.removeEventListener('load', handleLoad)
      element.removeEventListener('error', handleError)
    }
  }, [product?.model3dUrl])

  const defaultAutoRotate = product?.modelConfig?.autoRotate ?? true
  useEffect(() => {
    if (!product?.model3dUrl) {
      setAutoRotateEnabled(false)
      return
    }
    setAutoRotateEnabled(!prefersReducedMotion && defaultAutoRotate)
  }, [defaultAutoRotate, prefersReducedMotion, product?.model3dUrl])

  useEffect(() => {
    if (modelError) setAutoRotateEnabled(false)
  }, [modelError])

  if (product === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
        <h1 className="mb-4 text-2xl font-bold uppercase tracking-widest">Product Not Found</h1>
        <button
          onClick={() => navigate('/store')}
          className="bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors hover:bg-red-700"
        >
          Back to Shop
        </button>
      </div>
    )
  }

  if (product === undefined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
        <iconify-icon icon="solar:spinner-linear" width="32" height="32" className="animate-spin text-red-500" />
        <p className="mt-4 text-zinc-400">Loading...</p>
      </div>
    )
  }

  const imageUrl = product.thumbnailUrl || product.imageUrls[0] || '/images/placeholder.jpg'
  const description = product.description || product.longDescription || 'Premium quality merchandise from ROAPR Studio.'

  const sizes = [...new Set(product.variants.map((variant) => variant.size).filter(Boolean))]
  const colors = getOrderedColors({
    name: product.name,
    imageUrls: product.imageUrls,
    thumbnailUrl: product.thumbnailUrl,
    category: product.category,
    tags: product.tags,
    variants: product.variants,
  })
  const selectedSize = selectedVariant?.size || sizes[0] || ''
  const selectedColor = selectedVariant?.color || colors[0] || ''
  const variationIndex = getVariationIndexFromColor(
    {
      name: product.name,
      imageUrls: product.imageUrls,
      thumbnailUrl: product.thumbnailUrl,
      category: product.category,
      tags: product.tags,
      variants: product.variants,
    },
    selectedColor
  )
  const galleryImages = getMerchImagesForVariation(
    {
      name: product.name,
      imageUrls: product.imageUrls,
      thumbnailUrl: product.thumbnailUrl,
      category: product.category,
      tags: product.tags,
      variants: product.variants,
    },
    variationIndex,
    resolvedManifestEntries
  )

  const has3dModel = Boolean(product.model3dUrl) && !modelError
  const viewerPoster = product.modelPosterUrl || galleryImages[0] || imageUrl
  const minFieldOfView = product.modelConfig?.minFov ? `${product.modelConfig.minFov}deg` : undefined
  const maxFieldOfView = product.modelConfig?.maxFov ? `${product.modelConfig.maxFov}deg` : undefined
  const autoRotateActive = autoRotateEnabled && !prefersReducedMotion && has3dModel

  const modelViewerProps = {
    src: product.model3dUrl ?? undefined,
    poster: viewerPoster,
    loading: 'lazy' as const,
    reveal: 'auto' as const,
    className: 'h-full w-full rounded-xl border border-zinc-800 bg-black',
    style: { width: '100%', height: '100%' },
    'camera-controls': true,
    'auto-rotate': autoRotateActive ? true : undefined,
    'camera-orbit': product.modelConfig?.cameraOrbit,
    'min-field-of-view': minFieldOfView,
    'max-field-of-view': maxFieldOfView,
  }

  return (
    <MerchErrorBoundary>
      <div className="app-surface-page min-h-screen bg-zinc-950" style={{ fontFamily: 'var(--font-store, ui-monospace, monospace)' }}>
        <FreeShippingBanner />

        <div className="animate-fade-in mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link to="/store" className="mb-8 inline-flex items-center gap-2 text-zinc-500 transition-colors hover:text-white">
            <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16" />
            Back to Shop
          </Link>

          <div className="flex flex-col gap-12 md:flex-row">
            <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden border border-zinc-800 bg-zinc-900 p-6 md:w-3/5">
              {has3dModel ? (
                <div className="relative flex h-full w-full max-w-[640px] flex-col">
                  <div className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                    3D view
                  </div>
                  {!modelLoaded && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-black/70 text-xs uppercase tracking-[0.24em] text-white">
                      <iconify-icon icon="solar:spinner-linear" width="24" height="24" className="animate-spin" />
                      Loading model
                    </div>
                  )}
                  <div className="relative h-full min-h-[480px] w-full">
                    <model-viewer ref={modelViewerRef} {...modelViewerProps} />
                  </div>
                  <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                    {prefersReducedMotion && (
                      <span className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                        Reduced motion
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setAutoRotateEnabled((prev) => !prev)}
                      disabled={prefersReducedMotion || !has3dModel}
                      className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors ${
                        autoRotateActive
                          ? 'border-red-600 bg-red-600 text-white hover:bg-red-500'
                          : 'border-white/20 bg-black/70 text-white hover:border-white/50'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {autoRotateActive ? 'Auto-rotate on' : 'Auto-rotate off'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-[640px]">
                  <ImageGallery images={galleryImages} alt={product.name} />
                </div>
              )}

              {product.model3dUrl && modelError && (
                <div className="absolute inset-x-6 bottom-6 rounded-lg border border-red-900/60 bg-red-950/70 px-4 py-3 text-xs uppercase tracking-[0.2em] text-red-200">
                  3D viewer unavailable. Showing poster image.
                </div>
              )}
            </div>

            <div className="flex w-full flex-col md:w-2/5">
              <div className="mb-4 flex items-start justify-between">
                <h1 className="font-display text-3xl font-bold uppercase tracking-wider leading-tight text-white md:text-5xl">
                  {product.name}
                </h1>
              </div>

              <div className="mb-6 flex items-center gap-2">
                <div className="flex text-yellow-500">
                  <iconify-icon icon="solar:star-bold" width="16" height="16" />
                  <iconify-icon icon="solar:star-bold" width="16" height="16" />
                  <iconify-icon icon="solar:star-bold" width="16" height="16" />
                  <iconify-icon icon="solar:star-bold" width="16" height="16" />
                  <iconify-icon icon="solar:star-bold" width="16" height="16" className="opacity-50" />
                </div>
                <span className="text-sm font-medium text-zinc-400">4.5 (500 Reviews)</span>
              </div>

              <div className="mb-8 flex items-baseline gap-4">
                <span className="font-display text-3xl font-bold text-red-500">${(product.price / 100).toFixed(2)}</span>
              </div>

              <p className="mb-8 border-b border-zinc-800 pb-8 text-sm leading-relaxed text-zinc-400">{description}</p>

              {colors.length > 0 && (
                <div className="mb-6">
                  <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Color: <span className="text-white">{selectedColor}</span>
                  </span>
                  <div className="flex gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          const variant = product.variants.find((item) => item.color === color)
                          if (variant) setSelectedVariantId(variant._id)
                        }}
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                          selectedColor === color ? 'border-red-600' : 'border-zinc-800 hover:border-zinc-500'
                        }`}
                      >
                        <div
                          className={`h-9 w-9 rounded-full ${
                            color === 'Black'
                              ? 'bg-black'
                              : color === 'White'
                                ? 'bg-white'
                                : color === 'Scarlet' || color === 'Red'
                                  ? 'bg-red-600'
                                  : 'bg-zinc-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="mb-8">
                  <div className="mb-3 flex justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Select Size</span>
                    <button type="button" className="text-xs text-zinc-500 underline transition-colors hover:text-white">
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const variant = product.variants.find((item) => item.size === size)
                          if (variant) setSelectedVariantId(variant._id)
                        }}
                        className={`border py-3 text-sm font-bold transition-all ${
                          selectedSize === size
                            ? 'border-white bg-white text-black'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8 flex items-end gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Quantity</label>
                  <div className="flex items-center border border-zinc-800 bg-zinc-950">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-12 w-12 items-center justify-center text-lg font-light text-zinc-500 transition-colors hover:text-white"
                    >
                      -
                    </button>
                    <div className="flex h-12 w-12 items-center justify-center border-x border-zinc-800 text-base font-medium text-white">
                      {quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-12 w-12 items-center justify-center text-lg font-light text-zinc-500 transition-colors hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isLoading || selectedVariant?.stock === 0}
                  className="h-12 flex-1 border border-zinc-700 bg-zinc-900 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:border-zinc-600 hover:bg-zinc-800 disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  {isLoading ? 'Adding...' : selectedVariant?.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                </button>
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`flex h-12 w-12 items-center justify-center border transition-colors ${
                    isInWishlist
                      ? 'border-red-900 bg-red-900/10 text-red-600'
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  <iconify-icon icon={isInWishlist ? 'solar:heart-bold' : 'solar:heart-linear'} width="20" height="20" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MerchErrorBoundary>
  )
}
