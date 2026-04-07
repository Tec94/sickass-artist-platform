import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Minus, Plus } from 'lucide-react'
import { Skeleton } from 'boneyard-js/react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { setNextTransition } from '../../components/Effects/PageTransition'
import SharedNavbar from '../../components/Navigation/SharedNavbar'
import { usePrototypeCart } from '../../features/store/prototypeCart'
import { usePrototypeCatalog } from '../../features/store/usePrototypeCatalog'
import {
  formatPrototypePrice,
  getPrototypeDefaultSelection,
  getPrototypeSelectionUnitPrice,
  type PrototypeStoreSelection,
} from '../../features/store/prototypeStoreContract'

const clampQuantity = (value: number) => Math.max(1, Math.min(9, value))

export default function StoreProductDetail() {
  const navigate = useNavigate()
  const { productSlug } = useParams<{ productSlug: string }>()
  const { addItem, canWrite } = usePrototypeCart()
  const { products, getProductBySlug, isLoading } = usePrototypeCatalog()
  const mainRef = useRef<HTMLElement | null>(null)

  const matchedProduct = getProductBySlug(productSlug ?? '')
  const product = matchedProduct

  const galleryImages = useMemo(() => {
    if (!product) return []
    return product.gallery.length ? product.gallery : [product.primaryImage]
  }, [product])
  const defaultSelection = useMemo(
    () => (product ? getPrototypeDefaultSelection(product) : {}),
    [product],
  )
  const [selectedImage, setSelectedImage] = useState<string>(galleryImages[0] ?? '')
  const [selectedSelection, setSelectedSelection] = useState<PrototypeStoreSelection>(defaultSelection)
  const [quantity, setQuantity] = useState(1)

  const selectedPriceCents = useMemo(
    () => (product ? getPrototypeSelectionUnitPrice(product, selectedSelection) : 0),
    [product, selectedSelection],
  )

  const relatedProducts = product
    ? products
        .filter(
          (candidate) => candidate.slug !== product.slug && candidate.category === product.category,
        )
        .slice(0, 3)
    : []

  const openProduct = (slug: string) => {
    setNextTransition('push')
    navigate(`/store/product/${slug}`)
  }

  const handleBack = () => {
    setNextTransition('push-back')
    navigate('/store')
  }

  useEffect(() => {
    if (typeof mainRef.current?.scrollTo === 'function') {
      mainRef.current.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [productSlug])

  useEffect(() => {
    if (!product) return
    setSelectedImage(galleryImages[0] ?? product.primaryImage)
    setSelectedSelection(defaultSelection)
    setQuantity(1)
  }, [defaultSelection, galleryImages, product?.primaryImage, productSlug])

  const formatOptionDelta = (priceDeltaCents?: number) => {
    if (!priceDeltaCents) return ''
    const formattedDelta = formatPrototypePrice(Math.abs(priceDeltaCents))
    return priceDeltaCents > 0 ? ` +${formattedDelta}` : ` -${formattedDelta}`
  }

  const handleOptionSelect = (groupId: string, optionId: string) => {
    setSelectedSelection((currentSelection) => ({ ...currentSelection, [groupId]: optionId }))
  }

  const handleAddToCart = () => {
    if (!product) return
    addItem(product.slug, selectedSelection, quantity)
  }

  if (!product && !isLoading) {
    return <Navigate to="/store" replace />
  }

  const detailLoadingFallback = (
    <div className="flex h-full min-h-[320px] items-center justify-center px-6">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--site-text-muted)]">
          Loading product
        </p>
        <p className="mt-4 max-w-[34ch] text-sm leading-7 text-[#3C2A21]/76">
          The catalog is syncing pricing, gallery, and purchase controls for this item.
        </p>
      </div>
    </div>
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--site-page-bg)] font-sans text-[var(--site-text)]">
      <SharedNavbar />

      <main
        ref={mainRef}
        className="h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain"
      >
        <Skeleton
          name="store-product-detail"
          loading={isLoading}
          fallback={detailLoadingFallback}
          className="block"
        >
          {product ? (
            <div className="mx-auto max-w-[1560px] px-4 pb-32 pt-3 md:px-8 md:pb-24 md:pt-4 xl:pb-20">
          <button
            data-testid="detail-back-button"
            type="button"
            onClick={handleBack}
            className="-ml-4 inline-flex w-fit items-center gap-2 rounded-sm px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-[#FAF7F2] hover:text-[#C36B42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C36B42]"
          >
            <ArrowLeft size={14} />
            Back to store
          </button>

          <section className="mt-3 overflow-hidden border border-[#1C1B1A] bg-[#FCFBF9]">
            <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_160px_420px] xl:items-stretch">
              <div className="relative overflow-hidden border-b border-[#1C1B1A] bg-[#D7D5D0] xl:border-b-0 xl:border-r">
                <div className="absolute inset-0">
                  <img
                    src={selectedImage}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full scale-[1.08] object-cover blur-[34px] opacity-50"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(252,251,249,0.16),rgba(215,213,208,0.38)_58%,rgba(186,178,168,0.58)_100%)]" />
                </div>

                <div className="relative z-10 flex min-h-[320px] items-center justify-center px-3 py-4 sm:min-h-[380px] md:min-h-[520px] md:px-4 md:py-5 xl:h-full xl:px-0 xl:py-0">
                  <img
                    data-testid="detail-main-image"
                    src={selectedImage}
                    alt={product.alt}
                    className="h-full max-h-[720px] w-full origin-center object-contain md:scale-[1.06] xl:scale-[1.14]"
                  />
                </div>
              </div>

              <div className="border-b border-[#1C1B1A] bg-[#F7F1E8] p-4 md:p-5 xl:border-b-0 xl:border-r">
                <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-1">
                  {galleryImages.map((image, index) => {
                    const isActive = selectedImage === image

                    return (
                      <button
                        key={`${product.slug}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className={`aspect-[4/5] w-28 shrink-0 overflow-hidden border bg-[#EFE8DE] text-left transition-colors sm:w-auto ${
                          isActive
                            ? 'border-[#C36B42] shadow-[inset_0_0_0_1px_#C36B42]'
                            : 'border-[#1C1B1A] hover:border-[#3C2A21]'
                        }`}
                        aria-label={`View ${product.name} image ${index + 1}`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              <aside
                data-testid="detail-side-rail"
                className="border-t border-[#1C1B1A] bg-[#FCFBF9] xl:border-l xl:border-t-0"
              >
                <div className="border-b border-[#1C1B1A] bg-[#FAF7F2] p-6 md:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                        Prototype product detail
                      </p>
                      <h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl leading-none md:text-5xl">
                        {product.name}
                      </h1>
                    </div>
                    {product.badge ? (
                      <span className="border border-[#1C1B1A] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
                        {product.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-7">
                    <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#8E7D72]">
                      {product.releaseNote}
                    </p>
                    <p className="font-['Cormorant_Garamond'] text-3xl leading-none">
                      {formatPrototypePrice(selectedPriceCents)}
                    </p>
                  </div>
                </div>

                <div
                  data-testid="detail-rail-content"
                  className="space-y-6 bg-[#FCFBF9] p-6 md:p-7"
                >
                  <section className="space-y-5 border border-[#1C1B1A]/15 bg-[#F4EFE6] p-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8E7D72]">
                        Select options
                      </p>
                    </div>

                    <div className="space-y-4">
                       {product.optionGroups.map((group) => (
                         <fieldset key={group.key} className="space-y-2">
                           <legend className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                             {group.label}
                           </legend>
                           <div className="flex flex-wrap gap-2">
                             {group.options.map((option) => {
                               const isSelected = selectedSelection[group.key] === option.value

                               return (
                                 <button
                                   key={option.value}
                                   type="button"
                                   onClick={() => handleOptionSelect(group.key, option.value)}
                                   className={`min-h-[40px] border px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                                     isSelected
                                       ? 'border-[#1C1B1A] bg-[#1C1B1A] text-[#F4EFE6]'
                                      : 'border-[#1C1B1A]/18 bg-[#FCFBF9] text-[#3C2A21] hover:border-[#C36B42] hover:text-[#C36B42]'
                                  }`}
                                  aria-pressed={isSelected}
                                >
                                  {option.label}
                                  <span className="text-[10px] font-medium normal-case tracking-normal">
                                    {formatOptionDelta(option.priceDeltaCents)}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </fieldset>
                      ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-end">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                          Quantity
                        </p>
                        <div className="mt-2 inline-flex items-center border border-[#1C1B1A] bg-[#FCFBF9]">
                          <button
                            type="button"
                            onClick={() => setQuantity((currentQuantity) => clampQuantity(currentQuantity - 1))}
                            disabled={product.availability !== 'available'}
                            className="flex h-11 w-11 items-center justify-center border-r border-[#1C1B1A] text-[#3C2A21] transition-colors hover:bg-[#1C1B1A] hover:text-[#F4EFE6] disabled:cursor-not-allowed disabled:text-[#8E7D72] disabled:hover:bg-transparent disabled:hover:text-[#8E7D72]"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span
                            data-testid="detail-quantity-value"
                            className="flex h-11 min-w-[52px] items-center justify-center px-3 text-sm font-semibold tabular-nums"
                          >
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity((currentQuantity) => clampQuantity(currentQuantity + 1))}
                            disabled={product.availability !== 'available'}
                            className="flex h-11 w-11 items-center justify-center border-l border-[#1C1B1A] text-[#3C2A21] transition-colors hover:bg-[#1C1B1A] hover:text-[#F4EFE6] disabled:cursor-not-allowed disabled:text-[#8E7D72] disabled:hover:bg-transparent disabled:hover:text-[#8E7D72]"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                       {product.availability === 'available' && canWrite ? (
                         <button
                           type="button"
                           onClick={handleAddToCart}
                           className="inline-flex min-h-[44px] items-center justify-center border border-[#1C1B1A] bg-[#1C1B1A] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F4EFE6] transition-colors hover:border-[#C36B42] hover:bg-[#C36B42]"
                         >
                           Add to cart
                         </button>
                       ) : product.availability === 'available' ? (
                         <span className="inline-flex min-h-[44px] items-center justify-center border border-[#1C1B1A] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                           Sign in to add
                         </span>
                       ) : (
                         <span className="inline-flex min-h-[44px] items-center justify-center border border-[#1C1B1A] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                           Sold out
                        </span>
                      )}
                    </div>
                  </section>

                  <section className="border border-[#1C1B1A]/15 bg-[#F4EFE6] p-4">
                     <p className="text-[10px] uppercase tracking-[0.18em] text-[#8E7D72]">
                       Quick details
                     </p>
                     <ul className="mt-4 space-y-3">
                       {product.quickDetails.map((detail) => (
                         <li
                           key={detail}
                           className="border-b border-[#1C1B1A]/10 pb-3 text-sm leading-6 text-[#3C2A21]/80 last:border-b-0 last:pb-0"
                         >
                           {detail}
                         </li>
                       ))}
                     </ul>
                   </section>
                </div>
              </aside>
            </div>
          </section>

          {relatedProducts.length > 0 ? (
            <section className="mt-8 border border-[#1C1B1A] bg-[#FAF7F2]">
              <div className="flex items-center justify-between gap-4 border-b border-[#1C1B1A] px-6 py-6 md:px-8">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                    Same wing
                  </p>
                  <h2 className="mt-2 font-['Cormorant_Garamond'] text-3xl leading-none">
                    More in {product.category}
                  </h2>
                </div>
              </div>

              <div className="grid gap-px bg-[#1C1B1A] md:grid-cols-3">
                {relatedProducts.map((relatedProduct) => (
                  <article key={relatedProduct.slug} className="bg-[#FCFBF9]">
                    <button
                      type="button"
                      onClick={() => openProduct(relatedProduct.slug)}
                      className="w-full text-left"
                    >
                      <div className="aspect-[4/3] overflow-hidden border-b border-[#1C1B1A] bg-[#ECE7DF]">
                        <img
                          src={relatedProduct.primaryImage}
                          alt={relatedProduct.alt}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                        />
                      </div>
                      <div className="p-5">
                        <p className="font-['Cormorant_Garamond'] text-2xl leading-none">
                          {relatedProduct.name}
                        </p>
                        <p className="mt-2 text-sm text-[#8E7D72]">
                          {formatPrototypePrice(relatedProduct.priceCents)}
                        </p>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-8 hidden justify-end xl:flex">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 border border-[#1C1B1A] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-[#1C1B1A] hover:text-[#F4EFE6]"
            >
              Return to collection
              <ArrowRight size={14} />
            </button>
          </div>
            </div>
          ) : (
            detailLoadingFallback
          )}
        </Skeleton>
      </main>
      {product && !isLoading ? (
        <div className="mobile-safe-nav fixed inset-x-0 bottom-0 z-30 border-t border-[#1C1B1A]/12 bg-[#FCFBF9]/96 px-4 py-4 shadow-[0_-18px_40px_rgba(28,27,26,0.14)] backdrop-blur xl:hidden">
        <div data-testid="detail-mobile-purchase-bar" className="mx-auto flex max-w-[1560px] flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                {product.releaseNote}
              </p>
              <p className="mt-2 font-['Cormorant_Garamond'] text-3xl leading-none">
                {formatPrototypePrice(selectedPriceCents)}
              </p>
            </div>
            <div className="inline-flex items-center border border-[#1C1B1A] bg-[#FCFBF9]">
              <button
                type="button"
                onClick={() => setQuantity((currentQuantity) => clampQuantity(currentQuantity - 1))}
                disabled={product.availability !== 'available'}
                className="flex h-11 w-11 items-center justify-center border-r border-[#1C1B1A] text-[#3C2A21] transition-colors hover:bg-[#1C1B1A] hover:text-[#F4EFE6] disabled:cursor-not-allowed disabled:text-[#8E7D72] disabled:hover:bg-transparent disabled:hover:text-[#8E7D72]"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="flex h-11 min-w-[52px] items-center justify-center px-3 text-sm font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((currentQuantity) => clampQuantity(currentQuantity + 1))}
                disabled={product.availability !== 'available'}
                className="flex h-11 w-11 items-center justify-center border-l border-[#1C1B1A] text-[#3C2A21] transition-colors hover:bg-[#1C1B1A] hover:text-[#F4EFE6] disabled:cursor-not-allowed disabled:text-[#8E7D72] disabled:hover:bg-transparent disabled:hover:text-[#8E7D72]"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          {product.availability === 'available' && canWrite ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex min-h-[48px] items-center justify-center border border-[#1C1B1A] bg-[#1C1B1A] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F4EFE6] transition-colors hover:border-[#C36B42] hover:bg-[#C36B42]"
            >
              Add to cart
            </button>
          ) : product.availability === 'available' ? (
            <span className="inline-flex min-h-[48px] items-center justify-center border border-[#1C1B1A] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
              Sign in to add
            </span>
          ) : (
            <span className="inline-flex min-h-[48px] items-center justify-center border border-[#1C1B1A] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
              Sold out
            </span>
          )}
        </div>
        </div>
      ) : null}
    </div>
  )
}
