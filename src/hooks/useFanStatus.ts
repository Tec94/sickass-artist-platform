import { useAuth } from './useAuth'
import { FanTier } from '../types'

export function useFanStatus() {
  const { user } = useAuth()
  
  const tierHierarchy: Record<FanTier, number> = {
    bronze: 1,
    silver: 2,
    gold: 3,
    platinum: 4,
  }
  
  const hasTier = (tier: FanTier | FanTier[]) => {
    if (!user) return false
    const tiers = Array.isArray(tier) ? tier : [tier]
    const userTierLevel = tierHierarchy[user.fanTier as FanTier]
    return tiers.some(t => tierHierarchy[t] <= userTierLevel)
  }
  
  const isBronze = () => user?.fanTier === 'bronze'
  const isSilver = () => hasTier('silver')
  const isGold = () => hasTier('gold')
  const isPlatinum = () => hasTier('platinum')
  
  return {
    tier: user?.fanTier,
    xp: user?.xp || 0,
    level: user?.level || 1,
    hasTier,
    isBronze,
    isSilver,
    isGold,
    isPlatinum,
  }
}
