import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setNextTransition } from '../../components/Effects/PageTransition'
import SharedNavbar from '../../components/Navigation/SharedNavbar'
import { usePrototypeCart } from '../../features/store/prototypeCart'
import { usePrototypeCatalog } from '../../features/store/usePrototypeCatalog'
import {
  PROTOTYPE_STORE_CATEGORY_LABELS,
  PROTOTYPE_STORE_SORT_LABELS,
  getPrototypeDefaultSelection,
  type PrototypeStoreCategory,
  type PrototypeStoreSort,
} from '../../features/store/prototypeStoreContract'

const categoryOptions: PrototypeStoreCategory[] = [
  'all',
  'apparel',
  'music',
  'collectibles',
  'accessories',
]

const sortOptions: PrototypeStoreSort[] = ['latest', 'price-low', 'price-high']

export default function Store() {
  const navigate = useNavigate()
  const { addItem, itemCount, canWrite } = usePrototypeCart()
  const { getCategoryCounts, getProducts, formatPrototypePrice } = usePrototypeCatalog()
  const [activeCategory, setActiveCategory] = useState<PrototypeStoreCategory>('all')
  const [activeSort, setActiveSort] = useState<PrototypeStoreSort>('latest')

  const categoryCounts = getCategoryCounts()
  const products = getProducts(activeCategory, activeSort)

  const openProduct = (productSlug: string) => {
    setNextTransition('push')
    navigate(`/store/product/${productSlug}`)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F4EFE6] font-sans text-[#3C2A21]">
      <SharedNavbar />

      <main className="h-[calc(100dvh-72px)] overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col md:flex-row">
          <aside
            data-testid="prototype-store-sidebar"
            className="hidden md:block w-[250px] flex-shrink-0 overflow-y-auto bg-[#F4F0EB]"
          >
            <div className="p-8">
              <h2 className="font-['Cormorant_Garamond'] text-2xl mb-8 tracking-tight">Categories</h2>
              <nav className="flex flex-col gap-6">
                {categoryOptions.map((category) => {
                  const isActive = activeCategory === category

                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveCategory(category)}
                      className="flex items-center justify-between text-left text-sm font-semibold uppercase tracking-widest group"
                    >
                      <span
                        className={
                          isActive
                            ? 'text-[#C36B42] border-b border-[#C36B42] pb-1'
                            : 'text-[#8E7D72] group-hover:text-[#3C2A21] transition-colors'
                        }
                      >
                        {PROTOTYPE_STORE_CATEGORY_LABELS[category]}
                      </span>
                      <span
                        className={`text-xs transition-colors ${
                          isActive ? 'text-[#C36B42]' : 'text-[#8E7D72] group-hover:text-[#3C2A21]'
                        }`}
                      >
                        {categoryCounts[category]}
                      </span>
                    </button>
                  )
                })}
              </nav>

              <div className="mt-16 pt-8">
                <h3 className="font-['Cormorant_Garamond'] text-xl mb-6 tracking-tight">Sort By</h3>
                <div className="flex flex-col gap-4">
                  {sortOptions.map((sort) => {
                    const isActive = activeSort === sort

                    return (
                      <button
                        key={sort}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setActiveSort(sort)}
                        className="flex items-center gap-3 text-left group"
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            isActive ? 'border-[#0C86D2]' : 'border-[#1C1B1A]/50'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full bg-[#0C86D2] transition-opacity ${
                              isActive ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        </span>
                        <span
                          className={`text-xs font-semibold uppercase tracking-widest transition-colors ${
                            isActive ? 'text-[#3C2A21]' : 'text-[#8E7D72] group-hover:text-[#3C2A21]'
                          }`}
                        >
                          {PROTOTYPE_STORE_SORT_LABELS[sort]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </aside>

          <section className="min-h-0 flex-1 overflow-y-auto bg-[#FCFBF9] overscroll-contain">
            <div className="md:hidden border-b border-[#1C1B1A] bg-[#F4F0EB] px-4 py-4 space-y-4">
              <div className="overflow-x-auto whitespace-nowrap">
                <div className="flex gap-3 min-w-max">
                  {categoryOptions.map((category) => {
                    const isActive = activeCategory === category

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                          isActive
                            ? 'border-[#1C1B1A] bg-[#1C1B1A] text-[#F4EFE6]'
                            : 'border-[#1C1B1A]/20 bg-[#FCFBF9] text-[#3C2A21]'
                        }`}
                      >
                        {PROTOTYPE_STORE_CATEGORY_LABELS[category]} ({categoryCounts[category]})
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {sortOptions.map((sort) => {
                  const isActive = activeSort === sort

                  return (
                    <button
                      key={sort}
                      type="button"
                      onClick={() => setActiveSort(sort)}
                      className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                        isActive ? 'text-[#C36B42]' : 'text-[#8E7D72]'
                      }`}
                    >
                      {PROTOTYPE_STORE_SORT_LABELS[sort]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div
              data-testid="prototype-store-canvas"
              className="border-l border-r border-b border-[#1C1B1A] bg-[#FCFBF9]"
            >
              <div className="border-b border-[#1C1B1A] bg-[#FAF7F2] px-5 py-5 md:px-8 md:py-7">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                      Prototype-first collection
                    </p>
                    <h1 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl leading-none mt-3">
                      {PROTOTYPE_STORE_CATEGORY_LABELS[activeCategory]}
                    </h1>
                     <p className="text-sm md:text-base text-[#3C2A21]/75 mt-3 max-w-3xl">
                       Filter the editorial prototype catalog without leaving the route. Product cards
                       open a dedicated detail page, while cart actions resolve against the live
                       Convex catalog.
                     </p>
                     {!canWrite ? (
                       <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C36B42]">
                         Sign in to add items to the Convex cart.
                       </p>
                     ) : null}
                   </div>

                  <div className="flex items-end gap-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                        Showing
                      </p>
                      <p className="font-['Cormorant_Garamond'] text-3xl leading-none mt-2">
                        {products.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E7D72]">
                        Cart
                      </p>
                      <p className="font-['Cormorant_Garamond'] text-3xl leading-none mt-2">
                        {itemCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {products.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeCategory}-${activeSort}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="grid min-h-[420px] grid-cols-1 content-start bg-[#FCFBF9] sm:grid-cols-2 xl:grid-cols-3"
                  >
                    {products.map((product) => (
                      <article
                        key={product.slug}
                        className="group flex h-[450px] flex-col border-r border-b border-[#1C1B1A] bg-[#FCFBF9] first:border-l sm:[&:nth-child(odd)]:border-l xl:[&:nth-child(3n+1)]:border-l"
                      >
                        <button
                          type="button"
                          onClick={() => openProduct(product.slug)}
                          className="flex-1 overflow-hidden border-b border-[#1C1B1A] bg-[#F0ECE6] text-left"
                          aria-label={`Open ${product.name} details`}
                        >
                          <div className="relative h-full w-full overflow-hidden">
                            <img
                              src={product.primaryImage}
                              alt={product.alt}
                              className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
                                product.availability === 'sold-out' ? 'grayscale opacity-55' : ''
                              }`}
                            />
                            {product.badge ? (
                              <div className="absolute top-4 left-4">
                                <span className="bg-[#1C1B1A] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#F4EFE6]">
                                  {product.badge}
                                </span>
                              </div>
                            ) : null}
                            {product.availability === 'sold-out' ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-[#FCFBF9]/20 backdrop-blur-[2px]">
                                <span className="border border-[#1C1B1A] bg-[#F4F0EB] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#1C1B1A]">
                                  Sold Out
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </button>

                        <div className="flex min-h-[120px] items-end gap-4 bg-[#FCFBF9] p-5">
                          <button
                            type="button"
                            onClick={() => openProduct(product.slug)}
                            className="flex-1 self-stretch text-left"
                            aria-label={`View ${product.name}`}
                          >
                            <div className="flex h-full flex-col justify-end">
                              <h3
                                className={`font-['Cormorant_Garamond'] text-[32px] leading-none tracking-tight ${
                                  product.availability === 'sold-out' ? 'text-[#8E7D72]' : 'text-[#3C2A21]'
                                }`}
                              >
                                {product.name}
                              </h3>
                              <p className="mt-3 text-sm font-medium text-[#8E7D72]">
                                {formatPrototypePrice(product.priceCents)}
                              </p>
                            </div>
                          </button>

                          {product.availability === 'available' && canWrite ? (
                            <button
                              type="button"
                              onClick={() => addItem(product.slug, getPrototypeDefaultSelection(product), 1)}
                              className="self-end border border-[#1C1B1A] bg-[#FCFBF9] px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-[#1C1B1A] hover:text-[#F4EFE6]"
                            >
                              Add
                            </button>
                          ) : product.availability === 'available' ? (
                            <span className="self-end border border-[#1C1B1A] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#8E7D72]">
                              Sign in to add
                            </span>
                          ) : (
                            <span className="self-end border border-[#1C1B1A] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#8E7D72]">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="h-[360px] flex flex-col items-center justify-center gap-4 bg-[#FCFBF9] px-6 text-center">
                  <p className="font-['Cormorant_Garamond'] text-4xl leading-none">No products in this lane.</p>
                  <p className="max-w-xl text-sm leading-7 text-[#3C2A21]/75">
                    This category is still empty in the prototype catalog. Switch filters to return
                    to the full collection.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
