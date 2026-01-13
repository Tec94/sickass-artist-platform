import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Doc } from '../../convex/_generated/dataModel'

export const InstagramGallery = () => {
  const posts = useQuery(api.instagram.getFeaturedInstagramPosts, { limit: 12 })
  const status = useQuery(api.instagram.getInstagramStatus)
  const [selectedPost, setSelectedPost] = useState<Doc<'instagramPosts'> | null>(null)

  if (!posts || !status) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-800 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div>
          {status.lastSyncedAt && (
            <span>
              Last updated:{' '}
              {new Date(status.lastSyncedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 hover:text-pink-400 flex items-center gap-1 transition"
        >
          <span>Follow on Instagram</span>
          <span>↗</span>
        </a>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            No Instagram posts featured yet
          </div>
        ) : (
          posts.map((post: Doc<'instagramPosts'>) => (
            <motion.div
              key={post._id}
              className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square bg-gray-800"
              onClick={() => setSelectedPost(post)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              layout
            >
              {/* Image */}
              <img
                src={post.thumbnailUrl}
                alt={post.caption || 'Instagram post'}
                className="w-full h-full object-cover group-hover:brightness-75 transition"
                loading="lazy"
                onError={(e) => {
                  // Fallback to placeholder on error
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23374151" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Unavailable%3C/text%3E%3C/svg%3E'
                }}
              />

              {/* Media Type Badge */}
              {post.mediaType === 'video' && (
                <div className="absolute top-2 right-2">
                  <span className="bg-blue-600 px-2 py-1 rounded text-xs font-bold text-white">
                    ▶ VIDEO
                  </span>
                </div>
              )}
              {post.mediaType === 'carousel_album' && (
                <div className="absolute top-2 right-2">
                  <span className="bg-purple-600 px-2 py-1 rounded text-xs font-bold text-white">
                    📹 CAROUSEL
                  </span>
                </div>
              )}

              {/* Stats Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition text-white text-center">
                  <div className="text-lg font-bold">❤️ {post.likeCount.toLocaleString()}</div>
                  <div className="text-sm">💬 {post.commentCount.toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              className="bg-gray-900 rounded-lg overflow-hidden max-w-2xl w-full border border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <img
                src={selectedPost.mediaUrl || selectedPost.thumbnailUrl}
                alt={selectedPost.caption}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23374151" width="800" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Unavailable%3C/text%3E%3C/svg%3E'
                }}
              />

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-200 mb-4 line-clamp-3">{selectedPost.caption}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-2xl font-bold text-pink-500">❤️ {selectedPost.likeCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Likes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-500">💬 {selectedPost.commentCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Comments</p>
                    </div>
                  </div>

                  <a
                    href={selectedPost.igLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-pink-600 text-white rounded font-semibold hover:bg-pink-700 transition"
                  >
                    View on Instagram ↗
                  </a>
                </div>

                <button
                  onClick={() => setSelectedPost(null)}
                  className="w-full py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
