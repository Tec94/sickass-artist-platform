import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { setNextTransition } from '../../components/Effects/PageTransition'
import SharedNavbar from '../../components/Navigation/SharedNavbar'
import { usePrototypeCart } from '../../features/store/prototypeCart'
import {
  PROTOTYPE_STORE_PRODUCTS,
  formatPrototypePrice,
  getPrototypeStoreProduct,
} from '../../features/store/prototypeStoreCatalog'

export default function StoreProductDetail() {
  const navigate = useNavigate()
  const { productSlug } = useParams<{ productSlug: string }>()
  const { addItem, itemCount } = usePrototypeCart()
  const mainRef = useRef<HTMLElement | null>(null)

  const product = getPrototypeStoreProduct(productSlug ?? '')

  const galleryImages = useMemo(
    () => (product?.gallery?.length ? product.gallery : product ? [product.primaryImage] : []),
    [product],
  )
  const [selectedImage, setSelectedImage] = useState<string>(galleryImages[0] ?? '')

  if (!product) {
    return <Navigate to="/store" replace />
  }

  const relatedProducts = PROTOTYPE_STORE_PRODUCTS.filter(
    (candidate) => candidate.slug !== product.slug && candidate.category === product.category,
  ).slice(0, 3)

  const openProduct = (slug: string) => {
    setNextTransition('push')
    navigate(`/store/product/${slug}`)
  }

  const handleBack = () => {
    setNextTransition('push-back')
    navigate('/store')
  }

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [productSlug])

  useEffect(() => {
    setSelectedImage(galleryImages[0] ?? product.primaryImage)
  }, [galleryImages, product.primaryImage, productSlug])

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F4EFE6] font-sans text-[#3C2A21]">
      <SharedNavbar />

      <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1560px] px-4 pb-10 pt-4 md:px-8 md:pb-16 md:pt-5">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] hover:text-[#C36B42] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to store
          </button>

          <section className="mt-4 border border-[#1C1B1A] bg-[#FCFBF9] xl:h-[min(720px,calc(100dvh-172px))]">
            <div className="grid h-full items-start xl:grid-cols-[minmax(0,1.02fr)_420px]">
              <div className="border-b border-[#1C1B1A] bg-[#F0ECE6] xl:h-full xl:border-b-0 xl:border-r">
                <div className="grid h-full lg:grid-cols-[minmax(0,1fr)_180px]">
                  <div className="min-h-[360px] bg-[#ECE7DF] md:min-h-[460px] xl:h-full xl:min-h-0">
                    <img src={selectedImage} alt={product.alt} className="h-full w-full object-cover" />
                  </div>
                  <div className="border-t border-[#1C1B1A] bg-[#F7F1E8] p-4 md:p-5 xl:h-full xl:overflow-y-auto lg:border-l lg:border-t-0">
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                      {galleryImages.map((image, index) => {
                        const isActive = selectedImage === image

                        return (
                          <button
                            key={`${product.slug}-${index}`}
                            type="button"
                            onClick={() => setSelectedImage(image)}
                            className={`aspect-[4/5] overflow-hidden border bg-[#EFE8DE] text-left transition-colors ${
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
                </div>
              </div>

              <div className="xl:grid xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
                <div className="border-b border-[#1C1B1A] bg-[#FAF7F2] p-6 md:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                        Prototype product detail
                      </p>
                      <h1 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl leading-none mt-3">
                        {product.name}
                      </h1>
                    </div>
                    {product.badge ? (
                      <span className="border border-[#1C1B1A] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
                        {product.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-7 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#8E7D72] mb-2">
                        {product.releaseNote}
                      </p>
                      <p className="text-3xl font-['Cormorant_Garamond'] leading-none">
                        {formatPrototypePrice(product.priceCents)}
                      </p>
                    </div>
                    {product.availability === 'available' ? (
                      <button
                        type="button"
                        onClick={() => addItem(product.slug)}
                        className="inline-flex items-center gap-2 border border-[#1C1B1A] bg-[#1C1B1A] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F4EFE6] hover:bg-[#C36B42] hover:border-[#C36B42] transition-colors"
                      >
                        <ShoppingBag size={14} />
                        Add to cart
                      </button>
                    ) : (
                      <span className="border border-[#1C1B1A] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                        Sold out
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-5 bg-[#FCFBF9] p-6 md:p-7 xl:overflow-y-auto">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72] mb-3">
                      Editorial note
                    </p>
                    <p className="text-base leading-8 text-[#3C2A21]/82">{product.detailDescription}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="border border-[#1C1B1A]/15 bg-[#F4EFE6] p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8E7D72] mb-2">
                        Material study
                      </p>
                      <p className="text-sm leading-6 text-[#3C2A21]/80">{product.materials}</p>
                    </div>
                    <div className="border border-[#1C1B1A]/15 bg-[#F4EFE6] p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8E7D72] mb-2">
                        Grid status
                      </p>
                      <p className="text-sm leading-6 text-[#3C2A21]/80">
                        {product.availability === 'available'
                          ? `Ready to add. Your cart currently holds ${itemCount} item${itemCount === 1 ? '' : 's'}.`
                          : 'The story page stays open for browsing, but cart actions are disabled while stock is closed.'}
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#1C1B1A]/15 bg-[#F4EFE6] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#8E7D72] mb-2">
                      Product intent
                    </p>
                    <p className="text-sm leading-6 text-[#3C2A21]/80">{product.shortDescription}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {relatedProducts.length > 0 ? (
            <section className="mt-8 border border-[#1C1B1A] bg-[#FAF7F2]">
              <div className="px-6 md:px-8 py-6 border-b border-[#1C1B1A] flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                    Same wing
                  </p>
                  <h2 className="font-['Cormorant_Garamond'] text-3xl leading-none mt-2">
                    More in {product.category}
                  </h2>
                </div>
              </div>

              <div className="grid md:grid-cols-3 bg-[#1C1B1A] gap-px">
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
                        <p className="text-sm text-[#8E7D72] mt-2">
                          {formatPrototypePrice(relatedProduct.priceCents)}
                        </p>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 border border-[#1C1B1A] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-[#1C1B1A] hover:text-[#F4EFE6] transition-colors"
            >
              Return to collection
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
