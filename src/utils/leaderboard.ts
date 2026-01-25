export type LeaderboardPeriod = 'weekly' | 'monthly' | 'quarterly' | 'allTime'
export type SubmissionType = 'top3' | 'top5' | 'top10' | 'top15' | 'top25'

const DAY_MS = 24 * 60 * 60 * 1000

export function getCurrentLeaderboardId(period: LeaderboardPeriod): string {
  const now = new Date()

  if (period === 'allTime') {
    return 'all-time'
  }

  if (period === 'weekly') {
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / DAY_MS)
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
    return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`
  }

  if (period === 'monthly') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  const quarter = Math.floor(now.getMonth() / 3) + 1
  return `${now.getFullYear()}-Q${quarter}`
}

export function getSubmissionLimit(submissionType: SubmissionType): number {
  const limits: Record<SubmissionType, number> = {
    top3: 3,
    top5: 5,
    top10: 10,
    top15: 15,
    top25: 25,
  }
  return limits[submissionType]
}

export function withSequentialRanks<T extends { rank: number }>(songs: T[]): T[] {
  return songs.map((song, index) => ({ ...song, rank: index + 1 }))
}
