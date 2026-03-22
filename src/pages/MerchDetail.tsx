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
import { StoreTopRail } from '../components/Merch/StoreTopRail'
import { useUser } from '../contexts/UserContext'
import { buildAuthEntryHref } from '../features/auth/authRouting'
import { ImageGallery } from '../components/Merch/ImageGallery'
import { STORE_DESIGN_HERO_IMAGE } from '../features/store/storeDesignAssets'
import { getMerchImagesForVariation, getMerchSlugCandidates, getOrderedColors, getVariationIndexFromColor } from '../utils/merchImages'
import { resolveMerchManifestEntries } from '../utils/merchManifestClient'
import { useTranslation } from '../hooks/useTranslation'
import type { StoreQueueStateViewModel, StoreQueueTargetViewModel } from '../types/store-queue'

function formatClockTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp)
}

export function MerchDetail() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

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
  const queueTargetRaw = useQuery(api.merchQueue.getQueueTargetDrop)
  const queueTarget = (queueTargetRaw ?? null) as StoreQueueTargetViewModel | null
  const queueDropId = queueTarget?.drop?._id ?? null
  const myQueueStateRaw = useQuery(api.merchQueue.getMyQueueState, queueDropId ? { dropId: queueDropId } : 'skip')
  const myQueueState = (myQueueStateRaw ?? null) as StoreQueueStateViewModel | null

  const { retryWithBackoff } = useAutoRetry()
  const addToCartMutation = useMutation(api.cart.addToCart)
  const toggleWishlistMutation = useMutation(api.merch.toggleWishlist)
  const recordRecentlyViewedMutation = useMutation(api.merch.recordRecentlyViewed)
  const joinQueueMutation = useMutation(api.merchQueue.joinQueue)
  const claimSlotMutation = useMutation(api.merchQueue.claimSlot)
  const leaveQueueMutation = useMutation(api.merchQueue.leaveQueue)

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
  const queueNowUtc = queueTarget?.now ?? Date.now()
  const hasActiveQueueSlot =
    myQueueState?.status === 'admitted' &&
    typeof myQueueState.slotExpiresAtUtc === 'number' &&
    myQueueState.slotExpiresAtUtc > queueNowUtc
  const isQueueTargetActive = queueTarget?.state === 'active' && Boolean(queueTarget?.drop)
  const isProductInActiveQueueDrop = Boolean(
    product &&
      queueTarget?.drop?.products.some((dropProductId) => String(dropProductId) === String(product._id)),
  )
  const isQueueLockedProduct = Boolean(isQueueTargetActive && isProductInActiveQueueDrop && !hasActiveQueueSlot)

  const queueReturnTo = `/store/product/${productId ?? ''}`
  const openQueueSignIn = useCallback(() => {
    navigate(buildAuthEntryHref('signin', queueReturnTo))
  }, [navigate, queueReturnTo])

  const runQueueAction = useCallback(async (action: 'join' | 'claim' | 'leave') => {
    if (!queueDropId) return

    if (!isSignedIn) {
      openQueueSignIn()
      return
    }

    try {
      if (action === 'join') {
        await joinQueueMutation({ dropId: queueDropId })
        showToast(t('store.queueJoined'), { type: 'success' })
        return
      }

      if (action === 'leave') {
        await leaveQueueMutation({ dropId: queueDropId })
        showToast(t('store.queueLeft'), { type: 'success' })
        return
      }

      await claimSlotMutation({ dropId: queueDropId })
      showToast(t('store.queueAdmitted'), { type: 'success' })
    } catch (error) {
      const fallbackMessage = t('store.queueActionFailed')
      const message = error instanceof Error ? error.message || fallbackMessage : fallbackMessage
      showToast(message, { type: 'error' })
    }
  }, [claimSlotMutation, isSignedIn, joinQueueMutation, leaveQueueMutation, openQueueSignIn, queueDropId, t])

  const handleAddToCart = useCallback(async () => {
    if (isQueueLockedProduct) {
      showToast(t('store.queueLockedCta'), { type: 'error' })
      return
    }

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
  }, [addToCartMutation, isQueueLockedProduct, productId, quantity, retryWithBackoff, selectedVariant, t])

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

  useEffect(() => {
    if (!productId || !product) return
    recordRecentlyViewedMutation({ productId: product._id }).catch(() => undefined)
  }, [product, productId, recordRecentlyViewedMutation])

  if (product === null) {
    return (
      <div className="store-v2-root flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
        <h1 className="mb-4 text-2xl font-bold uppercase tracking-widest">Product Not Found</h1>
        <button
          onClick={() => navigate('/store/browse')}
          className="store-v2-control store-v2-btn-primary px-6"
        >
          Back to Collection
        </button>
      </div>
    )
  }

  if (product === undefined) {
    return (
      <div className="store-v2-root flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
        <iconify-icon icon="solar:spinner-linear" width="32" height="32" className="animate-spin text-red-500" />
        <p className="mt-4 text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (isQueueLockedProduct) {
    const waitingPosition = typeof myQueueState?.position === 'number' ? myQueueState.position + 1 : null
    const queueDetail =
      myQueueState?.status === 'admitted' && hasActiveQueueSlot && myQueueState.slotExpiresAtUtc
        ? `${t('store.queueSlotExpires')} ${formatClockTime(myQueueState.slotExpiresAtUtc)}`
        : myQueueState?.status === 'waiting' && waitingPosition
          ? `#${waitingPosition}`
          : queueTarget?.drop?.name || t('store.queueUnavailableMeta')

    const canClaim =
      Boolean(isSignedIn) &&
      myQueueState?.status === 'waiting' &&
      queueTarget?.state === 'active' &&
      myQueueState.canClaimSlot
    const canJoin =
      !isSignedIn || !myQueueState || myQueueState.status === 'left' || myQueueState.status === 'expired'
    const waitingOnly = Boolean(isSignedIn && myQueueState?.status === 'waiting' && !myQueueState.canClaimSlot)

    const primaryLabel = !isSignedIn
      ? t('store.queueSignInToJoin')
      : canClaim
        ? t('store.claimQueueSlot')
        : canJoin
          ? t('store.joinQueueNow')
          : t('store.queueWaiting')

    return (
      <MerchErrorBoundary>
        <div className="app-surface-page store-v2-root min-h-screen bg-zinc-950">
          <FreeShippingBanner />
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="store-surface-shell store-v2-detail-shell rounded-3xl p-8 text-center">
              <p className="store-v2-label justify-center">{t('store.queueStatus')}</p>
              <h1 className="store-v2-display mt-3 text-3xl">{t('store.detailLockedTitle')}</h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--store-v2-tone-text-meta)]">{t('store.detailLockedBody')}</p>
              <p className="store-v2-detail-option-label mt-4 mb-0">{queueDetail}</p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  className="store-v2-control store-v2-btn-primary"
                  disabled={waitingOnly}
                  onClick={() => {
                    if (!isSignedIn) {
                      openQueueSignIn()
                      return
                    }

                    if (canClaim) {
                      void runQueueAction('claim')
                      return
                    }

                    if (canJoin) {
                      void runQueueAction('join')
                    }
                  }}
                >
                  {primaryLabel}
                </button>
                {(myQueueState?.status === 'waiting' || myQueueState?.status === 'admitted') ? (
                  <button
                    type="button"
                    className="store-v2-control store-v2-btn-secondary"
                    onClick={() => void runQueueAction('leave')}
                  >
                    {t('store.leaveQueue')}
                  </button>
                ) : null}
                <Link to="/store/browse#store-queue-control" className="store-v2-control store-v2-btn-secondary inline-flex items-center">
                  {t('store.backToQueueControl')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MerchErrorBoundary>
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
      <div className="app-surface-page store-v2-root min-h-screen bg-zinc-950" style={{ fontFamily: 'var(--font-store, ui-monospace, monospace)' }}>
        <FreeShippingBanner />

        <div className="store-v2-page-frame animate-fade-in">
          <StoreTopRail
            activeId="browse"
            actions={[
              {
                label: 'View Store Scene',
                to: '/store',
                icon: 'solar:buildings-3-linear',
                variant: 'pill',
              },
              {
                label: 'Return to Grounds',
                to: '/',
              },
            ]}
          />

          <section
            className="store-v2-route-hero store-v2-route-hero--compact"
            style={{
              backgroundImage: `linear-gradient(118deg, rgba(9,7,6,0.18), rgba(9,7,6,0.74)), url(${STORE_DESIGN_HERO_IMAGE})`,
            }}
          >
            <div className="store-v2-route-hero__content">
              <Link to="/store/browse" className="store-v2-back-link mb-4">
                <iconify-icon icon="solar:alt-arrow-left-linear" width="16" height="16" />
                Back to Collection
              </Link>
              <p className="store-v2-label">Product detail / {product.category}</p>
              <h1 className="store-v2-route-title store-v2-route-title--compact">{product.name}</h1>
              <p className="store-v2-route-copy">
                Gallery-led purchasing keeps large imagery first, then size, stock, and action without burying the collection context.
              </p>
            </div>
          </section>

          <div className="store-v2-page-columns store-v2-page-columns--detail">
            <div className="store-v2-detail-media relative flex min-h-[520px] w-full items-center justify-center overflow-hidden p-6">
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

            <aside className="store-v2-detail-panel store-v2-surface-card store-v2-detail-purchase-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="store-v2-label">{product.category}</p>
                  <h2 className="font-display mt-2 text-3xl font-semibold leading-tight text-[var(--store-v2-tone-text-main)] md:text-5xl">
                    {product.name}
                  </h2>
                </div>
              </div>

              <div className="store-v2-detail-rating mb-6 flex items-center gap-2">
                  <div className="flex text-[var(--store-v2-tone-accent-strong)]">
                    <iconify-icon icon="solar:star-bold" width="16" height="16" />
                    <iconify-icon icon="solar:star-bold" width="16" height="16" />
                    <iconify-icon icon="solar:star-bold" width="16" height="16" />
                    <iconify-icon icon="solar:star-bold" width="16" height="16" />
                    <iconify-icon icon="solar:star-bold" width="16" height="16" className="opacity-45" />
                  </div>
                  <span className="text-sm font-medium">4.5 (500 Reviews)</span>
                </div>

              <div className="mb-8 flex items-baseline gap-4">
                <span className="store-v2-detail-price">${(product.price / 100).toFixed(2)}</span>
              </div>

              <p className="store-v2-detail-divider mb-8 border-b pb-8 text-sm leading-relaxed text-[var(--store-v2-tone-text-meta)]">{description}</p>

              {colors.length > 0 ? (
                <div className="mb-6">
                  <span className="store-v2-detail-option-label">
                    Color: <strong>{selectedColor}</strong>
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
                        className={`store-v2-detail-color-option ${selectedColor === color ? 'store-v2-detail-color-option--active' : ''}`}
                      >
                        <div
                          className={`h-8 w-8 rounded-full ${
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
              ) : null}

              {sizes.length > 0 ? (
                <div className="mb-8">
                  <div className="mb-3 flex justify-between gap-3">
                    <span className="store-v2-detail-option-label mb-0">
                      Size: <strong>{selectedSize}</strong>
                    </span>
                    <button type="button" className="store-v2-shell-link">
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
                        className={`store-v2-detail-size-option py-3 text-sm font-semibold ${
                          selectedSize === size ? 'store-v2-detail-size-option--active' : ''
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mb-6 flex items-end gap-4">
                <div className="flex flex-col gap-2">
                  <label className="store-v2-detail-option-label mb-0">Quantity</label>
                  <div className="store-v2-detail-quantity-shell">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="store-v2-detail-quantity-button"
                    >
                      -
                    </button>
                    <div className="store-v2-detail-quantity-value">{quantity}</div>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="store-v2-detail-quantity-button"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isLoading || selectedVariant?.stock === 0}
                  className="store-v2-control store-v2-btn-primary h-12 flex-1"
                >
                  {isLoading ? 'Adding...' : selectedVariant?.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                </button>
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`store-v2-detail-icon-button ${isInWishlist ? 'store-v2-detail-icon-button--active' : ''}`}
                >
                  <iconify-icon icon={isInWishlist ? 'solar:heart-bold' : 'solar:heart-linear'} width="20" height="20" />
                </button>
              </div>

              <div className="store-v2-detail-links">
                <Link to="/store" className="store-v2-shell-link">
                  View Store Scene
                </Link>
                <Link to="/store/drops" className="store-v2-shell-link">
                  Drop Notes
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </MerchErrorBoundary>
  )
}
