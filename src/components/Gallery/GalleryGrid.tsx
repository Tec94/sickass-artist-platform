import React from 'react';
import { GalleryCard } from './GalleryCard';
import { GallerySkeleton } from './GallerySkeleton';
import { GalleryContentItem } from '../../types/gallery';

interface GalleryGridProps {
  items?: GalleryContentItem[];
  isLoading: boolean;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ items, isLoading }) => {
  if (isLoading && (!items || items.length === 0)) {
    return (
      <div className="gallery-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <GallerySkeleton key={i} />
        ))}
        <style>{gridStyles}</style>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="gallery-empty">
        <p>No content found.</p>
        <style>{`
          .gallery-empty {
            text-align: center;
            padding: 48px;
            background: rgba(28, 31, 46, 0.5);
            border: 1px dashed rgba(139, 15, 255, 0.3);
            border-radius: 8px;
            color: #888;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="gallery-grid">
      {items.map((item) => (
        <GalleryCard key={item.contentId} item={item} />
      ))}
      {isLoading && Array.from({ length: 4 }).map((_, i) => (
        <GallerySkeleton key={`loading-${i}`} />
      ))}
      <style>{gridStyles}</style>
    </div>
  );
};

const gridStyles = `
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 20px;
    width: 100%;
  }

  @media (min-width: 640px) {
    .gallery-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .gallery-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 1280px) {
    .gallery-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
`;
