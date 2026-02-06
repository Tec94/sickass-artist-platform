import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import { useAdminAccess } from '../hooks/useAdminAccess'
import type { Id } from '../../convex/_generated/dataModel'

export const AdminRedemptions = () => {
  const { user, isAdmin, isReady, hasValidToken, hasAdminAccess, canUseAdminQueries, tokenMatchesUser } = useAdminAccess()
  const pending = useQuery(api.rewards.getPendingRedemptions, canUseAdminQueries ? {} : 'skip')
  const approveMutation = useMutation(api.rewards.adminApproveRedemption)
  const [trackingId, setTrackingId] = useState<Record<string, string>>({})

  if (!isReady) return <div className="animate-pulse text-white p-8">Session syncing...</div>

  if (!hasValidToken || !tokenMatchesUser) return <div className="text-white p-8">Session not ready</div>

  if (!user) {
    return <div className="text-white p-8">Sign in required</div>
  }

  if (!hasAdminAccess || !isAdmin) {
    return <div className="text-white p-8">Admin access required</div>
  }

  if (!pending) return <div className="animate-pulse text-white p-8">Loading...</div>

  const handleApprove = async (redemptionId: Id<'userRedemptions'>) => {
    try {
      await approveMutation({
        redemptionId,
        trackingId: trackingId[String(redemptionId)] || undefined,
      })
      alert('Approved!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error: ${errorMessage}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Pending Redemptions</h1>

      {pending.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No pending redemptions</div>
      ) : (
        <div className="space-y-4">
          {pending.map((redemption) => (
            <div
              key={redemption._id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase">User</p>
                  <p className="font-semibold text-white">{redemption.userName}</p>
                  <p className="text-sm text-gray-500">{redemption.userEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Reward</p>
                  <p className="font-semibold text-white">{redemption.rewardName}</p>
                  <p className="text-sm text-yellow-400">{redemption.pointsSpent} points</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Code</p>
                  <p className="font-mono text-sm text-white">{redemption.redeemCode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Redeemed</p>
                  <p className="text-sm text-gray-300">
                    {new Date(redemption.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {redemption.deliveryAddress && (
                <div className="mb-4 p-3 bg-gray-900 rounded text-sm text-gray-300">
                  <p className="font-semibold mb-1">Ship To:</p>
                  <p>{redemption.deliveryAddress.name}</p>
                  <p>{redemption.deliveryAddress.address}</p>
                  <p>
                    {redemption.deliveryAddress.city}, {redemption.deliveryAddress.state}{' '}
                    {redemption.deliveryAddress.zip}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Tracking ID (optional)"
                  value={trackingId[String(redemption._id)] || ''}
                  onChange={(e) =>
                    setTrackingId({
                      ...trackingId,
                      [String(redemption._id)]: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-sm"
                />
                <button
                  onClick={() => handleApprove(redemption._id)}
                  className="px-6 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700"
                >
                  Approve & Ship
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
