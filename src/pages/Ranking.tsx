import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { SongRankingWidget } from '../components/Leaderboard/SongRankingWidget'
import { UserRankingsFeed } from '../components/Leaderboard/UserRankingsFeed'
import { RankingPeriodTabs } from '../components/Leaderboard/RankingPeriodTabs'
import { useTranslation } from '../hooks/useTranslation'
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import type { SongDetailPanelData, SongTrendPoint } from '../types/ranking'
import type { LeaderboardPeriod } from '../utils/leaderboard'

const buildFallbackTrend = (detail: SongDetailPanelData | null, period: LeaderboardPeriod): SongTrendPoint[] => {
  const now = Date.now()
  const base = detail?.totalScore ?? 0
  const step = period === 'weekly' ? 6 : period === 'monthly' ? 12 : 18

  return Array.from({ length: 8 }).map((_, index) => {
    const variance = Math.max(0, base - step * (7 - index))
    return {
      leaderboardId: `${period}-fallback-${index}`,
      period,
      timestamp: now - (7 - index) * 12 * 60 * 60 * 1000,
      totalScore: Number((variance + index * 0.9).toFixed(1)),
      rank: detail?.rank ?? null,
      uniqueVoters: detail?.uniqueVoters ?? 0,
    }
  })
}

const Sparkline = ({ points }: { points: SongTrendPoint[] }) => {
  if (!points.length) return null

  const values = points.map((point) => point.totalScore)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100
      const y = 100 - ((point.totalScore - min) / range) * 100
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 100" className="h-24 w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="rankingTrendStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-state-info)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--color-state-success)" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path d={`${path} L 100 100 L 0 100 Z`} fill="url(#rankingTrendStroke)" opacity="0.14" />
      <path d={path} fill="none" stroke="url(#rankingTrendStroke)" strokeWidth="3" strokeLinecap="round" />
      {points.map((point, index) => {
        const x = (index / Math.max(points.length - 1, 1)) * 100
        const y = 100 - ((point.totalScore - min) / range) * 100
        return (
          <circle
            key={point.leaderboardId}
            cx={x}
            cy={y}
            r={1.7}
            fill="var(--color-text-primary)"
            opacity={index === points.length - 1 ? 1 : 0.45}
          />
        )
      })}
    </svg>
  )
}

