import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Doc, Id } from '../../../convex/_generated/dataModel'
import { ProfileAvatar } from '../Profile/ProfileAvatar'
import { FanStatusBadge } from '../Profile/FanStatusBadge'
import { ReactionPicker } from './ReactionPicker'
import { showToast } from '../../lib/toast'
import type { ChatAttachment, ChatMessage, ChatSticker, OptimisticMessage } from '../../types/chat'
import { buildChatEmbeds, splitTextByUrls, type ChatEmbed } from '../../utils/chatEmbeds'

type MessageView = ChatMessage | OptimisticMessage

type AuthorView = {
  username: string
  displayName: string
  avatar: string
  fanTier: Doc<'users'>['fanTier']
  level: number
  xp: number
}

interface MessageItemProps {
  message: MessageView
  isPinned?: boolean
  onDelete?: (message: MessageView) => void
  onReact?: (message: MessageView, emoji: string) => void
  onReport?: (messageId: Id<'messages'>, reason: string, note?: string) => Promise<void>
  onRetry?: (tempId: string) => Promise<void>
  currentUserId?: Id<'users'>
  isStacked?: boolean
  compactMode: boolean
  autoplayMedia: boolean
  showStickers: boolean
  stickerMap: Map<string, ChatSticker>
}

const REPORT_REASONS = [
  { value: 'hate_speech', label: 'Hate speech or slur' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'spam', label: 'Spam or scam' },
  { value: 'explicit', label: 'Explicit content' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'other', label: 'Other' },
] as const

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

function deriveUsername(displayName: string, authorId: string) {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
  if (slug.length > 0) return slug
  return `fan-${authorId.slice(-6)}`
}

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = now.toDateString() === date.toDateString()
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return isToday ? time : `${date.toLocaleDateString()} ${time}`
}

function formatUrlDisplay(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl)
    const host = parsed.hostname.replace('www.', '')
    const path = parsed.pathname.length > 1 ? parsed.pathname : ''
    return `${host}${path}`
  } catch {
    return rawUrl
  }
}

function toServerMessageId(message: MessageView): Id<'messages'> | null {
  const id = String(message._id)
  if (id.startsWith('temp-')) return null
  return message._id as Id<'messages'>
}

