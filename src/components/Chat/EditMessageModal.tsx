import { useState, useEffect } from 'react'
import { useEditMessage } from '../../hooks/useEditMessage'
import type { Doc } from '../../../convex/_generated/dataModel'

interface EditMessageModalProps {
  message: Doc<'messages'>
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EditMessageModal({ message, isOpen, onClose, onSuccess }: EditMessageModalProps) {
  const [content, setContent] = useState(message.content)
  const [showError, setShowError] = useState(false)

  const { handleEditMessage, isLoading, error } = useEditMessage({
    messageId: message._id,
    initialContent: message.content,
  })

  useEffect(() => {
    if (isOpen) {
      setContent(message.content)
      setShowError(false)
    }
  }, [isOpen, message.content])

  useEffect(() => {
    if (error) {
      setShowError(true)
      const timer = setTimeout(() => setShowError(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleSubmit = async () => {
    const result = await handleEditMessage(content)
    if (result) {
      onSuccess?.()
      onClose()
    }
  }

  const handleCancel = () => {
    setContent(message.content)
    setShowError(false)
    onClose()
  }

  const charCount = content.length
  const isNearLimit = charCount > 4500
  const isOverLimit = charCount > 5000

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Edit Message</h2>
        
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full px-3 py-2 bg-gray-800 text-white border rounded-lg resize-none focus:outline-none focus:ring-2 ${
              isOverLimit
                ? 'border-red-500 focus:ring-red-500'
                : isNearLimit
                ? 'border-yellow-500 focus:ring-yellow-500'
                : 'border-gray-700 focus:ring-blue-500'
            }`}
            rows={6}
            maxLength={5000}
            placeholder="Edit your message..."
            autoFocus
          />
          
          <div className={`text-right text-sm mt-1 ${
            isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {charCount} / 5000
          </div>
        </div>

        {showError && error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || isOverLimit || content.trim() === message.content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}