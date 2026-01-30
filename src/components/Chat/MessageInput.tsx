import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import type { Doc, Id } from '../../../convex/_generated/dataModel'
import { api } from '../../../convex/_generated/api'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../hooks/useTranslation'
import { showToast } from '../../lib/toast'
import type {
  ChatServerSettings,
  ChatSticker,
  ChatStickerPack,
  OptimisticMessage,
} from '../../types/chat'
import { StickerPicker } from './StickerPicker'

type UserSettingsView = {
  autoplayMedia: boolean
  showStickers: boolean
  compactMode: boolean
}

type AttachmentInput = {
  storageId: Id<'_storage'>
  type: 'image' | 'video'
  sizeBytes: number
  contentType: string
  width?: number
  height?: number
  durationMs?: number
  previewUrl: string
}

type SendMessageInput = {
  content: string
  attachments?: AttachmentInput[]
  stickerId?: Id<'chatStickers'>
  stickerPreviewUrl?: string
  stickerName?: string
  author: {
    id: Id<'users'>
    displayName: string
    avatar: string
    tier: Doc<'users'>['fanTier']
  }
  idempotencyKey: string
}

type SendMessageResult = { tempId: string; idempotencyKey: string; error?: Error }

type PendingAttachment = {
  id: string
  file: File
  previewUrl: string
  type: 'image' | 'video'
  sizeBytes: number
  contentType: string
  status: 'uploading' | 'uploaded' | 'error'
  storageId?: Id<'_storage'>
  width?: number
  height?: number
  durationMs?: number
  error?: string
}

interface MessageInputProps {
  channelId: Id<'channels'>
  channelName?: string
  serverSettings?: ChatServerSettings
  userSettings: UserSettingsView
  stickerPacks: ChatStickerPack[]
  optimisticMessages: OptimisticMessage[]
  sendMessage: (input: SendMessageInput) => Promise<SendMessageResult>
  retryMessage: (tempId: string) => Promise<void>
  removeMessage?: (tempId: string) => void
}

const MAX_ATTACHMENTS = 4
const MB = 1024 * 1024

const DEFAULT_SERVER_SETTINGS: Pick<
  ChatServerSettings,
  'slowModeSeconds' | 'maxImageMb' | 'maxVideoMb' | 'allowedMediaTypes'
