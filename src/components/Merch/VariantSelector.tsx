import { useMemo } from 'react'
import { Doc } from '../../../convex/_generated/dataModel'

interface VariantSelectorProps {
  variants: Doc<'merchVariants'>[]
  selectedVariantId: string | null
  onSelectVariant: (variantId: string) => void
  onSelectQuantity: (quantity: number) => void
  quantity: number
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
  onSelectQuantity,
  quantity,
}: VariantSelectorProps) {
  // Group variants by size/color for matrix view
  const variantMatrix = useMemo(() => {
    const sizes = new Set<string>()
    const colors = new Set<string>()
    const matrix: Record<string, Record<string, Doc<'merchVariants'> | null>> = {}

    variants.forEach(v => {
      if (v.size) sizes.add(v.size)
      if (v.color) colors.add(v.color)
    })

    const sizeArray = Array.from(sizes).sort()
    const colorArray = Array.from(colors).sort()

    sizeArray.forEach(size => {
      if (!matrix[size]) matrix[size] = {}
      colorArray.forEach(color => {
        const variant = variants.find(v => v.size === size && v.color === color)
        matrix[size][color] = variant || null
      })
    })

    return { matrix, sizes: sizeArray, colors: colorArray }
  }, [variants])

  const selectedVariant = variants.find(v => v._id === selectedVariantId)

  // Handle both simple and complex variants
  const isSimple = variants.length <= 1
  const hasSize = variants.some(v => v.size)
  const hasColor = variants.some(v => v.color)

  if (isSimple) {
    return (
      <div className="space-y-4">
        {/* Quantity selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-white"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                if (val >= 1 && val <= 100) onSelectQuantity(val)
              }}
              className="w-16 text-center px-2 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
            <button
              onClick={() => onSelectQuantity(Math.min(100, quantity + 1))}
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-white"
            >
              +
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Complex variants with size/color matrix
  if (hasSize && hasColor) {
    return (
      <div className="space-y-6">
        {/* Size selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {variantMatrix.sizes.map(size => {
              const sizeVariants = variants.filter(v => v.size === size)
              const hasAvailable = sizeVariants.some(v => v.stock > 0)

              return (
                <button
                  key={size}
                  onClick={() => {
                    const available = sizeVariants.find(v => v.stock > 0)
                    if (available) onSelectVariant(available._id)
                  }}
                  disabled={!hasAvailable}
                  className={`py-2 px-3 rounded border text-sm font-semibold transition-colors ${
                    selectedVariant?.size === size
                      ? 'bg-cyan-600 border-cyan-500 text-white'
                      : hasAvailable
                        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                        : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>

        {/* Color selector */}
        {selectedVariant?.size && (
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {variantMatrix.colors.map(color => {
                const variant = variants.find(
                  v => v.size === selectedVariant.size && v.color === color
                )
                const available = variant && variant.stock > 0

                return (
                  <button
                    key={color}
                    onClick={() => {
                      if (variant) onSelectVariant(variant._id)
                    }}
                    disabled={!available}
                    className={`py-2 px-3 rounded border text-sm font-semibold transition-colors ${
                      selectedVariantId === variant?._id
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : available
                          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                          : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {color}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Stock indicator */}
        {selectedVariant && (
          <div className={`p-3 rounded text-sm ${
            selectedVariant.stock > 0
              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {selectedVariant.stock > 0
              ? `${selectedVariant.stock} in stock`
              : 'Out of stock'}
          </div>
        )}

        {/* Quantity selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-white"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max={selectedVariant?.stock || 100}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                if (val >= 1 && val <= (selectedVariant?.stock || 100)) {
                  onSelectQuantity(val)
                }
              }}
              className="w-16 text-center px-2 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
            <button
              onClick={() => onSelectQuantity(Math.min(selectedVariant?.stock || 100, quantity + 1))}
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-white"
            >
              +
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Simple list of variants
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Options
        </label>
        <div className="space-y-2">
          {variants.map(variant => (
            <button
              key={variant._id}
              onClick={() => onSelectVariant(variant._id)}
              className={`w-full py-2 px-3 rounded border text-left transition-colors ${
                selectedVariantId === variant._id
                  ? 'bg-cyan-600 border-cyan-500 text-white'
                  : variant.stock > 0
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                    : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
              }`}
              disabled={variant.stock === 0}
            >
              <div className="flex justify-between items-center">
                <span>
                  {variant.size && variant.color
                    ? `${variant.size} - ${variant.color}`
                    : variant.size || variant.color || 'Default'}
                </span>
                <span className="text-xs">
                  {variant.stock > 0 ? `${variant.stock} left` : 'Out of stock'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-white"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              if (val >= 1 && val <= 100) onSelectQuantity(val)
            }}
            className="w-16 text-center px-2 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
          <button
            onClick={() => onSelectQuantity(Math.min(100, quantity + 1))}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-white"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}