
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id, type Doc } from '../../convex/_generated/dataModel'
import { MerchProductCard } from '../components/Merch/MerchProductCard'
import { StoreReminderModal } from '../components/Merch/StoreReminderModal'
import { useTranslation } from '../hooks/useTranslation'
import { getMerchSlugCandidates } from '../utils/merchImages'
import { resolveMerchManifestEntries } from '../utils/merchManifestClient'
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import { useCart } from '../contexts/CartContext'
import { showToast } from '../lib/toast'
import { useUser } from '../contexts/UserContext'
import type { StoreQueueStateViewModel, StoreQueueTargetViewModel } from '../types/store-queue'

interface StoreProduct {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  imageUrls: string[]
  thumbnailUrl?: string
  category: Doc<'merchProducts'>['category']
  tags: string[]
  variants: Array<{ _id: Id<'merchVariants'>; stock: number; color?: string; size?: string }>
  totalStock: number
  isNew?: boolean
  _creationTime?: number
}

type StoreSortOption = 'newest' | 'best-selling' | 'price-asc' | 'price-desc' | 'alpha'
type StockFilterOption = 'all' | 'in-stock' | 'out-of-stock'
type FilterSectionKey = 'category' | 'availability' | 'collection' | 'price'

interface StoreFilterState {
  category: string
  minPrice: number
  maxPrice: number
  selectedCollections: string[]
  stock: StockFilterOption
}

interface ActiveStoreFilterChip {
  id: string
  label: string
}

interface UpcomingDropViewModel {
  id: string
  name: string
  description?: string
  startsAt: number
  endsAt: number
  localDateTime: string
  timezone: string
}

type QueuePrimaryAction = 'none' | 'learn' | 'sign-in' | 'join' | 'claim' | 'shop'
type QueueSecondaryAction = 'none' | 'leave'

interface QueueControlModel {
  statusLabel: string
  detailLabel: string
  primaryLabel: string
  primaryAction: QueuePrimaryAction
  primaryDisabled: boolean
  secondaryLabel?: string
  secondaryAction?: QueueSecondaryAction
}

const PRICE_MIN_DEFAULT = 0
const PRICE_MAX_DEFAULT = 400
const PRICE_STEP = 5

const SORT_OPTIONS: Array<{ value: StoreSortOption; labelKey: string }> = [
  { value: 'newest', labelKey: 'store.sortNewest' },
  { value: 'best-selling', labelKey: 'store.sortBestSellers' },
  { value: 'price-asc', labelKey: 'store.sortPriceLowHigh' },
  { value: 'price-desc', labelKey: 'store.sortPriceHighLow' },
  { value: 'alpha', labelKey: 'store.sortAlphabetical' },
]

const STOCK_OPTIONS: Array<{ value: StockFilterOption; labelKey: string }> = [
  { value: 'all', labelKey: 'store.allItems' },
  { value: 'in-stock', labelKey: 'store.inStock' },
  { value: 'out-of-stock', labelKey: 'store.outOfStock' },
]

const INITIAL_COLLAPSED_STATE: Record<FilterSectionKey, boolean> = {
  category: false,
  availability: false,
  collection: false,
  price: false,
}

function formatClockTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp)
}

