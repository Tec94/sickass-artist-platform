import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

export function AdminInstagram() {
  const posts = useQuery(api.instagram.getAllInstagramPosts, { limit: 50 })
  const status = useQuery(api.instagram.getInstagramStatus)
  const triggerSync = useMutation(api.instagram.adminTriggerSync)
  const toggleFeature = useMutation(api.instagram.adminToggleFeature)

  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [displayOrders, setDisplayOrders] = useState<Record<string, number>>({})

  const handleSync = async () => {
    setSyncing(true)
    setSyncError(null)
    try {
      await triggerSync({})
      setTimeout(() => {
        setSyncing(false)
      }, 3000)
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncError(error instanceof Error ? error.message : 'Sync failed')
      setSyncing(false)
    }
  }

  const handleToggleFeature = async (postId: Id<'instagramPosts'>, currentlyFeatured: boolean, displayOrder?: number) => {
    try {
      await toggleFeature({
        postId,
        isFeatured: !currentlyFeatured,
        displayOrder: !currentlyFeatured ? (displayOrder || 0) : undefined,
      })
    } catch (error) {
      console.error('Toggle feature failed:', error)
      alert(error instanceof Error ? error.message : 'Failed to toggle feature')
    }
  }

  const handleUpdateDisplayOrder = async (postId: Id<'instagramPosts'>, order: number) => {
    try {
      await toggleFeature({
        postId,
        isFeatured: true,
        displayOrder: order,
      })
      setDisplayOrders((prev) => ({ ...prev, [postId]: order }))
    } catch (error) {
      console.error('Update display order failed:', error)
    }
  }

  return (
    <div className="admin-instagram">
      <div className="section-header">
        <div>
          <h2>Instagram Posts</h2>
          <p>Manage synced posts from your Instagram Business account</p>
        </div>
      </div>

      {/* Sync Status */}
      <div className="sync-status-card">
        <div className="sync-info">
          <div className="sync-stat">
            <span className="sync-label">Total Posts:</span>
            <span className="sync-value">{status?.totalPosts ?? 0}</span>
          </div>
          <div className="sync-stat">
            <span className="sync-label">Last Synced:</span>
            <span className="sync-value">
              {status?.lastSyncedAt 
                ? new Date(status.lastSyncedAt).toLocaleString()
                : 'Never'}
            </span>
          </div>
          <div className="sync-stat">
            <span className="sync-label">Status:</span>
            <span className={`sync-badge ${status?.status}`}>
              {status?.status === 'fresh' ? '✓ Fresh' : 
               status?.status === 'stale' ? '⚠ Stale' : 
               '○ Never Synced'}
            </span>
          </div>
        </div>
        <button 
          className="sync-btn"
          onClick={handleSync}
          disabled={syncing}
        >
          <iconify-icon icon={syncing ? 'line-md:loading-loop' : 'solar:refresh-circle-linear'} width="18" height="18"></iconify-icon>
          <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>

      {syncError && (
        <div className="error-banner">
          <iconify-icon icon="solar:danger-circle-linear" width="20" height="20"></iconify-icon>
          <span>{syncError}</span>
        </div>
      )}

      {/* Posts Grid */}
      <div className="posts-section">
        <h3>All Posts ({posts?.length ?? 0})</h3>
        
        {!posts ? (
          <div className="loading-state">
            <iconify-icon icon="line-md:loading-loop" width="32" height="32"></iconify-icon>
            <p>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <iconify-icon icon="solar:gallery-linear" width="48" height="48"></iconify-icon>
            <p>No Instagram posts found</p>
            <button className="sync-btn" onClick={handleSync}>
              Sync Posts
            </button>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <div 
                key={post._id} 
                className={`post-card ${post.isFeatured ? 'featured' : ''}`}
              >
                {/* Thumbnail */}
                <div className="post-thumbnail">
                  <img 
                    src={post.thumbnailUrl} 
                    alt={post.caption}
                    loading="lazy"
                  />
                  {post.isFeatured && (
                    <div className="featured-badge">
                      <iconify-icon icon="solar:star-bold" width="16" height="16"></iconify-icon>
                      <span>Featured</span>
                    </div>
                  )}
                  {post.mediaType === 'video' && (
                    <div className="media-badge video">▶ Video</div>
                  )}
                  {post.mediaType === 'carousel_album' && (
                    <div className="media-badge carousel">📹 Carousel</div>
                  )}
                </div>

                {/* Post Info */}
                <div className="post-info">
                  <p className="post-caption">{post.caption.slice(0, 100)}{post.caption.length > 100 ? '...' : ''}</p>
                  <div className="post-stats">
                    <span>❤️ {post.likeCount.toLocaleString()}</span>
                    <span>💬 {post.commentCount.toLocaleString()}</span>
                  </div>
                  <div className="post-date">
                    {new Date(post.igSourceCreatedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="post-actions">
                  <button 
                    className={`feature-btn ${post.isFeatured ? 'active' : ''}`}
                    onClick={() => handleToggleFeature(post._id, post.isFeatured, post.displayOrder)}
                  >
                    <iconify-icon icon="solar:star-linear" width="16" height="16"></iconify-icon>
                    <span>{post.isFeatured ? 'Unfeature' : 'Feature'}</span>
                  </button>
                  
                  {post.isFeatured && (
                    <div className="order-input">
                      <label>Order:</label>
                      <input 
                        type="number"
                        min="0"
                        max="999"
                        value={displayOrders[post._id] ?? post.displayOrder ?? 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          setDisplayOrders((prev) => ({ ...prev, [post._id]: val }))
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value) || 0
                          handleUpdateDisplayOrder(post._id, val)
                        }}
                      />
                    </div>
                  )}

                  <a 
                    href={post.igLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-btn"
                  >
                    <iconify-icon icon="solar:eye-linear" width="16" height="16"></iconify-icon>
                    <span>View</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .admin-instagram {
          padding: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .section-header p {
          font-size: 14px;
          color: #808080;
        }

        .sync-status-card {
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .sync-info {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }

        .sync-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sync-label {
          font-size: 12px;
          color: #808080;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sync-value {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }

        .sync-badge {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .sync-badge.fresh {
          background: rgba(0, 128, 0, 0.2);
          color: #00ff00;
        }

        .sync-badge.stale {
          background: rgba(255, 165, 0, 0.2);
          color: #ffa500;
        }

        .sync-badge.never {
          background: rgba(128, 128, 128, 0.2);
          color: #808080;
        }

        .sync-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #8b0000, #c41e3a);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .sync-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 0, 0, 0.4);
        }

        .sync-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-banner {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ef4444;
        }

        .posts-section h3 {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 16px;
        }

        .loading-state,
        .empty-state {
          padding: 60px 24px;
          text-align: center;
          color: #808080;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .post-card {
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .post-card.featured {
          border-color: #ffd700;
          box-shadow: 0 0 12px rgba(255, 215, 0, 0.2);
        }

        .post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .post-thumbnail {
          position: relative;
          aspect-ratio: 1;
          background: #0a0a0a;
        }

        .post-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .featured-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(255, 215, 0, 0.9);
          color: #000;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .media-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
        }

        .media-badge.video {
          background: rgba(59, 130, 246, 0.9);
        }

        .media-badge.carousel {
          background: rgba(168, 85, 247, 0.9);
        }

        .post-info {
          padding: 12px;
        }

        .post-caption {
          font-size: 13px;
          color: #e0e0e0;
          line-height: 1.4;
          margin-bottom: 8px;
        }

        .post-stats {
          display: flex;
          gap: 12px;
          font-size: 13px;
          color: #808080;
          margin-bottom: 8px;
        }

        .post-date {
          font-size: 12px;
          color: #606060;
        }

        .post-actions {
          padding: 12px;
          border-top: 1px solid #1a1a1a;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .feature-btn,
        .view-btn {
          padding: 6px 12px;
          background: #1a1a1a;
          color: #e0e0e0;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          text-decoration: none;
        }

        .feature-btn:hover,
        .view-btn:hover {
          background: #2a2a2a;
          border-color: #3a3a3a;
        }

        .feature-btn.active {
          background: rgba(255, 215, 0, 0.2);
          border-color: #ffd700;
          color: #ffd700;
        }

        .order-input {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .order-input label {
          color: #808080;
          font-weight: 600;
        }

        .order-input input {
          width: 60px;
          padding: 4px 8px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          color: #fff;
          font-size: 12px;
        }

        @media (max-width: 768px) {
          .admin-instagram {
            padding: 16px;
          }

          .sync-status-card {
            flex-direction: column;
            align-items: stretch;
          }

          .sync-info {
            gap: 16px;
          }

          .posts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
