import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { useCallback, useRef, useEffect } from 'react'
import { parseConvexError, logError } from '../utils/convexErrorHandler'
import { useAuth } from './useAuth'
import { trackCartAdd, trackCartRemove } from '../utils/analytics'

export interface CartItem {
  variantId: Id<'merchVariants'>
  productName: string
  variantName: string
  quantity: number
  currentPrice: number
  priceAtAddTime: number
  priceChanged: boolean
  priceChangePercentage: number
  available: boolean
  availableQuantity: number
}

export function useShoppingCart() {
  const { isSignedIn } = useAuth()
  const cart = useQuery(api.cart.getCart, isSignedIn ? {} : 'skip')

  const addToCartMutation = useMutation(api.cart.addToCart)
  const updateQuantityMutation = useMutation(api.cart.updateCartQuantity)
  const removeFromCartMutation = useMutation(api.cart.removeFromCart)
  const clearCartMutation = useMutation(api.cart.clearCart)

  // Local ref for optimistic updates
  const optimisticCartRef = useRef(cart)

  useEffect(() => {
    optimisticCartRef.current = cart
  }, [cart])

  const addItem = useCallback(async (variantId: Id<'merchVariants'>, quantity: number) => {
    try {
      await addToCartMutation({ variantId, quantity })
      // Track analytics
      trackCartAdd(variantId, quantity)
      // Cart syncs automatically via Convex
    } catch (err) {
      const parsed = parseConvexError(err)
      logError(parsed, {
        component: 'useShoppingCart',
        action: 'add_item',
      })
      throw err
    }
  }, [addToCartMutation])

  const updateQuantity = useCallback(async (variantId: Id<'merchVariants'>, quantity: number) => {
    try {
      await updateQuantityMutation({ variantId, quantity })
    } catch (err) {
      const parsed = parseConvexError(err)
      logError(parsed, {
        component: 'useShoppingCart',
        action: 'update_quantity',
      })
      throw err
    }
  }, [updateQuantityMutation])

  const removeItem = useCallback(async (variantId: Id<'merchVariants'>) => {
    try {
      // Track before removing (we need the quantity from the current cart state)
      const item = optimisticCartRef.current?.items?.find((i) => i.variantId === variantId)
      if (item) {
        trackCartRemove(variantId, item.quantity)
      }
      await removeFromCartMutation({ variantId })
    } catch (err) {
      const parsed = parseConvexError(err)
      logError(parsed, {
        component: 'useShoppingCart',
        action: 'remove_item',
      })
      throw err
    }
  }, [removeFromCartMutation])

  const clearCart = useCallback(async () => {
    try {
      await clearCartMutation({})
    } catch (err) {
      const parsed = parseConvexError(err)
      logError(parsed, {
        component: 'useShoppingCart',
        action: 'clear_cart',
      })
      throw err
    }
  }, [clearCartMutation])

  const items: CartItem[] = (cart?.items || []).map((item) => {
    const variantName = [item.variant.size, item.variant.color, item.variant.style]
      .filter(Boolean)
      .join(' - ') || 'Default'

    return {
      variantId: item.variantId,
      productName: item.product.name,
      variantName,
      quantity: item.quantity,
      currentPrice: item.currentPrice,
      priceAtAddTime: item.priceAtAddTime,
      priceChanged: item.priceChanged,
      priceChangePercentage: item.priceChangePercentage,
      available: item.available,
      availableQuantity: item.availableQuantity,
    }
  })

  return {
    items,
    itemCount: cart?.itemCount || 0,
    subtotal: cart?.subtotal || 0,
    tax: cart?.tax || 0,
    shipping: cart?.shipping || 0,
    total: cart?.total || 0,
    isEmpty: !isSignedIn || (cart?.isEmpty ?? true),
    cartId: cart?.cartId,
    isLoading: isSignedIn && cart === undefined,

    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }
}
