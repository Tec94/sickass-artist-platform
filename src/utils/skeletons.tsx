import { memo } from 'react'

export interface SkeletonProps {
  className?: string
}

// Base shimmer animation styles
export const shimmerAnimation = 'animate-pulse bg-gray-800'

// Event Card Skeleton (for grid/list view)
export const EventCardSkeleton = memo(({ className = '' }: SkeletonProps) => {
  return (
    <div className={`${shimmerAnimation} rounded-lg overflow-hidden ${className}`}>
      <div className="aspect-video bg-gray-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-700 rounded w-16" />
        <div className="h-5 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
        <div className="h-3 bg-gray-700 rounded w-5/6" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 bg-gray-700 rounded w-20" />
          <div className="h-3 bg-gray-700 rounded w-16" />
        </div>
      </div>
    </div>
  )
})

EventCardSkeleton.displayName = 'EventCardSkeleton'

// Event Detail Skeleton
export const EventDetailSkeleton = memo(({ className = '' }: SkeletonProps) => {
  return (
    <div className={`${className}`}>
      <div className={`${shimmerAnimation} aspect-video mb-6 rounded-lg`}>
        <div className="w-full h-full bg-gray-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-3">
            <div className="h-8 bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
          </div>

          <div className="space-y-4">
            <div className="h-32 bg-gray-800 rounded-lg" />
            <div className="h-24 bg-gray-800 rounded-lg" />
          </div>

          <div className="space-y-3">
            <div className="h-6 bg-gray-800 rounded w-1/4" />
            <div className="h-20 bg-gray-800 rounded-lg" />
            <div className="h-20 bg-gray-800 rounded-lg" />
            <div className="h-20 bg-gray-800 rounded-lg" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-24 bg-gray-800 rounded-lg" />
          <div className="h-32 bg-gray-800 rounded-lg" />
        </div>
      </div>
    </div>
  )
})

EventDetailSkeleton.displayName = 'EventDetailSkeleton'

// Event Filters Skeleton
export const EventFiltersSkeleton = memo(({ className = '' }: SkeletonProps) => {
  return (
    <div className={`${shimmerAnimation} rounded-lg p-4 space-y-4 ${className}`}>
      <div className="h-4 bg-gray-800 rounded w-1/3" />
      <div className="space-y-3">
        <div className="h-10 bg-gray-800 rounded" />
        <div className="h-10 bg-gray-800 rounded" />
        <div className="h-10 bg-gray-800 rounded" />
        <div className="h-10 bg-gray-800 rounded" />
      </div>
    </div>
  )
})

EventFiltersSkeleton.displayName = 'EventFiltersSkeleton'

// Queue Countdown Spinner
export const QueueSpinner = memo(({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-gray-700 border-t-red-500 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
})

QueueSpinner.displayName = 'QueueSpinner'

// Purchase Loading State
export const PurchaseLoadingState = memo(() => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 text-center">
        <QueueSpinner size="lg" className="mb-4" />
        <p className="text-white">Processing your purchase...</p>
        <p className="text-sm text-gray-400 mt-2">Please don\'t close this tab</p>
      </div>
    </div>
  )
})

PurchaseLoadingState.displayName = 'PurchaseLoadingState'