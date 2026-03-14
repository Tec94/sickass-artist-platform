import { useState, useEffect } from 'react'
import { useChannels } from '../hooks/useChannels'
import { useAuth } from '../hooks/useAuth'
import { ChannelList } from '../components/Chat/ChannelList'
import { ChannelView } from '../components/Chat/ChannelView'
import type { Id } from '../types/chat'
import { useTranslation } from '../hooks/useTranslation'
import { useTokenAuth } from '../components/ConvexAuthProvider'

export function Chat() {
  const { user } = useAuth()
  const { hasValidToken, isTokenLoading } = useTokenAuth()
  const shouldLoadChannels = Boolean(user && hasValidToken && !isTokenLoading)
  const { channels, isLoading: isChannelsLoading } = useChannels(shouldLoadChannels)
  const [selectedChannelId, setSelectedChannelId] = useState<Id<'channels'> | null>(null)
  const { t } = useTranslation()
  
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0]._id)
    }
  }, [channels, selectedChannelId])

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
        <div className="app-surface-card rounded-lg border p-8 text-center shadow-xl">
          <iconify-icon icon="solar:lock-password-bold" style={{ fontSize: '48px', color: 'var(--color-accent-brand-soft)' }}></iconify-icon>
          <h2 className="mt-4 text-xl font-bold">{t('chat.accessRestricted')}</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">{t('chat.signInToAccess')}</p>
        </div>
      </div>
    )
  }

  if (!isTokenLoading && !hasValidToken) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
        <div className="app-surface-card max-w-md rounded-lg border p-8 text-center shadow-xl">
          <iconify-icon icon="solar:shield-warning-linear" style={{ fontSize: '48px', color: 'var(--color-accent-brand-soft)' }}></iconify-icon>
          <h2 className="mt-4 text-xl font-bold">Session not ready</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Convex auth hasn&apos;t finished syncing. Refresh the page or sign out and back in.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-layout app-surface-page flex h-[calc(100vh-theme(spacing.16))] w-full overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-sans selection:bg-red-900/35">
      {/* Channel Sidebar */}
      <aside className="flex w-64 flex-col overflow-hidden border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-app)]">
        <header className="flex h-16 cursor-pointer items-center border-b border-[var(--color-border-subtle)] px-4 shadow-sm transition-colors hover:bg-[var(--color-bg-base)]">
          <h2 className="font-display font-bold tracking-wide text-[var(--color-text-primary)]">{t('chat.serverName')}</h2>
          {/* <iconify-icon icon="solar:alt-arrow-down-linear" className="ml-auto text-zinc-500"></iconify-icon> */}
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar py-3">
          <ChannelList
            channels={channels}
            selectedChannelId={selectedChannelId}
            onSelectChannel={(id) => setSelectedChannelId(id)}
            isLoading={isChannelsLoading}
          />
        </div>

        {/* User Profile Bar */}
        <section className="flex items-center gap-2 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-app)]/80 p-3">
           <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
             {/* Use avatar if available */}
             <div className="flex h-full w-full items-center justify-center bg-[var(--color-border-subtle)] text-xs font-bold text-[var(--color-text-tertiary)]">
               {user.displayName?.[0] || 'U'}
             </div>
           </div>
           <div className="flex-1 min-w-0">
             <div className="truncate text-xs font-bold text-[var(--color-text-primary)]">{user.displayName}</div>
             <div className="text-[10px] text-[var(--color-text-secondary)]">{t('common.online')}</div>
           </div>
           <div className="flex gap-1 text-[var(--color-text-tertiary)]">
             <button className="hover:text-white p-1"><iconify-icon icon="solar:microphone-bold" style={{ fontSize: '14px' }}></iconify-icon></button>
             <button className="hover:text-white p-1"><iconify-icon icon="solar:headphones-round-bold" style={{ fontSize: '14px' }}></iconify-icon></button>
             <button className="hover:text-white p-1"><iconify-icon icon="solar:settings-bold" style={{ fontSize: '14px' }}></iconify-icon></button>
           </div>
        </section>
      </aside>

      {/* Main Chat Area */}
      <main className="flex min-w-0 flex-1 flex-col bg-[var(--color-bg-surface)]">
        {selectedChannelId ? (
          <ChannelView channelId={selectedChannelId} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-[var(--color-text-secondary)]">
             <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]">
               <iconify-icon icon="solar:chat-round-line-bold" style={{ fontSize: '40px' }}></iconify-icon>
             </div>
             <h3 className="mb-1 text-lg font-bold text-[var(--color-text-primary)]">{t('chat.welcomeTitle')}</h3>
             <p className="max-w-xs text-sm">{t('chat.welcomeSubtitle')}</p>
          </div>
        )}
      </main>
    </div>
  )
}
