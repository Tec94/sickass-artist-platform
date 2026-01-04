import React from 'react';
import type { GalleryContentItem } from '../../types/gallery';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { OptimizedImage } from './OptimizedImage';

interface GalleryFYPProps {
  items: GalleryContentItem[];
  isLoading?: boolean;
}

export const GalleryFYP: React.FC<GalleryFYPProps> = ({ items, isLoading }) => {
  const animate = useScrollAnimation();

  return (
    <div className="fyp-container">
      {items.map((item) => (
        <article key={item.contentId} ref={animate} data-animate className="fyp-post">
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
            <OptimizedImage
              src={item.imageUrl}
              alt={item.title}
              aspectRatio={1}
            />
            {item.isLocked && (
              <div className="locked-overlay">
                <iconify-icon icon="solar:lock-bold"></iconify-icon>
                <span>Exclusive Content</span>
              </div>
            )}
          </div>

          <div className="post-actions">
            <div className="main-actions">
              <button><iconify-icon icon="solar:heart-linear"></iconify-icon></button>
              <button><iconify-icon icon="solar:chat-round-line-linear"></iconify-icon></button>
              <button><iconify-icon icon="solar:share-linear"></iconify-icon></button>
            </div>
            <button><iconify-icon icon="solar:bookmark-linear"></iconify-icon></button>
          </div>

          <div className="post-info">
            <div className="likes-count">{item.likeCount.toLocaleString()} likes</div>
            <div className="caption">
              <span className="username">{item.creator.displayName}</span> {item.title}
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="tags">
                {item.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
              </div>
            )}
          </div>
        </article>
      ))}

      {isLoading && (
        <div className="fyp-loading">
          <iconify-icon icon="solar:spinner-bold" className="spin"></iconify-icon>
        </div>
      )}

      <style>{`
        .fyp-container {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding: 20px 0;
        }

        .fyp-post {
          background: #000;
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
          overflow: hidden;
        }

        .post-header {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: #222;
        }

        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; }

        .username { font-weight: 600; font-size: 14px; }

        .post-media {
          background: #050505;
          position: relative;
        }

        .locked-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: white;
        }

        .locked-overlay iconify-icon { font-size: 48px; color: var(--color-primary); }

        .post-actions {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .main-actions { display: flex; gap: 16px; }

        .post-actions button {
          background: transparent;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
        }

        .post-info {
          padding: 0 16px 16px;
        }

        .likes-count { font-weight: 700; font-size: 14px; margin-bottom: 8px; }
        .caption { font-size: 14px; line-height: 1.4; }
        .caption .username { margin-right: 8px; }

        .tags { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px; }
        .tag { color: var(--color-primary); font-size: 13px; font-weight: 500; }

        .fyp-loading { text-align: center; padding: 40px; font-size: 32px; color: var(--color-primary); }
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .fyp-container { padding: 0; gap: 0; }
          .fyp-post { border-radius: 0; border-left: none; border-right: none; }
        }
      `}</style>
    </div>
  );
};
