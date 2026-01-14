import { useState } from 'react'
import { SongSubmissionModal } from './SongSubmissionModal'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

export const SongRankingWidget = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user } = useAuth()

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <iconify-icon icon="solar:music-library-2-bold-duotone" width="24" height="24"></iconify-icon>
        </div>
        
        <h3 className="text-xl font-display font-bold text-white mb-2">
          Rank Your Top Songs
        </h3>
        
        <p className="text-zinc-400 text-sm mb-6 max-w-xs">
          Submit your favorite tracks to influence the community leaderboard and earn points.
        </p>

        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/20"
        >
          <iconify-icon icon="solar:add-circle-bold" width="18" height="18"></iconify-icon> Submit Ranking
        </motion.button>

        {!user && (
          <p className="text-xs text-zinc-500 mt-3">
            Sign in to participate
          </p>
        )}
      </div>

      <SongSubmissionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        period="weekly"
      />
    </>
  )
}
