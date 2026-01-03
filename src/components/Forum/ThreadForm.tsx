import { useMemo, useState } from 'react'
import type { Category, Id } from '../../types/forum'

interface ThreadFormInitialData {
  title: string
  content: string
  tags: string[]
}

interface ThreadFormProps {
  categories: Category[]
  initialCategoryId: Id<'categories'> | null
  onSubmit: (categoryId: Id<'categories'>, title: string, content: string, tags: string[]) => Promise<void>
  onCancel: () => void
  initialData?: ThreadFormInitialData
}

const parseTags = (value: string): string[] => {
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t, idx, arr) => arr.indexOf(t) === idx)
}

export function ThreadForm({ categories, initialCategoryId, onSubmit, onCancel, initialData }: ThreadFormProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<'categories'> | null>(
    initialCategoryId ?? (categories.length > 0 ? categories[0]._id : null)
  )
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [tagsInput, setTagsInput] = useState((initialData?.tags ?? []).join(', '))
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const tags = useMemo(() => parseTags(tagsInput), [tagsInput])

  const isEditMode = Boolean(initialData)

  const validate = (): string | null => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!selectedCategoryId) return 'Please select a category'

    if (!trimmedTitle) return 'Title cannot be empty'
    if (trimmedTitle.length > 200) return 'Title must be 200 characters or less'

    if (!trimmedContent) return 'Content cannot be empty'
    if (trimmedContent.length > 10000) return 'Content must be 10000 characters or less'

    for (const tag of tags) {
      if (tag.length > 20) return 'Each tag must be 20 characters or less'
    }

    return null
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!selectedCategoryId) return

    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(selectedCategoryId, title.trim(), content.trim(), tags)
    } catch (err) {
      setError((err as Error).message)
      return
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={isEditMode ? 'Edit thread' : 'Create thread'}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl mx-4 rounded-2xl border border-gray-700 bg-gray-900/90 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-white font-bold text-xl">
            {isEditMode ? 'Edit Thread' : 'Create Thread'}
          </h2>
          <p className="text-gray-400 text-sm">Share your thoughts with the community</p>
        </div>

        <div className="p-5 space-y-4">
          {!isEditMode && (
            <div>
              <label className="block text-gray-200 text-sm font-semibold mb-1">Category</label>
              <select
                value={selectedCategoryId ?? ''}
                onChange={(e) => setSelectedCategoryId(e.target.value as Id<'categories'>)}
                className="w-full rounded-xl border border-gray-700 bg-gray-900/30 text-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
              >
                {categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <div>
            <label className="block text-gray-200 text-sm font-semibold mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Thread title"
              className="w-full rounded-xl border border-gray-700 bg-gray-900/30 text-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
            />
            <div className="mt-1 text-xs text-gray-400 flex justify-end">{title.length}/200</div>
          </div>

          <div>
            <label className="block text-gray-200 text-sm font-semibold mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              maxLength={10000}
              placeholder="Write your thread content..."
              className="w-full rounded-xl border border-gray-700 bg-gray-900/30 text-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
            />
            <div className="mt-1 text-xs text-gray-400 flex justify-end">{content.length}/10000</div>
          </div>

          <div>
            <label className="block text-gray-200 text-sm font-semibold mb-1">Tags</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="comma,separated,tags"
              className="w-full rounded-xl border border-gray-700 bg-gray-900/30 text-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={
                    `text-xs px-2 py-1 rounded-full border ` +
                    `${tag.length > 20 ? 'border-red-600/40 bg-red-600/10 text-red-200' : 'border-gray-700 bg-gray-900/30 text-gray-200'}`
                  }
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-400">Each tag max 20 characters</p>
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>

        <div className="p-5 border-t border-gray-700 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-700 bg-gray-900/30 text-gray-200 hover:bg-gray-800/50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={
              `px-4 py-2 rounded-xl font-semibold border transition-colors ` +
              `${isSubmitting ? 'cursor-not-allowed opacity-60 border-gray-700 bg-gray-800/40 text-gray-300' : 'border-cyan-500/60 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30'}`
            }
          >
            {isEditMode ? 'Save Changes' : 'Create Thread'}
          </button>
        </div>
      </div>
    </div>
  )
}
