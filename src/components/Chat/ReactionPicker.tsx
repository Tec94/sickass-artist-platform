import { useRef, useEffect } from 'react'

interface ReactionPickerProps {
  onReact: (emoji: string) => void
  currentReactions: string[]
}

// Common emojis for reactions
const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '🙏']

export function ReactionPicker({ onReact, currentReactions }: ReactionPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        // Close logic would go here - in this case, the parent component controls visibility
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleEmojiClick = (emoji: string) => {
    onReact(emoji)
  }

  return (
    <div ref={pickerRef} className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-64">
      <div className="grid grid-cols-4 gap-3">
        {commonEmojis.map((emoji) => {
          const isSelected = currentReactions.includes(emoji)
          return (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className={`flex items-center justify-center w-12 h-12 rounded-lg text-2xl hover:bg-gray-700 transition-colors relative ${
                isSelected ? 'ring-2 ring-cyan-500' : ''
              }`}
            >
              <span>{emoji}</span>
              {isSelected && (
                <span className="absolute -top-1 -right-1 text-xs bg-cyan-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}