import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { Id } from '../../convex/_generated/dataModel'

export const AdminPoints = () => {
  const { user, isLoading: authLoading } = useAuth()
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const adminAdjust = useMutation(api.points.adminAdjustPoints)

  const targetBalance = useQuery(
    api.points.getUserBalance,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  )

  const txHistory = useQuery(
    api.points.getUserTransactionHistory,
    userId ? { userId: userId as Id<'users'>, limit: 25 } : 'skip'
  )

  if (authLoading) {
    return <div className="text-white p-8 text-center">Loading...</div>
  }

  if (!user) {
    return <div className="text-white p-8 text-center">Sign in required</div>
  }

  if (user.role !== 'admin') {
    return <div className="text-white p-8 text-center">Admin access required</div>
  }

  const handleAdjust = async () => {
    if (!userId || !reason) {
      alert('Fill all fields')
      return
    }

    if (!Number.isInteger(amount) || amount === 0) {
      alert('Amount must be a non-zero integer')
      return
    }

    setIsLoading(true)
    try {
      await adminAdjust({
        userId: userId as Id<'users'>,
        amount,
        reason,
        adminId: user._id as Id<'users'>,
      })

      alert('Points adjusted!')
      setUserId('')
      setAmount(0)
      setReason('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Adjust User Points</h1>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded"
            placeholder="Enter user document ID"
          />
          {targetBalance && (
            <p className="text-xs text-gray-400 mt-2">
              Balance: <span className="text-yellow-400 font-semibold">{targetBalance.availablePoints}</span>{' '}
              available / <span className="text-gray-200">{targetBalance.totalPoints}</span> total
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded"
            placeholder="Positive or negative amount"
          />
          <p className="text-xs text-gray-500 mt-2">
            Use a negative amount to deduct points. Deductions cannot make a user balance negative.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Reason</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded"
            placeholder="Why are you adjusting points? (auditable)"
            rows={3}
          />
        </div>

        <button
          onClick={handleAdjust}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-bold hover:shadow-lg disabled:opacity-50"
        >
          {isLoading ? 'Adjusting...' : 'Adjust Points'}
        </button>
      </div>

      <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-600 rounded text-sm text-yellow-300">
        <p className="font-semibold mb-2">Important</p>
        <p>All point adjustments are logged and auditable. Be careful with large amounts.</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-3">Recent Transactions</h2>
        {!userId ? (
          <div className="text-gray-400 text-sm">Enter a User ID to view transaction history.</div>
        ) : !txHistory ? (
          <div className="text-gray-400 text-sm">Loading transaction history...</div>
        ) : txHistory.length === 0 ? (
          <div className="text-gray-400 text-sm">No transactions found.</div>
        ) : (
          <div className="space-y-2">
            {txHistory.map((tx) => (
              <div key={tx._id} className="bg-gray-800 border border-gray-700 rounded p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-white font-semibold">{tx.type}</p>
                    <p className="text-xs text-gray-400">{tx.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
