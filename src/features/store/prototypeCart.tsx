import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  PROTOTYPE_STORE_PRODUCTS,
  getPrototypeStoreProduct,
  type PrototypeStoreProduct,
} from './prototypeStoreCatalog'

const PROTOTYPE_CART_STORAGE_KEY = 'prototype_store_cart_v1'

interface PrototypeCartStoredItem {
  slug: string
  quantity: number
}

export interface PrototypeCartLineItem {
  slug: string
  quantity: number
  product: PrototypeStoreProduct
  lineTotalCents: number
}

interface PrototypeCartContextValue {
  items: PrototypeCartLineItem[]
  itemCount: number
  subtotalCents: number
  addItem: (slug: string) => void
  removeItem: (slug: string) => void
  setQuantity: (slug: string, quantity: number) => void
  clearCart: () => void
}

const PrototypeCartContext = createContext<PrototypeCartContextValue | null>(null)

const parseStoredItems = (rawValue: string | null): PrototypeCartStoredItem[] => {
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => ({
        slug: typeof item?.slug === 'string' ? item.slug : '',
        quantity: typeof item?.quantity === 'number' ? item.quantity : 0,
      }))
      .filter((item) => item.slug && item.quantity > 0 && getPrototypeStoreProduct(item.slug))
  } catch {
    return []
  }
}

export function PrototypeCartProvider({ children }: { children: ReactNode }) {
  const [storedItems, setStoredItems] = useState<PrototypeCartStoredItem[]>(() => {
    if (typeof window === 'undefined') return []
    return parseStoredItems(window.localStorage.getItem(PROTOTYPE_CART_STORAGE_KEY))
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(PROTOTYPE_CART_STORAGE_KEY, JSON.stringify(storedItems))
  }, [storedItems])

  const items = useMemo<PrototypeCartLineItem[]>(() => {
    return storedItems.flatMap((item) => {
      const product = getPrototypeStoreProduct(item.slug)
      if (!product) return []

      return [
        {
          slug: item.slug,
          quantity: item.quantity,
          product,
          lineTotalCents: product.priceCents * item.quantity,
        },
      ]
    })
  }, [storedItems])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotalCents = items.reduce((total, item) => total + item.lineTotalCents, 0)

  const setQuantity = (slug: string, quantity: number) => {
    setStoredItems((currentItems) => {
      if (quantity <= 0) {
        return currentItems.filter((item) => item.slug !== slug)
      }

      const product = getPrototypeStoreProduct(slug)
      if (!product || product.availability !== 'available') return currentItems

      const existingItem = currentItems.find((item) => item.slug === slug)
      if (!existingItem) {
        return [...currentItems, { slug, quantity }]
      }

      return currentItems.map((item) => (item.slug === slug ? { ...item, quantity } : item))
    })
  }

  const addItem = (slug: string) => {
    const product = getPrototypeStoreProduct(slug)
    if (!product || product.availability !== 'available') return

    setStoredItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.slug === slug)
      if (!existingItem) return [...currentItems, { slug, quantity: 1 }]

      return currentItems.map((item) =>
        item.slug === slug ? { ...item, quantity: item.quantity + 1 } : item,
      )
    })
  }

  const removeItem = (slug: string) => {
    setStoredItems((currentItems) => currentItems.filter((item) => item.slug !== slug))
  }

  const clearCart = () => {
    setStoredItems([])
  }

  return (
    <PrototypeCartContext.Provider
      value={{
        items,
        itemCount,
        subtotalCents,
        addItem,
        removeItem,
        setQuantity,
        clearCart,
      }}
    >
      {children}
    </PrototypeCartContext.Provider>
  )
}

export function usePrototypeCart() {
  const context = useContext(PrototypeCartContext)

  if (!context) {
    throw new Error('usePrototypeCart must be used inside PrototypeCartProvider')
  }

  return context
}

export const PROTOTYPE_CART_PRODUCT_SLUGS = PROTOTYPE_STORE_PRODUCTS.map((product) => product.slug)
