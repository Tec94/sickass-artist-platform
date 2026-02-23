import {
  DASHBOARD_VISUAL_VARIANTS,
  type DashboardVisualVariant,
} from './dashboardVisualVariants'

type DashboardDesignLabSwitcherProps = {
  visible: boolean
  variant: DashboardVisualVariant
  onSelect: (variant: DashboardVisualVariant) => void
}

export const DashboardDesignLabSwitcher = ({
  visible,
  variant,
  onSelect,
}: DashboardDesignLabSwitcherProps) => {
  if (!visible) {
    return null
  }

  return (
    <aside
      data-dashboard-design-lab-switcher="true"
      className="fixed bottom-4 right-4 z-[120] w-[min(92vw,360px)] rounded-2xl border border-[#334252] bg-[#09111a]/92 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      aria-label="Dashboard design review switcher"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-store uppercase tracking-[0.24em] text-[#8EA0B3]">
            Dashboard Design Lab
          </p>
          <p className="mt-1 text-xs text-[#A9B6C3]">
            Review three visual directions without changing data or routes.
          </p>
        </div>
        <span className="rounded-full border border-[#314151] bg-[#101a24] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4D0DB]">
          Temp
        </span>
      </div>

      <div className="space-y-2">
        {DASHBOARD_VISUAL_VARIANTS.map((option) => {
          const isActive = option.id === variant

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`group flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                isActive
                  ? 'border-[#A62B3A]/80 bg-[#A62B3A]/16 shadow-[0_8px_20px_rgba(166,43,58,0.24)]'
                  : 'border-[#2A3541] bg-[#0E1620]/70 hover:border-[#3A4959] hover:bg-[#131c27]'
              }`}
              aria-pressed={isActive}
            >
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                  isActive ? 'bg-[#D08C97]' : 'bg-[#556576] group-hover:bg-[#718399]'
                }`}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#E8E1D5]">{option.label}</span>
                  <span className="rounded-full border border-[#334252] px-2 py-0.5 text-[10px] font-store uppercase tracking-[0.12em] text-[#8EA0B3]">
                    {option.shortLabel}
                  </span>
                </span>
                <span className="mt-0.5 block text-[11px] leading-4 text-[#92A1B0]">
                  {option.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

