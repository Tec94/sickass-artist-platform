import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { useChannelMessages } from '../../hooks/useChannelMessages'
import { useTypingIndicators } from '../../hooks/useTypingIndicators'
import { useOptimisticMessage } from '../../hooks/useOptimisticMessage'
import { MessageThread } from './MessageThread'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { ChatSettingsModal } from './ChatSettingsModal'
import { useAuth } from '../../hooks/useAuth'
import { showToast } from '../../lib/toast'
import type { ChatMessage, ChatSticker, OptimisticMessage } from '../../types/chat'

interface ChannelViewProps {
  channelId: Id<'channels'>
}

type UserSettingsView = {
  autoplayMedia: boolean
  showStickers: boolean
  compactMode: boolean
}

const DEFAULT_USER_SETTINGS: UserSettingsView = {
  autoplayMedia: true,
  showStickers: true,
  compactMode: false,
}

export function ChannelView({ channelId }: ChannelViewProps) {
  const { user } = useAuth()
  const { messages, isLoading, isLoadingMore, loadMore, hasMore } = useChannelMessages(channelId)
  const { typingUsers, isLoading: isTypingLoading } = useTypingIndicators(channelId)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const channelDetail = useQuery(api.chat.getChannelDetail, { channelId })
  const channelSettings = useQuery(
    api.userSettings.getChannelSettings,
    user ? { channelId, userId: user._id } : 'skip'
  )
  const serverSettings = useQuery(api.chat.getServerSettings, user ? {} : 'skip')
  const userChatSettings = useQuery(api.chat.getUserChatSettings, user ? {} : 'skip')
  const stickerPacks = useQuery(api.chat.getStickerPacks, user ? {} : 'skip')

  const toggleMute = useMutation(api.userSettings.toggleMute)
  const toggleDeafen = useMutation(api.userSettings.toggleDeafen)
  const addReaction = useMutation(api.chat.addReaction)
  const removeReaction = useMutation(api.chat.removeReaction)
  const deleteMessage = useMutation(api.chat.deleteMessage)
  const reportContent = useMutation(api.moderation.reportContent)
  const updateUserChatSettings = useMutation(api.chat.updateUserChatSettings)

  const mergedUserSettings = useMemo<UserSettingsView>(
    () => ({
      autoplayMedia: userChatSettings?.autoplayMedia ?? DEFAULT_USER_SETTINGS.autoplayMedia,
      showStickers: userChatSettings?.showStickers ?? DEFAULT_USER_SETTINGS.showStickers,
      compactMode: userChatSettings?.compactMode ?? DEFAULT_USER_SETTINGS.compactMode,
    }),
    [userChatSettings]
  )

  const stickerMap = useMemo(() => {
    const map = new Map<string, ChatSticker>()
    for (const pack of stickerPacks ?? []) {
      for (const sticker of pack.stickers) {
        map.set(String(sticker._id), sticker)
      }
    }
    return map
  }, [stickerPacks])

  const optimistic = useOptimisticMessage({ channelId, messages })

  const handleToggleMute = useCallback(async () => {
    if (!user) return
    try {
      await toggleMute({ channelId, userId: user._id })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update mute setting', { type: 'error' })
    }
  }, [channelId, toggleMute, user])

  const handleToggleDeafen = useCallback(async () => {
    if (!user) return
    try {
      await toggleDeafen({ channelId, userId: user._id })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update deafen setting', { type: 'error' })
    }
  }, [channelId, toggleDeafen, user])

  const handleReact = useCallback(
    async (message: ChatMessage | OptimisticMessage, emoji: string) => {
      const messageId = String(message._id)
      if (!user || messageId.startsWith('temp-') || message.status === 'failed') return
      try {
        await addReaction({ messageId: message._id as Id<'messages'>, emoji })
      } catch (error) {
        const messageText = error instanceof Error ? error.message : 'Failed to react'
        if (messageText.includes('Already reacted')) {
          try {
            await removeReaction({ messageId: message._id as Id<'messages'>, emoji })
          } catch (removeError) {
            showToast(
              removeError instanceof Error ? removeError.message : 'Failed to update reaction',
              { type: 'error' }
            )
          }
          return
        }
        showToast(messageText, { type: 'error' })
      }
    },
    [addReaction, removeReaction, user]
  )

  const handleDelete = useCallback(
    async (message: ChatMessage | OptimisticMessage) => {
      if (!user || message.isDeleted) return
      const messageId = String(message._id)
      if (messageId.startsWith('temp-')) {
        optimistic.removeOptimisticMessage(messageId)
        return
      }
      try {
        await deleteMessage({ messageId: message._id as Id<'messages'> })
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to delete message', { type: 'error' })
      }
    },
    [deleteMessage, optimistic, user]
  )

  const handleReport = useCallback(
    async (messageId: Id<'messages'>, reason: string, note?: string) => {
      await reportContent({ contentType: 'chat_message', contentId: messageId, reason, note })
    },
    [reportContent]
  )

  const handleUpdateUserSettings = useCallback(
    async (patch: Partial<UserSettingsView>) => {
      await updateUserChatSettings(patch)
    },
    [updateUserChatSettings]
  )

  return (
    <div className="flex h-full w-full flex-col bg-[#111]">
      <header className="h-12 flex-shrink-0 border-b border-[#1a1a1a] px-4 shadow-sm flex items-center gap-2">
        <span className="translate-y-[-1px] text-2xl font-light text-[#808080]">#</span>
        <h2 className="text-[15px] font-bold text-white">{channelDetail?.name}</h2>
        <div className="mx-2 h-6 w-[1px] bg-[#2a2a2a]" />
        <p className="truncate text-[13px] text-[#808080]">{channelDetail?.description}</p>

        <div className="ml-auto flex items-center gap-4 text-[#808080]">
          <button
            onClick={handleToggleMute}
            className={`${channelSettings?.muted ? 'text-[#c41e3a]' : 'hover:text-white'} transition-colors`}
            title={channelSettings?.muted ? 'Unmute' : 'Mute'}
            type="button"
          >
            <iconify-icon
              icon={channelSettings?.muted ? 'solar:volume-cross-bold' : 'solar:notification-lines-bold'}
            />
          </button>

          <button
            onClick={handleToggleDeafen}
            className={`${channelSettings?.deafened ? 'text-[#c41e3a]' : 'hover:text-white'} transition-colors`}
            title={channelSettings?.deafened ? 'Undeafen' : 'Deafen'}
            type="button"
          >
            <iconify-icon
              icon={channelSettings?.deafened ? 'solar:headphones-round-cross-bold' : 'solar:headphones-round-bold'}
            />
          </button>

          <iconify-icon icon="solar:pin-bold" className="cursor-pointer hover:text-white" />
          <iconify-icon icon="solar:users-group-rounded-bold" className="cursor-pointer hover:text-white" />

          <div className="group relative">
            <input
              type="text"
              placeholder="Search"
              className="w-36 rounded-[4px] border border-[#1a1a1a] bg-[#0a0a0a] px-2 py-0.5 text-[13px] text-[#e0e0e0] transition-all duration-200 focus:w-60 focus:border-[#3d1818] focus:outline-none"
            />
            <iconify-icon
              icon="solar:magnifer-linear"
              className="absolute right-2 top-1/2 translate-y-[-50%] text-[14px]"
            />
          </div>

          <button
            type="button"
            className="transition-colors hover:text-white"
            title="Chat settings"
            onClick={() => setIsSettingsOpen(true)}
            disabled={!user}
          >
            <iconify-icon icon="solar:settings-bold" />
          </button>
          <iconify-icon icon="solar:help-bold" className="cursor-pointer hover:text-white" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-[#808080]">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#c41e3a]" />
              <span className="text-sm font-medium">Syncing messages...</span>
            </div>
          </div>
        ) : (
          <MessageThread
            channelId={channelId}
            channelName={channelDetail?.name}
            messages={messages as ChatMessage[]}
            optimisticMessages={optimistic.optimisticMessages}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            currentUserId={user?._id}
            userSettings={mergedUserSettings}
            stickerMap={stickerMap}
            onReact={handleReact}
            onDelete={handleDelete}
            onReport={handleReport}
            onRetry={optimistic.retryOptimisticMessage}
          />
        )}
      </div>

      <footer className="flex-shrink-0 bg-[#111] px-4 pb-4">
        {!isTypingLoading && typingUsers.length > 0 && (
          <div className="mb-1 h-5 px-1">
            <TypingIndicator typingUsers={typingUsers} />
          </div>
        )}
        <MessageInput
          channelId={channelId}
          channelName={channelDetail?.name}
          serverSettings={serverSettings ?? undefined}
          userSettings={mergedUserSettings}
          stickerPacks={stickerPacks ?? []}
          optimisticMessages={optimistic.optimisticMessages}
          sendMessage={optimistic.sendOptimisticMessage}
          retryMessage={optimistic.retryOptimisticMessage}
          removeMessage={optimistic.removeOptimisticMessage}
        />
      </footer>

      <ChatSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        serverSettings={serverSettings ?? undefined}
        userSettings={mergedUserSettings}
        onUpdate={handleUpdateUserSettings}
      />
    </div>
  )
}
