/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, ReactNode } from 'react'
import { useShoppingCart, CartItem } from '../hooks/useShoppingCart'
import { Id } from '../../convex/_generated/dataModel'

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  tax: number
  shipping: number
  total: number
  isEmpty: boolean
  isLoading: boolean
  addItem: (variantId: Id<'merchVariants'>, quantity: number) => Promise<void>
  updateQuantity: (variantId: Id<'merchVariants'>, quantity: number) => Promise<void>
  removeItem: (variantId: Id<'merchVariants'>) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useShoppingCart()

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
