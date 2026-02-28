import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState, useEffect } from 'react'
import { DropCard } from '../components/Merch/DropCard'
import { motion } from 'framer-motion'

export function DropsPage() {
  const [serverTime, setServerTime] = useState<number | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'ended'>('active')

  // We'll use the queries implemented in convex/drops.ts
  const activeDrops = useQuery(api.drops.getActiveDrops)
  const upcomingDrops = useQuery(api.drops.getUpcomingDrops)

  // Sync server time on mount
  useEffect(() => {
    // In production, would call API endpoint
    setServerTime(Date.now())
  }, [])

  // Refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Force refetch
      window.location.reload()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const now = Date.now()

  const displayDrops = {
    active: activeDrops?.filter(d => now >= d.startsAt && now < d.endsAt) || [],
    upcoming: upcomingDrops?.filter(d => d.startsAt > now) || [],
    ended: activeDrops?.filter(d => d.endsAt < now) || [],
  }

  const tabs = [
    { id: 'active', label: 'Active', count: displayDrops.active.length },
    { id: 'upcoming', label: 'Upcoming', count: displayDrops.upcoming.length },
    { id: 'ended', label: 'Past', count: displayDrops.ended.length },
  ] as const

  return (
    <div className="app-surface-page min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-b from-black to-transparent py-12 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-3">Drops</h1>
          <p className="text-gray-400 text-lg">
            Limited-time collection releases and exclusive drops
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="app-surface-shell max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 border-b border-gray-800 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-2 font-semibold transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-red-400 border-red-500'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Drops grid */}
        {displayDrops[activeTab].length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No {activeTab} drops right now</p>
            <p className="text-gray-500 text-sm mt-2">
              Check back soon for more exciting releases!
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {displayDrops[activeTab].map(drop => (
              <DropCard
                key={drop._id}
                drop={drop}
                serverTime={serverTime}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
