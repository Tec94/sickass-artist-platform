import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState, useEffect } from 'react'
import { DropCard } from '../components/Merch/DropCard'
import { StoreTopRail } from '../components/Merch/StoreTopRail'
import { STORE_DESIGN_HERO_IMAGE } from '../features/store/storeDesignAssets'
import { motion } from 'framer-motion'

export function DropsPage() {
  const navigate = useNavigate()
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
      setServerTime(Date.now())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const now = serverTime ?? Date.now()

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
    <div className="app-surface-page store-v2-root min-h-screen bg-black">
      <div className="store-v2-page-frame">
        <StoreTopRail
          activeId="drops"
          actions={[
            {
              label: 'View Store Scene',
              onClick: () => navigate('/store'),
              icon: 'solar:buildings-3-linear',
              variant: 'pill',
            },
            {
              label: 'Browse Collection',
              onClick: () => navigate('/store/browse'),
            },
          ]}
        />

        <section
          className="store-v2-route-hero"
          style={{
            backgroundImage: `linear-gradient(118deg, rgba(9,7,6,0.24), rgba(9,7,6,0.8)), url(${STORE_DESIGN_HERO_IMAGE})`,
          }}
        >
          <div className="store-v2-route-hero__content">
            <p className="store-v2-label">Drops / Queue window</p>
            <h1 className="store-v2-route-title">
              Private releases stay premium, not chaotic.
            </h1>
            <p className="store-v2-route-copy">
              One featured panel carries urgency. Tabs and release cards keep the rest of the page legible for real shopping decisions.
            </p>
          </div>
        </section>

        <section className="store-v2-status-strip">
          <div className="store-v2-status-strip__group">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`store-v2-segmented-filter-button ${activeTab === tab.id ? 'store-v2-segmented-filter-button--active' : ''}`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 ? <span className="store-v2-pill">{tab.count}</span> : null}
              </button>
            ))}
          </div>
          <span className="store-v2-meta">
            Queue admission, reminder entry, and release timing stay in one predictable layer.
          </span>
        </section>

        {displayDrops[activeTab].length === 0 ? (
          <div className="store-v2-surface-card store-v2-empty-state">
            <p className="store-v2-page-title text-center !text-[1.8rem]">No {activeTab} drops right now.</p>
            <p className="store-v2-page-copy text-center">Check back soon for more exclusive staging and timed collection releases.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {displayDrops[activeTab].map((drop) => (
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
