import { Id } from '../../convex/_generated/dataModel';

export type UGCCategory = 'user-edit' | 'fan-art' | 'repost';

export interface UGCItem {
  _id: Id<'ugcContent'>;
  ugcId: string;
  creatorId: Id<'users'>;
  creatorDisplayName: string;
  creatorAvatar: string;
  creatorTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  title: string;
  description: string;
  imageUrls: string[];
  likeCount: number;
  viewCount: number;
  downloadCount: number;
  category: UGCCategory;
  tags: string[];
  isApproved: boolean;
  createdAt: number;
  updatedAt: number;
  isLiked: boolean;
}