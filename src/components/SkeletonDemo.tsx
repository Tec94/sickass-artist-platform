// SkeletonDemo component - demonstrates loading skeleton patterns
import { LoadingSkeleton } from './LoadingSkeleton'

/**
 * Example component demonstrating loading skeleton usage
 * with timeout handling and zero CLS
 */
export function SkeletonDemo() {
  return (
    <div className="space-y-12 p-8">
      {/* Gallery Skeleton Demo */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Gallery Skeleton</h2>
        <LoadingSkeleton type="gallery" count={8} />
      </section>

      {/* Forum Skeleton Demo */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Forum Skeleton</h2>
        <LoadingSkeleton type="forum" count={5} />
      </section>

      {/* Product Skeleton Demo */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Product Skeleton</h2>
        <LoadingSkeleton type="product" count={12} />
      </section>

      {/* Chat Skeleton Demo */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Chat Skeleton</h2>
        <LoadingSkeleton type="chat" count={4} />
      </section>

      {/* Mixed Layout Demo */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Mixed Layout Demo</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Gallery Items</h3>
            <LoadingSkeleton type="gallery" count={6} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Recent Threads</h3>
            <LoadingSkeleton type="forum" count={4} />
          </div>
        </div>
      </section>

      {/* Responsive Demo */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Responsive Behavior</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Desktop (4 columns)</h3>
            <LoadingSkeleton type="gallery" count={4} />
          </div>
          <div className="md:hidden">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Mobile (2 columns)</h3>
            <LoadingSkeleton type="gallery" count={4} />
          </div>
        </div>
      </section>
    </div>
  )
}