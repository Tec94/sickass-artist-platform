import type { FC } from 'react'
import type { GalleryContentItem } from '../../types/gallery'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { OptimizedImage } from './OptimizedImage'
import { LikeButton } from './LikeButton'

interface GalleryFYPProps {
  items: GalleryContentItem[]
  isLoading?: boolean
  onItemClick?: (index: number) => void
}

export const GalleryFYP: FC<GalleryFYPProps> = ({ items, isLoading, onItemClick }) => {
  const animate = useScrollAnimation()

  return (
    <div className="fyp-container">
      {items.map((item, index) => (
        <article
          key={item.contentId}
          ref={animate}
          data-animate
          className="fyp-post cursor-pointer"
          onClick={() => onItemClick?.(index)}
          role="button"
          aria-label="View item"
        >
          <div className="post-header">
            <div className="user-info">
              <div className="avatar">
                {item.creator.avatar ? (
                  <img src={item.creator.avatar} alt={item.creator.displayName} />
                ) : (
                  <div className="avatar-placeholder">{item.creator.displayName?.[0]}</div>
                )}
              </div>
              <span className="username">{item.creator.displayName}</span>
            </div>
            <iconify-icon icon="solar:menu-dots-bold"></iconify-icon>
          </div>

          <div className="post-media">
            <div className="post-media-visual">
              <OptimizedImage src={item.imageUrl} alt={item.title} aspectRatio={1} />
            </div>
            <div className="post-media-overlay" />
            {item.isLocked && (
              <div className="locked-overlay">
                <iconify-icon icon="solar:lock-bold"></iconify-icon>
                <span>Exclusive Content</span>
              </div>
            )}
          </div>

          <div className="post-actions">
            <div className="main-actions">
              <LikeButton
                contentId={item.contentId}
                contentType="gallery"
                initialLiked={item.isLiked}
                initialCount={item.likeCount}
                size="md"
                showCount={false}
                compact
              />
              <button aria-label="Comment">
                <iconify-icon icon="solar:chat-round-line-linear"></iconify-icon>
              </button>
              <button aria-label="Share">
                <iconify-icon icon="solar:share-linear"></iconify-icon>
              </button>
            </div>
            <button aria-label="Bookmark">
              <iconify-icon icon="solar:bookmark-linear"></iconify-icon>
            </button>
          </div>

          <div className="post-info">
            <div className="likes-count">{item.likeCount.toLocaleString()} likes</div>
            <div className="caption">
              <span className="username">{item.creator.displayName}</span> {item.title}
            </div>
            {item.tags && item.tags.length > 0 ? (
              <div className="tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      ))}

      {isLoading ? (
        <div className="fyp-loading">
          <iconify-icon icon="solar:spinner-bold" className="spin"></iconify-icon>
        </div>
      ) : null}
    </div>
  )
}
