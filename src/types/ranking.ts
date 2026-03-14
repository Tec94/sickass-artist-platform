export interface SongDetailPanelData {
  spotifyTrackId: string
  period: 'weekly' | 'monthly' | 'quarterly' | 'allTime'
  leaderboardId: string
  rank: number | null
  totalScore: number | null
  uniqueVoters: number
  songTitle: string
  songArtist: string
  albumCover: string
  totalMentions: number
  top3Mentions: number
  averageRank: number | null
  recentMentions: number
  totalSubmissionUpvotes: number
  contributors: number
  aheadTrack: {
    spotifyTrackId: string
    songTitle: string
    rank: number
    totalScore: number
  } | null
  behindTrack: {
    spotifyTrackId: string
    songTitle: string
    rank: number
    totalScore: number
  } | null
  updatedAt: number
}

export interface SongTrendPoint {
  leaderboardId: string
  period: 'weekly' | 'monthly' | 'quarterly' | 'allTime' | 'yearly'
  timestamp: number
  totalScore: number
  rank: number | null
  uniqueVoters: number
}