export function MessageItem({
  message,
  isPinned = false,
  onDelete,
  onReact,
  onReport,
  onRetry,
  currentUserId,
  isStacked = false,
  compactMode,
  autoplayMedia,
  showStickers,
  stickerMap,
}: MessageItemProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState<(typeof REPORT_REASONS)[number]['value']>('spam')
  const [reportNote, setReportNote] = useState('')
  const [reportState, setReportState] = useState<'idle' | 'submitting'>('idle')
  const [reportError, setReportError] = useState<string | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const messageId = String(message._id)
  const isTemp = messageId.startsWith('temp-')
  const isFailed = message.status === 'failed'
  const isSending = message.status === 'sending'
  const isOwnMessage = Boolean(currentUserId && message.authorId === currentUserId)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(media.matches)
    update()
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }
    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  const overlayOpen = Boolean(lightboxUrl) || showReportModal
  useEffect(() => {
    if (!overlayOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (showReportModal) {
        setShowReportModal(false)
      } else {
        setLightboxUrl(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [overlayOpen, showReportModal])

  const author = useMemo<AuthorView>(() => {
    const displayName = message.authorDisplayName || 'Fan'
    const username = deriveUsername(displayName, String(message.authorId))
    const tier = normalizeTier(message.authorTier)
    const avatar = message.authorAvatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${username}`
    return {
      username,
      displayName,
      avatar,
      fanTier: tier,
      level: 1,
      xp: 0,
    }
  }, [message.authorAvatar, message.authorDisplayName, message.authorId, message.authorTier])

  const attachments = message.attachments ?? []
  const sticker = message.stickerId ? stickerMap.get(String(message.stickerId)) : undefined
  const stickerUrl = sticker?.imageUrl ?? message.stickerUrl
  const stickerName = sticker?.name ?? message.stickerName ?? 'Sticker'
  const allowAutoplay = autoplayMedia && !prefersReducedMotion

  const hasText = !message.isDeleted && message.content.trim().length > 0
  const shouldRenderText = message.isDeleted || hasText || (attachments.length === 0 && !message.stickerId)
  const textContent = message.isDeleted ? '[removed]' : hasText ? message.content : '[no text]'
  const textParts = useMemo(() => splitTextByUrls(textContent), [textContent])
  const embeds = useMemo(
    () => (!message.isDeleted && hasText ? buildChatEmbeds(message.content) : []),
    [hasText, message.content, message.isDeleted]
  )
  const canReact = Boolean(onReact && !message.isDeleted && !isTemp && !isFailed)
  const canReport = Boolean(onReport && !message.isDeleted && !isTemp && !isFailed)
  const canDelete = Boolean(onDelete && isOwnMessage && !message.isDeleted)

  const handleReact = useCallback(
    (emoji: string) => {
      if (!canReact || !onReact) return
      onReact(message, emoji)
    },
    [canReact, message, onReact]
  )

  const handleDelete = useCallback(() => {
    if (!onDelete) return
    onDelete(message)
  }, [message, onDelete])

  const handleRetry = useCallback(() => {
    if (!onRetry || !isFailed || !isTemp) return
    void onRetry(messageId)
  }, [isFailed, isTemp, messageId, onRetry])

  const openReportModal = useCallback(() => {
    if (!canReport) return
    setReportError(null)
    setReportState('idle')
    setShowReportModal(true)
  }, [canReport])

  const submitReport = useCallback(async () => {
    if (!onReport || reportState === 'submitting') return
    const serverId = toServerMessageId(message)
    if (!serverId) {
      showToast('Message is not available to report yet.', { type: 'error' })
      return
    }

    setReportState('submitting')
    setReportError(null)
    try {
      await onReport(serverId, reportReason, reportNote.trim() || undefined)
      showToast('Report submitted to moderators.', { type: 'success' })
      setShowReportModal(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit report'
      setReportError(errorMessage)
    } finally {
      setReportState('idle')
    }
  }, [message, onReport, reportNote, reportReason, reportState])

  const reactionEmojis = message.reactionEmojis ?? []

  const basePadding = compactMode ? (isStacked ? 'py-0.5' : 'py-1') : (isStacked ? 'py-0.5' : 'py-1.5')
  const gapClass = compactMode ? 'gap-2' : 'gap-2.5'
  const stackMargin = isStacked ? 'mt-0.5' : compactMode ? 'mt-1' : 'mt-1.5'

  return (
    <div
      className={`group/item relative flex items-start ${gapClass} px-3 ${basePadding} transition-colors hover:bg-[#1a1a1a]/50 ${
        isPinned ? 'border-l-2 border-[#c41e3a]' : ''
      } ${stackMargin}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onContextMenu={(event) => {
        event.preventDefault()
        if (canReact) setShowReactionPicker((prev) => !prev)
      }}
    >
      <div className={`flex-shrink-0 ${compactMode ? 'h-10 w-10' : 'h-11 w-11'} pt-0.5 flex items-start justify-center`}>
        {!isStacked ? (
          <ProfileAvatar user={author} size="sm" />
        ) : (
          <span className="block text-center text-[10px] font-light leading-[20px] text-[#808080] opacity-0 transition-opacity group-hover/item:opacity-100">
            {formatTimestamp(message.createdAt)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {!isStacked && (
          <div className="flex items-center gap-2 leading-tight">
            <span className="text-sm font-semibold text-white">{author.displayName}</span>
            <div className="flex-shrink-0">
              <FanStatusBadge user={{ fanTier: author.fanTier, level: author.level, xp: author.xp }} size="sm" />
            </div>
            <span className="text-[11px] font-medium text-[#808080]">{formatTimestamp(message.createdAt)}</span>
            {isPinned && <span className="text-xs text-[#c41e3a]">Pinned</span>}
            {message.isDeleted && <span className="text-xs text-[#c41e3a]">Removed</span>}
          </div>
        )}

        {shouldRenderText && (
          <div
            className={`text-[15px] leading-snug text-[#e0e0e0] whitespace-pre-wrap break-words ${
              message.isDeleted ? 'italic text-[#808080]' : ''
            }`}
          >
            {textParts.map((part, index) =>
              part.type === 'url' ? (
                <a
                  key={`${part.value}-${index}`}
                  href={part.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-300 hover:text-red-200 underline underline-offset-2 break-all"
                >
                  {formatUrlDisplay(part.value)}
                </a>
              ) : (
                <span key={`${part.value}-${index}`}>{part.value}</span>
              )
            )}
          </div>
        )}

        {!message.isDeleted && attachments.length > 0 && (
          <div className={`mt-2 grid grid-cols-1 gap-2 ${attachments.length > 1 ? 'md:grid-cols-2' : ''}`}>
            {attachments.map((attachment, index) => (
              <AttachmentTile
                key={`${attachment.storageId}-${index}`}
                attachment={attachment}
                allowAutoplay={allowAutoplay}
                onOpenLightbox={setLightboxUrl}
              />
            ))}
          </div>
        )}

        {!message.isDeleted && message.stickerId && (
          <div className="mt-2">
            {showStickers ? (
              stickerUrl ? (
                <img
                  src={stickerUrl}
                  alt={stickerName}
                  loading="lazy"
                  className="h-28 w-28 rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] object-contain p-2"
                />
              ) : (
                <div className="inline-flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-[#3a3a3a] bg-[#0b0b0b] text-xs uppercase tracking-[0.2em] text-[#707070]">
                  Sticker missing
                </div>
              )
            ) : (
              <div className="inline-flex h-20 items-center rounded-lg border border-[#2a2a2a] bg-[#0b0b0b] px-3 text-xs uppercase tracking-[0.2em] text-[#808080]">
                Sticker hidden
              </div>
            )}
          </div>
        )}

        {!message.isDeleted && embeds.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {embeds.map((embed) => (
              <ChatEmbedCard
                key={`${embed.type}-${embed.url}`}
                embed={embed}
                allowAutoplay={allowAutoplay}
                onOpenLightbox={setLightboxUrl}
              />
            ))}
          </div>
        )}

        {reactionEmojis.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {reactionEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="flex items-center gap-1 rounded-md border border-[#2a2a2a] bg-[#1a1a1a]/50 px-1.5 py-0.5 text-xs transition-colors hover:bg-[#2a2a2a]/60"
                onClick={() => handleReact(emoji)}
              >
                <span>{emoji}</span>
                {message.reactionCount > 0 && <span className="font-medium text-[#e0e0e0]">{message.reactionCount}</span>}
              </button>
            ))}
          </div>
        )}

        {isSending && (
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#606060]">Sending...</div>
        )}

        {isFailed && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#ff6b6b]">
            <span className="font-semibold uppercase tracking-[0.2em]">{message.errorMessage || 'Failed to send'}</span>
            {onRetry && (
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-md border border-[#ff6b6b]/40 px-2 py-0.5 font-semibold uppercase tracking-[0.2em] text-[#ff6b6b] transition-colors hover:border-[#ff6b6b] hover:text-white"
              >
                Retry
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md border border-[#2a2a2a] px-2 py-0.5 font-semibold uppercase tracking-[0.2em] text-[#b0b0b0] transition-colors hover:border-[#c41e3a] hover:text-white"
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className={`absolute right-4 top-0 z-10 flex items-center gap-1 rounded-md border border-[#2a2a2a] bg-[#111] px-1.5 py-1 shadow-2xl transition-all duration-150 ${
          showActions || showReactionPicker ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {canReact && (
          <button
            type="button"
            onClick={() => setShowReactionPicker((prev) => !prev)}
            className="rounded p-1 text-[#808080] transition-all hover:bg-[#1a1a1a] hover:text-white"
            title="Add reaction"
          >
            <iconify-icon icon="solar:sticker-smiley-bold" style={{ fontSize: '16px' }} />
          </button>
        )}

        {canReport && (
          <button
            type="button"
            onClick={openReportModal}
            className="rounded p-1 text-[#808080] transition-all hover:bg-[#1a1a1a] hover:text-white"
            title="Report message"
          >
            <iconify-icon icon="solar:flag-2-bold" style={{ fontSize: '16px' }} />
          </button>
        )}

        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded p-1 text-[#808080] transition-all hover:bg-[#1a1a1a] hover:text-[#c41e3a]"
            title="Delete message"
          >
            <iconify-icon icon="solar:trash-bin-trash-bold" style={{ fontSize: '16px' }} />
          </button>
        )}
      </div>

      {showReactionPicker && canReact && (
        <div className="absolute right-4 top-full z-40 mt-1">
          <div className="relative">
            <div className="fixed inset-0 z-[-1]" onClick={() => setShowReactionPicker(false)} />
            <ReactionPicker
              onReact={(emoji) => {
                handleReact(emoji)
                setShowReactionPicker(false)
              }}
              currentReactions={reactionEmojis}
            />
          </div>
        </div>
      )}

      {lightboxUrl &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightboxUrl(null)}>
            <button
              type="button"
              className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/40 p-2 text-white transition-colors hover:border-white/50"
              onClick={() => setLightboxUrl(null)}
              aria-label="Close image preview"
            >
              <iconify-icon icon="solar:close-circle-linear" width="22" height="22" />
            </button>
            <img
              src={lightboxUrl}
              alt="Attachment preview"
              className="max-h-[85vh] max-w-[90vw] rounded-xl border border-white/10 object-contain shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            />
          </div>,
          document.body
        )}

      {showReportModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowReportModal(false)}>
            <div className="w-full max-w-md rounded-2xl border border-[#2a2a2a] bg-[#111] p-5" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-white">Report message</h4>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="rounded p-1 text-[#808080] transition-colors hover:bg-[#1a1a1a] hover:text-white"
                  aria-label="Close report dialog"
                >
                  <iconify-icon icon="solar:close-circle-linear" width="20" height="20" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <label className="block text-xs uppercase tracking-[0.2em] text-[#808080]">Reason</label>
                <select
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value as (typeof REPORT_REASONS)[number]['value'])}
                  className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-[#c41e3a] focus:outline-none"
                >
                  {REPORT_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>

                <label className="block text-xs uppercase tracking-[0.2em] text-[#808080]">Note (optional)</label>
                <textarea
                  value={reportNote}
                  onChange={(event) => setReportNote(event.target.value)}
                  rows={3}
                  maxLength={400}
                  placeholder="Add context for moderators"
                  className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-[#606060] focus:border-[#c41e3a] focus:outline-none"
                />
                {reportError && <div className="text-xs font-medium text-[#ff6b6b]">{reportError}</div>}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b0b0b0] transition-colors hover:border-[#3a3a3a] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReport}
                  disabled={reportState === 'submitting'}
                  className="rounded-lg border border-[#c41e3a] bg-[#c41e3a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#d92745] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {reportState === 'submitting' ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

interface AttachmentTileProps {
  attachment: ChatAttachment
  allowAutoplay: boolean
  onOpenLightbox: (url: string) => void
}

function AttachmentTile({ attachment, allowAutoplay, onOpenLightbox }: AttachmentTileProps) {
  const url = attachment.url || attachment.thumbnailUrl
  const isImage = attachment.type === 'image'
  const mediaClass = 'w-full max-w-[420px] rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] shadow-lg'

  if (!url) {
    return (
      <div className={`${mediaClass} flex h-40 items-center justify-center text-xs uppercase tracking-[0.2em] text-[#707070]`}>
        Media unavailable
      </div>
    )
  }

  if (isImage) {
    return (
      <button type="button" className={`${mediaClass} overflow-hidden`} onClick={() => onOpenLightbox(url)}>
        <img src={url} alt="Attachment" loading="lazy" className="h-full w-full object-cover" />
      </button>
    )
  }

  return (
    <div className={`${mediaClass} overflow-hidden`}>
      <video
        src={url}
        poster={attachment.thumbnailUrl}
        controls
        playsInline
        muted={allowAutoplay}
        autoPlay={allowAutoplay}
        preload="metadata"
        className="h-full w-full object-cover"
      />
    </div>
  )
}

interface ChatEmbedCardProps {
  embed: ChatEmbed
  allowAutoplay: boolean
  onOpenLightbox: (url: string) => void
}

function ChatEmbedCard({ embed, allowAutoplay, onOpenLightbox }: ChatEmbedCardProps) {
  const baseClass = 'w-full max-w-[520px] rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] shadow-lg overflow-hidden'

  if (embed.type === 'youtube' || embed.type === 'vimeo') {
    return (
      <div className={baseClass}>
        <div className="relative w-full pt-[56.25%]">
          <iframe
            src={embed.embedUrl}
            title={embed.provider ?? 'Embedded video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <div className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#808080]">{embed.provider}</div>
      </div>
    )
  }

  if (embed.type === 'video') {
    return (
      <div className={baseClass}>
        <video
          src={embed.embedUrl}
          controls
          playsInline
          muted={allowAutoplay}
          autoPlay={allowAutoplay}
          preload="metadata"
          className="h-full w-full object-cover"
        />
        <div className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#808080]">{embed.displayUrl}</div>
      </div>
    )
  }

  if (embed.type === 'gif' || embed.type === 'image') {
    return (
      <button
        type="button"
        onClick={() => onOpenLightbox(embed.embedUrl)}
        className={`${baseClass} text-left`}
      >
        <img src={embed.embedUrl} alt="Embedded media" loading="lazy" className="h-full w-full object-cover" />
        <div className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#808080]">
          {embed.provider ?? 'Image'}
        </div>
      </button>
    )
  }

  return (
    <a
      href={embed.embedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClass} block px-4 py-3 text-sm text-[#e0e0e0] transition-colors hover:border-[#c41e3a]`}
    >
      <div className="text-xs uppercase tracking-[0.2em] text-[#808080] mb-2">{embed.provider ?? 'Link'}</div>
      <div className="font-semibold text-white break-all">{embed.displayUrl ?? embed.url}</div>
    </a>
  )
}
