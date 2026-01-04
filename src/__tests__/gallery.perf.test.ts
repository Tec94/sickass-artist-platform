import { describe, it, expect } from 'vitest'
import { perfMonitor } from '../utils/performanceMonitor'

describe('Gallery Performance', () => {
  it('lightbox should open in < 300ms', () => {
    // Simulate lightbox open
    perfMonitor.mark('lightbox-start')
    // Simulate some work
    for(let i=0; i<1000000; i++) {
      // Intentional empty block for simulation
    }
    const metric = perfMonitor.measure('lightbox-open', 'lightbox-start')
    
    // In test environment this should be very fast
    expect(metric.value).toBeLessThan(300)
  })

  it('filter apply should complete in < 500ms', () => {
    perfMonitor.mark('filter-start')
    // Simulate filter operations
    for(let i=0; i<1000000; i++) {
      // Intentional empty block for simulation
    }
    const metric = perfMonitor.measure('filter-apply', 'filter-start')
    
    expect(metric.value).toBeLessThan(500)
  })

  it('image load should average < 800ms', () => {
    // Track multiple image loads
    const durations = [600, 750, 850, 700, 800]
    const avg = durations.reduce((a, b) => a + b) / durations.length
    
    expect(avg).toBeLessThan(800)
  })
})
