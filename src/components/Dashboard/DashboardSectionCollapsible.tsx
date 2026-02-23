import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { type ReactNode, useId } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

type DashboardSectionCollapseToggleProps = {
  expanded: boolean
  onToggle: () => void
  contentId: string
  sectionLabel: string
  className?: string
}

export const DashboardSectionCollapseToggle = ({
  expanded,
  onToggle,
  contentId,
  sectionLabel,
  className,
}: DashboardSectionCollapseToggleProps) => {
  const { t } = useTranslation()
  const actionLabel = expanded ? t('dashboard.sections.collapse') : t('dashboard.sections.expand')
  const classes = ['dashboard-section-collapse-toggle', className].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classes}
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={contentId}
      aria-label={`${actionLabel} ${sectionLabel}`}
      data-expanded={expanded ? 'true' : 'false'}
    >
      <span className="dashboard-section-collapse-toggle__label" aria-hidden="true">
        {actionLabel}
      </span>
      <span className="dashboard-section-collapse-toggle__icon" aria-hidden="true">
        <iconify-icon icon="solar:alt-arrow-down-linear" width="14" height="14"></iconify-icon>
      </span>
    </button>
  )
}

type DashboardCollapsibleBodyProps = {
  expanded: boolean
  id?: string
  children: ReactNode
  className?: string
}

export const DashboardCollapsibleBody = ({
  expanded,
  id,
  children,
  className,
}: DashboardCollapsibleBodyProps) => {
  const prefersReducedMotion = useReducedMotion()
  const fallbackId = useId()
  const resolvedId = id || `dashboard-collapsible-${fallbackId}`
  const classes = ['dashboard-collapsible__body', className].filter(Boolean).join(' ')

  return (
    <AnimatePresence initial={false}>
      {expanded ? (
        <motion.div
          key="expanded"
          id={resolvedId}
          className={classes}
          initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0.01 }
              : {
                  height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.18, ease: 'easeOut' },
                }
          }
        >
          <div className="dashboard-collapsible__body-inner">{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export type DashboardSectionCollapseControl = {
  expanded: boolean
  onToggle: () => void
  contentId: string
}
