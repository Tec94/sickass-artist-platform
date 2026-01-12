import { usePoints } from '../hooks/usePoints'
import { motion } from 'framer-motion'

export const PointsDisplay = () => {
  const { balance, isLoading } = usePoints()

  if (isLoading) {
    return <div className="h-8 w-16 animate-pulse bg-gray-700 rounded" />
  }

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600"
      whileHover={{ scale: 1.05 }}
    >
      <span className="text-sm font-bold text-white">⭐</span>
      <span className="text-sm font-semibold text-white">{balance.availablePoints}</span>
    </motion.div>
  )
}

export const PointsEarned = ({ amount, type }: { amount: number; type: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-lg font-bold z-50"
    >
      +{amount} points for {type}
    </motion.div>
  )
}
