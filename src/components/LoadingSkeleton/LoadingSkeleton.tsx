import { memo } from 'react'
import { GallerySkeleton } from '../Skeletons/GallerySkeleton'
import { ForumSkeleton } from '../Skeletons/ForumSkeleton'
import { ProductSkeleton } from '../Skeletons/ProductSkeleton'
import { ChatSkeleton } from '../Skeletons/ChatSkeleton'

export type SkeletonType = 'gallery' | 'forum' | 'product' | 'chat'

interface LoadingSkeletonProps {
  type: SkeletonType
  count?: number
  className?: string
}

export const LoadingSkeleton = memo(function LoadingSkeleton({
  type,
  count = 1,
  className = ''
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-in fade-in duration-200'
  const combinedClasses = `${baseClasses} ${className}`.trim()

  switch (type) {
    case 'gallery':
      return (
        <div className={combinedClasses}>
          <GallerySkeleton count={count} />
        </div>
      )
    case 'forum':
      return (
        <div className={combinedClasses}>
          <ForumSkeleton count={count} />
        </div>
      )
    case 'product':
      return (
        <div className={combinedClasses}>
          <ProductSkeleton count={count} />
        </div>
      )
    case 'chat':
      return (
        <div className={combinedClasses}>
          <ChatSkeleton count={count} />
        </div>
      )
    default:
      return null
  }
})
