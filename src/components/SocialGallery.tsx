import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface InstagramMetadata {
  caption: string
  likeCount: number
  commentCount: number
  url: string
  mediaType: string
  mediaUrl?: string
}

interface SpotifyMetadata {
  artist: string
  album: string
  previewUrl?: string
  url: string
  hasPreview: boolean
  popularity: number
}

interface GalleryItemBase {
  _id: string
  id: string
  thumbnail: string
  title: string
  createdAt: number
}

type InstagramGalleryItem = GalleryItemBase & {
  type: 'instagram'
  metadata: InstagramMetadata
}

type SpotifyGalleryItem = GalleryItemBase & {
  type: 'spotify'
  metadata: SpotifyMetadata
}

type GalleryItem = InstagramGalleryItem | SpotifyGalleryItem

export const SocialGallery = () => {
  const [source, setSource] = useState<'all' | 'instagram' | 'spotify'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const galleryItems = useQuery(
    api.socialGallery.getSocialGalleryItems,
    {
      source,
      limit: 50,
    }
  )

  const searchResults = useQuery(
    api.socialGallery.searchSocialGallery,
    searchQuery ? { query: searchQuery, limit: 50 } : 'skip'
  )

  const items = searchQuery ? searchResults : galleryItems?.items

  if (!items) {
    return <div className="animate-pulse">Loading gallery...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Gallery</h1>
        <p className="text-gray-400">Explore posts and music from the artist</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search posts, songs, artists..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', 'instagram', 'spotify'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setSource(tab)
              setSearchQuery('')
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition capitalize ${
              source === tab
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab === 'instagram' && '📷'}
            {tab === 'spotify' && '🎵'}
            {tab === 'all' && '✨'}
            <span className="ml-2">{tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <p>No items found. Try a different search or filter.</p>
          </div>
        ) : (
          items.map((item: GalleryItem) => (
            <GalleryItemCard
              key={item._id}
              item={item}
              onSelect={setSelectedItem}
            />
          ))
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <GalleryLightbox
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface GalleryItemCardProps {
  item: GalleryItem
  onSelect: (item: GalleryItem) => void
}

const GalleryItemCard = ({ item, onSelect }: GalleryItemCardProps) => {
  return (
    <motion.div
      onClick={() => onSelect(item)}
      className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square bg-gray-800 border border-gray-700 hover:border-purple-500 transition"
      whileHover={{ scale: 1.05 }}
      layout
    >
      {/* Image */}
      <img
        src={item.thumbnail}
        alt={item.title}
        className="w-full h-full object-cover group-hover:brightness-75 transition"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23374151" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Unavailable%3C/text%3E%3C/svg%3E'
        }}
      />

      {/* Type Badge */}
      <div className="absolute top-2 right-2">
        <span
          className={`px-2 py-1 rounded text-xs font-bold text-white ${
            item.type === 'instagram'
              ? 'bg-pink-600'
              : 'bg-green-600'
          }`}
        >
          {item.type === 'instagram' ? '📷' : '🎵'} {item.type.toUpperCase()}
        </span>
      </div>

      {/* Title Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition">
        <p className="text-white font-semibold line-clamp-2 text-sm">{item.title}</p>
      </div>

      {/* Stats (Instagram only) */}
      {item.type === 'instagram' && (
        <div className="absolute bottom-2 left-2 flex gap-3 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition">
          <span>❤️ {item.metadata.likeCount}</span>
          <span>💬 {item.metadata.commentCount}</span>
        </div>
      )}

      {/* Popularity (Spotify only) */}
      {item.type === 'spotify' && (
        <div className="absolute bottom-2 left-2 text-green-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition">
          <span>⭐ {item.metadata.popularity}/100</span>
        </div>
      )}
    </motion.div>
  )
}

interface GalleryLightboxProps {
  item: GalleryItem
  onClose: () => void
}

const GalleryLightbox = ({ item, onClose }: GalleryLightboxProps) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-lg overflow-hidden max-w-3xl w-full border border-gray-700 relative"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
      >
        {item.type === 'instagram' ? (
          <InstagramLightboxContent item={item} />
        ) : (
          <SpotifyLightboxContent item={item} />
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-xl z-10"
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  )
}

const InstagramLightboxContent = ({ item }: { item: InstagramGalleryItem }) => {
  return (
    <div className="max-h-[90vh] overflow-y-auto">
      {/* Image */}
      <img
        src={item.metadata.mediaUrl || item.thumbnail}
        alt={item.title}
        className="w-full max-h-96 object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23374151" width="800" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Unavailable%3C/text%3E%3C/svg%3E'
        }}
      />

      {/* Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">{item.title}</h2>

        {item.metadata.caption && (
          <p className="text-gray-300 mb-4 whitespace-pre-wrap">{item.metadata.caption}</p>
        )}

        {/* Stats */}
        <div className="flex gap-6 mb-6">
          <div>
            <p className="text-3xl font-bold text-pink-500">❤️</p>
            <p className="text-sm text-gray-400">{item.metadata.likeCount} likes</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-500">💬</p>
            <p className="text-sm text-gray-400">{item.metadata.commentCount} comments</p>
          </div>
        </div>

        {/* Open on Instagram */}
        <a
          href={item.metadata.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-pink-500/50"
        >
          View on Instagram ↗
        </a>
      </div>
    </div>
  )
}

const SpotifyLightboxContent = ({ item }: { item: SpotifyGalleryItem }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Album Cover */}
      <div className="flex justify-center">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-48 h-48 rounded-lg shadow-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23374151" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Unavailable%3C/text%3E%3C/svg%3E'
          }}
        />
      </div>

      {/* Track Info */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
        <p className="text-gray-300 mb-1">{item.metadata.artist}</p>
        <p className="text-sm text-gray-400">{item.metadata.album}</p>
        <p className="text-sm text-yellow-400 mt-2">⭐ {item.metadata.popularity}/100 Popularity</p>
      </div>

      {/* Player */}
      {item.metadata.hasPreview && item.metadata.previewUrl ? (
        <div>
          <audio
            controls
            src={item.metadata.previewUrl}
            className="w-full h-10 rounded-lg"
          />
          <p className="text-xs text-gray-400 text-center mt-2">30-second preview</p>
        </div>
      ) : (
        <div className="text-center text-gray-400 text-sm">
          Preview not available for this track
        </div>
      )}

      {/* Open on Spotify */}
      <a
        href={item.metadata.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full block text-center py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
      >
        Open in Spotify ↗
      </a>
    </div>
  )
}
