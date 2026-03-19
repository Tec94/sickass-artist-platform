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
    <div className="store-v2-surface-card store-v2-record-card space-y-4 p-5">
      {/* Product info */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-[var(--font-display)] text-lg font-semibold text-[var(--store-v2-tone-text-main)]">{item.productName}</h4>
          <p className="text-sm text-[var(--store-v2-tone-text-meta)]">{item.variantName}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-[var(--store-v2-tone-accent)]">
            ${(itemSubtotal / 100).toFixed(2)}
          </p>
          <p className="text-xs text-[var(--store-v2-tone-text-muted)]">
            ${(item.currentPrice / 100).toFixed(2)} each
          </p>
        </div>
      </div>

      {/* Price change warning */}
      {item.priceChanged && (
        <div className="flex items-center gap-2 rounded-[12px] border border-[rgba(216,184,152,0.22)] bg-[rgba(52,33,28,0.48)] p-3 text-xs text-[var(--store-v2-tone-accent)]">
          <iconify-icon icon="solar:info-circle-linear" width="12" height="12" class="flex-shrink-0"></iconify-icon>
          <span>
            Price {item.priceChangePercentage > 0 ? 'increased' : 'decreased'} {Math.abs(item.priceChangePercentage)}%
          </span>
        </div>
      )}

      {/* Stock warning */}
      {!item.available && (
        <div className="flex items-center gap-2 rounded-[12px] border border-[rgba(160,32,48,0.32)] bg-[rgba(76,42,49,0.34)] p-3 text-xs text-[#f4c5c7]">
          <iconify-icon icon="solar:danger-circle-linear" width="12" height="12" class="flex-shrink-0"></iconify-icon>
          <span>Out of stock - Please remove or contact support</span>
        </div>
      )}

      {/* Quantity selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
            className="store-v2-detail-size-option flex h-9 w-9 items-center justify-center text-sm disabled:opacity-50"
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
            className="store-v2-control w-12 text-center text-sm"
          />
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating || item.quantity >= 100}
            className="store-v2-detail-size-option flex h-9 w-9 items-center justify-center text-sm disabled:opacity-50"
          >
            +
          </button>
        </div>

        {/* Remove button */}
        <button
          onClick={handleRemove}
          disabled={isRemoving || loading}
          className="store-v2-detail-icon-button min-h-9 min-w-9 p-2 disabled:opacity-50"
        >
          <iconify-icon icon="solar:trash-bin-trash-linear" width="16" height="16"></iconify-icon>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-[#f4c5c7]">{error}</p>
      )}
    </div>
  )
}
