import { Trash2, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { Id } from '../../../convex/_generated/dataModel'

interface CartItemProps {
  item: {
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
  onUpdateQuantity: (quantity: number) => Promise<void>
  onRemove: () => Promise<void>
  loading?: boolean
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  loading,
}: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 100) return
    setIsUpdating(true)
    setError(null)
    try {
      await onUpdateQuantity(newQuantity)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    setError(null)
    try {
      await onRemove()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove')
    } finally {
      setIsRemoving(false)
    }
  }

  const itemSubtotal = item.currentPrice * item.quantity

  return (
    <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg space-y-3">
      {/* Product info */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-white">{item.productName}</h4>
          <p className="text-sm text-gray-400">{item.variantName}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-cyan-400">
            ${(itemSubtotal / 100).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            ${(item.currentPrice / 100).toFixed(2)} each
          </p>
        </div>
      </div>

      {/* Price change warning */}
      {item.priceChanged && (
        <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400 text-xs">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>
            Price {item.priceChangePercentage > 0 ? 'increased' : 'decreased'} {Math.abs(item.priceChangePercentage)}%
          </span>
        </div>
      )}

      {/* Stock warning */}
      {!item.available && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>Out of stock - Please remove or contact support</span>
        </div>
      )}

      {/* Quantity selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 rounded text-sm text-white transition-colors"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max={item.availableQuantity}
            value={item.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
            disabled={isUpdating}
            className="w-12 text-center px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
          />
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating || item.quantity >= 100}
            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 rounded text-sm text-white transition-colors"
          >
            +
          </button>
        </div>

        {/* Remove button */}
        <button
          onClick={handleRemove}
          disabled={isRemoving || loading}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:text-gray-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
