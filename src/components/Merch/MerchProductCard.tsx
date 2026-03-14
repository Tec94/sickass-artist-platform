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
  'rounded-[10px] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md'

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
      className="group relative flex h-full cursor-pointer flex-col rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-100"
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
      <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-2xl border border-slate-700/28 bg-slate-950 transition group-hover:border-slate-300/62">
        {isPrimaryLoading ? (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/90" />
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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew ? (
            <span className={`${badgeClassName} border border-red-300/60 bg-red-500/55 text-red-50`}>New</span>
          ) : null}
          {isLimited ? (
            <span className={`${badgeClassName} border border-amber-200/70 bg-amber-500/55 text-amber-50`}>Limited</span>
          ) : null}
          {isOutOfStock ? (
            <span className={`${badgeClassName} border border-slate-400/60 bg-slate-900/75 text-slate-100`}>Sold Out</span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlistLabel}
          title={wishlistLabel}
          className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-100 ${
            isWishlisted
              ? 'border-red-300/80 bg-red-500/25 text-red-200'
              : 'border-slate-300/35 bg-slate-950/70 text-slate-100 hover:border-slate-200/80'
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
              className="flex min-h-10 w-full items-center justify-center rounded-[10px] border border-amber-200/70 bg-black/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-100 backdrop-blur-md transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-100"
            >
              {lockLabel}
            </button>
          </div>
        ) : (
          <div className="absolute inset-x-3 bottom-3 hidden translate-y-4 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 lg:grid">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onQuickView?.(product._id)
              }}
              className="min-h-10 rounded-[10px] border border-slate-300/55 bg-black/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-50 backdrop-blur-sm transition hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-50"
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

      <div className="mt-auto space-y-1.5">
        <h3 className="line-clamp-1 text-[15px] font-semibold text-slate-100 transition group-hover:text-white">{product.name}</h3>
        <div className="flex items-end gap-2">
          <span className="text-xl font-bold leading-none text-emerald-300">{priceLabel}</span>
          {product.originalPrice ? (
            <span className="text-xs text-slate-400 line-through">${(product.originalPrice / 100).toFixed(2)}</span>
          ) : null}
        </div>
        <p className="line-clamp-1 text-xs font-medium text-slate-300">{isLocked ? 'Queue-gated product' : variantSummary}</p>

        <div className="flex items-center gap-2 pt-1 lg:hidden">
          {isLocked ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onQueueAction?.()
              }}
              className="min-h-10 flex-1 rounded-[10px] border border-amber-300/70 bg-amber-500/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-100 transition hover:bg-amber-500/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-100"
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
                className="min-h-10 rounded-[10px] border border-slate-500/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-100 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-100"
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
