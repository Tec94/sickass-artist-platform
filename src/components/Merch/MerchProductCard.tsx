import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id, type Doc } from '../../../convex/_generated/dataModel'
import { showToast } from '../../lib/toast'
import { useUser } from '../../contexts/UserContext'
import { getMerchPrimaryImages } from '../../utils/merchImages'
import type { MerchImageManifest } from '../../types/merch'
import type { UiTone } from '../../types/ui-color'

interface MerchProductCardProps {
  product: {
    _id: string
    name: string
    price: number
    originalPrice?: number
    imageUrls: string[]
    thumbnailUrl?: string
    isNew?: boolean
    totalStock?: number
    category?: Doc<'merchProducts'>['category']
    tags?: string[]
    variants?: Array<{ _id?: Id<'merchVariants'>; stock?: number; size?: string; color?: string }> | any[]
  }
  manifest?: MerchImageManifest | null
  onQuickView?: (productId: string) => void
  onOpenProduct?: (productId: string) => void
  tone?: UiTone
  isLocked?: boolean
  lockLabel?: string
  onQueueAction?: () => void
}

const FALLBACK_IMAGE = '/images/placeholder.jpg'

const toneToCtaClasses: Record<UiTone, string> = {
  brand:
    'border-rose-300/70 bg-rose-500/20 text-rose-100 hover:bg-rose-500/80 hover:text-white focus-visible:outline-rose-200',
  neutral:
    'border-slate-500/75 bg-slate-900/80 text-slate-100 hover:border-slate-300 hover:bg-slate-800 focus-visible:outline-slate-100',
  info:
    'border-sky-300/70 bg-sky-500/15 text-sky-100 hover:bg-sky-500/80 hover:text-white focus-visible:outline-sky-200',
  success:
    'border-emerald-300/70 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/80 hover:text-white focus-visible:outline-emerald-200',
  warning:
    'border-amber-300/70 bg-amber-500/15 text-amber-100 hover:bg-amber-500/80 hover:text-white focus-visible:outline-amber-200',
  danger:
    'border-rose-300/70 bg-rose-500/15 text-rose-100 hover:bg-rose-500/80 hover:text-white focus-visible:outline-rose-200',
}

const badgeClassName =
  'rounded-[7px] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md'

