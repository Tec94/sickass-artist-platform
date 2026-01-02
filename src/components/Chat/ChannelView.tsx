import { useRef, useEffect, useState } from 'react'
import { useChannelMessages } from '../../hooks/useChannelMessages'
import { useTypingIndicators } from '../../hooks/useTypingIndicators'
import { MessageThread } from './MessageThread'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import type { Id } from '../../types/chat'

interface ChannelViewProps {
  channelId: Id<'channels'>
}

export function ChannelView({ channelId }: ChannelViewProps) {
  const { messages, isLoading, loadMore, hasMore } = useChannelMessages(channelId)
  const { typingUsers, isLoading: isTypingLoading } = useTypingIndicators(channelId)
  const [channelInfo, setChannelInfo] = useState<{ name: string; description: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // This would be replaced with actual channel data fetching
    const mockChannelData = {
      name: 'general',
      description: 'The main channel for general discussions and community interaction.'
    }
    setChannelInfo(mockChannelData)
  }, [channelId])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full w-full bg-[#313338]">
      {/* Header */}
      <header className="h-12 px-4 flex items-center gap-2 border-b border-[#1f2023] shadow-sm flex-shrink-0">
        <span className="text-2xl text-[#80848e] font-light translate-y-[-1px]">#</span>
        <h2 className="font-bold text-white text-[15px]">{channelInfo?.name}</h2>
        <div className="w-[1px] h-6 bg-[#3f4147] mx-2"></div>
        <p className="text-[#b5bac1] text-[13px] truncate">{channelInfo?.description}</p>
        
        <div className="flex items-center gap-4 ml-auto text-[#b5bac1]">
           <iconify-icon icon="solar:notification-lines-bold" className="hover:text-white cursor-pointer"></iconify-icon>
           <iconify-icon icon="solar:pin-bold" className="hover:text-white cursor-pointer"></iconify-icon>
           <iconify-icon icon="solar:users-group-rounded-bold" className="hover:text-white cursor-pointer"></iconify-icon>
           
           <div className="relative group">
             <input 
               type="text" 
               placeholder="Search" 
               className="bg-[#1e1f22] border-none rounded-[4px] px-2 py-0.5 text-[13px] w-36 focus:w-60 transition-all duration-200 focus:outline-none"
             />
             <iconify-icon icon="solar:magnifer-linear" className="absolute right-2 top-1/2 translate-y-[-50%] text-[14px]"></iconify-icon>
           </div>

           <iconify-icon icon="solar:help-bold" className="hover:text-white cursor-pointer"></iconify-icon>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col custom-scrollbar">
        {isLoading && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-[#b5bac1]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5865f2]"></div>
              <span className="text-sm font-medium">Syncing messages...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-end min-h-full">
            <div className="p-4 pb-2">
              <div className="w-16 h-16 rounded-full bg-[#404249] flex items-center justify-center mb-4">
                 <span className="text-white text-3xl font-light">#</span>
              </div>
              <h1 className="text-white text-3xl font-extrabold mb-1">Welcome to #{channelInfo?.name}!</h1>
              <p className="text-[#b5bac1]">This is the start of the #{channelInfo?.name} channel.</p>
              <div className="h-[1px] bg-[#3f4147] w-full my-6"></div>
            </div>
            
            <MessageThread
              messages={messages}
              optimisticMessages={[]}
              isLoading={isLoading}
              onLoadMore={loadMore}
              hasMore={hasMore}
            />
          </div>
        )}
        <div ref={messagesEndRef} className="h-4 flex-shrink-0" />
      </div>

      {/* Input Footer */}
      <footer className="px-4 pb-6 flex-shrink-0">
        {!isTypingLoading && typingUsers.length > 0 && (
          <div className="h-5 mb-1 px-1">
            <TypingIndicator typingUsers={typingUsers} />
          </div>
        )}
        <div className="bg-[#383a40] rounded-lg px-4 py-2.5 flex items-center gap-4">
          <button className="text-[#b5bac1] hover:text-white transition-colors"><iconify-icon icon="solar:add-circle-bold" style={{ fontSize: '24px' }}></iconify-icon></button>
          <div className="flex-1">
            <MessageInput channelId={channelId} />
          </div>
          <div className="flex items-center gap-3 text-[#b5bac1]">
             <button className="hover:text-white transition-colors"><iconify-icon icon="solar:gift-bold" style={{ fontSize: '22px' }}></iconify-icon></button>
             <button className="hover:text-white transition-colors"><iconify-icon icon="solar:smile-circle-bold" style={{ fontSize: '22px' }}></iconify-icon></button>
             <button className="hover:text-white transition-colors"><iconify-icon icon="solar:sticker-smiley-bold" style={{ fontSize: '22px' }}></iconify-icon></button>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e1f22; border-radius: 4px; border: 2px solid #313338; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #232428; }
        
        /* Overriding some default input styles to match Discord */
        .message-input-custom textarea {
          background: transparent !important;
          border: none !important;
          color: #dbdee1 !important;
          padding: 0 !important;
          resize: none !important;
        }
      `}</style>
    </div>
  )
}
