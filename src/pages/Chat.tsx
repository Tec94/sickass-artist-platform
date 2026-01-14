import { useState, useEffect } from 'react'
import { useChannels } from '../hooks/useChannels'
import { useAuth } from '../hooks/useAuth'
import { ChannelList } from '../components/Chat/ChannelList'
import { ChannelView } from '../components/Chat/ChannelView'
import type { Id } from '../types/chat'

export function Chat() {
  const { user } = useAuth()
  const { channels, isLoading: isChannelsLoading } = useChannels()
  const [selectedChannelId, setSelectedChannelId] = useState<Id<'channels'> | null>(null)
  
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0]._id)
    }
  }, [channels, selectedChannelId])

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0a0a] text-[#e0e0e0]">
        <div className="text-center p-8 bg-[#111] rounded-lg shadow-xl border border-[#1a1a1a]">
          <iconify-icon icon="solar:lock-password-bold" style={{ fontSize: '48px', color: '#c41e3a' }}></iconify-icon>
          <h2 className="mt-4 text-xl font-bold">Access Restricted</h2>
          <p className="mt-2 opacity-70">Please sign in to access the secure chatroom</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] w-full bg-zinc-950 text-zinc-200 font-sans selection:bg-red-900/30 overflow-hidden">
      {/* Channel Sidebar */}
      <aside className="w-64 flex flex-col bg-zinc-950 overflow-hidden border-r border-zinc-800">
        <header className="h-16 px-4 flex items-center border-b border-zinc-800 shadow-sm cursor-pointer hover:bg-zinc-900 transition-colors">
          <h2 className="text-white font-bold font-display tracking-wide">ROA WOLVES Server</h2>
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
        <section className="p-3 bg-zinc-950/50 border-t border-zinc-800 flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0">
             {/* Use avatar if available */}
             <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold">
               {user.displayName?.[0] || 'U'}
             </div>
           </div>
           <div className="flex-1 min-w-0">
             <div className="text-white text-xs font-bold truncate">{user.displayName}</div>
             <div className="text-zinc-500 text-[10px]">Online</div>
           </div>
           <div className="flex gap-1 text-zinc-400">
             <button className="hover:text-white p-1"><iconify-icon icon="solar:microphone-bold" style={{ fontSize: '14px' }}></iconify-icon></button>
             <button className="hover:text-white p-1"><iconify-icon icon="solar:headphones-round-bold" style={{ fontSize: '14px' }}></iconify-icon></button>
             <button className="hover:text-white p-1"><iconify-icon icon="solar:settings-bold" style={{ fontSize: '14px' }}></iconify-icon></button>
           </div>
        </section>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-zinc-900 min-w-0">
        {selectedChannelId ? (
          <ChannelView channelId={selectedChannelId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
             <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4 text-zinc-600">
               <iconify-icon icon="solar:chat-round-line-bold" style={{ fontSize: '40px' }}></iconify-icon>
             </div>
             <h3 className="text-white text-lg font-bold mb-1">Welcome to ROA WOLVES</h3>
             <p className="max-w-xs text-sm">Select a channel from the sidebar to join the conversation.</p>
          </div>
        )}
      </main>
    </div>
  )
}
