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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Select first available channel by default
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0]._id)
    }
  }, [channels, selectedChannelId])

  const handleSelectChannel = (channelId: Id<'channels'>) => {
    setSelectedChannelId(channelId)
    setIsMobileSidebarOpen(false) // Close sidebar on mobile when selecting channel
  }

  if (!user) {
    return <div className="text-center py-8 text-gray-400">Please sign in to access chat</div>
  }

  return (
    <div className="flex h-full w-full bg-gray-900/80 backdrop-blur-sm rounded-lg overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      {selectedChannelId && (
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg border border-gray-700"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Channel List - Sidebar */}
      <div className={`${
        isMobileSidebarOpen ? 'block' : 'hidden'
      } md:block w-full md:w-80 bg-gray-800/90 border-r border-gray-700 overflow-y-auto`}>
        <ChannelList
          channels={channels}
          selectedChannelId={selectedChannelId}
          onSelectChannel={handleSelectChannel}
          isLoading={isChannelsLoading}
        />
      </div>

      {/* Channel View - Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {selectedChannelId ? (
          <ChannelView channelId={selectedChannelId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Select a channel to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}