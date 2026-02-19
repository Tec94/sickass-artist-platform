import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '../../hooks/useAuth'
import type { Channel, Id } from '../../types/chat'

interface ChannelListProps {
  channels: Channel[]
  selectedChannelId: Id<'channels'> | null
  onSelectChannel: (channelId: Id<'channels'>) => void
  isLoading: boolean
}

export function ChannelList({ channels, selectedChannelId, onSelectChannel, isLoading }: ChannelListProps) {
  const { user } = useAuth()
  const allSettings = useQuery(api.userSettings.getAllChannelSettings, user ? { userId: user._id as any } : 'skip')

  const muteMap = useMemo(() => {
    const map = new Map<string, boolean>()
    allSettings?.forEach(s => {
      if (s.muted) map.set(s.channelId, true)
    })
    return map
  }, [allSettings])

  const groupedChannels = useMemo(() => {
    const groups = {
      announcements: [] as Channel[],
      general: [] as Channel[],
      'fan-only': [] as Channel[],
      mod: [] as Channel[],
    }

    channels.forEach(channel => {
      const category = channel.category || 'general'
      if (groups[category]) {
        groups[category].push(channel)
      } else {
        groups['general'].push(channel) // Fallback
      }
    })

    // Sort within groups
    Object.keys(groups).forEach(key => {
       groups[key as keyof typeof groups].sort((a, b) => b.createdAt - a.createdAt)
    })

    return groups
  }, [channels])

  if (isLoading) {
    return (
      <div className="px-3 flex flex-col gap-1.5 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 bg-[#1a1a1a] rounded-md w-full"></div>
        ))}
      </div>
    )
  }

  const renderChannelGroup = (title: string, groupChannels: Channel[]) => {
    if (groupChannels.length === 0) return null
    return (
      <div className="mb-4">
        <div className="px-2 py-1 mb-1 flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-widest group">
          <span>{title}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {groupChannels.map(channel => {
             const isMuted = muteMap.get(channel._id)
             return (
              <button
                key={channel._id}
                onClick={() => onSelectChannel(channel._id)}
                className={`group relative flex items-center px-2 py-1.5 rounded-md transition-all duration-100 ${
                  selectedChannelId === channel._id
                    ? 'bg-[#2a1515] text-white border-l-2 border-[#c41e3a]'
                    : 'text-[#808080] hover:bg-[#1a1a1a] hover:text-[#e0e0e0]'
                }`}
              >
                <span className="text-lg mr-1.5 opacity-60 font-light">#</span>
                <span className={`flex-1 text-left truncate font-medium text-[14px] ${isMuted ? 'opacity-40' : ''}`}>
                  {channel.name}
                </span>
                
                {channel.messageCount > 0 && selectedChannelId !== channel._id && !isMuted && (
                  <span className="w-1.5 h-1.5 bg-[#c41e3a] rounded-full absolute left-[-4px] top-1/2 translate-y-[-50%]"></span>
                )}
  
                <div className="flex items-center gap-1 opacity-100 transition-opacity ml-1">
                   {isMuted && (
                     <iconify-icon icon="solar:volume-cross-bold" style={{ fontSize: '14px' }} className="text-[#c41e3a] opacity-60"></iconify-icon>
                   )}
                </div>
              </button>
             )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="px-2 flex flex-col pt-2">
      {renderChannelGroup('Announcements', groupedChannels.announcements)}
      {renderChannelGroup('General', groupedChannels.general)}
      {renderChannelGroup('The Warehouse', groupedChannels['fan-only'])}
      {renderChannelGroup('Moderation', groupedChannels.mod)}
    </div>
  )
}
