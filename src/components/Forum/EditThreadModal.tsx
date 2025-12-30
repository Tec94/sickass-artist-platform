import { useState, useEffect } from 'react'
import { useEditThread } from '../../hooks/useEditThread'
import type { Doc } from '../../../convex/_generated/dataModel'

interface EditThreadModalProps {
  thread: Doc<'threads'>
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EditThreadModal({ thread, isOpen, onClose, onSuccess }: EditThreadModalProps) {
  const [title, setTitle] = useState(thread.title)
  const [content, setContent] = useState(thread.content)
  const [showError, setShowError] = useState(false)

  const { handleEditThread, isLoading, error } = useEditThread({
    threadId: thread._id,
    initialTitle: thread.title,
    initialContent: thread.content,
  })

  useEffect(() => {
    if (isOpen) {
      setTitle(thread.title)
      setContent(thread.content)
      setShowError(false)
    }
  }, [isOpen, thread.title, thread.content])

  useEffect(() => {
    if (error) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleSubmit = async () => {
    const result = await handleEditThread(title, content)
    if (result) {
      onSuccess?.()
      onClose()
    }
  }

  const handleCancel = () => {
    setTitle(thread.title)
    setContent(thread.content)
    setShowError(false)
    onClose()
  }

  const titleCount = title.length
  const contentCount = content.length
  const titleNearLimit = titleCount > 180
  const titleOverLimit = titleCount > 200
  const contentNearLimit = contentCount > 9000
  const contentOverLimit = contentCount > 10000
  const hasChanges = title.trim() !== thread.title || content.trim() !== thread.content

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Edit Thread</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 bg-gray-800 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                titleOverLimit
                  ? 'border-red-500 focus:ring-red-500'
                  : titleNearLimit
                  ? 'border-yellow-500 focus:ring-yellow-500'
                  : 'border-gray-700 focus:ring-blue-500'
              }`}
              maxLength={200}
              placeholder="Thread title..."
            />
            <div className={`text-right text-sm mt-1 ${
              titleOverLimit ? 'text-red-400' : titleNearLimit ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {titleCount} / 200
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full px-3 py-2 bg-gray-800 text-white border rounded-lg resize-none focus:outline-none focus:ring-2 ${
                contentOverLimit
                  ? 'border-red-500 focus:ring-red-500'
                  : contentNearLimit
                  ? 'border-yellow-500 focus:ring-yellow-500'
                  : 'border-gray-700 focus:ring-blue-500'
              }`}
              rows={12}
              maxLength={10000}
              placeholder="Edit your thread content..."
            />
            <div className={`text-right text-sm mt-1 ${
              contentOverLimit ? 'text-red-400' : contentNearLimit ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {contentCount} / 10000
            </div>
          </div>
        </div>

        {showError && error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || titleOverLimit || contentOverLimit || !hasChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}