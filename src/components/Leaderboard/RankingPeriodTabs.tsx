import { useTranslation } from '../../hooks/useTranslation'
import type { LeaderboardPeriod } from '../../utils/leaderboard'

interface RankingPeriodTabsProps {
  period: LeaderboardPeriod
  onChange: (period: LeaderboardPeriod) => void
}

export function RankingPeriodTabs({ period, onChange }: RankingPeriodTabsProps) {
  const { t } = useTranslation()
  const options: LeaderboardPeriod[] = ['weekly', 'monthly', 'allTime']

  return (
    <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1 w-full sm:w-auto">
      {options.map((option) => {
        const isActive = option === period
        const label =
          option === 'allTime'
            ? t('ranking.allTime')
            : option === 'weekly'
              ? t('events.thisWeek')
              : t('events.thisMonth')

        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
              isActive
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
