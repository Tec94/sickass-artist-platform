import { useState } from 'react'
import { SongLeaderboard } from '../components/SongLeaderboard'
import { SongRankingWidget } from '../components/Leaderboard/SongRankingWidget'
import { UserRankingsFeed } from '../components/Leaderboard/UserRankingsFeed'
import { RankingPeriodTabs } from '../components/Leaderboard/RankingPeriodTabs'
import { useTranslation } from '../hooks/useTranslation'
import type { LeaderboardPeriod } from '../utils/leaderboard'

export const Ranking = () => {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly')

  return (
    <div className="app-surface-page px-4 sm:px-6 lg:px-8 py-12 lg:py-16 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-12">
        <section className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-10 items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-zinc-500 mb-4">Community Rankings</div>
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-white uppercase tracking-tight mb-4">
              {t('ranking.title')}
            </h1>
            <p className="text-zinc-400 max-w-2xl text-lg">{t('ranking.subtitle')}</p>

            <div className="mt-8">
              <RankingPeriodTabs period={period} onChange={setPeriod} />
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Cadence</div>
                <div className="text-white font-bold mt-1">Hourly updates</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Top Board</div>
                <div className="text-white font-bold mt-1">Live top 50</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Edits</div>
                <div className="text-white font-bold mt-1">Revise anytime</div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <SongRankingWidget period={period} />
          </div>
        </section>

        <section className="grid gap-10">
          <SongLeaderboard period={period} limit={50} />
        </section>

        <section className="pt-6 border-t border-zinc-800">
          <UserRankingsFeed period={period} />
        </section>
      </div>
    </div>
  )
}