export const MerchProductCard = ({
  product,
  manifest,
  onQuickView,
  onOpenProduct,
  tone = 'brand',
  isLocked = false,
  lockLabel = 'Queue locked',
  onQueueAction,
}: MerchProductCardProps) => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  const variants = Array.isArray(product.variants) ? product.variants : []
  const inStockVariantCount = variants.filter((variant) => (variant?.stock ?? 0) > 0).length
  const variantCount = variants.length
  const isOutOfStock = typeof product.totalStock === 'number' ? product.totalStock === 0 : inStockVariantCount === 0
  const hasMultipleVariants = variantCount > 1
  const availableSizes = Array.from(new Set(variants.map((variant) => variant?.size).filter(Boolean))).slice(0, 3)
  const isLimited = product.category === 'limited' || product.tags?.some((tag) => tag.toLowerCase().includes('limited')) || false

  const merchImages = getMerchPrimaryImages(
    {
      name: product.name,
      imageUrls: product.imageUrls,
      thumbnailUrl: product.thumbnailUrl ?? product.imageUrls?.[0] ?? null,
      category: product.category ?? 'other',
      tags: product.tags ?? [],
      variants,
    },
    manifest,
  )

  const primaryCandidate = merchImages[0] || product.thumbnailUrl || product.imageUrls[0] || FALLBACK_IMAGE
  const secondaryCandidate = merchImages[1] || ''

  const [primarySrc, setPrimarySrc] = useState(primaryCandidate)
  const [secondarySrc, setSecondarySrc] = useState(secondaryCandidate)
  const [isPrimaryLoading, setIsPrimaryLoading] = useState(true)
  const [isSecondaryLoading, setIsSecondaryLoading] = useState(Boolean(secondaryCandidate))

  useEffect(() => {
    setPrimarySrc(primaryCandidate)
    setSecondarySrc(secondaryCandidate)
    setIsPrimaryLoading(true)
    setIsSecondaryLoading(Boolean(secondaryCandidate))
  }, [primaryCandidate, secondaryCandidate])

  const toggleWishlist = useMutation(api.merch.toggleWishlist)
  const addToCart = useMutation(api.cart.addToCart)
  const { isSignedIn, userProfile } = useUser()
  const wishlist = useQuery(api.merch.getWishlist, isSignedIn && userProfile ? {} : 'skip')

  const isWishlisted = wishlist?.some((item) => item._id === product._id)
  const priceLabel = `$${(product.price / 100).toFixed(2)}`

  const variantSummary = useMemo(() => {
    if (isOutOfStock) return 'Sold out'
    if (hasMultipleVariants) return `${inStockVariantCount} variants available`
    if (availableSizes.length) return `Sizes: ${availableSizes.join(', ')}`
    return 'In stock'
  }, [availableSizes, hasMultipleVariants, inStockVariantCount, isOutOfStock])

  const dominantState = useMemo<'sold-out' | 'queue-locked' | 'limited' | 'new' | null>(() => {
    if (isOutOfStock) return 'sold-out'
    if (isLocked) return 'queue-locked'
    if (isLimited) return 'limited'
    if (product.isNew) return 'new'
    return null
  }, [isLimited, isLocked, isOutOfStock, product.isNew])

  const dominantBadge = useMemo(() => {
    switch (dominantState) {
      case 'sold-out':
        return {
          label: 'Sold Out',
          className: `${badgeClassName} border border-slate-400/45 bg-slate-950/80 text-slate-100`,
        }
      case 'queue-locked':
        return {
          label: lockLabel,
          className: `${badgeClassName} border border-amber-200/45 bg-amber-950/60 text-amber-100`,
        }
      case 'limited':
        return {
          label: 'Limited',
          className: `${badgeClassName} border border-amber-200/60 bg-[rgba(160,96,52,0.5)] text-amber-50`,
        }
      case 'new':
        return {
          label: 'New',
          className: `${badgeClassName} border border-stone-200/40 bg-[rgba(237,224,220,0.22)] text-stone-100`,
        }
      default:
        return null
    }
  }, [dominantState, lockLabel])

  const supportingMeta = useMemo(() => {
    if (isLocked) return 'Join the live queue to unlock this piece'
    if (isOutOfStock) {
      return isLimited ? 'Limited edition archive' : 'Currently unavailable'
    }
    if (isLimited && product.isNew) return 'Limited edition · New arrival'
    if (isLimited) return 'Limited edition'
    if (product.isNew) return 'New arrival'
    return variantSummary
  }, [isLimited, isLocked, isOutOfStock, product.isNew, variantSummary])

  const primaryCtaLabel = isOutOfStock ? 'Sold Out' : hasMultipleVariants ? 'Choose Options' : 'Add to Cart'
  const wishlistLabel = isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'

  const openProduct = () => {
    if (onOpenProduct) {
      onOpenProduct(product._id)
      return
    }
    navigate(`/store/product/${product._id}`)
  }

  const handleWishlist = async (event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await toggleWishlist({ productId: product._id as Id<'merchProducts'> })
      showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', { type: 'success' })
    } catch {
      showToast('Login to wishlist items', { type: 'error' })
    }
  }

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.stopPropagation()
    if (isOutOfStock || isLocked) return

    if (hasMultipleVariants) {
      openProduct()
      return
    }

    const variantId = variants?.[0]?._id
    if (!variantId) {
      openProduct()
      return
    }

    try {
      await addToCart({ variantId, quantity: 1 })
      showToast('Added to cart', { type: 'success' })
    } catch {
      showToast('Failed to add to cart', { type: 'error' })
    }
  }

  return (
    <article
      className="store-v2-product-card group relative flex cursor-pointer flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-50"
      role="button"
      tabIndex={0}
      onClick={openProduct}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openProduct()
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="store-v2-product-media relative mb-4 aspect-[4/5] overflow-hidden transition duration-300">
        {isPrimaryLoading ? (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[rgba(18,14,12,0.96)] via-[rgba(33,25,20,0.84)] to-[rgba(15,11,10,0.98)]" />
        ) : null}

        <img
          src={primarySrc}
          alt={product.name}
          loading="lazy"
          onLoad={() => setIsPrimaryLoading(false)}
          onError={() => {
            if (primarySrc !== FALLBACK_IMAGE) {
              setPrimarySrc(FALLBACK_IMAGE)
              return
            }
            setIsPrimaryLoading(false)
          }}
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
            isHovered && secondarySrc ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'
          }`}
        />

        {secondarySrc ? (
          <img
            src={secondarySrc}
            alt={product.name}
            loading="lazy"
            onLoad={() => setIsSecondaryLoading(false)}
            onError={() => {
              setSecondarySrc('')
              setIsSecondaryLoading(false)
            }}
            className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
              isHovered && !isSecondaryLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
            }`}
          />
        ) : null}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(9,7,6,0.76)] via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {dominantBadge ? (
            <span className={dominantBadge.className}>{dominantBadge.label}</span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlistLabel}
          title={wishlistLabel}
          className={`store-v2-product-wishlist absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-50 ${
            isWishlisted
              ? 'border-red-300/65 bg-[rgba(160,32,48,0.24)] text-red-100'
              : 'border-[rgba(216,184,152,0.22)] bg-[rgba(14,11,9,0.78)] text-stone-200 hover:border-[rgba(216,184,152,0.42)]'
          }`}
        >
          <iconify-icon icon={isWishlisted ? 'solar:heart-bold' : 'solar:heart-linear'}></iconify-icon>
        </button>

        {isLocked ? (
          <div className="absolute inset-x-3 bottom-3">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onQueueAction?.()
              }}
              className="flex min-h-10 w-full items-center justify-center rounded-[8px] border border-amber-200/60 bg-[rgba(18,14,11,0.9)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-100 backdrop-blur-md transition hover:bg-[rgba(24,18,14,0.96)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-100"
            >
              {lockLabel}
            </button>
          </div>
        ) : (
          <div className="store-v2-product-actions absolute inset-x-4 bottom-4 hidden translate-y-4 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 lg:grid">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onQuickView?.(product._id)
              }}
              className="min-h-10 rounded-[8px] border border-[rgba(216,184,152,0.28)] bg-[rgba(19,15,12,0.88)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-100 backdrop-blur-sm transition hover:border-[rgba(216,184,152,0.48)] hover:bg-[rgba(27,21,17,0.95)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-50"
            >
              Quick View
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`min-h-10 rounded-[10px] border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${toneToCtaClasses[tone]}`}
            >
              {primaryCtaLabel}
            </button>
          </div>
        )}
      </div>

      <div className="store-v2-product-meta">
        <h3 className="store-v2-product-title line-clamp-1 transition group-hover:text-white">{product.name}</h3>
        <div className="flex items-end gap-2">
          <span className="store-v2-product-price">{priceLabel}</span>
          {product.originalPrice ? (
            <span className="text-xs text-stone-500 line-through">${(product.originalPrice / 100).toFixed(2)}</span>
          ) : null}
        </div>
        <p className="store-v2-product-support line-clamp-2">{supportingMeta}</p>

        <div className="store-v2-product-mobile-actions lg:hidden">
          {isLocked ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onQueueAction?.()
              }}
                className="min-h-10 flex-1 rounded-[8px] border border-amber-300/60 bg-[rgba(160,96,52,0.2)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100 transition hover:bg-[rgba(160,96,52,0.34)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-100"
              >
                {lockLabel}
              </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                aria-label={`Mobile ${primaryCtaLabel}`}
                className={`min-h-10 flex-1 rounded-[10px] border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${toneToCtaClasses[tone]}`}
              >
                {primaryCtaLabel}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onQuickView?.(product._id)
                }}
                aria-label="Mobile Quick View"
                className="min-h-10 rounded-[8px] border border-[rgba(216,184,152,0.22)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-100 transition hover:border-[rgba(216,184,152,0.44)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-100"
              >
                Quick View
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
