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
    <div className="flex h-full w-full bg-[#0a0a0a] text-[#e0e0e0] font-sans selection:bg-[#3d1818]/50">


      {/* Channel Sidebar */}
      <aside className="w-60 flex flex-col bg-[#0f0f0f] overflow-hidden border-r border-[#1a1a1a]">
        <header className="h-12 px-4 flex items-center border-b border-[#1a1a1a] shadow-sm cursor-pointer hover:bg-[#1a1a1a] transition-colors">
          <h1 className="font-bold text-white truncate text-[15px]">THE HUB CHAT</h1>
          <iconify-icon icon="solar:alt-arrow-down-linear" className="ml-auto text-[#808080]"></iconify-icon>
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
        <section className="h-[52px] px-2 bg-[#0a0a0a] flex items-center gap-2 border-t border-[#1a1a1a]">
          <div className="relative group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#8b0000] flex items-center justify-center text-white text-xs font-bold">
              {user.displayName?.[0] || 'U'}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-[3px] border-[#0a0a0a] rounded-full"></div>
          </div>
          <div className="flex-1 min-width-0 leading-[1.2]">
            <div className="text-white text-[13px] font-semibold truncate">{user.displayName}</div>
            <div className="text-[11px] text-[#808080] truncate">Online</div>
          </div>
          <div className="flex items-center gap-0.5 text-[#808080]">
            <button className="p-1.5 hover:bg-[#1a1a1a] rounded-md transition-colors"><iconify-icon icon="solar:microphone-bold" style={{ fontSize: '18px' }}></iconify-icon></button>
            <button className="p-1.5 hover:bg-[#1a1a1a] rounded-md transition-colors"><iconify-icon icon="solar:headphones-round-bold" style={{ fontSize: '18px' }}></iconify-icon></button>
            <button className="p-1.5 hover:bg-[#1a1a1a] rounded-md transition-colors"><iconify-icon icon="solar:settings-bold" style={{ fontSize: '18px' }}></iconify-icon></button>
          </div>
        </section>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-[#111] min-w-0">
        {selectedChannelId ? (
          <ChannelView channelId={selectedChannelId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#808080] p-8 text-center">
             <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4 text-[#8b0000]">
               <iconify-icon icon="solar:chat-round-line-bold" style={{ fontSize: '40px', opacity: 0.5 }}></iconify-icon>
             </div>
             <h3 className="text-white text-lg font-bold">Welcome to the Hub</h3>
             <p className="max-w-xs mt-1">Select a channel from the sidebar to join the conversation.</p>
          </div>
        )}
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
