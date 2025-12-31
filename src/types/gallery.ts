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