const formatDuration = (durationMs?: number | null) => {
  if (!durationMs || durationMs <= 0) return null
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export const Ranking = () => {
  const { t } = useTranslation()
  const { prefersReducedMotion, motionClassName } = useReducedMotionPreference()

  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly')
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)

  const board = useQuery(api.leaderboard.getLeaderboard, { period, limit: 50 })

  useEffect(() => {
    if (!board || board.length === 0) {
      setSelectedTrackId(null)
      return
    }

    if (!selectedTrackId || !board.some((entry) => entry.spotifyTrackId === selectedTrackId)) {
      setSelectedTrackId(board[0].spotifyTrackId)
    }
  }, [board, selectedTrackId])

  const detailRaw = useQuery(
    api.leaderboard.getSongDetailPanelData,
    selectedTrackId ? { spotifyTrackId: selectedTrackId, period } : 'skip',
  )
  const detail = (detailRaw ?? null) as SongDetailPanelData | null

  const historyRaw = useQuery(
    api.leaderboard.getSongHistory,
    selectedTrackId ? { spotifyTrackId: selectedTrackId, period, points: 14 } : 'skip',
  )
  const trackPreviewRaw = useQuery(
    api.spotify.getTrackPreview,
    selectedTrackId ? { spotifyTrackId: selectedTrackId } : 'skip',
  )
  const trackPreview = trackPreviewRaw ?? null

  const trendPoints = useMemo(() => {
    const rows = (historyRaw ?? []) as SongTrendPoint[]
    if (rows.length > 0) return rows
    return buildFallbackTrend(detail, period)
  }, [detail, historyRaw, period])

  const selectedRow = useMemo(() => {
    if (!board || !selectedTrackId) return null
    return board.find((entry) => entry.spotifyTrackId === selectedTrackId) ?? null
  }, [board, selectedTrackId])

  const summaryLine = useMemo(() => {
    if (!detail) return t('ranking.detailSummaryFallback')

    const avgRank = detail.averageRank ? detail.averageRank.toFixed(1) : '--'
    return t('ranking.detailSummaryTemplate')
      .replace('{mentions}', String(detail.totalMentions))
      .replace('{avgRank}', String(avgRank))
      .replace('{top3}', String(detail.top3Mentions))
  }, [detail, t])

  return (
    <div className={`app-surface-page mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 ${motionClassName}`}>
      <div className="ranking-surface-shell motion-panel-enter p-4 sm:p-6">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Nocturne Board</p>
            <h1 className="mt-2 text-3xl font-display font-semibold text-slate-100 lg:text-5xl">{t('ranking.title')}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 lg:text-base">{t('ranking.songFirstSubtitle')}</p>
          </div>

          <RankingPeriodTabs period={period} onChange={setPeriod} variant="ranking-nocturne" />
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 space-y-3">
            <div className="grid grid-cols-[72px_minmax(0,1fr)_120px_84px] items-center rounded-xl border border-slate-700/80 bg-black/90 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span>{t('ranking.rankLabel')}</span>
              <span>{t('ranking.songLabel')}</span>
              <span className="text-right">{t('ranking.score')}</span>
              <span className="text-right">{t('ranking.votesLabel')}</span>
            </div>

            {!board ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="ranking-surface-row h-20 animate-pulse bg-slate-900/70" />
                ))}
              </div>
            ) : board.length === 0 ? (
              <div className="ranking-surface-row p-8 text-center text-slate-400">{t('ranking.noRankingsYet')}</div>
            ) : (
              <div className="space-y-2">
                {board.map((entry, index) => {
                  const isSelected = entry.spotifyTrackId === selectedTrackId
                  return (
                    <button
                      key={entry.spotifyTrackId}
                      type="button"
                      onClick={() => setSelectedTrackId(entry.spotifyTrackId)}
                      className={`ranking-surface-row motion-hover-lift w-full px-3 py-3 text-left transition ${
                        isSelected
                          ? 'border-blue-400/60 bg-blue-500/10 shadow-[0_0_0_1px_rgba(96,165,250,0.32)]'
                          : `hover:border-slate-500 ${entry.rank <= 3 ? 'ranking-row-highlight' : ''}`
                      }`}
                      style={
                        prefersReducedMotion
                          ? undefined
                          : { animation: 'card-reveal 280ms cubic-bezier(0.2,0.8,0.2,1) both', animationDelay: `${Math.min(index * 20, 140)}ms` }
                      }
                    >
                      <div className="grid grid-cols-[72px_minmax(0,1fr)_120px_84px] items-center gap-3">
                        <div className={`text-2xl font-display font-semibold leading-none ${entry.rank <= 3 ? 'text-amber-200' : 'text-slate-300'}`}>
                          #{entry.rank}
                        </div>
                        <div className="flex min-w-0 items-center gap-3">
                          <img src={entry.albumCover} alt={entry.songTitle} className="h-12 w-12 rounded-md border border-slate-700 object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-100">{entry.songTitle}</p>
                            <p className="truncate text-xs text-slate-400">{entry.songArtist}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm font-semibold text-emerald-200">{entry.totalScore.toFixed(2)} / 10</div>
                        <div className="text-right text-xs font-semibold text-slate-300">{entry.uniqueVoters}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="ranking-surface-row p-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('ranking.artistRankingComing')}</h2>
              <p className="mt-2 text-sm text-slate-400">{t('ranking.artistRankingComingDescription')}</p>
            </div>

            <UserRankingsFeed period={period} variant="ranking-nocturne" />
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="ranking-surface-row overflow-hidden p-4">
              {selectedRow ? (
                <>
                  <div className="relative mb-4 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/70">
                    <img src={selectedRow.albumCover} alt={selectedRow.songTitle} className="h-56 w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-300">{selectedRow.songArtist}</p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-100">{selectedRow.songTitle}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-slate-700/70 bg-slate-950/70 p-3">
                      <p className="uppercase tracking-[0.16em] text-slate-400">{t('ranking.rankLabel')}</p>
                      <p className="mt-1 text-lg font-semibold text-slate-100">#{detail?.rank ?? selectedRow.rank}</p>
                    </div>
                    <div className="rounded-lg border border-slate-700/70 bg-slate-950/70 p-3">
                      <p className="uppercase tracking-[0.16em] text-slate-400">{t('ranking.score')}</p>
                      <p className="mt-1 text-lg font-semibold text-emerald-200">{(detail?.totalScore ?? selectedRow.totalScore).toFixed(1)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-700/70 bg-slate-950/70 p-3">
                      <p className="uppercase tracking-[0.16em] text-slate-400">{t('ranking.mentionsLabel')}</p>
                      <p className="mt-1 text-lg font-semibold text-slate-100">{detail?.totalMentions ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-700/70 bg-slate-950/70 p-3">
                      <p className="uppercase tracking-[0.16em] text-slate-400">{t('ranking.top3MentionsLabel')}</p>
                      <p className="mt-1 text-lg font-semibold text-slate-100">{detail?.top3Mentions ?? 0}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-400">{summaryLine}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-950/80 p-3 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-600/70 bg-slate-900/70 px-3 py-1">
                      <iconify-icon icon="solar:clock-circle-linear"></iconify-icon>
                      {formatDuration(trackPreview?.duration) || t('ranking.durationUnknown')}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-600/70 bg-slate-900/70 px-3 py-1">
                      <iconify-icon icon="solar:music-note-4-linear"></iconify-icon>
                      {t('ranking.metadataLive')}
                    </span>
                  </div>

                  <div className="mt-4 rounded-lg border border-slate-700/70 bg-slate-950/80 p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t('ranking.trendLabel')}</p>
                    <Sparkline points={trendPoints} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={trackPreview?.previewUrl || trackPreview?.externalUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!trackPreview?.previewUrl && !trackPreview?.externalUrl}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                        trackPreview?.previewUrl || trackPreview?.externalUrl
                          ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
                          : 'pointer-events-none border-slate-700 bg-slate-900/70 text-slate-400'
                      }`}
                    >
                      <iconify-icon icon="solar:play-circle-linear"></iconify-icon>
                      {t('ranking.listenNow')}
                    </a>
                    {trackPreview?.externalUrl ? (
                      <a
                        href={trackPreview.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-slate-400"
                      >
                        <iconify-icon icon="solar:link-linear"></iconify-icon>
                        {t('ranking.openSource')}
                      </a>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">{t('ranking.selectSongPrompt')}</p>
              )}
            </section>

            <SongRankingWidget period={period} variant="ranking-nocturne" />
          </aside>
        </div>
      </div>
    </div>
  )
}
