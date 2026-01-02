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
      <div className="flex items-center justify-center h-full bg-[#313338] text-[#dbdee1]">
        <div className="text-center p-8 bg-[#2b2d31] rounded-lg shadow-xl border border-white/5">
          <iconify-icon icon="solar:lock-password-bold" style={{ fontSize: '48px', color: '#f23f42' }}></iconify-icon>
          <h2 className="mt-4 text-xl font-bold">Access Restricted</h2>
          <p className="mt-2 opacity-70">Please sign in to access the secure chatroom</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full bg-[#1e1f22] text-[#dbdee1] font-sans selection:bg-[#404249]">
      {/* App Sidebar (Discord-style server bar) */}
      <nav className="w-[72px] flex flex-col items-center py-3 gap-2 bg-[#1e1f22] overflow-y-auto no-scrollbar">
        <div className="w-[48px] h-[48px] bg-[#313338] rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center cursor-pointer group hover:bg-[#5865f2]">
          <iconify-icon icon="solar:home-2-bold" style={{ fontSize: '28px' }} className="group-hover:text-white"></iconify-icon>
        </div>
        <div className="w-8 h-[2px] bg-[#35363c] rounded-full my-1"></div>
        <div className="w-[48px] h-[48px] bg-[#5865f2] rounded-[16px] flex items-center justify-center cursor-pointer shadow-lg">
          <iconify-icon icon="solar:chat-round-dots-bold" style={{ fontSize: '28px', color: 'white' }}></iconify-icon>
        </div>
        <div className="w-[48px] h-[48px] bg-[#313338] rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center cursor-pointer group hover:bg-[#23a559]">
          <iconify-icon icon="solar:compass-bold" style={{ fontSize: '28px' }} className="group-hover:text-white"></iconify-icon>
        </div>
      </nav>

      {/* Channel Sidebar */}
      <aside className="w-60 flex flex-col bg-[#2b2d31] overflow-hidden">
        <header className="h-12 px-4 flex items-center border-b border-[#1f2023] shadow-sm cursor-pointer hover:bg-[#35373c] transition-colors">
          <h1 className="font-bold text-white truncate text-[15px]">THE HUB CHAT</h1>
          <iconify-icon icon="solar:alt-arrow-down-linear" className="ml-auto text-gray-400"></iconify-icon>
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
        <section className="h-[52px] px-2 bg-[#232428] flex items-center gap-2">
          <div className="relative group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-xs font-bold">
              {user.displayName?.[0] || 'U'}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#23a559] border-[3px] border-[#232428] rounded-full"></div>
          </div>
          <div className="flex-1 min-width-0 leading-[1.2]">
            <div className="text-white text-[13px] font-semibold truncate">{user.displayName}</div>
            <div className="text-[11px] text-[#b5bac1] truncate">Online</div>
          </div>
          <div className="flex items-center gap-0.5 text-[#b5bac1]">
            <button className="p-1.5 hover:bg-[#3f4147] rounded-md transition-colors"><iconify-icon icon="solar:microphone-bold" style={{ fontSize: '18px' }}></iconify-icon></button>
            <button className="p-1.5 hover:bg-[#3f4147] rounded-md transition-colors"><iconify-icon icon="solar:headphones-round-bold" style={{ fontSize: '18px' }}></iconify-icon></button>
            <button className="p-1.5 hover:bg-[#3f4147] rounded-md transition-colors"><iconify-icon icon="solar:settings-bold" style={{ fontSize: '18px' }}></iconify-icon></button>
          </div>
        </section>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-[#313338] min-w-0 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
        {selectedChannelId ? (
          <ChannelView channelId={selectedChannelId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#b5bac1] p-8 text-center">
             <div className="w-20 h-20 rounded-full bg-[#2b2d31] flex items-center justify-center mb-4">
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
