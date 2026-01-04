import { useMemo } from 'react'
import type { Channel, Id } from '../../types/chat'

interface ChannelListProps {
  channels: Channel[]
  selectedChannelId: Id<'channels'> | null
  onSelectChannel: (channelId: Id<'channels'>) => void
  isLoading: boolean
}

export function ChannelList({ channels, selectedChannelId, onSelectChannel, isLoading }: ChannelListProps) {
  const sortedChannels = useMemo(() => {
    return [...channels].sort((a, b) => b.createdAt - a.createdAt)
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

  return (
    <div className="px-2 flex flex-col gap-1">
      <div className="px-2 py-1 flex items-center justify-between text-[12px] font-bold text-[#c41e3a] uppercase tracking-wider group">
        <span className="flex items-center gap-0.5">
           CHANNELS
        </span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white text-[#808080]">
           <iconify-icon icon="solar:add-circle-linear" style={{ fontSize: '16px' }}></iconify-icon>
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 mt-1">
        {sortedChannels.map((channel) => (
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
            <span className="flex-1 text-left truncate font-medium text-[14px]">
              {channel.name}
            </span>
            
            {channel.messageCount > 0 && selectedChannelId !== channel._id && (
              <span className="w-1.5 h-1.5 bg-[#c41e3a] rounded-full absolute left-[-4px] top-1/2 translate-y-[-50%]"></span>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
               <iconify-icon icon="solar:volume-loud-bold" style={{ fontSize: '14px' }} className="hover:text-white text-[#808080]"></iconify-icon>
            </div>
          </button>
        ))}
      </nav>
    </div>
  )
}
