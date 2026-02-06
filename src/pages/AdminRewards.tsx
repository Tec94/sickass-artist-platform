import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import { useAdminAccess } from '../hooks/useAdminAccess'

export const AdminRewards = () => {
  const { user, isAdmin, isReady, hasValidToken, hasAdminAccess, canUseAdminQueries, tokenMatchesUser } = useAdminAccess()
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    rewardId: '',
    name: '',
    description: '',
    category: 'discount',
    pointCost: 100,
    stock: null as number | null,
    discountPercent: 0,
  })

  const createReward = useMutation(api.rewards.createReward)
  const rewards = useQuery(api.rewards.getAvailableRewards, canUseAdminQueries ? {} : 'skip')

  if (!isReady) {
    return <div className="text-white p-8 text-center">Session syncing...</div>
  }

  if (!hasValidToken || !tokenMatchesUser) {
    return <div className="text-white p-8 text-center">Session not ready</div>
  }

  if (!user) {
    return <div className="text-white p-8 text-center">Sign in required</div>
  }

  if (!hasAdminAccess || !isAdmin) {
    return <div className="text-white p-8 text-center">Admin access required</div>
  }

  const handleCreate = async () => {
    try {
      await createReward({
        rewardId: formData.rewardId,
        name: formData.name,
        description: formData.description,
        category: formData.category as 'discount' | 'physical' | 'digital' | 'experience' | 'feature',
        pointCost: formData.pointCost,
        stock: formData.stock ?? undefined,
        metadata: {
          discountPercent: formData.discountPercent,
        },
      })

      alert('Reward created!')
      setIsCreating(false)
      setFormData({
        rewardId: '',
        name: '',
        description: '',
        category: 'discount',
        pointCost: 100,
        stock: null,
        discountPercent: 0,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error: ${message}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Rewards</h1>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-semibold hover:shadow-lg"
        >
          {isCreating ? 'Cancel' : 'Create Reward'}
        </button>
      </div>

      {isCreating && (
        <div className="bg-gray-800 p-6 rounded-lg border border-purple-600 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">New Reward</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Reward ID (e.g., 10_percent_off)"
                value={formData.rewardId}
                onChange={e => setFormData({ ...formData, rewardId: e.target.value })}
                className="px-4 py-2 bg-gray-700 text-white rounded"
              />
              <input
                type="text"
                placeholder="Reward Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 bg-gray-700 text-white rounded"
              />
            </div>

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              rows={3}
            />

            <div className="grid grid-cols-3 gap-4">
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-2 bg-gray-700 text-white rounded"
              >
                <option>discount</option>
                <option>physical</option>
                <option>digital</option>
                <option>experience</option>
                <option>feature</option>
              </select>

              <input
                type="number"
                placeholder="Point Cost"
                value={formData.pointCost}
                onChange={e => setFormData({ ...formData, pointCost: parseInt(e.target.value) })}
                className="px-4 py-2 bg-gray-700 text-white rounded"
              />

              <input
                type="number"
                placeholder="Stock (leave blank for unlimited)"
                value={formData.stock || ''}
                onChange={e => setFormData({
                  ...formData,
                  stock: e.target.value ? parseInt(e.target.value) : null
                })}
                className="px-4 py-2 bg-gray-700 text-white rounded"
              />
            </div>

            <button
              onClick={handleCreate}
              className="w-full py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700"
            >
              Create Reward
            </button>
          </div>
        </div>
      )}

      {/* Existing Rewards List */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Existing Rewards</h2>
        {!rewards ? (
          <div className="text-gray-400 text-center py-8">Loading rewards...</div>
        ) : rewards.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No rewards created yet</div>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div
                key={reward._id}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Name</p>
                    <p className="font-semibold text-white">{reward.name}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {reward.rewardId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Category</p>
                    <p className="text-white capitalize">{reward.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Cost</p>
                    <p className="text-yellow-400 font-bold">{reward.pointCost} points</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Stock</p>
                    <p className="text-white">
                      {reward.stock 
                        ? `${(reward.stockUsed ?? 0)} / ${reward.stock} used`
                        : 'Unlimited'
                      }
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-400">{reward.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