> = {
  slowModeSeconds: 0,
  maxImageMb: 10,
  maxVideoMb: 25,
  allowedMediaTypes: [],
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function inferAttachmentType(file: File): 'image' | 'video' | null {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  const name = file.name.toLowerCase()
  if (/\.(png|jpe?g|webp)$/i.test(name)) return 'image'
  if (/\.(mp4|webm)$/i.test(name)) return 'video'
  return null
}

type MediaMetadata = Pick<PendingAttachment, 'width' | 'height' | 'durationMs'>

async function getMediaMetadata(previewUrl: string, type: 'image' | 'video'): Promise<MediaMetadata> {
  if (type === 'image') {
    return new Promise<MediaMetadata>((resolve) => {
      const image = new Image()
      image.onload = () => resolve({ width: image.width, height: image.height })
      image.onerror = () => resolve({})
      image.src = previewUrl
    })
  }

  return new Promise<MediaMetadata>((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () =>
      resolve({ width: video.videoWidth, height: video.videoHeight, durationMs: Math.round(video.duration * 1000) })
    video.onerror = () => resolve({})
    video.src = previewUrl
    video.load()
  })
}

function normalizeTier(tier?: string): Doc<'users'>['fanTier'] {
  switch (tier) {
    case 'silver':
    case 'gold':
    case 'platinum':
      return tier
    case 'bronze':
    default:
      return 'bronze'
  }
}

function isHardFailure(message: string) {
  const text = message.toLowerCase()
  return [
    'moderation policy',
    'slow mode',
    'banned',
    'timed out',
    'too quickly',
    'blocked',
    'access denied',
  ].some((keyword) => text.includes(keyword))
}

export function MessageInput({
  channelId,
  channelName,
  serverSettings,
  userSettings,
  stickerPacks,
  optimisticMessages,
  sendMessage,
  retryMessage,
  removeMessage,
}: MessageInputProps) {
  const [messageContent, setMessageContent] = useState('')
  const [attachments, setAttachments] = useState<PendingAttachment[]>([])
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [selectedStickerId, setSelectedStickerId] = useState<Id<'chatStickers'> | null>(null)
  const [selectedStickerPreview, setSelectedStickerPreview] = useState<string | null>(null)
  const [selectedStickerName, setSelectedStickerName] = useState<string | null>(null)
  const [isStickerUploading, setIsStickerUploading] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stickerInputRef = useRef<HTMLInputElement>(null)
  const attachmentsRef = useRef<PendingAttachment[]>(attachments)
  const removedIdsRef = useRef<Set<string>>(new Set())
  const uploadTasksRef = useRef<Map<string, Promise<void>>>(new Map())
  const previewUrlsByKeyRef = useRef<Map<string, string[]>>(new Map())

  const { isOnline } = useOnlineStatus()
  const { user } = useAuth()
  const { t } = useTranslation()

  const generateUploadUrl = useMutation(api.chat.generateUploadUrl)
  const uploadUserSticker = useMutation(api.chat.uploadUserSticker)
  const setTypingIndicator = useMutation(api.chat.setTypingIndicator)

  useEffect(() => {
    attachmentsRef.current = attachments
  }, [attachments])

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus()
  }, [channelId])

  useEffect(() => {
    if (!userSettings.showStickers) {
      setShowStickerPicker(false)
      setSelectedStickerId(null)
      setSelectedStickerPreview(null)
      setSelectedStickerName(null)
    }
  }, [userSettings.showStickers])

  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`
  }, [messageContent])

  const stickerLookup = useMemo(() => {
    const map = new Map<string, ChatSticker>()
    for (const pack of stickerPacks) {
      for (const sticker of pack.stickers) {
        map.set(String(sticker._id), sticker)
      }
    }
    return map
  }, [stickerPacks])

  useEffect(() => {
    if (!selectedStickerId) return
    const sticker = stickerLookup.get(String(selectedStickerId))
    if (!sticker) {
      setSelectedStickerId(null)
      setSelectedStickerPreview(null)
      setSelectedStickerName(null)
      return
    }
    setSelectedStickerPreview(sticker.imageUrl)
    setSelectedStickerName(sticker.name)
  }, [selectedStickerId, stickerLookup])

  useEffect(() => {
    const activeKeys = new Set(optimisticMessages.map((message) => message.idempotencyKey))
    for (const [key, urls] of previewUrlsByKeyRef.current.entries()) {
      if (activeKeys.has(key)) continue
      urls.forEach((url) => URL.revokeObjectURL(url))
      previewUrlsByKeyRef.current.delete(key)
    }
  }, [optimisticMessages])

  const settings = serverSettings ?? DEFAULT_SERVER_SETTINGS
  const allowedTypes = settings.allowedMediaTypes.length > 0 ? new Set(settings.allowedMediaTypes) : null

  const sendTypingIndicator = useCallback(
    async (isTyping: boolean) => {
      if (!user || !isOnline) return
      try {
        await setTypingIndicator({ channelId, isTyping })
      } catch {
        // Typing indicators are best-effort; ignore transient failures.
      }
    },
    [channelId, isOnline, setTypingIndicator, user]
  )

  const isTyping = messageContent.trim().length > 0
  useEffect(() => {
    if (!user || !isOnline) return
    let intervalId: number | undefined
    if (isTyping) {
      void sendTypingIndicator(true)
      intervalId = window.setInterval(() => void sendTypingIndicator(true), 2000)
    } else {
      void sendTypingIndicator(false)
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId)
      if (isTyping) void sendTypingIndicator(false)
    }
  }, [channelId, isOnline, isTyping, sendTypingIndicator, user])

  const uploadFileWithRetry = useCallback(
    async (file: File, attempts = 2) => {
      let lastError: Error | null = null
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
          const uploadUrl = await generateUploadUrl({})
          const response = await fetch(uploadUrl, { method: 'POST', body: file })
          if (!response.ok) {
            throw new Error(`Upload failed (${response.status})`)
          }
          const payload = (await response.json()) as { storageId?: Id<'_storage'> }
          if (!payload.storageId) {
            throw new Error('Upload did not return a storage id')
          }
          return payload.storageId
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Upload failed')
          if (attempt < attempts - 1) {
            await sleep(500 * (attempt + 1))
          }
        }
      }
      throw lastError ?? new Error('Upload failed')
    },
    [generateUploadUrl]
  )

  const trackUploadTask = useCallback((id: string, promise: Promise<void>) => {
    uploadTasksRef.current.set(id, promise)
    promise.finally(() => uploadTasksRef.current.delete(id))
  }, [])

  const uploadAttachment = useCallback(
    async (attachment: PendingAttachment) => {
      try {
        const metadata = await getMediaMetadata(attachment.previewUrl, attachment.type)
        const storageId = await uploadFileWithRetry(attachment.file)
        if (removedIdsRef.current.has(attachment.id)) {
          removedIdsRef.current.delete(attachment.id)
          return
        }
        setAttachments((prev) =>
          prev.map((item) =>
            item.id === attachment.id
              ? {
                  ...item,
                  status: 'uploaded',
                  storageId,
                  width: metadata.width,
                  height: metadata.height,
                  durationMs: metadata.durationMs,
                  error: undefined,
                }
              : item
          )
        )
      } catch (error) {
        if (removedIdsRef.current.has(attachment.id)) return
        const message = error instanceof Error ? error.message : 'Upload failed'
        setAttachments((prev) =>
          prev.map((item) =>
            item.id === attachment.id ? { ...item, status: 'error', error: message } : item
          )
        )
      }
    },
    [uploadFileWithRetry]
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!user) {
        showToast('Sign in to upload media.', { type: 'error' })
        return
      }
      if (!isOnline) {
        showToast(t('chat.offlineMessage'), { type: 'error' })
        return
      }
      if (!files || files.length === 0) return
      const availableSlots = Math.max(0, MAX_ATTACHMENTS - attachmentsRef.current.length)
      if (availableSlots === 0) {
        showToast(`You can attach up to ${MAX_ATTACHMENTS} files.`, { type: 'error' })
        return
      }

      const incoming = Array.from(files).slice(0, availableSlots)
      const nextAttachments: PendingAttachment[] = []

      for (const file of incoming) {
        const type = inferAttachmentType(file)
        if (!type) {
          showToast('Only images (JPG, PNG, WebP) and videos (MP4, WebM) are supported.', { type: 'error' })
          continue
        }
        if (allowedTypes && !allowedTypes.has(file.type)) {
          showToast('This file type is not allowed in this channel.', { type: 'error' })
          continue
        }

        const maxBytes = (type === 'image' ? settings.maxImageMb : settings.maxVideoMb) * MB
        if (file.size > maxBytes) {
          showToast(`File exceeds the ${type === 'image' ? settings.maxImageMb : settings.maxVideoMb}MB limit.`, {
            type: 'error',
          })
          continue
        }

        const previewUrl = URL.createObjectURL(file)
        const attachment: PendingAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl,
          type,
          sizeBytes: file.size,
          contentType: file.type,
          status: 'uploading',
        }
        nextAttachments.push(attachment)
      }

      if (nextAttachments.length === 0) return

      setAttachments((prev) => [...prev, ...nextAttachments])
      for (const attachment of nextAttachments) {
        const task = uploadAttachment(attachment)
        trackUploadTask(attachment.id, task)
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [allowedTypes, isOnline, settings.maxImageMb, settings.maxVideoMb, t, trackUploadTask, uploadAttachment, user]
  )

  const removeAttachment = useCallback((id: string) => {
    removedIdsRef.current.add(id)
    const attachment = attachmentsRef.current.find((item) => item.id === id)
    if (attachment) {
      URL.revokeObjectURL(attachment.previewUrl)
    }
    setAttachments((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const retryAttachment = useCallback(
    (id: string) => {
      removedIdsRef.current.delete(id)
      setAttachments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'uploading', error: undefined } : item))
      )
      const attachment = attachmentsRef.current.find((item) => item.id === id)
      if (!attachment) return
      const task = uploadAttachment({ ...attachment, status: 'uploading', error: undefined })
      trackUploadTask(id, task)
    },
    [trackUploadTask, uploadAttachment]
  )

  const ensureUploadsComplete = useCallback(async () => {
    const uploadingIds = attachmentsRef.current.filter((item) => item.status === 'uploading').map((item) => item.id)
    if (uploadingIds.length === 0) return
    const tasks = uploadingIds.map((id) => uploadTasksRef.current.get(id)).filter(Boolean) as Promise<void>[]
    await Promise.allSettled(tasks)
  }, [])

  const handleSend = useCallback(async () => {
    if (!user || isSending) return
    if (!isOnline) {
      setSendError(t('chat.offlineMessage'))
      return
    }

    const trimmedContent = messageContent.trim()
    const hasAttachments = attachmentsRef.current.length > 0
    const hasSticker = Boolean(selectedStickerId)
    if (!trimmedContent && !hasAttachments && !hasSticker) return

    setIsSending(true)
    setSendError(null)

    await ensureUploadsComplete()

    const latestAttachments = attachmentsRef.current
    if (latestAttachments.some((item) => item.status === 'error')) {
      setSendError('Resolve failed uploads before sending.')
      setIsSending(false)
      return
    }
    if (latestAttachments.some((item) => item.status !== 'uploaded' || !item.storageId)) {
      setSendError('Uploads are still processing. Please wait a moment.')
      setIsSending(false)
      return
    }

    const idempotencyKey = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const attachmentsInput: AttachmentInput[] = latestAttachments.map((item) => ({
      storageId: item.storageId!,
      type: item.type,
      sizeBytes: item.sizeBytes,
      contentType: item.contentType,
      width: item.width,
      height: item.height,
      durationMs: item.durationMs,
      previewUrl: item.previewUrl,
    }))

    previewUrlsByKeyRef.current.set(idempotencyKey, latestAttachments.map((item) => item.previewUrl))

    const displayName = user.displayName || user.username
    const tier = normalizeTier(user.fanTier)
    const avatar = user.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${user.username}`

    const snapshot = {
      content: trimmedContent,
      attachments: latestAttachments,
      stickerId: selectedStickerId,
      stickerPreview: selectedStickerPreview,
      stickerName: selectedStickerName,
    }

    setMessageContent('')
    setAttachments([])
    setSelectedStickerId(null)
    setSelectedStickerPreview(null)
    setSelectedStickerName(null)
    textareaRef.current?.focus()

    const result = await sendMessage({
      content: trimmedContent,
      attachments: attachmentsInput.length > 0 ? attachmentsInput : undefined,
      stickerId: selectedStickerId ?? undefined,
      stickerPreviewUrl: selectedStickerPreview ?? undefined,
      stickerName: selectedStickerName ?? undefined,
      author: { id: user._id, displayName, avatar, tier },
      idempotencyKey,
    })

    if (result.error) {
      const message = result.error.message || 'Failed to send message'
      setSendError(message)
      if (result.tempId && removeMessage && isHardFailure(message)) {
        removeMessage(result.tempId)
        previewUrlsByKeyRef.current.delete(idempotencyKey)
        removedIdsRef.current.clear()
        setAttachments(snapshot.attachments)
        setSelectedStickerId(snapshot.stickerId)
        setSelectedStickerPreview(snapshot.stickerPreview)
        setSelectedStickerName(snapshot.stickerName)
        setMessageContent(snapshot.content)
        textareaRef.current?.focus()
      }
      setIsSending(false)
      return
    }

    void sendTypingIndicator(false)
    setIsSending(false)
  }, [
    ensureUploadsComplete,
    isOnline,
    isSending,
    messageContent,
    removeMessage,
    selectedStickerId,
    selectedStickerName,
    selectedStickerPreview,
    sendMessage,
    sendTypingIndicator,
    t,
    user,
  ])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        void handleSend()
      }
    },
    [handleSend]
  )

  const handleStickerSelect = useCallback((sticker: ChatSticker) => {
    setSelectedStickerId(sticker._id)
    setSelectedStickerPreview(sticker.imageUrl)
    setSelectedStickerName(sticker.name)
    setShowStickerPicker(false)
  }, [])

  const handleStickerUpload = useCallback(
    async (file: File) => {
      if (!user) {
        showToast('Sign in to upload stickers.', { type: 'error' })
        return
      }
      if (!file.type.startsWith('image/')) {
        showToast('Stickers must be an image file.', { type: 'error' })
        return
      }
      const maxStickerMb = 4
      if (file.size > maxStickerMb * MB) {
        showToast(`Sticker exceeds ${maxStickerMb}MB limit.`, { type: 'error' })
        return
      }

      setIsStickerUploading(true)
      try {
        const storageId = await uploadFileWithRetry(file)
        await uploadUserSticker({
          storageId,
          name: file.name.replace(/\.[a-z0-9]+$/i, ''),
        })
        showToast('Sticker uploaded!', { type: 'success' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload sticker'
        showToast(message, { type: 'error' })
      } finally {
        setIsStickerUploading(false)
      }
    },
    [uploadFileWithRetry, uploadUserSticker, user]
  )

  const failedMessages = optimisticMessages.filter((message) => message.status === 'failed')
  const retryAllFailed = useCallback(async () => {
    const ids = failedMessages.map((message) => String(message._id)).filter((id) => id.startsWith('temp-'))
    if (ids.length === 0) return
    await Promise.allSettled(ids.map((id) => retryMessage(id)))
  }, [failedMessages, retryMessage])

  const placeholder = isOnline
    ? `${t('chat.messagePlaceholder')}${channelName ? `#${channelName}` : ''}`
    : t('chat.offlinePlaceholder')

  const slowModeLabel = settings.slowModeSeconds > 0 ? `Slow mode ${settings.slowModeSeconds}s` : null

  const hasAnyContent = messageContent.trim().length > 0 || attachments.length > 0 || Boolean(selectedStickerId)

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
        className="hidden"
        multiple
        onChange={(event) => handleFiles(event.target.files)}
      />

      <input
        ref={stickerInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) {
            void handleStickerUpload(file)
          }
          if (stickerInputRef.current) {
            stickerInputRef.current.value = ''
          }
        }}
      />

      {attachments.length > 0 && (
        <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-4">
          {attachments.map((attachment) => (
            <AttachmentPreview
              key={attachment.id}
              attachment={attachment}
              onRemove={removeAttachment}
              onRetry={retryAttachment}
            />
          ))}
        </div>
      )}

      {selectedStickerPreview && userSettings.showStickers && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#0b0b0b] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
          <img src={selectedStickerPreview} alt="Selected sticker" className="h-6 w-6 rounded-md object-cover" />
          Sticker selected
          <button
            type="button"
            onClick={() => {
              setSelectedStickerId(null)
              setSelectedStickerPreview(null)
              setSelectedStickerName(null)
            }}
            className="text-[#808080] hover:text-white"
          >
            <iconify-icon icon="solar:close-circle-linear" width="16" height="16" />
          </button>
        </div>
      )}

      {isStickerUploading && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#0b0b0b] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#808080]">
          <iconify-icon icon="solar:spinner-linear" width="14" height="14" className="animate-spin" />
          Uploading sticker...
        </div>
      )}

      {slowModeLabel && (
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#707070]">{slowModeLabel}</div>
      )}

      <div className="relative flex min-h-[48px] items-center gap-3 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-shrink-0 items-center justify-center text-[#808080] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={attachments.length >= MAX_ATTACHMENTS || !user}
          title={attachments.length >= MAX_ATTACHMENTS ? `Max ${MAX_ATTACHMENTS} attachments` : 'Add media'}
        >
          <iconify-icon icon="solar:add-circle-bold" style={{ fontSize: '24px' }} />
        </button>

        {userSettings.showStickers && (
          <>
            <button
              type="button"
              onClick={() => setShowStickerPicker((prev) => !prev)}
              className="flex flex-shrink-0 items-center justify-center rounded-full border border-transparent px-1 text-[#808080] transition-colors hover:border-[#2a2a2a] hover:text-white"
              title="Stickers"
            >
              <iconify-icon icon="solar:sticker-smiley-bold" style={{ fontSize: '22px' }} />
            </button>
            <button
              type="button"
              onClick={() => stickerInputRef.current?.click()}
              className="flex flex-shrink-0 items-center justify-center rounded-full border border-transparent px-1 text-[#808080] transition-colors hover:border-[#2a2a2a] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              title="Upload sticker"
              disabled={!user || isStickerUploading}
            >
              <iconify-icon icon="solar:upload-minimalistic-bold" style={{ fontSize: '20px' }} />
            </button>
          </>
        )}

        {!isOnline && (
          <div className="absolute -top-9 left-0 rounded bg-[#c41e3a]/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white">
            {t('chat.offlineMessage')}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={messageContent}
          onChange={(event) => setMessageContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          maxLength={2000}
          className="max-h-[140px] w-full resize-none bg-transparent text-sm leading-[20px] text-[#e0e0e0] placeholder:text-[#505050] focus:outline-none"
          disabled={!user}
        />

        <div className="flex flex-shrink-0 items-center gap-2 text-[#808080]">
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!user || isSending || !hasAnyContent}
            className={`flex items-center justify-center rounded-full border border-transparent px-2 py-1 transition-colors ${
              !user || isSending || !hasAnyContent ? 'cursor-not-allowed text-[#333]' : 'text-[#c41e3a] hover:text-[#ff3355]'
            }`}
            title="Send message"
          >
            <iconify-icon icon="solar:plain-bold" style={{ fontSize: '20px' }} />
          </button>
        </div>

        {showStickerPicker && userSettings.showStickers && (
          <div className="absolute bottom-14 right-2 z-50">
            <StickerPicker
              packs={stickerPacks}
              onSelect={handleStickerSelect}
              onClose={() => setShowStickerPicker(false)}
              currentUserId={user?._id}
              onUploadSticker={handleStickerUpload}
              isUploading={isStickerUploading}
            />
          </div>
        )}
      </div>

      <div className="mt-1 flex flex-col gap-1 px-1">
        {sendError && <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c41e3a]">{sendError}</div>}
        {failedMessages.length > 0 && (
          <button
            type="button"
            onClick={() => void retryAllFailed()}
            className="self-start text-[10px] font-bold uppercase tracking-[0.2em] text-[#c41e3a] transition-colors hover:text-[#ff3355]"
          >
            Retry failed messages
          </button>
        )}
      </div>
    </div>
  )
}

