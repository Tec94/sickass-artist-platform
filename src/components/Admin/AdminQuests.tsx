import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { useAuth } from '../../hooks/useAuth'
import { showToast } from '../../lib/toast'

type QuestType = 'daily' | 'weekly' | 'milestone' | 'seasonal' | 'challenge'
type QuestCategory = 'social' | 'creation' | 'commerce' | 'events' | 'engagement' | 'streak'
type ProgressType = 'single' | 'cumulative'

const toLocalInputValue = (timestamp: number) => {
  const d = new Date(timestamp)
  const offsetMs = d.getTimezoneOffset() * 60000
  return new Date(timestamp - offsetMs).toISOString().slice(0, 16)
}

const buildDefaultDates = () => {
  const now = Date.now()
  const yearFromNow = now + 365 * 24 * 60 * 60 * 1000
  return {
    startsAt: toLocalInputValue(now),
    endsAt: toLocalInputValue(yearFromNow),
  }
}

const baseFormState = () => ({
  questId: '',
  name: '',
  description: '',
  icon: '🔥',
  type: 'daily' as QuestType,
  category: 'social' as QuestCategory,
  rewardPoints: 10,
  targetValue: 1,
  progressType: 'single' as ProgressType,
  priority: 1,
  isActive: true,
  ...buildDefaultDates(),
})

