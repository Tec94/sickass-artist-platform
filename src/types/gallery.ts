import { Id } from '../../convex/_generated/dataModel';

export type FanTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface GalleryContentItem {
  contentId: string;
  type: 'show' | 'bts' | 'edit' | 'wip' | 'exclusive';
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  creatorId: Id<'users'>;
  requiredFanTier?: FanTier;
  tags: string[];
  likeCount: number;
  viewCount: number;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  creator: {
    _id: Id<'users'>;
    displayName: string;
    avatar: string;
    username: string;
    fanTier: FanTier;
  };
  isLiked: boolean;
  isLocked: boolean;
}

export interface GalleryFilters {
  types: ('show' | 'bts' | 'edit' | 'wip' | 'exclusive')[]
  dateRange: '7d' | '30d' | '90d' | 'all'
  creatorId: string | null
  fanTier: 'all' | 'bronze' | 'silver' | 'gold' | 'platinum'
  tags: string[]
  sortBy: 'newest' | 'oldest' | 'mostLiked' | 'mostViewed' | 'trending'
  page: number
}

export interface FilterState extends GalleryFilters {
  isActive: boolean
  appliedCount: number
  resultsCount: number
  isLoading: boolean
  error: Error | null
}
