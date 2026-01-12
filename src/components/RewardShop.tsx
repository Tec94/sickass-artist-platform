import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import type { Id } from '../../convex/_generated/dataModel'

export const RewardShop = () => {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest')

  const rewards = useQuery(api.rewards.getAvailableRewards, {
    category: selectedCategory,
    sortBy: sortBy,
  })

  const balance = useQuery(
    api.points.getUserBalance,
    user ? { userId: user._id } : 'skip'
  )

  if (!rewards || !balance) {
    return <div className="animate-pulse text-white p-8">Loading rewards...</div>
  }

  const categories = ['discount', 'physical', 'digital', 'experience', 'feature']

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Reward Shop</h1>
        <p className="text-gray-400">Spend your points on exclusive rewards</p>
      </div>

      <div className="mb-8 p-4 bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg">
        <p className="text-gray-300">Available Points</p>
        <p className="text-4xl font-bold text-white">{balance.availablePoints}</p>
      </div>

      <div className="mb-6 space-y-4">
        <div>
          <p className="text-sm text-gray-400 mb-2">Category</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded font-semibold transition ${
                selectedCategory === undefined
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded font-semibold transition capitalize ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-2">Sort</p>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'newest' | 'price_low' | 'price_high')}
            className="px-4 py-2 bg-gray-700 text-white rounded border-none"
          >
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">No rewards available in this category</p>
          </div>
        ) : (
          rewards.map(reward => (
            <RewardCard
              key={reward._id}
              reward={reward}
              userPoints={balance.availablePoints}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface RewardCardProps {
  reward: {
    _id: Id<'rewards'>
    name: string
    description: string
    category: string
    pointCost: number
    stock?: number
    stockUsed?: number
    imageUrl?: string
  }
  userPoints: number
}

const RewardCard = ({ reward, userPoints }: RewardCardProps) => {
  const { user } = useAuth()
  const [isRedeemOpen, setIsRedeemOpen] = useState(false)
  const [redeemIdempotencyKey, setRedeemIdempotencyKey] = useState<string | null>(null)
  const redeemMutation = useMutation(api.rewards.redeemReward)

  const canAfford = userPoints >= reward.pointCost
  const isOutOfStock = typeof reward.stock === 'number' && (reward.stockUsed ?? 0) >= reward.stock

  const createIdempotencyKey = () => {
    const random =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Math.random().toString(36).slice(2)}-${Date.now()}`

    return `redeem-${user?._id || 'anon'}-${reward._id}-${random}`
  }

  const handleRedeem = async () => {
    if (!user) return

    try {
      const idempotencyKey = redeemIdempotencyKey ?? createIdempotencyKey()
      const result = await redeemMutation({
        userId: user._id,
        rewardId: reward._id,
        idempotencyKey,
      })

      alert(`Reward redeemed! Code: ${result.couponCode}`)
      setIsRedeemOpen(false)
      setRedeemIdempotencyKey(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error: ${errorMessage}`)
    }
  }

  return (
    <motion.div
      className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition"
      whileHover={{ scale: 1.02 }}
      layout
    >
      {reward.imageUrl && (
        <img src={reward.imageUrl} alt={reward.name} className="w-full h-40 object-cover" />
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-white text-lg">{reward.name}</h3>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded capitalize">
            {reward.category}
          </span>
        </div>

        <p className="text-sm text-gray-400 mb-3">{reward.description}</p>

        {reward.stock && (
          <p className="text-xs text-gray-500 mb-2">
            Stock: {reward.stock - (reward.stockUsed || 0)} remaining
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
            <span>⭐</span>
            <span>{reward.pointCost}</span>
          </div>
        </div>

        {isOutOfStock ? (
          <button disabled className="w-full py-2 bg-gray-700 text-gray-500 rounded font-semibold cursor-not-allowed">
            Out of Stock
          </button>
        ) : !canAfford ? (
          <button disabled className="w-full py-2 bg-gray-700 text-gray-500 rounded font-semibold cursor-not-allowed">
            Insufficient Points ({userPoints}/{reward.pointCost})
          </button>
        ) : (
          <motion.button
            onClick={() => setIsRedeemOpen(true)}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-semibold hover:shadow-lg hover:shadow-purple-500/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Redeem Now
          </motion.button>
        )}
      </div>

      {isRedeemOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-purple-600"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Confirm Redemption</h3>
            <p className="text-gray-300 mb-4">
              You're about to spend <span className="font-bold text-yellow-400">{reward.pointCost} points</span> on <span className="font-bold">{reward.name}</span>
            </p>
            <p className="text-sm text-gray-400 mb-6">
              You'll receive a code via email that you can use to claim your reward.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsRedeemOpen(false)}
                className="flex-1 py-2 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeem}
                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-semibold hover:shadow-lg"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