export const AdminQuests = () => {
  const { user } = useAuth()
  const quests = useQuery(api.quests.getAllQuests, {})
  const createQuest = useMutation(api.quests.createQuest)
  const assignQuestToSelf = useMutation(api.quests.assignQuestToSelf)

  const [formData, setFormData] = useState(baseFormState)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null)

  const sortedQuests = useMemo(() => {
    if (!quests) return []
    return [...quests].sort((a, b) => a.priority - b.priority)
  }, [quests])

  if (!user || user.role !== 'admin') {
    return <div className="text-zinc-500 p-8">Admin access required</div>
  }

  const resetForm = () => {
    setFormData(baseFormState())
    setEditingQuestId(null)
    setIsCreating(false)
  }

  const handleSave = async () => {
    if (!formData.questId.trim() || !formData.name.trim()) {
      showToast('Quest ID and name are required.', { type: 'error' })
      return
    }

    const startsAt = Date.parse(formData.startsAt)
    const endsAt = Date.parse(formData.endsAt)
    if (Number.isNaN(startsAt) || Number.isNaN(endsAt) || endsAt <= startsAt) {
      showToast('Please provide a valid date range.', { type: 'error' })
      return
    }

    setIsSaving(true)
    try {
      await createQuest({
        questId: formData.questId.trim(),
        type: formData.type,
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon.trim() || '🔥',
        rewardPoints: Number(formData.rewardPoints),
        targetValue: Number(formData.targetValue),
        progressType: formData.progressType,
        category: formData.category,
        isActive: formData.isActive,
        startsAt,
        endsAt,
        priority: Number(formData.priority),
      })

      showToast(editingQuestId ? 'Quest updated.' : 'Quest created.', { type: 'success' })
      resetForm()
    } catch (error) {
      console.error('Failed to save quest:', error)
      showToast(
        error instanceof Error ? error.message : 'Failed to save quest.',
        { type: 'error' }
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (quest: any) => {
    setFormData({
      questId: quest.questId,
      name: quest.name,
      description: quest.description,
      icon: quest.icon || '🔥',
      type: quest.type,
      category: quest.category,
      rewardPoints: quest.rewardPoints,
      targetValue: quest.targetValue,
      progressType: quest.progressType,
      priority: quest.priority ?? 1,
      isActive: quest.isActive,
      startsAt: toLocalInputValue(quest.startsAt),
      endsAt: toLocalInputValue(quest.endsAt),
    })
    setEditingQuestId(quest.questId)
    setIsCreating(true)
  }

  const handleToggleActive = async (quest: any) => {
    setIsSaving(true)
    try {
      await createQuest({
        questId: quest.questId,
        type: quest.type,
        name: quest.name,
        description: quest.description,
        icon: quest.icon || '🔥',
        rewardPoints: quest.rewardPoints,
        targetValue: quest.targetValue,
        progressType: quest.progressType,
        category: quest.category,
        isActive: !quest.isActive,
        startsAt: quest.startsAt,
        endsAt: quest.endsAt,
        priority: quest.priority ?? 1,
      })
      showToast(`Quest ${!quest.isActive ? 'activated' : 'paused'}.`, { type: 'success' })
    } catch (error) {
      console.error('Failed to toggle quest:', error)
      showToast(
        error instanceof Error ? error.message : 'Failed to update quest.',
        { type: 'error' }
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleAssignToSelf = async (questId: Id<'quests'>) => {
    try {
      const result = await assignQuestToSelf({ questId })
      if (result.alreadyAssigned) {
        showToast('Quest already assigned to you.', { type: 'info' })
      } else {
        showToast('Quest assigned to your profile.', { type: 'success' })
      }
    } catch (error) {
      console.error('Failed to assign quest:', error)
      showToast(
        error instanceof Error ? error.message : 'Failed to assign quest.',
        { type: 'error' }
      )
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Quests</h1>
          <p className="text-zinc-500 text-sm">Create, update, and assign quest content.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded font-semibold hover:shadow-lg"
        >
          {isCreating ? 'Close' : 'Create Quest'}
        </button>
      </div>

      {isCreating && (
        <div className="bg-zinc-900/60 p-6 rounded-lg border border-red-600/40 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingQuestId ? 'Edit Quest' : 'New Quest'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Quest ID (daily_login_001)"
              className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
              value={formData.questId}
              onChange={(e) => setFormData({ ...formData, questId: e.target.value })}
            />
            <input
              type="text"
              placeholder="Quest name"
              className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description"
              className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700 md:col-span-2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <input
              type="text"
              placeholder="Icon (emoji or URL)"
              className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />
            <select
              className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as QuestType })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="milestone">Milestone</option>
              <option value="seasonal">Seasonal</option>
              <option value="challenge">Challenge</option>
            </select>
            <select
              className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as QuestCategory })}
            >
              <option value="social">Social</option>
              <option value="creation">Creation</option>
              <option value="commerce">Commerce</option>
              <option value="events">Events</option>
              <option value="engagement">Engagement</option>
              <option value="streak">Streak</option>
            </select>
            <select
              className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
              value={formData.progressType}
              onChange={(e) => setFormData({ ...formData, progressType: e.target.value as ProgressType })}
            >
              <option value="single">Single</option>
              <option value="cumulative">Cumulative</option>
            </select>
            <input
              type="number"
              placeholder="Reward points"
              className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
              value={formData.rewardPoints}
              onChange={(e) => setFormData({ ...formData, rewardPoints: Number(e.target.value) })}
            />
            <input
              type="number"
              placeholder="Target value"
              className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
            />
            <input
              type="number"
              placeholder="Priority"
              className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
            />
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active
            </div>
            <input
              type="datetime-local"
              className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
              value={formData.startsAt}
              onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
            />
            <input
              type="datetime-local"
              className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
              value={formData.endsAt}
              onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : editingQuestId ? 'Update Quest' : 'Save Quest'}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-zinc-800 text-white rounded border border-zinc-700 hover:border-zinc-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {!quests && <div className="text-zinc-500">Loading quests...</div>}
        {quests && sortedQuests.length === 0 && (
          <div className="text-zinc-500">No quests found. Create one to get started.</div>
        )}
        {sortedQuests.map((quest: any) => (
          <div
            key={quest._id}
            className="bg-zinc-900 border border-zinc-800 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-lg"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-bold">{quest.name}</h3>
                <span className="text-[10px] uppercase px-2 rounded bg-zinc-800 text-zinc-300">
                  {quest.type}
                </span>
                {!quest.isActive && (
                  <span className="text-[10px] uppercase px-2 rounded bg-red-900/40 text-red-300">
                    paused
                  </span>
                )}
              </div>
              <p className="text-zinc-500 text-sm">{quest.description}</p>
              <p className="text-[11px] text-zinc-600 mt-2">
                ID: {quest.questId} · {quest.category} · Target {quest.targetValue}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-yellow-500 font-bold">{quest.rewardPoints} PTS</span>
              <button
                onClick={() => handleAssignToSelf(quest._id)}
                className="px-3 py-1 text-xs rounded border border-zinc-700 text-zinc-200 hover:border-zinc-500"
              >
                Assign to Me
              </button>
              <button
                onClick={() => handleEdit(quest)}
                className="px-3 py-1 text-xs rounded border border-zinc-700 text-zinc-200 hover:border-zinc-500"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(quest)}
                className="px-3 py-1 text-xs rounded border border-zinc-700 text-zinc-200 hover:border-zinc-500"
              >
                {quest.isActive ? 'Pause' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
