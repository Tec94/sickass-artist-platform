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
    <div className="flex bg-[#111A24] border border-[#2A3541] rounded-xl p-1 gap-1 w-full sm:w-auto">
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
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
              isActive
                ? 'bg-[#A62B3A] text-[#E8E1D5] shadow-[0_10px_20px_rgba(166,43,58,0.28)]'
                : 'text-[#9AA7B5] hover:text-[#E8E1D5] hover:bg-[#1A2531]'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
