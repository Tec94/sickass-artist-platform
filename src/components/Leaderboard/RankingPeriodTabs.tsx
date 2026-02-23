import { useTranslation } from '../../hooks/useTranslation'
import type { LeaderboardPeriod } from '../../utils/leaderboard'
import type { DashboardVisualVariant } from '../Dashboard/dashboardVisualVariants'

interface RankingPeriodTabsProps {
  period: LeaderboardPeriod
  onChange: (period: LeaderboardPeriod) => void
  variant?: DashboardVisualVariant
}

export function RankingPeriodTabs({ period, onChange, variant = 'forum-ops' }: RankingPeriodTabsProps) {
  const { t } = useTranslation()
  const options: LeaderboardPeriod[] = ['weekly', 'monthly', 'allTime']
  const variantRootClass =
    variant === 'curated-shop'
      ? 'ranking-period-tabs--curated'
      : variant === 'ranking-nocturne'
        ? 'ranking-period-tabs--nocturne'
        : 'ranking-period-tabs--ops'

  return (
    <div
      className={`ranking-period-tabs flex bg-[#111A24] border border-[#2A3541] rounded-xl p-1 gap-1 w-full sm:w-auto ${variantRootClass}`}
      data-dashboard-variant={variant}
    >
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
            className={`ranking-period-tabs__button flex-1 sm:flex-none px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
              isActive
                ? 'ranking-period-tabs__button--active bg-[#A62B3A] text-[#E8E1D5] shadow-[0_10px_20px_rgba(166,43,58,0.28)]'
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
