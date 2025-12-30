import { useMemo } from 'react'
import type { Channel, Id } from '../../types/chat'

interface ChannelListProps {
  channels: Channel[]
  selectedChannelId: Id<'channels'> | null
  onSelectChannel: (channelId: Id<'channels'>) => void
  isLoading: boolean
}

export function ChannelList({ channels, selectedChannelId, onSelectChannel, isLoading }: ChannelListProps) {
  // Sort channels by creation date (newest first)
  const sortedChannels = useMemo(() => {
    return [...channels].sort((a, b) => b.createdAt - a.createdAt)
  }, [channels])

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <span className="ml-2 text-gray-400">Loading channels...</span>
        </div>
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-400">No channels available</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-bold text-lg">Channels</h2>
      </div>

      <div className="divide-y divide-gray-700">
        {sortedChannels.map((channel) => (
          <div
            key={channel._id}
            onClick={() => onSelectChannel(channel._id)}
            className={`${
              selectedChannelId === channel._id
                ? 'bg-cyan-600/20 border-l-2 border-cyan-500'
                : 'hover:bg-gray-700/50'
            } cursor-pointer p-4 flex flex-col gap-1 transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium"># {channel.name}</span>
                {channel.messageCount > 0 && (
                  <span className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full">
                    {channel.messageCount}
                  </span>
                )}
              </div>
            </div>

            {channel.description && (
              <p className="text-gray-400 text-sm line-clamp-1">
                {channel.description}
              </p>
            )}

            {/* Category badge */}
            <div className="flex gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${
                channel.category === 'general' ? 'bg-blue-600/30 text-blue-300' :
                channel.category === 'mod' ? 'bg-red-600/30 text-red-300' :
                channel.category === 'fan-only' ? 'bg-yellow-600/30 text-yellow-300' :
                'bg-purple-600/30 text-purple-300'
              }`}>
                {channel.category}
              </span>

              {channel.requiredRole && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-600/30 text-green-300">
                  {channel.requiredRole}
                </span>
              )}

              {channel.requiredFanTier && (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-600/30 text-amber-300">
                  {channel.requiredFanTier}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}