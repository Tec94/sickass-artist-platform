import { Link } from 'react-router-dom'
import { StoreSectionNav, type StoreSectionNavId } from './StoreSectionNav'

interface StoreRailAction {
  label: string
  to?: string
  onClick?: () => void
  icon?: string
  variant?: 'pill' | 'link'
  ariaLabel?: string
}

interface StoreTopRailProps {
  activeId: StoreSectionNavId
  actions?: StoreRailAction[]
  className?: string
}

export function StoreTopRail({ activeId, actions = [], className }: StoreTopRailProps) {
  return (
    <div className={['store-v2-top-rail', className].filter(Boolean).join(' ')}>
      <StoreSectionNav activeId={activeId} className="w-full xl:w-auto" />
      {actions.length > 0 ? (
        <div className="store-v2-rail-actions">
          {actions.map((action) => {
            const className = action.variant === 'pill' ? 'store-v2-scene-pill' : 'store-v2-shell-link'
            const content = (
              <>
                {action.icon ? <iconify-icon icon={action.icon} width="16" height="16" /> : null}
                {action.label}
              </>
            )

            if (action.to) {
              return (
                <Link
                  key={`${action.variant ?? 'link'}-${action.label}`}
                  to={action.to}
                  aria-label={action.ariaLabel}
                  className={className}
                >
                  {content}
                </Link>
              )
            }

            return (
              <button
                key={`${action.variant ?? 'link'}-${action.label}`}
                type="button"
                onClick={action.onClick}
                aria-label={action.ariaLabel}
                className={className}
              >
                {content}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