export function Merch() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { motionClassName } = useReducedMotionPreference()
  const { itemCount } = useCart()
  const { isSignedIn } = useUser()

  const initialSearch = searchParams.get('search') || ''
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [sortBy, setSortBy] = useState<StoreSortOption>('newest')
  const [filters, setFilters] = useState<StoreFilterState>({
    category: '',
    minPrice: PRICE_MIN_DEFAULT,
    maxPrice: PRICE_MAX_DEFAULT,
    selectedCollections: [],
    stock: 'all',
  })
  const [collapsedSections, setCollapsedSections] = useState<Record<FilterSectionKey, boolean>>(INITIAL_COLLAPSED_STATE)
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isUtilitySticky, setIsUtilitySticky] = useState(false)
  const [utilityHeight, setUtilityHeight] = useState(0)

  const stickySentinelRef = useRef<HTMLDivElement | null>(null)
  const utilityRowRef = useRef<HTMLDivElement | null>(null)

  const productsQuery = useQuery(api.merch.getProducts, {
    page: 0,
    pageSize: 120,
    sortBy: 'newest',
  })
  const upcomingDrops = useQuery(api.merch.getUpcomingDrops)
  const queueTargetRaw = useQuery(api.merchQueue.getQueueTargetDrop)

  const queueTarget = (queueTargetRaw ?? null) as StoreQueueTargetViewModel | null
  const queueDropId = queueTarget?.drop?._id ?? null
  const myQueueStateRaw = useQuery(api.merchQueue.getMyQueueState, queueDropId ? { dropId: queueDropId } : 'skip')
  const myQueueState = (myQueueStateRaw ?? null) as StoreQueueStateViewModel | null

  const recordRecentlyViewed = useMutation(api.merch.recordRecentlyViewed)
  const recentlyViewed = useQuery(api.merch.getRecentlyViewed, { limit: 8 })
  const addToCart = useMutation(api.cart.addToCart)
  const joinQueue = useMutation(api.merchQueue.joinQueue)
  const leaveQueue = useMutation(api.merchQueue.leaveQueue)
  const claimSlot = useMutation(api.merchQueue.claimSlot)

  const queueNowUtc = queueTarget?.now ?? Date.now()
  const hasActiveSlot =
    myQueueState?.status === 'admitted' &&
    typeof myQueueState.slotExpiresAtUtc === 'number' &&
    myQueueState.slotExpiresAtUtc > queueNowUtc

  const lockableProductIds = useMemo(() => {
    if (!queueTarget?.drop || queueTarget.state !== 'active') {
      return new Set<string>()
    }
    return new Set(queueTarget.drop.products.map((productId) => String(productId)))
  }, [queueTarget?.drop, queueTarget?.state])

  const queueGateEnabled = queueTarget?.state === 'active' && Boolean(queueTarget.drop) && !hasActiveSlot

  const resetStoreFilters = useCallback(() => {
    setSearchTerm('')
    setSortBy('newest')
    setCollapsedSections(INITIAL_COLLAPSED_STATE)
    setFilters({
      category: '',
      minPrice: PRICE_MIN_DEFAULT,
      maxPrice: PRICE_MAX_DEFAULT,
      selectedCollections: [],
      stock: 'all',
    })
  }, [])

  const setPriceRange = useCallback((nextMin: number, nextMax: number) => {
    setFilters((current) => {
      const clampedMin = Math.max(PRICE_MIN_DEFAULT, Math.min(nextMin, PRICE_MAX_DEFAULT))
      const clampedMax = Math.max(PRICE_MIN_DEFAULT, Math.min(nextMax, PRICE_MAX_DEFAULT))
      return {
        ...current,
        minPrice: Math.min(clampedMin, clampedMax),
        maxPrice: Math.max(clampedMin, clampedMax),
      }
    })
  }, [])

  const handleCollectionToggle = useCallback((collection: string) => {
    setFilters((current) => ({
      ...current,
      selectedCollections: current.selectedCollections.includes(collection)
        ? current.selectedCollections.filter((item) => item !== collection)
        : [...current.selectedCollections, collection],
    }))
  }, [])

  const products = (productsQuery?.items ?? []) as StoreProduct[]

  const filteredProducts = useMemo(() => {
    let next = [...products]
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (normalizedSearch) {
      next = next.filter(
        (product) =>
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.description.toLowerCase().includes(normalizedSearch) ||
          product.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch)),
      )
    }

    if (filters.category) {
      next = next.filter((product) => product.category === filters.category)
    }

    if (filters.selectedCollections.length > 0) {
      next = next.filter((product) =>
        product.tags.some((tag) => filters.selectedCollections.includes(tag.toLowerCase())),
      )
    }

    next = next.filter((product) => {
      const priceValue = product.price / 100
      return priceValue >= filters.minPrice && priceValue <= filters.maxPrice
    })

    if (filters.stock === 'in-stock') {
      next = next.filter((product) => product.variants.some((variant) => variant.stock > 0))
    } else if (filters.stock === 'out-of-stock') {
      next = next.filter((product) => product.variants.every((variant) => variant.stock === 0))
    }

    next.sort((a, b) => {
      switch (sortBy) {
        case 'best-selling':
          return a.totalStock - b.totalStock || (b._creationTime || 0) - (a._creationTime || 0)
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'alpha':
          return a.name.localeCompare(b.name)
        case 'newest':
        default:
          return (b._creationTime || 0) - (a._creationTime || 0)
      }
    })

    return next
  }, [products, searchTerm, filters.category, filters.minPrice, filters.maxPrice, filters.selectedCollections, filters.stock, sortBy])

  const quickViewProduct = useMemo(() => {
    if (!quickViewProductId) return null
    return filteredProducts.find((product) => product._id === quickViewProductId) ?? null
  }, [filteredProducts, quickViewProductId])

  const quickViewLocked = Boolean(quickViewProduct && queueGateEnabled && lockableProductIds.has(quickViewProduct._id))

  const manifestSlugs = useMemo(() => {
    const slugs = filteredProducts.flatMap((product) =>
      getMerchSlugCandidates({
        name: product.name,
        imageUrls: product.imageUrls,
        thumbnailUrl: product.thumbnailUrl ?? '',
        category: product.category,
        tags: product.tags,
        variants: product.variants,
      }),
    )
    return Array.from(new Set(slugs))
  }, [filteredProducts])

  const manifestEntries = useQuery(
    api.merchManifest.getMerchImageManifestEntries,
    manifestSlugs.length ? { slugs: manifestSlugs } : 'skip',
  )
  const resolvedManifest = useMemo(
    () => resolveMerchManifestEntries(manifestSlugs, manifestEntries?.entries ?? null),
    [manifestSlugs, manifestEntries?.entries],
  )

  const categoryOptions = useMemo(
    () => [
      { value: '', label: t('store.allProducts') },
      { value: 'apparel', label: t('store.apparel') },
      { value: 'accessories', label: t('store.accessories') },
      { value: 'vinyl', label: t('store.vinyl') },
      { value: 'limited', label: t('store.limitedEdition') },
    ],
    [t],
  )

  const collectionOptions = useMemo(
    () => [
      { value: 'tour collection', label: t('store.tourCollection') },
      { value: 'signature series', label: t('store.signatureSeries') },
      { value: 'the vault', label: t('store.theVault') },
    ],
    [t],
  )

  const userTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', [])
  const upcomingDrop = useMemo<UpcomingDropViewModel | null>(() => {
    if (!upcomingDrops?.length) return null

    const nextDrop = [...upcomingDrops].sort((a, b) => a.startsAt - b.startsAt)[0]
    const dateFormatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: userTimeZone,
    })

    return {
      id: String(nextDrop._id),
      name: nextDrop.name,
      description: nextDrop.description,
      startsAt: nextDrop.startsAt,
      endsAt: nextDrop.endsAt,
      localDateTime: dateFormatter.format(nextDrop.startsAt),
      timezone: userTimeZone,
    }
  }, [upcomingDrops, userTimeZone])

  const activeFilterChips = useMemo<ActiveStoreFilterChip[]>(() => {
    const chips: ActiveStoreFilterChip[] = []
    const normalizedSearch = searchTerm.trim()

    if (normalizedSearch) {
      chips.push({
        id: 'search',
        label: `${t('common.search')}: ${normalizedSearch}`,
      })
    }

    if (filters.category) {
      const category = categoryOptions.find((option) => option.value === filters.category)
      if (category) {
        chips.push({
          id: 'category',
          label: `${t('store.filterCategory')}: ${category.label}`,
        })
      }
    }

    if (filters.stock !== 'all') {
      chips.push({
        id: 'availability',
        label: `${t('store.filterAvailability')}: ${filters.stock === 'in-stock' ? t('store.inStock') : t('store.outOfStock')}`,
      })
    }

    for (const collectionValue of filters.selectedCollections) {
      const collection = collectionOptions.find((option) => option.value === collectionValue)
      if (!collection) continue
      chips.push({
        id: `collection:${collectionValue}`,
        label: `${t('store.filterCollection')}: ${collection.label}`,
      })
    }

    if (filters.minPrice !== PRICE_MIN_DEFAULT || filters.maxPrice !== PRICE_MAX_DEFAULT) {
      chips.push({
        id: 'price',
        label: `${t('store.filterPriceRange')}: $${filters.minPrice.toFixed(0)} - $${filters.maxPrice.toFixed(0)}`,
      })
    }

    return chips
  }, [
    searchTerm,
    filters.category,
    filters.stock,
    filters.selectedCollections,
    filters.minPrice,
    filters.maxPrice,
    categoryOptions,
    collectionOptions,
    t,
  ])

  const removeActiveChip = useCallback((chipId: string) => {
    if (chipId === 'search') {
      setSearchTerm('')
      return
    }

    if (chipId === 'category') {
      setFilters((current) => ({ ...current, category: '' }))
      return
    }

    if (chipId === 'availability') {
      setFilters((current) => ({ ...current, stock: 'all' }))
      return
    }

    if (chipId === 'price') {
      setPriceRange(PRICE_MIN_DEFAULT, PRICE_MAX_DEFAULT)
      return
    }

    if (chipId.startsWith('collection:')) {
      const collection = chipId.replace('collection:', '')
      setFilters((current) => ({
        ...current,
        selectedCollections: current.selectedCollections.filter((item) => item !== collection),
      }))
    }
  }, [setPriceRange])

  useEffect(() => {
    if (!showMobileFilters && !quickViewProductId) return

    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (quickViewProductId) {
        setQuickViewProductId(null)
        return
      }
      setShowMobileFilters(false)
    }

    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [showMobileFilters, quickViewProductId])

  useEffect(() => {
    const node = utilityRowRef.current
    if (!node) return

    const updateHeight = () => {
      setUtilityHeight(node.getBoundingClientRect().height)
    }

    updateHeight()

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => updateHeight())
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const sentinel = stickySentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsUtilitySticky(!entry.isIntersecting)
      },
      {
        threshold: [1],
        rootMargin: '-76px 0px 0px 0px',
      },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const openProduct = async (productId: string) => {
    navigate(`/store/product/${productId}`)
    try {
      await recordRecentlyViewed({ productId: productId as Id<'merchProducts'> })
    } catch {
      // Ignore for signed-out users.
    }
  }

  const queueReturnTo = `${location.pathname}${location.search}${location.hash}`

  const openQueueSignIn = useCallback(() => {
    navigate(`/sign-in?returnTo=${encodeURIComponent(queueReturnTo)}`)
  }, [navigate, queueReturnTo])

  const runQueueAction = useCallback(
    async (action: 'join' | 'leave' | 'claim') => {
      if (!queueDropId) return

      if (!isSignedIn) {
        openQueueSignIn()
        return
      }

      try {
        if (action === 'join') {
          await joinQueue({ dropId: queueDropId })
          showToast(t('store.queueJoined'), { type: 'success' })
          return
        }

        if (action === 'leave') {
          await leaveQueue({ dropId: queueDropId })
          showToast(t('store.queueLeft'), { type: 'success' })
          return
        }

        await claimSlot({ dropId: queueDropId })
        showToast(t('store.queueAdmitted'), { type: 'success' })
      } catch (error) {
        const fallbackMessage = t('store.queueActionFailed')
        const message = error instanceof Error ? error.message || fallbackMessage : fallbackMessage
        showToast(message, { type: 'error' })
      }
    },
    [claimSlot, isSignedIn, joinQueue, leaveQueue, openQueueSignIn, queueDropId, t],
  )

  const queueCooldownMinutes =
    myQueueState?.cooldownUntilUtc && myQueueState.cooldownUntilUtc > queueNowUtc
      ? Math.ceil((myQueueState.cooldownUntilUtc - queueNowUtc) / (60 * 1000))
      : 0

  const queueControl = useMemo<QueueControlModel>(() => {
    if (!queueTarget?.drop) {
      return {
        statusLabel: t('store.queueUnavailable'),
        detailLabel: t('store.queueUnavailableMeta'),
        primaryLabel: t('store.learnAboutDrop'),
        primaryAction: 'learn',
        primaryDisabled: false,
      }
    }

    if (!isSignedIn) {
      return {
        statusLabel: t('store.queueSignInRequired'),
        detailLabel: queueTarget.state === 'active' ? t('store.queueOpenNow') : t('store.queuePreQueueOpen'),
        primaryLabel: t('store.queueSignInToJoin'),
        primaryAction: 'sign-in',
        primaryDisabled: false,
      }
    }

    const hasTerminalState = !myQueueState || myQueueState.status === 'left' || myQueueState.status === 'expired'
    if (queueCooldownMinutes > 0 && hasTerminalState) {
      return {
        statusLabel: t('store.queueCooldown'),
        detailLabel: `${queueCooldownMinutes}m`,
        primaryLabel: t('store.queueCooldown'),
        primaryAction: 'none',
        primaryDisabled: true,
      }
    }

    if (!myQueueState || myQueueState.status === 'left' || myQueueState.status === 'expired') {
      return {
        statusLabel: queueTarget.state === 'active' ? t('store.queueOpenNow') : t('store.queuePreQueueOpen'),
        detailLabel: queueTarget.drop.name,
        primaryLabel: queueTarget.state === 'active' ? t('store.joinQueueNow') : t('store.joinPreQueue'),
        primaryAction: 'join',
        primaryDisabled: false,
      }
    }

    if (myQueueState.status === 'waiting') {
      const position = myQueueState.position + 1
      const waitMeta = myQueueState.estimatedWaitMinutes > 0 ? ` · ${myQueueState.estimatedWaitMinutes}m` : ''
      if (queueTarget.state === 'active' && myQueueState.canClaimSlot) {
        return {
          statusLabel: t('store.queueWaiting'),
          detailLabel: `#${position}${waitMeta}`,
          primaryLabel: t('store.claimQueueSlot'),
          primaryAction: 'claim',
          primaryDisabled: false,
          secondaryLabel: t('store.leaveQueue'),
          secondaryAction: 'leave',
        }
      }

      return {
        statusLabel: t('store.queueWaiting'),
        detailLabel: `#${position}${waitMeta}`,
        primaryLabel: t('store.queueWaiting'),
        primaryAction: 'none',
        primaryDisabled: true,
        secondaryLabel: t('store.leaveQueue'),
        secondaryAction: 'leave',
      }
    }

    if (myQueueState.status === 'admitted' && hasActiveSlot) {
      return {
        statusLabel: t('store.queueAdmitted'),
        detailLabel: `${t('store.queueSlotExpires')} ${formatClockTime(myQueueState.slotExpiresAtUtc ?? queueNowUtc)}`,
        primaryLabel: t('store.shopQueueSlot'),
        primaryAction: 'shop',
        primaryDisabled: false,
        secondaryLabel: t('store.leaveQueue'),
        secondaryAction: 'leave',
      }
    }

    return {
      statusLabel: t('store.queueOpenNow'),
      detailLabel: queueTarget.drop.name,
      primaryLabel: t('store.joinQueueNow'),
      primaryAction: 'join',
      primaryDisabled: false,
    }
  }, [
    hasActiveSlot,
    isSignedIn,
    myQueueState,
    queueCooldownMinutes,
    queueNowUtc,
    queueTarget?.drop,
    queueTarget?.state,
    t,
  ])

  const handleQueuePrimaryAction = useCallback(() => {
    switch (queueControl.primaryAction) {
      case 'learn':
        navigate('/store/drops')
        break
      case 'sign-in':
        openQueueSignIn()
        break
      case 'join':
        void runQueueAction('join')
        break
      case 'claim':
        void runQueueAction('claim')
        break
      case 'shop':
        document.getElementById('store-product-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      case 'none':
      default:
        break
    }
  }, [navigate, openQueueSignIn, queueControl.primaryAction, runQueueAction])

  const handleQueueSecondaryAction = useCallback(() => {
    if (queueControl.secondaryAction === 'leave') {
      void runQueueAction('leave')
    }
  }, [queueControl.secondaryAction, runQueueAction])

  const handleQueueLockAction = useCallback(() => {
    if (!queueTarget?.drop) {
      navigate('/store/drops')
      return
    }

    if (!isSignedIn) {
      openQueueSignIn()
      return
    }

    if (myQueueState?.status === 'waiting' && queueTarget.state === 'active' && myQueueState.canClaimSlot) {
      void runQueueAction('claim')
      return
    }

    if (hasActiveSlot) {
      document.getElementById('store-product-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    void runQueueAction('join')
  }, [hasActiveSlot, isSignedIn, myQueueState?.canClaimSlot, myQueueState?.status, navigate, openQueueSignIn, queueTarget?.drop, queueTarget?.state, runQueueAction])

  const handleQuickViewAddToCart = async () => {
    if (!quickViewProduct) return

    if (quickViewLocked) {
      handleQueueLockAction()
      return
    }

    const firstAvailableVariant = quickViewProduct.variants.find((variant) => variant.stock > 0) || quickViewProduct.variants[0]
    if (!firstAvailableVariant?._id) {
      navigate(`/store/product/${quickViewProduct._id}`)
      return
    }

    try {
      await addToCart({ variantId: firstAvailableVariant._id, quantity: 1 })
      showToast('Added to cart', { type: 'success' })
    } catch {
      showToast('Failed to add to cart', { type: 'error' })
    }
  }

  const toggleSection = useCallback((section: FilterSectionKey) => {
    setCollapsedSections((current) => ({
      ...current,
      [section]: !current[section],
    }))
  }, [])

  const sectionCounts = {
    category: filters.category ? 1 : 0,
    availability: filters.stock !== 'all' ? 1 : 0,
    collection: filters.selectedCollections.length,
    price: filters.minPrice !== PRICE_MIN_DEFAULT || filters.maxPrice !== PRICE_MAX_DEFAULT ? 1 : 0,
  }

  const sliderRange = PRICE_MAX_DEFAULT - PRICE_MIN_DEFAULT
  const minPercent = ((filters.minPrice - PRICE_MIN_DEFAULT) / sliderRange) * 100
  const maxPercent = ((filters.maxPrice - PRICE_MIN_DEFAULT) / sliderRange) * 100

  const reminderCtaLabel = upcomingDrop ? t('store.setReminder') : t('store.notifyNextDrop')
  const resultsLabel = `${filteredProducts.length} ${t('store.results')}`

  const filterPanel = (
    <div className="store-v2-sidebar" data-testid="store-sidebar-panel">
      <section className="store-v2-filter-section">
        <button
          type="button"
          className="store-v2-filter-section-trigger"
          onClick={() => toggleSection('category')}
          aria-expanded={!collapsedSections.category}
        >
          <span className="store-v2-label">{t('store.filterCategory')}</span>
          <span className="flex items-center gap-2">
            {sectionCounts.category > 0 ? <span className="store-v2-count-badge">{sectionCounts.category}</span> : null}
            <iconify-icon icon={collapsedSections.category ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-up-linear'} width="16" height="16"></iconify-icon>
          </span>
        </button>
        {!collapsedSections.category ? (
          <div className="mt-2 grid gap-1">
            {categoryOptions.map((option) => {
              const active = filters.category === option.value
              return (
                <button
                  key={option.value || 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilters((current) => ({ ...current, category: option.value }))}
                  className={`store-v2-sidebar-row ${active ? 'store-v2-sidebar-row--active' : ''}`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        ) : null}
      </section>

      <section className="store-v2-filter-section">
        <button
          type="button"
          className="store-v2-filter-section-trigger"
          onClick={() => toggleSection('availability')}
          aria-expanded={!collapsedSections.availability}
        >
          <span className="store-v2-label">{t('store.filterAvailability')}</span>
          <span className="flex items-center gap-2">
            {sectionCounts.availability > 0 ? <span className="store-v2-count-badge">{sectionCounts.availability}</span> : null}
            <iconify-icon icon={collapsedSections.availability ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-up-linear'} width="16" height="16"></iconify-icon>
          </span>
        </button>
        {!collapsedSections.availability ? (
          <div className="mt-2 grid gap-1">
            {STOCK_OPTIONS.map((option) => {
              const active = filters.stock === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilters((current) => ({ ...current, stock: option.value }))}
                  className={`store-v2-sidebar-row ${active ? 'store-v2-sidebar-row--active' : ''}`}
                >
                  {t(option.labelKey)}
                </button>
              )
            })}
          </div>
        ) : null}
      </section>

      <section className="store-v2-filter-section">
        <button
          type="button"
          className="store-v2-filter-section-trigger"
          onClick={() => toggleSection('collection')}
          aria-expanded={!collapsedSections.collection}
        >
          <span className="store-v2-label">{t('store.filterCollection')}</span>
          <span className="flex items-center gap-2">
            {sectionCounts.collection > 0 ? <span className="store-v2-count-badge">{sectionCounts.collection}</span> : null}
            <iconify-icon icon={collapsedSections.collection ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-up-linear'} width="16" height="16"></iconify-icon>
          </span>
        </button>
        {!collapsedSections.collection ? (
          <div className="mt-2 grid gap-1">
            {collectionOptions.map((collection) => {
              const active = filters.selectedCollections.includes(collection.value)
              return (
                <button
                  key={collection.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleCollectionToggle(collection.value)}
                  className={`store-v2-sidebar-row ${active ? 'store-v2-sidebar-row--active' : ''}`}
                >
                  {collection.label}
                </button>
              )
            })}
          </div>
        ) : null}
      </section>

      <section className="store-v2-filter-section">
        <button
          type="button"
          className="store-v2-filter-section-trigger"
          onClick={() => toggleSection('price')}
          aria-expanded={!collapsedSections.price}
        >
          <span className="store-v2-label">{t('store.filterPriceRange')}</span>
          <span className="flex items-center gap-2">
            {sectionCounts.price > 0 ? <span className="store-v2-count-badge">{sectionCounts.price}</span> : null}
            <iconify-icon icon={collapsedSections.price ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-up-linear'} width="16" height="16"></iconify-icon>
          </span>
        </button>

        {!collapsedSections.price ? (
          <div className="mt-3 space-y-3">
            <p className="store-v2-meta">${filters.minPrice.toFixed(0)} - ${filters.maxPrice.toFixed(0)}</p>
            <div className="store-v2-range-shell" aria-hidden="true">
              <div className="store-v2-range-track">
                <span className="store-v2-range-fill" style={{ left: `${minPercent}%`, width: `${Math.max(maxPercent - minPercent, 0)}%` }} />
              </div>
              <input
                type="range"
                min={PRICE_MIN_DEFAULT}
                max={PRICE_MAX_DEFAULT}
                step={PRICE_STEP}
                value={filters.minPrice}
                onChange={(event) => setPriceRange(Number(event.target.value), filters.maxPrice)}
                className="store-v2-range-input"
                aria-label={t('store.minPriceLabel')}
              />
              <input
                type="range"
                min={PRICE_MIN_DEFAULT}
                max={PRICE_MAX_DEFAULT}
                step={PRICE_STEP}
                value={filters.maxPrice}
                onChange={(event) => setPriceRange(filters.minPrice, Number(event.target.value))}
                className="store-v2-range-input"
                aria-label={t('store.maxPriceLabel')}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="store-v2-price-input-wrap">
                <span className="store-v2-label">{t('store.minPriceLabel')}</span>
                <input
                  type="number"
                  min={PRICE_MIN_DEFAULT}
                  max={PRICE_MAX_DEFAULT}
                  step={PRICE_STEP}
                  value={filters.minPrice}
                  onChange={(event) => {
                    const parsed = Number(event.target.value)
                    if (!Number.isFinite(parsed)) return
                    setPriceRange(parsed, filters.maxPrice)
                  }}
                  className="store-v2-control store-v2-price-input"
                  inputMode="numeric"
                />
              </label>
              <label className="store-v2-price-input-wrap">
                <span className="store-v2-label">{t('store.maxPriceLabel')}</span>
                <input
                  type="number"
                  min={PRICE_MIN_DEFAULT}
                  max={PRICE_MAX_DEFAULT}
                  step={PRICE_STEP}
                  value={filters.maxPrice}
                  onChange={(event) => {
                    const parsed = Number(event.target.value)
                    if (!Number.isFinite(parsed)) return
                    setPriceRange(filters.minPrice, parsed)
                  }}
                  className="store-v2-control store-v2-price-input"
                  inputMode="numeric"
                />
              </label>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )

  return (
    <div className={`app-surface-page store-v2-root ${motionClassName}`}>
      <div className="mx-auto w-full max-w-[1700px] px-4 py-4 sm:px-6 lg:px-8">
        <section className="store-surface-shell store-v2-shell motion-panel-enter p-4 lg:p-5">
          <header className="space-y-3">
            <section className="store-hero-banner store-v2-hero p-4 lg:p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:items-start">
                <div className="space-y-3">
                  <p className="store-v2-label">{t('store.curatedCommerce')}</p>
                  <h1 className="store-v2-display">{t('store.collectionTitle')}</h1>
                  <p className="store-v2-body max-w-3xl">{t('store.collectionSubtitle')}</p>
                </div>

                <div className="store-v2-drop-module">
                  <p className="store-v2-label">{t('store.upcomingDrop')}</p>
                  {upcomingDrop ? (
                    <>
                      <p className="store-v2-h2 mt-2">{upcomingDrop.name}</p>
                      <p className="store-v2-meta mt-1">
                        {upcomingDrop.localDateTime} ({upcomingDrop.timezone})
                      </p>
                    </>
                  ) : (
                    <p className="store-v2-meta mt-2">{t('store.noUpcomingDropGeneric')}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReminderModalOpen(true)}
                      className="store-v2-control store-v2-btn-primary"
                    >
                      {reminderCtaLabel}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/store/drops')}
                      className="store-v2-control store-v2-btn-secondary"
                    >
                      {t('store.learnAboutDrop')}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="store-announcement-strip store-v2-promo-strip">
              <iconify-icon icon="solar:truck-linear" width="14" height="14"></iconify-icon>
              {t('store.freeShippingPromo')}
            </div>
          </header>

          <div className="mt-4 grid gap-4 lg:grid-cols-[252px_minmax(0,1fr)]">
            <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-fit" aria-label={t('store.filtersLabel')}>
              {filterPanel}
            </aside>

            <main className="min-w-0">
              <div ref={stickySentinelRef} className="h-px w-full" data-testid="store-sticky-sentinel" aria-hidden="true" />
              {isUtilitySticky && utilityHeight > 0 ? (
                <div style={{ height: utilityHeight }} data-testid="store-sticky-spacer" aria-hidden="true" />
              ) : null}

              <div ref={utilityRowRef} className="store-utility-row store-v2-utility sticky top-16 z-40" data-sticky={isUtilitySticky ? 'true' : 'false'}>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(true)}
                    className="store-v2-control store-v2-btn-secondary lg:hidden"
                  >
                    {t('store.filtersLabel')}
                  </button>

                  <label className="store-v2-search-wrap">
                    <span className="sr-only">{t('store.searchProducts')}</span>
                    <iconify-icon
                      icon="solar:magnifer-linear"
                      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    ></iconify-icon>
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder={t('store.searchProducts')}
                      className="store-v2-control store-v2-search"
                      aria-label={t('store.searchProducts')}
                    />
                  </label>

                  <label className="store-v2-sort-wrap">
                    <span className="store-v2-sort-label">{t('store.sortBy')}:</span>
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as StoreSortOption)}
                      className="store-v2-control store-v2-select"
                      aria-label={t('store.sortBy')}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(option.labelKey)}
                        </option>
                      ))}
                    </select>
                    <iconify-icon icon="solar:alt-arrow-down-linear" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"></iconify-icon>
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate('/store/cart')}
                    className="store-v2-control store-v2-cart-button"
                    aria-label={`${t('store.cartButton')} (${itemCount})`}
                  >
                    <iconify-icon icon="solar:bag-3-linear" width="18" height="18"></iconify-icon>
                    {t('store.cartButton')}
                    <span className="store-v2-count-badge">{itemCount}</span>
                  </button>
                </div>

                <div id="store-queue-control" className="store-v2-queue-row">
                  <span className="store-v2-pill">{t('store.queueStatus')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="store-v2-label truncate">{queueControl.statusLabel}</p>
                    <p className="store-v2-meta truncate">{queueControl.detailLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleQueuePrimaryAction}
                    disabled={queueControl.primaryDisabled}
                    className="store-v2-control store-v2-btn-primary"
                  >
                    {queueControl.primaryLabel}
                  </button>
                  {queueControl.secondaryAction === 'leave' ? (
                    <button
                      type="button"
                      onClick={handleQueueSecondaryAction}
                      className="store-v2-control store-v2-btn-secondary"
                    >
                      {queueControl.secondaryLabel}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-b border-slate-700/55 pb-2">
                <p className="store-v2-meta" aria-live="polite">
                  {resultsLabel}
                </p>
              </div>

              {activeFilterChips.length > 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-slate-700/45 pb-3">
                  {activeFilterChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => removeActiveChip(chip.id)}
                      className="store-v2-filter-chip"
                      aria-label={`${t('common.remove')} ${chip.label}`}
                    >
                      <span>{chip.label}</span>
                      <iconify-icon icon="solar:close-circle-linear" width="14" height="14"></iconify-icon>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={resetStoreFilters}
                    className="ml-auto text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 underline decoration-slate-500 underline-offset-4 transition hover:text-white"
                  >
                    {t('store.clearAllFilters')}
                  </button>
                </div>
              ) : null}

              {filteredProducts.length ? (
                <div id="store-product-grid" className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => {
                    const isLocked = queueGateEnabled && lockableProductIds.has(product._id)
                    return (
                      <MerchProductCard
                        key={product._id}
                        product={product}
                        manifest={resolvedManifest}
                        onOpenProduct={openProduct}
                        onQuickView={(productId) => setQuickViewProductId(productId)}
                        isLocked={isLocked}
                        lockLabel={t('store.queueLockedCta')}
                        onQueueAction={handleQueueLockAction}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <h2 className="store-v2-h2 text-slate-100">{t('store.noProductsFound')}</h2>
                  <p className="mt-2 store-v2-meta">{t('store.tryAdjustingFilters')}</p>
                  <button
                    type="button"
                    onClick={resetStoreFilters}
                    className="store-v2-control store-v2-btn-secondary mt-4"
                  >
                    {t('store.clearAllFilters')}
                  </button>
                </div>
              )}

              <section className="mt-8 border-t border-slate-700/55 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="store-v2-label text-slate-100">{t('store.recentlyViewed')}</h2>
                </div>

                {!recentlyViewed ? (
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-900/60" />
                ) : recentlyViewed.length === 0 ? (
                  <p className="store-v2-meta">{t('store.recentlyViewedEmpty')}</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {recentlyViewed.slice(0, 4).map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => navigate(`/store/product/${item._id}`)}
                        className="store-v2-recent-item"
                      >
                        <img
                          src={item.thumbnailUrl || item.imageUrls?.[0] || '/images/placeholder.jpg'}
                          alt={item.name}
                          className="store-v2-recent-image"
                        />
                        <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-100">{item.name}</p>
                        <p className="text-sm font-semibold text-emerald-300">${(item.price / 100).toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </main>
          </div>
        </section>
      </div>

      {showMobileFilters ? (
        <div className="fixed inset-0 z-[120] bg-black/78 p-4 lg:hidden" onClick={() => setShowMobileFilters(false)}>
          <div
            className="ml-auto mt-10 h-[calc(100%-2.5rem)] w-full max-w-sm overflow-y-auto rounded-[24px] border border-slate-600/60 bg-slate-950/96 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={t('store.filtersLabel')}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="store-v2-label">{t('store.filtersLabel')}</p>
              <button type="button" className="store-v2-control store-v2-btn-secondary" onClick={() => setShowMobileFilters(false)}>
                {t('common.close')}
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      ) : null}

      {quickViewProduct ? (
        <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/80 p-4 sm:items-center" onClick={() => setQuickViewProductId(null)}>
          <div className="store-surface-card w-full max-w-3xl p-4 sm:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="grid gap-4 sm:grid-cols-[280px_minmax(0,1fr)]">
              <img
                src={quickViewProduct.thumbnailUrl || quickViewProduct.imageUrls?.[0] || '/images/placeholder.jpg'}
                alt={quickViewProduct.name}
                className="h-72 w-full rounded-xl object-cover"
              />
              <div>
                <p className="store-v2-label text-slate-300">{quickViewProduct.category}</p>
                <h2 className="store-v2-display mt-2 text-3xl text-slate-100">{quickViewProduct.name}</h2>
                <p className="mt-3 store-v2-meta">{quickViewProduct.description}</p>
                <p className="mt-4 text-xl font-semibold text-emerald-300">${(quickViewProduct.price / 100).toFixed(2)}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {quickViewLocked ? (
                    <button
                      type="button"
                      onClick={handleQueueLockAction}
                      className="store-v2-control store-v2-btn-primary"
                    >
                      {t('store.queueLockedCta')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleQuickViewAddToCart}
                      className="store-v2-control store-v2-btn-primary"
                    >
                      {t('store.quickAdd')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openProduct(quickViewProduct._id)}
                    className="store-v2-control store-v2-btn-secondary"
                  >
                    {t('store.viewDetails')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <StoreReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        drop={upcomingDrop}
      />
    </div>
  )
}
