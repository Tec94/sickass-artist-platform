import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Doc, Id } from '../../../convex/_generated/dataModel'
import { showToast } from '../../lib/toast'
import { useAdminAccess } from '../../hooks/useAdminAccess'

type ModerationContentType = 'chat_message' | 'forum_thread' | 'forum_reply'
type ModerationActionType = 'dismiss' | 'warn' | 'remove' | 'timeout' | 'ban'
type Severity = 'low' | 'medium' | 'high'
type ModerationContentId = Id<'messages'> | Id<'threads'> | Id<'replies'>

type QueueItem = {
  contentType: ModerationContentType
  contentId: ModerationContentId
  targetUserId: Id<'users'>
  channelId?: Id<'channels'>
  reportCount: number
  severity: Severity
  latestCreatedAt: number
  reasons: Record<string, number>
  content: {
    content?: string
    title?: string
    attachments?: unknown[]
    stickerId?: Id<'chatStickers'>
    moderationStatus?: 'active' | 'removed'
  }
}

type QueuePage = { items: QueueItem[]; nextCursor: number | null }

type StickerPackAdmin = Doc<'chatStickerPacks'> & { stickerCount: number; isEnabled: boolean }

const SUPPORTED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'] as const

function queueKey(item: QueueItem) {
  return `${item.contentType}:${String(item.contentId)}`
}

