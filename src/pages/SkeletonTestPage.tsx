import React from 'react'
import { SkeletonDemo } from '../components/SkeletonDemo'

/**
 * Test page to demonstrate skeleton loading states
 * with zero CLS and shimmer animations
 */
export default function SkeletonTestPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Loading Skeletons Test Page
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Testing zero CLS loading states with smooth shimmer animations.
            All skeleton components use exact content dimensions to prevent layout shift.
          </p>
        </header>
        
        <SkeletonDemo />
        
        <footer className="mt-16 text-center text-gray-500">
          <p>Skeleton components with 60fps shimmer animation • CLS = 0.0</p>
        </footer>
      </div>
    </div>
  )
}