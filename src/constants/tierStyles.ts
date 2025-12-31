import type { FanTier } from '../types'

export const tierStyles: Record<FanTier, string> = {
  bronze: 'bg-amber-600/20 text-amber-200 border-amber-600/30',
  silver: 'bg-gray-300/20 text-gray-100 border-gray-300/30',
  gold: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  platinum: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
}

export function formatTierLabel(tier: FanTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}