function mergeQueue(prev: QueueItem[], next: QueueItem[]) {
  const map = new Map<string, QueueItem>()
  for (const item of prev) map.set(queueKey(item), item)
  for (const item of next) map.set(queueKey(item), item)
  return Array.from(map.values()).sort((a, b) => b.latestCreatedAt - a.latestCreatedAt)
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

function formatDuration(ms: number) {
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

function severityClasses(severity: Severity) {
  switch (severity) {
    case 'high':
      return 'border-red-500/40 bg-red-500/10 text-red-200'
    case 'medium':
      return 'border-amber-400/40 bg-amber-400/10 text-amber-200'
    case 'low':
    default:
      return 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
  }
}

function summaryText(item: QueueItem) {
  if (item.contentType === 'forum_thread') return item.content.title || item.content.content || '[thread missing]'
  if (item.contentType === 'forum_reply') return item.content.content || '[reply missing]'
  if (item.content.content && item.content.content.trim().length > 0) return item.content.content
  if ((item.content.attachments?.length ?? 0) > 0) return '[media attachment]'
  if (item.content.stickerId) return '[sticker]'
  return '[message empty]'
}
export function AdminModerationHub() {
  const { canUseAdminQueries } = useAdminAccess()
  const [statusFilter, setStatusFilter] = useState<'open' | 'resolved'>('open')
  const [typeFilter, setTypeFilter] = useState<ModerationContentType | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all')
  const [requestedCursor, setRequestedCursor] = useState<number | null>(null)
  const [olderItems, setOlderItems] = useState<QueueItem[]>([])
  const [nextCursor, setNextCursor] = useState<number | null | undefined>(undefined)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [timeoutDurationMs, setTimeoutDurationMs] = useState(10 * 60 * 1000)
  const [actionLoading, setActionLoading] = useState<ModerationActionType | null>(null)

  const [policyDraft, setPolicyDraft] = useState<{
    warningWindowDays: number
    warningThreshold: number
    timeoutDurationsMinutes: string
    banThreshold: number
    denylist: string
    allowlist: string
  } | null>(null)
  const [policySaving, setPolicySaving] = useState(false)

  const [serverDraft, setServerDraft] = useState<{
    slowModeSeconds: number
    maxImageMb: number
    maxVideoMb: number
    retentionDays: number
    allowedMediaTypes: string[]
    enabledStickerPackIds: Id<'chatStickerPacks'>[]
  } | null>(null)
  const [serverSaving, setServerSaving] = useState(false)

  const [updatingFlag, setUpdatingFlag] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)

  const baseArgs = useMemo(() => {
    const args: {
      status: 'open' | 'resolved'
      limit: number
      cursor?: number
      contentType?: ModerationContentType
      severity?: Severity
    } = {
      status: statusFilter,
      limit: 25,
    }
    if (typeFilter !== 'all') args.contentType = typeFilter
    if (severityFilter !== 'all') args.severity = severityFilter
    return args
  }, [severityFilter, statusFilter, typeFilter])

  const baseQueue = useQuery(api.moderation.getQueue, canUseAdminQueries ? baseArgs : 'skip')
  const paginatedQueue = useQuery(
    api.moderation.getQueue,
    canUseAdminQueries && requestedCursor ? { ...baseArgs, cursor: requestedCursor } : 'skip'
  )
  const stats = useQuery(api.moderation.getModerationStats, canUseAdminQueries ? {} : 'skip')
  const policy = useQuery(api.moderation.getPolicy, canUseAdminQueries ? {} : 'skip')
  const channels = useQuery(api.chat.getChannels, canUseAdminQueries ? {} : 'skip')
  const serverSettings = useQuery(api.chat.getServerSettings, canUseAdminQueries ? {} : 'skip')
  const stickerPacks = useQuery(api.admin.listStickerPacks, canUseAdminQueries ? {} : 'skip') as
    | StickerPackAdmin[]
    | undefined
  const featureFlags = useQuery(api.admin.getFeatureFlags, canUseAdminQueries ? {} : 'skip')

  const takeAction = useMutation(api.moderation.takeAction)
  const updatePolicy = useMutation(api.admin.updateModerationPolicy)
  const updateServerSettings = useMutation(api.admin.updateServerSettings)
  const updateFeatureFlag = useMutation(api.admin.updateFeatureFlag)
  const seedModerationData = useMutation(api.admin.seedModerationData)
  useEffect(() => {
    setRequestedCursor(null)
    setOlderItems([])
    setNextCursor(undefined)
    setIsLoadingMore(false)
    setSelectedKey(null)
  }, [severityFilter, statusFilter, typeFilter])

  useEffect(() => {
    if (!baseQueue) return
    const page = baseQueue as QueuePage
    if (olderItems.length === 0) {
      setNextCursor(page.nextCursor ?? null)
    }
  }, [baseQueue, olderItems.length])

  useEffect(() => {
    if (!paginatedQueue || !requestedCursor) return
    const page = paginatedQueue as QueuePage
    setOlderItems((prev) => mergeQueue(prev, page.items))
    setNextCursor(page.nextCursor ?? null)
    setRequestedCursor(null)
    setIsLoadingMore(false)
  }, [paginatedQueue, requestedCursor])

  const queueItems = useMemo(() => {
    if (!baseQueue) return olderItems
    const page = baseQueue as QueuePage
    return mergeQueue(olderItems, page.items)
  }, [baseQueue, olderItems])

  useEffect(() => {
    if (!policy) return
    setPolicyDraft({
      warningWindowDays: policy.warningWindowDays,
      warningThreshold: policy.warningThreshold,
      timeoutDurationsMinutes: policy.timeoutDurationsMs.map((ms) => Math.round(ms / 60000)).join(', '),
      banThreshold: policy.banThreshold,
      denylist: policy.denylist.join(', '),
      allowlist: policy.allowlist.join(', '),
    })
    if (policy.timeoutDurationsMs.length > 0) {
      setTimeoutDurationMs(policy.timeoutDurationsMs[0])
    }
  }, [policy])

  useEffect(() => {
    if (!serverSettings) return
    setServerDraft({
      slowModeSeconds: serverSettings.slowModeSeconds,
      maxImageMb: serverSettings.maxImageMb,
      maxVideoMb: serverSettings.maxVideoMb,
      retentionDays: serverSettings.retentionDays ?? 0,
      allowedMediaTypes: [...serverSettings.allowedMediaTypes],
      enabledStickerPackIds: [...serverSettings.enabledStickerPackIds],
    })
  }, [serverSettings])

  useEffect(() => {
    if (queueItems.length === 0) {
      setSelectedKey(null)
      return
    }
    const hasSelected = selectedKey ? queueItems.some((item) => queueKey(item) === selectedKey) : false
    if (!hasSelected) {
      setSelectedKey(queueKey(queueItems[0]))
    }
  }, [queueItems, selectedKey])

  const channelNameMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const channel of channels ?? []) {
      map.set(String(channel._id), channel.name)
    }
    return map
  }, [channels])

  const selectedItem = useMemo(
    () => (selectedKey ? queueItems.find((item) => queueKey(item) === selectedKey) ?? null : null),
    [queueItems, selectedKey]
  )

  const userHistory = useQuery(
    api.moderation.getUserHistory,
    selectedItem ? { targetUserId: selectedItem.targetUserId, limit: 20 } : 'skip'
  )

  const timeoutOptions = useMemo(() => {
    return (policy?.timeoutDurationsMs ?? []).map((ms) => ({ ms, label: formatDuration(ms) }))
  }, [policy])

  const topFlaggedChannels = useMemo(() => {
    if (!stats?.topFlaggedChannels) return []
    return stats.topFlaggedChannels.map((entry) => ({
      ...entry,
      name: channelNameMap.get(String(entry.channelId)) ?? 'unknown-channel',
    }))
  }, [channelNameMap, stats?.topFlaggedChannels])
  const handleLoadMore = useCallback(() => {
    if (!nextCursor || isLoadingMore) return
    setIsLoadingMore(true)
    setRequestedCursor(nextCursor)
  }, [isLoadingMore, nextCursor])

  const handleAction = useCallback(
    async (actionType: ModerationActionType) => {
      if (!selectedItem) return
      const reason = actionReason.trim()
      setActionLoading(actionType)
      try {
        await takeAction({
          actionType,
          targetUserId: selectedItem.targetUserId,
          contentType: selectedItem.contentType,
          contentId: selectedItem.contentId,
          ...(reason ? { reason } : {}),
          ...(actionType === 'timeout' ? { durationMs: timeoutDurationMs } : {}),
        })
        showToast(`${actionType} applied.`, { type: 'success' })
        setActionReason('')
        setRequestedCursor(null)
        setOlderItems([])
        setNextCursor(undefined)
        setSelectedKey(null)
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to take action', { type: 'error' })
      } finally {
        setActionLoading(null)
      }
    },
    [actionReason, selectedItem, takeAction, timeoutDurationMs]
  )
  const handlePolicySave = useCallback(async () => {
    if (!policyDraft) return
    const durations = policyDraft.timeoutDurationsMinutes
      .split(/[\s,]+/)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .map((minutes) => Math.round(minutes * 60000))

    if (durations.length === 0) {
      showToast('Add at least one timeout duration in minutes.', { type: 'error' })
      return
    }

    const parseList = (text: string) =>
      text
        .split(/[\n,]+/)
        .map((value) => value.trim())
        .filter(Boolean)

    setPolicySaving(true)
    try {
      await updatePolicy({
        warningWindowDays: policyDraft.warningWindowDays,
        warningThreshold: policyDraft.warningThreshold,
        timeoutDurationsMs: durations,
        banThreshold: policyDraft.banThreshold,
        denylist: parseList(policyDraft.denylist),
        allowlist: parseList(policyDraft.allowlist),
      })
      showToast('Moderation policy updated.', { type: 'success' })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update policy', { type: 'error' })
    } finally {
      setPolicySaving(false)
    }
  }, [policyDraft, updatePolicy])

  const handleServerSave = useCallback(async () => {
    if (!serverDraft) return
    setServerSaving(true)
    try {
      await updateServerSettings({
        slowModeSeconds: serverDraft.slowModeSeconds,
        maxImageMb: serverDraft.maxImageMb,
        maxVideoMb: serverDraft.maxVideoMb,
        retentionDays: serverDraft.retentionDays > 0 ? serverDraft.retentionDays : 0,
        allowedMediaTypes: serverDraft.allowedMediaTypes,
        enabledStickerPackIds: serverDraft.enabledStickerPackIds,
      })
      showToast('Chat server settings updated.', { type: 'success' })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update server settings', { type: 'error' })
    } finally {
      setServerSaving(false)
    }
  }, [serverDraft, updateServerSettings])

  const handleToggleFlag = useCallback(
    async (key: string, enabled: boolean) => {
      setUpdatingFlag(key)
      try {
        await updateFeatureFlag({ key, enabled })
        showToast(`Flag ${key} ${enabled ? 'enabled' : 'disabled'}.`, { type: 'success' })
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to update flag', { type: 'error' })
      } finally {
        setUpdatingFlag(null)
      }
    },
    [updateFeatureFlag]
  )

  const handleSeed = useCallback(async () => {
    setSeeding(true)
    try {
      const result = await seedModerationData({})
      showToast(result.seeded ? 'Seed data added.' : result.reason ?? 'Seed skipped.', {
        type: result.seeded ? 'success' : 'error',
      })
      setRequestedCursor(null)
      setOlderItems([])
      setNextCursor(undefined)
      setSelectedKey(null)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to seed moderation data', { type: 'error' })
    } finally {
      setSeeding(false)
    }
  }, [seedModerationData])
  return (
    <div className="flex flex-col gap-6 p-6 text-white">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Moderation Hub</h2>
        <p className="text-sm text-zinc-400">Review reports, tune policies, and keep chat healthy.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Open Reports" value={stats?.openReports} />
        <StatCard label="Removals (24h)" value={stats?.removalsLast24h} />
        <StatCard label="Active Timeouts" value={stats?.activeTimeouts} />
        <StatCard label="Banned Users" value={stats?.bannedCount} />
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Top Flagged Channels</div>
          <div className="mt-2 space-y-1 text-sm text-zinc-200">
            {topFlaggedChannels.length === 0 && <div className="text-zinc-500">No hot spots</div>}
            {topFlaggedChannels.map((entry) => (
              <div key={String(entry.channelId)} className="flex items-center justify-between">
                <span className="truncate">#{entry.name}</span>
                <span className="text-xs text-zinc-400">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Review Queue</div>
              <div className="text-xs text-zinc-400">Grouped reports across chat and forum.</div>
            </div>
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              className="rounded-full border border-red-600/40 bg-red-600/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-200 transition-colors hover:bg-red-600/20 disabled:opacity-60"
            >
              {seeding ? 'Seeding...' : 'Seed Demo Data'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <FilterSelect label="Status" value={statusFilter} onChange={(value) => setStatusFilter(value as 'open' | 'resolved')}>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </FilterSelect>
            <FilterSelect label="Type" value={typeFilter} onChange={(value) => setTypeFilter(value as ModerationContentType | 'all')}>
              <option value="all">All</option>
              <option value="chat_message">Chat</option>
              <option value="forum_thread">Thread</option>
              <option value="forum_reply">Reply</option>
            </FilterSelect>
            <FilterSelect label="Severity" value={severityFilter} onChange={(value) => setSeverityFilter(value as Severity | 'all')}>
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </FilterSelect>
          </div>

          <div className="flex min-h-[360px] flex-col gap-2 overflow-hidden rounded-xl border border-zinc-800 bg-black/20 p-2">
            {queueItems.length === 0 && (
              <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">No reports match these filters.</div>
            )}
            {queueItems.map((item) => {
              const key = queueKey(item)
              const selected = key === selectedKey
              const channelName = item.channelId ? channelNameMap.get(String(item.channelId)) : undefined
              const topReasons = Object.entries(item.reasons)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  className={`flex flex-col gap-1 rounded-lg border px-3 py-2 text-left transition-colors ${
                    selected ? 'border-red-500/60 bg-red-500/10' : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold capitalize">{item.contentType.replace('_', ' ')}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${severityClasses(item.severity)}`}>
                      {item.severity}
                    </span>
                    {channelName && <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">#{channelName}</span>}
                    <span className="ml-auto text-xs text-zinc-500">{formatTime(item.latestCreatedAt)}</span>
                  </div>
                  <div className="line-clamp-2 text-sm text-zinc-200">{summaryText(item)}</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <span>{item.reportCount} reports</span>
                    {topReasons.map(([reason, count]) => (
                      <span key={reason} className="rounded-full border border-zinc-700 px-2 py-0.5">
                        {reason} ({count})
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}

            {nextCursor && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="mt-1 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:opacity-60"
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          {!selectedItem && <div className="text-sm text-zinc-500">Select a report group to review details.</div>}
          {selectedItem && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-lg font-semibold capitalize">{selectedItem.contentType.replace('_', ' ')}</div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${severityClasses(selectedItem.severity)}`}>
                  {selectedItem.severity}
                </span>
                <span className="text-xs text-zinc-500">{selectedItem.reportCount} reports</span>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/30 p-3 text-sm text-zinc-200">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Content</div>
                <div className="mt-2 whitespace-pre-wrap break-words">{summaryText(selectedItem)}</div>
                {selectedItem.content.moderationStatus === 'removed' && (
                  <div className="mt-2 text-xs uppercase tracking-[0.2em] text-red-300">Already removed</div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-black/20 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Reasons</div>
                  <div className="mt-2 space-y-1 text-sm">
                    {Object.entries(selectedItem.reasons)
                      .sort((a, b) => b[1] - a[1])
                      .map(([reason, count]) => (
                        <div key={reason} className="flex items-center justify-between text-zinc-200">
                          <span>{reason}</span>
                          <span className="text-xs text-zinc-500">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-black/20 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">User Status</div>
                  <div className="mt-2 text-sm text-zinc-200">
                    {userHistory?.status?.isBanned && <div className="text-red-300">Banned</div>}
                    {userHistory?.status?.timeoutUntil && userHistory.status.timeoutUntil > Date.now() && (
                      <div className="text-amber-300">Timed out until {formatTime(userHistory.status.timeoutUntil)}</div>
                    )}
                    {!userHistory?.status?.isBanned &&
                      !(userHistory?.status?.timeoutUntil && userHistory.status.timeoutUntil > Date.now()) && (
                        <div className="text-emerald-300">Active</div>
                      )}
                  </div>
                  {userHistory?.summary && (
                    <div className="mt-2 text-xs text-zinc-400">
                      {userHistory.summary.warnings}/{userHistory.summary.warningThreshold} warnings in the last{' '}
                      {userHistory.summary.warningWindowDays} days
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-black/20 p-3">
                <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">Action Reason (optional)</label>
                <textarea
                  value={actionReason}
                  onChange={(event) => setActionReason(event.target.value)}
                  rows={3}
                  placeholder="Add context for the audit log"
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                />
                {timeoutOptions.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <span className="uppercase tracking-[0.2em] text-zinc-500">Timeout</span>
                    <select
                      value={timeoutDurationMs}
                      onChange={(event) => setTimeoutDurationMs(Number(event.target.value))}
                      className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-white focus:border-red-600 focus:outline-none"
                    >
                      {timeoutOptions.map((option) => (
                        <option key={option.ms} value={option.ms}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton label="Dismiss" onClick={() => handleAction('dismiss')} loading={actionLoading === 'dismiss'} />
                <ActionButton label="Warn" onClick={() => handleAction('warn')} loading={actionLoading === 'warn'} />
                <ActionButton label="Remove" onClick={() => handleAction('remove')} loading={actionLoading === 'remove'} tone="danger" />
                <ActionButton label="Timeout" onClick={() => handleAction('timeout')} loading={actionLoading === 'timeout'} tone="warning" />
                <div className="col-span-2">
                  <ActionButton label="Ban User" onClick={() => handleAction('ban')} loading={actionLoading === 'ban'} tone="danger" fullWidth />
                </div>
              </div>

              {userHistory?.actions?.length ? (
                <div className="rounded-xl border border-zinc-800 bg-black/20 p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Recent Actions</div>
                  <div className="mt-2 space-y-1 text-sm">
                    {userHistory.actions.slice(0, 6).map((action: Doc<'moderationActions'>) => (
                      <div key={action._id} className="flex items-center justify-between text-zinc-200">
                        <span className="capitalize">{action.actionType}</span>
                        <span className="text-xs text-zinc-500">{formatTime(action.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Moderation Policy</div>
            <div className="text-xs text-zinc-400">Escalation rules and word lists.</div>
          </div>
          {policyDraft && (
            <div className="grid grid-cols-1 gap-2">
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Warning Window (days)
                <input
                  type="number"
                  min={1}
                  value={policyDraft.warningWindowDays}
                  onChange={(event) =>
                    setPolicyDraft((prev) => (prev ? { ...prev, warningWindowDays: Number(event.target.value) || 0 } : prev))
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-white focus:border-red-600 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Warning Threshold
                <input
                  type="number"
                  min={1}
                  value={policyDraft.warningThreshold}
                  onChange={(event) =>
                    setPolicyDraft((prev) => (prev ? { ...prev, warningThreshold: Number(event.target.value) || 0 } : prev))
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-white focus:border-red-600 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Ban Threshold
                <input
                  type="number"
                  min={1}
                  value={policyDraft.banThreshold}
                  onChange={(event) =>
                    setPolicyDraft((prev) => (prev ? { ...prev, banThreshold: Number(event.target.value) || 0 } : prev))
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-white focus:border-red-600 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Timeout Durations (minutes)
                <input
                  type="text"
                  value={policyDraft.timeoutDurationsMinutes}
                  onChange={(event) =>
                    setPolicyDraft((prev) => (prev ? { ...prev, timeoutDurationsMinutes: event.target.value } : prev))
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-white focus:border-red-600 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Denylist
                <textarea
                  rows={3}
                  value={policyDraft.denylist}
                  onChange={(event) => setPolicyDraft((prev) => (prev ? { ...prev, denylist: event.target.value } : prev))}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Allowlist
                <textarea
                  rows={3}
                  value={policyDraft.allowlist}
                  onChange={(event) =>
                    setPolicyDraft((prev) => (prev ? { ...prev, allowlist: event.target.value } : prev))
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-white placeholder:text-zinc-600 focus:border-red-600 focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={handlePolicySave}
                disabled={policySaving}
                className="mt-1 rounded-lg border border-red-600/50 bg-red-600/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-200 transition-colors hover:bg-red-600/20 disabled:opacity-60"
              >
                {policySaving ? 'Saving...' : 'Save Policy'}
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Chat Server Settings</div>
            <div className="text-xs text-zinc-400">Slow mode, limits, and pack enablement.</div>
          </div>
          {serverDraft && (
            <div className="flex flex-col gap-2">
              <FilterSelect
                label="Slow Mode"
                value={serverDraft.slowModeSeconds}
                onChange={(value) =>
                  setServerDraft((prev) => (prev ? { ...prev, slowModeSeconds: Number(value) } : prev))
                }
              >
                <option value={0}>Off</option>
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
              </FilterSelect>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Max Image (MB)
                <input
                  type="number"
                  min={1}
                  value={serverDraft.maxImageMb}
                  onChange={(event) =>
                    setServerDraft((prev) => (prev ? { ...prev, maxImageMb: Number(event.target.value) || 0 } : prev))
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-white focus:border-red-600 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Max Video (MB)
                <input
                  type="number"
                  min={1}
                  value={serverDraft.maxVideoMb}
                  onChange={(event) =>
                    setServerDraft((prev) => (prev ? { ...prev, maxVideoMb: Number(event.target.value) || 0 } : prev))
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-white focus:border-red-600 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Retention (days, 0 = off)
                <input
                  type="number"
                  min={0}
                  value={serverDraft.retentionDays}
                  onChange={(event) =>
                    setServerDraft((prev) => (prev ? { ...prev, retentionDays: Number(event.target.value) || 0 } : prev))
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-white focus:border-red-600 focus:outline-none"
                />
              </label>

              <div className="rounded-lg border border-zinc-800 bg-black/20 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Allowed Media Types</div>
                <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-zinc-200">
                  {SUPPORTED_MEDIA_TYPES.map((type) => {
                    const checked = serverDraft.allowedMediaTypes.includes(type)
                    return (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setServerDraft((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    allowedMediaTypes: event.target.checked
                                      ? [...prev.allowedMediaTypes, type]
                                      : prev.allowedMediaTypes.filter((item) => item !== type),
                                  }
                                : prev
                            )
                          }
                        />
                        <span>{type}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-black/20 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Enabled Sticker Packs</div>
                <div className="mt-2 flex flex-col gap-1 text-sm text-zinc-200">
                  {(stickerPacks ?? []).map((pack) => {
                    const checked = serverDraft.enabledStickerPackIds.some((id) => id === pack._id)
                    return (
                      <label key={pack._id} className={`flex items-center justify-between gap-2 ${pack.isActive ? '' : 'opacity-60'}`}>
                        <span className="truncate">
                          {pack.name} <span className="text-xs text-zinc-500">({pack.stickerCount})</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!pack.isActive}
                          onChange={(event) =>
                            setServerDraft((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    enabledStickerPackIds: event.target.checked
                                      ? [...prev.enabledStickerPackIds, pack._id]
                                      : prev.enabledStickerPackIds.filter((id) => id !== pack._id),
                                  }
                                : prev
                            )
                          }
                        />
                      </label>
                    )
                  })}
                  {(stickerPacks ?? []).length === 0 && <div className="text-zinc-500">No sticker packs yet.</div>}
                </div>
              </div>
              <button
                type="button"
                onClick={handleServerSave}
                disabled={serverSaving}
                className="rounded-lg border border-red-600/50 bg-red-600/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-200 transition-colors hover:bg-red-600/20 disabled:opacity-60"
              >
                {serverSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Feature Flags</div>
            <div className="text-xs text-zinc-400">Admin-only toggles wired to live data.</div>
          </div>
          <div className="flex flex-col gap-2">
            {featureFlags && Object.keys(featureFlags).length === 0 && (
              <div className="text-sm text-zinc-500">No flags configured yet.</div>
            )}
            {featureFlags &&
              Object.entries(featureFlags).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/20 px-3 py-2">
                  <div className="text-sm font-medium text-zinc-200">{key}</div>
                  <button
                    type="button"
                    onClick={() => handleToggleFlag(key, !enabled)}
                    disabled={updatingFlag === key}
                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                      enabled ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200' : 'border-zinc-600 text-zinc-300'
                    } disabled:opacity-60`}
                  >
                    {updatingFlag === key ? 'Updating...' : enabled ? 'On' : 'Off'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
function StatCard({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value ?? '-'}</div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-white focus:border-red-600 focus:outline-none"
      >
        {children}
      </select>
    </label>
  )
}

function ActionButton({
  label,
  onClick,
  loading,
  tone = 'default',
  fullWidth = false,
}: {
  label: string
  onClick: () => void
  loading: boolean
  tone?: 'default' | 'warning' | 'danger'
  fullWidth?: boolean
}) {
  const toneClasses =
    tone === 'danger'
      ? 'border-red-600/60 bg-red-600/10 text-red-200 hover:bg-red-600/20'
      : tone === 'warning'
        ? 'border-amber-500/60 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
        : 'border-zinc-600 bg-zinc-900 text-zinc-200 hover:border-zinc-400 hover:text-white'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`${fullWidth ? 'w-full' : 'w-full'} rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors disabled:opacity-60 ${toneClasses}`}
    >
      {loading ? 'Working...' : label}
    </button>
  )
}
