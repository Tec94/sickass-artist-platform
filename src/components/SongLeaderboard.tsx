import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { List, type RowComponentProps } from 'react-window'
import { api } from '../../convex/_generated/api'
import { useTranslation } from '../hooks/useTranslation'
import type { LeaderboardPeriod } from '../utils/leaderboard'

interface SongLeaderboardProps {
  period: LeaderboardPeriod
  limit?: number
  height?: number
}

const ROW_HEIGHT = 96

export const SongLeaderboard = ({ period, limit: limitProp = 50, height }: SongLeaderboardProps) => {
  const { t } = useTranslation()
  const limit = Math.min(limitProp, 50)
  const leaderboard = useQuery(api.leaderboard.getLeaderboard, { period, limit })
  const [listHeight, setListHeight] = useState(height ?? 640)

  useEffect(() => {
    if (height) {
      setListHeight(height)
      return
    }

    const updateHeight = () => {
      const computed = Math.min(760, window.innerHeight - 240)
      setListHeight(Math.max(480, computed))
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [height])

  const periodLabel = useMemo(() => {
    switch (period) {
      case 'weekly':
        return t('events.thisWeek')
      case 'monthly':
        return t('events.thisMonth')
      case 'allTime':
        return t('ranking.allTimeLabel')
      case 'quarterly':
        return t('ranking.allTimeLabel')
      default:
        return t('ranking.allTimeLabel')
    }
  }, [period, t])

  if (leaderboard === undefined) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3 animate-pulse">
        <div className="h-6 bg-zinc-800 rounded w-48" />
        {[...Array(8)].map((_, index) => (
          <div key={index} className="h-20 bg-zinc-800/70 rounded-lg" />
        ))}
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center text-zinc-500">
        <iconify-icon icon="solar:music-library-2-bold-duotone" width="42" height="42"></iconify-icon>
        <div className="mt-3 font-bold text-zinc-300">{t('ranking.noRankingsYet')}</div>
        <div className="text-sm mt-1">{t('ranking.beFirstToSubmit')}</div>
      </div>
    )
  }

  type RowData = {
    entries: typeof leaderboard
    scoreLabel: string
  }

  const rowProps = useMemo<RowData>(
    () => ({
      entries: leaderboard,
      scoreLabel: t('ranking.score'),
    }),
    [leaderboard, t]
  )

  const Row = ({ index, style, entries, scoreLabel }: RowComponentProps<RowData>) => {
    const entry = entries[index]
    if (!entry) {
      return <div style={style} />
    }
    const rank = entry.rank
    const rankColor =
      rank === 1
        ? 'text-amber-400'
        : rank === 2
          ? 'text-zinc-200'
          : rank === 3
            ? 'text-orange-400'
            : 'text-zinc-600'

    return (
      <div style={style} className="px-4">
        <div className="flex items-center gap-4 h-full border-b border-zinc-800/70">
          <div className={`w-12 text-center font-display font-bold text-2xl ${rankColor}`}>#{rank}</div>
          <img src={entry.albumCover} alt={entry.songTitle} className="w-16 h-16 rounded object-cover shadow-lg" />
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg truncate">{entry.songTitle}</div>
            <div className="text-zinc-400 text-sm truncate">{entry.songArtist}</div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold font-mono">{entry.totalScore.toFixed(1)}</div>
            <div className="text-zinc-500 text-[11px] uppercase tracking-wider">{scoreLabel}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/70 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-zinc-500">Leaderboard</div>
          <div className="text-xl font-display font-bold text-white">{periodLabel}</div>
        </div>
        <div className="text-xs text-zinc-500">Updates hourly</div>
      </div>
      <List
        defaultHeight={listHeight}
        rowCount={leaderboard.length}
        rowHeight={ROW_HEIGHT}
        rowComponent={Row}
        rowProps={rowProps}
        overscanCount={6}
        style={{ height: listHeight }}
      />
    </div>
  )
}
