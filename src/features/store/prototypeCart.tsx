import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import type {
  PrototypeStoreProduct,
  PrototypeStoreResolvedSelection,
  PrototypeStoreSelection,
} from './prototypeStoreContract'

export interface PrototypeCartLineItem {
  lineKey: string
  slug: string
  quantity: number
  selection: PrototypeStoreSelection
  selectedOptions: PrototypeStoreResolvedSelection[]
  variantId?: string | null
  product: PrototypeStoreProduct
  unitPriceCents: number
  lineTotalCents: number
}

interface PrototypeCartContextValue {
  items: PrototypeCartLineItem[]
  itemCount: number
  subtotalCents: number
  addItem: (
    slug: string,
    selection?: PrototypeStoreSelection,
    quantity?: number,
  ) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  setQuantity: (lineId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  storageMode: 'convex'
  canWrite: boolean
  isSyncing: boolean
}

interface RemoteCartState {
  items: Array<{
    lineId: string
    slug: string
    quantity: number
    selection: PrototypeStoreSelection
    selectedOptions: PrototypeStoreResolvedSelection[]
    variantId?: Id<'merchVariants'> | null
    product: PrototypeStoreProduct
    lineTotalCents: number
  }>
  itemCount: number
  subtotalCents: number
  canWrite: boolean
}

const PrototypeCartContext = createContext<PrototypeCartContextValue | null>(null)

export function PrototypeCartProvider({ children }: { children: ReactNode }) {
  const remoteCart = useQuery(api.catalog.getPrototypeCart, {}) as RemoteCartState | undefined
  const addPrototypeCartItem = useMutation(api.catalog.addPrototypeCartItem)
  const setPrototypeCartQuantity = useMutation(api.catalog.setPrototypeCartQuantity)
  const removePrototypeCartItem = useMutation(api.catalog.removePrototypeCartItem)
  const clearPrototypeCart = useMutation(api.catalog.clearPrototypeCart)
  const [pendingOps, setPendingOps] = useState(0)

  const runCartMutation = useCallback(
    async (operation: () => Promise<unknown>) => {
      setPendingOps((count) => count + 1)
      try {
        await operation()
      } finally {
        setPendingOps((count) => Math.max(0, count - 1))
      }
    },
    [],
  )

  const items = useMemo<PrototypeCartLineItem[]>(
    () =>
      (remoteCart?.items ?? []).map((item) => ({
        lineKey: item.lineId,
        slug: item.slug,
        quantity: item.quantity,
        selection: item.selection,
        selectedOptions: item.selectedOptions,
        variantId: item.variantId ? String(item.variantId) : null,
        product: item.product,
        unitPriceCents:
          item.quantity > 0 ? Math.round(item.lineTotalCents / item.quantity) : item.product.priceCents,
        lineTotalCents: item.lineTotalCents,
      })),
    [remoteCart],
  )

  const addItem = useCallback(
    async (slug: string, selection: PrototypeStoreSelection = {}, quantity = 1) => {
      if (!remoteCart?.canWrite) return
      await runCartMutation(() =>
        addPrototypeCartItem({
          slug,
          selection,
          quantity,
        }),
      )
    },
    [addPrototypeCartItem, remoteCart?.canWrite, runCartMutation],
  )

  const setQuantity = useCallback(
    async (lineKey: string, quantity: number) => {
      if (!remoteCart?.canWrite) return
      const remoteItem = remoteCart.items.find((item) => item.lineId === lineKey)
      if (!remoteItem?.variantId) return

      await runCartMutation(() =>
        setPrototypeCartQuantity({
          variantId: remoteItem.variantId!,
          quantity,
        }),
      )
    },
    [remoteCart, runCartMutation, setPrototypeCartQuantity],
  )

  const removeItem = useCallback(
    async (lineKey: string) => {
      if (!remoteCart?.canWrite) return
      const remoteItem = remoteCart.items.find((item) => item.lineId === lineKey)
      if (!remoteItem?.variantId) return

      await runCartMutation(() =>
        removePrototypeCartItem({
          variantId: remoteItem.variantId!,
        }),
      )
    },
    [remoteCart, removePrototypeCartItem, runCartMutation],
  )

  const clearCart = useCallback(async () => {
    if (!remoteCart?.canWrite) return
    await runCartMutation(() => clearPrototypeCart({}))
  }, [clearPrototypeCart, remoteCart?.canWrite, runCartMutation])

  return (
    <PrototypeCartContext.Provider
      value={{
        items,
        itemCount: remoteCart?.itemCount ?? 0,
        subtotalCents: remoteCart?.subtotalCents ?? 0,
        addItem,
        removeItem,
        setQuantity,
        clearCart,
        storageMode: 'convex',
        canWrite: remoteCart?.canWrite ?? false,
        isSyncing: remoteCart === undefined || pendingOps > 0,
      }}
    >
      {children}
    </PrototypeCartContext.Provider>
  )
}

export function usePrototypeCart() {
  const context = useContext(PrototypeCartContext)
  if (!context) {
    throw new Error('usePrototypeCart must be used within a PrototypeCartProvider')
  }
  return context
}
