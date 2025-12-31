import React from 'react';

export const GallerySkeleton = () => {
  return (
    <div className="gallery-skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-info">
        <div className="skeleton-line title" />
        <div className="skeleton-line meta" />
      </div>

      <style>{`
        .gallery-skeleton-card {
          background: rgba(28, 31, 46, 0.5);
          border: 1px solid rgba(139, 15, 255, 0.2);
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 16/10;
          display: flex;
          flex-direction: column;
        }

        .skeleton-image {
          flex: 1;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
        }

        .skeleton-info {
          padding: 12px;
          gap: 8px;
          display: flex;
          flex-direction: column;
        }

        .skeleton-line {
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .skeleton-line.title {
          width: 70%;
          height: 16px;
        }

        .skeleton-line.meta {
          width: 40%;
        }

        @keyframes skeleton-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};
