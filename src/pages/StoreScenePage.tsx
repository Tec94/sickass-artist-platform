import { useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import type { Doc } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import { getMerchSlugCandidates } from '../utils/merchImages'
import {
  STORE_SCENE,
  STORE_SCENE_SLOTS,
  STORE_SCENE_SLOT_ORDER,
  type StoreSceneProductSlot,
  type StoreSceneSlotId,
} from '../features/castleNavigation/storeSceneConfig'
import '../styles/store-scene.css'

interface ScenicStoreProduct {
  _id: string
  name: string
  description: string
  price: number
  imageUrls: string[]
  thumbnailUrl?: string
  category: Doc<'merchProducts'>['category']
  tags: string[]
  variants: Array<{ _id: string; stock: number; color?: string; size?: string }>
  totalStock: number
}

type ResolvedStoreSceneSlot = Omit<StoreSceneProductSlot, 'id'> & {
  id: StoreSceneSlotId
  product: ScenicStoreProduct | null
  route: string | null
}

const normalizeAlias = (value: string) => value.trim().toLowerCase()

const formatPrice = (priceInCents?: number | null) => {
  if (typeof priceInCents !== 'number') return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100)
}

export function StoreScenePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { prefersReducedMotion } = useReducedMotionPreference()
  const [hoveredSlotId, setHoveredSlotId] = useState<StoreSceneSlotId | null>(null)
  const [focusedSlotId, setFocusedSlotId] = useState<StoreSceneSlotId | null>(null)
  const [activeSlotId, setActiveSlotId] = useState<StoreSceneSlotId | null>(null)
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)

  const productsQuery = useQuery(api.merch.getProducts, {
    page: 0,
    pageSize: 120,
    sortBy: 'newest',
  })

  const debugScene = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get('debugStoreScene') === '1'
  }, [location.search])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    const updatePointerMode = () => setIsCoarsePointer(mediaQuery.matches)

    updatePointerMode()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePointerMode)
      return () => mediaQuery.removeEventListener('change', updatePointerMode)
    }

    mediaQuery.addListener(updatePointerMode)
    return () => mediaQuery.removeListener(updatePointerMode)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setHoveredSlotId(null)
      setFocusedSlotId(null)
      setActiveSlotId(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const products = useMemo(
    () => ((productsQuery?.items ?? []) as ScenicStoreProduct[]),
    [productsQuery?.items],
  )

  const slotProducts = useMemo<ResolvedStoreSceneSlot[]>(() => {
    const aliasIndex = new Map<string, ScenicStoreProduct>()

    for (const product of products) {
      const aliases = getMerchSlugCandidates({
        ...product,
        thumbnailUrl: product.thumbnailUrl ?? '',
      }).map(normalizeAlias)
      for (const alias of aliases) {
        if (!aliasIndex.has(alias)) {
          aliasIndex.set(alias, product)
        }
      }
    }

    return STORE_SCENE_SLOT_ORDER.map((id) => {
      const slot = STORE_SCENE_SLOTS[id]
      const product =
        slot.productAliases
          .map((alias) => aliasIndex.get(normalizeAlias(alias)))
          .find((candidate): candidate is ScenicStoreProduct => Boolean(candidate)) ?? null

      return {
        ...slot,
        id,
        product,
        route: product ? `/store/product/${product._id}` : null,
      }
    })
  }, [products])

  const visibleSlotId = focusedSlotId ?? hoveredSlotId ?? activeSlotId
  const visibleSlot =
    slotProducts.find((slot) => slot.id === visibleSlotId) ??
    (activeSlotId ? slotProducts.find((slot) => slot.id === activeSlotId) : null) ??
    null

  const visiblePrice = formatPrice(visibleSlot?.product?.price)
  const sceneReady = productsQuery !== undefined

  const handleSlotIntent = (slot: ResolvedStoreSceneSlot) => {
    if (!slot.route) return
    navigate(slot.route, {
      state: {
        fromScene: '/store',
      },
    })
  }

  const handleSlotAction = (slot: ResolvedStoreSceneSlot) => {
    if (isCoarsePointer && activeSlotId !== slot.id) {
      setActiveSlotId(slot.id)
      return
    }

    handleSlotIntent(slot)
  }

  const handleSlotPointerEnter = (slotId: StoreSceneSlotId) => {
    setHoveredSlotId(slotId)
    setActiveSlotId(slotId)
  }

  const handleSlotPointerLeave = () => {
    setHoveredSlotId(null)
  }

  const handleSlotKeyDown = (event: ReactKeyboardEvent<SVGPathElement>, slot: ResolvedStoreSceneSlot) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSlotAction(slot)
    }
  }

  return (
    <main className="store-scene" data-debug={debugScene ? 'true' : 'false'}>
      <section className="store-scene__stage">
        <div className="store-scene__scene-controls">
          <div className="store-scene__scene-actions">
            <Link to="/" className="store-scene__control store-scene__control--secondary">
              Return to Grounds
            </Link>
          </div>

          <div className="store-scene__scene-actions store-scene__scene-actions--end">
            <Link to="/store/browse" className="store-scene__control store-scene__control--primary">
              Open Store UI
            </Link>
            {isCoarsePointer ? <p className="store-scene__mobile-hint">{STORE_SCENE.mobileHint}</p> : null}
          </div>
        </div>

        <div className="store-scene__scene-wrap">
          <div
            className="store-scene__scene"
            onClick={(event) => {
              if (event.target !== event.currentTarget) return
              setHoveredSlotId(null)
              setFocusedSlotId(null)
              setActiveSlotId(null)
            }}
          >
            <img
              className="store-scene__image"
              src={STORE_SCENE.image}
              alt="Merchant wing of the ROA estate with featured products displayed across the room."
            />
            <div className="store-scene__vignette" aria-hidden="true" />
            <div className="store-scene__grain" aria-hidden="true" />
            <div className="store-scene__glow" aria-hidden="true" />

            <svg
              className="store-scene__overlay"
              viewBox={`0 0 ${STORE_SCENE.width} ${STORE_SCENE.height}`}
              preserveAspectRatio="xMidYMid meet"
              role="group"
              aria-labelledby="store-scene-title store-scene-description"
            >
              <title id="store-scene-title">ROA Store scene</title>
              <desc id="store-scene-description">
                Explore eight featured products in the merchant wing or open the full Store UI.
              </desc>

              <defs>
                <filter id="store-scene-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="20" result="blurred" />
                  <feMerge>
                    <feMergeNode in="blurred" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {slotProducts.map((slot) => (
                  <clipPath id={`store-scene-clip-${slot.id}`} key={`clip-${slot.id}`}>
                    <path d={slot.d} />
                  </clipPath>
                ))}

                {slotProducts.map((slot) => (
                  <linearGradient
                    id={`store-scene-tint-${slot.id}`}
                    key={`tint-${slot.id}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={slot.hoverAccent} stopOpacity="0.4" />
                    <stop offset="54%" stopColor={slot.hoverAccent} stopOpacity="0.14" />
                    <stop offset="100%" stopColor={slot.hoverAccent} stopOpacity="0.03" />
                  </linearGradient>
                ))}

                <linearGradient id="store-scene-sheen-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="47%" stopColor="#ffffff" stopOpacity="0.04" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.72" />
                  <stop offset="53%" stopColor="#ffffff" stopOpacity="0.09" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {debugScene ? (
                <path
                  d={STORE_SCENE.areaPath}
                  className="store-scene__area-outline"
                  aria-hidden="true"
                />
              ) : null}

              {slotProducts.map((slot) => {
                const isActive = visibleSlot?.id === slot.id
                const fillOpacity = isActive ? 0.18 : debugScene ? 0.14 : 0
                const strokeOpacity = isActive ? 0.84 : debugScene ? 0.52 : 0.08
                const strokeWidth = isActive ? 10 : debugScene ? 7 : 4

                return (
                  <g key={slot.id}>
                    {isActive ? (
                      <g
                        aria-hidden="true"
                        clipPath={`url(#store-scene-clip-${slot.id})`}
                        filter="url(#store-scene-glow)"
                      >
                        <rect
                          width={STORE_SCENE.width}
                          height={STORE_SCENE.height}
                          fill={`url(#store-scene-tint-${slot.id})`}
                          opacity={0.8}
                        />
                        {!prefersReducedMotion ? (
                          <rect
                            className="store-scene__sheen"
                            x={-STORE_SCENE.width * 0.65}
                            y={0}
                            width={STORE_SCENE.width * 0.55}
                            height={STORE_SCENE.height}
                            fill="url(#store-scene-sheen-gradient)"
                          />
                        ) : null}
                      </g>
                    ) : null}

                    <path
                      d={slot.d}
                      className="store-scene__outline"
                      aria-hidden="true"
                      fill={fillOpacity ? slot.hoverAccent : 'transparent'}
                      fillOpacity={fillOpacity}
                      stroke={slot.hoverAccent}
                      strokeOpacity={strokeOpacity}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      data-slot-id={slot.id}
                      data-debug={debugScene ? 'true' : 'false'}
                    />

                    <path
                      d={slot.d}
                      tabIndex={0}
                      focusable="true"
                      role="button"
                      aria-label={`${slot.label}. ${slot.product ? 'Opens product detail.' : 'Product currently unavailable.'} ${slot.preview}`}
                      aria-keyshortcuts="Enter Space"
                      className="store-scene__hit-slot"
                      data-slot-id={slot.id}
                      data-hit-slot="true"
                      fill="rgb(255 255 255 / 0.001)"
                      stroke="transparent"
                      strokeWidth={debugScene ? 20 : 32}
                      onPointerEnter={() => handleSlotPointerEnter(slot.id)}
                      onPointerLeave={handleSlotPointerLeave}
                      onClick={() => handleSlotAction(slot)}
                      onFocus={() => {
                        setFocusedSlotId(slot.id)
                        setActiveSlotId(slot.id)
                      }}
                      onBlur={() => {
                        setFocusedSlotId(null)
                      }}
                      onKeyDown={(event) => handleSlotKeyDown(event, slot)}
                    />
                  </g>
                )
              })}
            </svg>

            <div
              className="store-scene__dock"
              data-active={visibleSlot ? 'true' : 'false'}
              data-slot-id={visibleSlot?.id ?? 'default'}
              data-scene-slot-card="true"
            >
              <p className="store-scene__eyebrow">
                {visibleSlot ? visibleSlot.eyebrow : 'Merchant Wing'}
              </p>
              <h1 className="store-scene__title">
                {visibleSlot ? visibleSlot.label : 'Featured collection'}
              </h1>
              <p className="store-scene__copy">
                {visibleSlot
                  ? visibleSlot.preview
                  : 'Select a featured piece to preview it, or move into the full Store UI for search, filters, queue status, and cart access.'}
              </p>

              <div className="store-scene__meta-row">
                {visiblePrice ? (
                  <span className="store-scene__price">{visiblePrice}</span>
                ) : null}
                <span className="store-scene__meta">
                  {visibleSlot?.product
                    ? 'Direct entry to product detail'
                    : sceneReady
                      ? 'Open Store UI for the full catalog'
                      : 'Loading featured collection'}
                </span>
              </div>
            </div>

            {debugScene ? (
              <aside className="store-scene__debug-panel" aria-hidden="true">
                <p>Store scene debug</p>
                <ul>
                  {slotProducts.map((slot) => (
                    <li key={slot.id} data-debug-slot={slot.id}>
                      <span>{slot.debugLabel}</span>
                      <strong>{slot.product?.name ?? 'Unresolved product'}</strong>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}
