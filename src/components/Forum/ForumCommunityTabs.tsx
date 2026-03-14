import { useTranslation } from '../../hooks/useTranslation'

type ForumCommunityTab = 'community' | 'profile' | 'answers'

interface ForumCommunityTabsProps {
  activeTab: ForumCommunityTab
  onChange: (tab: ForumCommunityTab) => void
}

const TAB_KEYS: ForumCommunityTab[] = ['community', 'profile', 'answers']

export function ForumCommunityTabs({ activeTab, onChange }: ForumCommunityTabsProps) {
  const { t } = useTranslation()

  const labels: Record<ForumCommunityTab, string> = {
    community: t('forum.communityTab'),
    profile: t('forum.profileTab'),
    answers: t('forum.answersTab'),
  }

  return (
    <div className="inline-flex rounded-xl border border-slate-700/70 bg-slate-950/70 p-1">
      {TAB_KEYS.map((tab) => {
        const isActive = tab === activeTab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
              isActive
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
            }`}
          >
            {labels[tab]}
          </button>
        )
      })}
    </div>
  )
}
