import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { GalleryCard } from './GalleryCard'
import { GallerySkeleton } from './GallerySkeleton'
import type { GalleryContentItem } from '../types/gallery'

import { Id } from '../../convex/_generated/dataModel'

interface CreatorPortfolioProps {
  creatorId: Id<'users'>
  limit?: number
  onItemClick: (item: GalleryContentItem) => void
}

export const CreatorPortfolio = ({
  creatorId,
  limit = 8,
  onItemClick,
}: CreatorPortfolioProps) => {
  const creatorWorks = useQuery(api.recommendations.getCreatorContent, {
    creatorId,
    limit,
  })

  const creator = useQuery(api.recommendations.getCreator, { creatorId })

  if (!creator) return null

  return (
    <section className="py-8 px-4 md:px-6">
      {/* Header with creator info */}
      <div className="mb-6 flex items-center gap-4">
        <img
          src={creator.avatar}
          alt={creator.displayName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="text-lg font-bold text-white">
            More from {creator.displayName}
          </h3>
          <p className="text-sm text-gray-400">{creator.fanTier} tier artist</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!creatorWorks ? (
          <>
            {[...Array(limit)].map((_, i) => (
              <GallerySkeleton key={i} />
            ))}
          </>
        ) : (
          creatorWorks.map(item => (
            <button
              key={item.contentId}
              onClick={() => onItemClick(item)}
              className="group"
            >
              <GalleryCard item={item} onClick={() => onItemClick(item)} />
            </button>
          ))
        )}
      </div>

      {/* View all link */}
      <div className="mt-6 text-center">
        <a
          href={`/profile/${creator.username}`}
          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition"
        >
          View all works →
        </a>
      </div>
    </section>
  )
}
