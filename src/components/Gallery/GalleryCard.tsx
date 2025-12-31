import React from 'react';
import { GalleryContentItem } from '../../types/gallery';

interface GalleryCardProps {
  item: GalleryContentItem;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({ item }) => {
  return (
    <div className={`gallery-card ${item.isLocked ? 'locked' : ''}`}>
      <div className="card-image-container">
        <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} className="card-image" />
        {item.isLocked && (
          <div className="lock-overlay">
            <span className="lock-icon">🔒</span>
            <span className="lock-text">{item.requiredFanTier?.toUpperCase()} ONLY</span>
          </div>
        )}
        <div className="card-type-badge">{item.type}</div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{item.title}</h3>
        <div className="card-meta">
          <span className="card-creator">@{item.creator.username}</span>
          <div className="card-stats">
            <span className="stat">❤️ {item.likeCount}</span>
            <span className="stat">👁️ {item.viewCount}</span>
          </div>
        </div>
      </div>

      <style>{`
        .gallery-card {
          background: rgba(28, 31, 46, 0.7);
          border: 1px solid rgba(139, 15, 255, 0.3);
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s ease, border-color 0.2s ease;
          cursor: pointer;
          position: relative;
        }

        .gallery-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-primary);
        }

        .card-image-container {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
          background: #000;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.3s ease;
        }

        .gallery-card.locked .card-image {
          opacity: 0.3;
          filter: blur(2px);
        }

        .lock-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.4);
          color: white;
        }

        .lock-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .lock-text {
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 1px;
          color: var(--color-gold);
        }

        .card-type-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0, 217, 255, 0.8);
          color: black;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .card-content {
          padding: 12px;
        }

        .card-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .card-creator {
          color: var(--color-primary);
        }

        .card-stats {
          display: flex;
          gap: 12px;
          color: #888;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </div>
  );
};