interface AttachmentPreviewProps {
  attachment: PendingAttachment
  onRemove: (id: string) => void
  onRetry: (id: string) => void
}

function AttachmentPreview({ attachment, onRemove, onRetry }: AttachmentPreviewProps) {
  const isImage = attachment.type === 'image'
  const statusLabel = attachment.status === 'uploading' ? 'Uploading...' : attachment.status === 'error' ? 'Upload failed' : null

  return (
    <div className="group relative overflow-hidden rounded-lg border border-[#1a1a1a] bg-[#080808]">
      {isImage ? (
        <img src={attachment.previewUrl} alt="Attachment preview" className="h-24 w-full object-cover" />
      ) : (
        <video src={attachment.previewUrl} className="h-24 w-full object-cover" muted playsInline />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />

      {statusLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
          {attachment.status === 'uploading' && (
            <iconify-icon icon="solar:spinner-linear" width="18" height="18" className="animate-spin" />
          )}
          <span>{statusLabel}</span>
          {attachment.status === 'error' && (
            <button
              type="button"
              onClick={() => onRetry(attachment.id)}
              className="pointer-events-auto rounded-full border border-white/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-white"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        className="absolute right-1 top-1 rounded-full border border-white/20 bg-black/60 p-1 text-white opacity-0 transition-opacity hover:border-white/60 group-hover:opacity-100"
        aria-label="Remove attachment"
      >
        <iconify-icon icon="solar:close-circle-linear" width="16" height="16" />
      </button>
    </div>
  )
}
