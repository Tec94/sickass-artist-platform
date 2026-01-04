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
    <div ref={pickerRef} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 w-64">
      <div className="grid grid-cols-4 gap-3">
        {commonEmojis.map((emoji) => {
          const isSelected = currentReactions.includes(emoji)
          return (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className={`flex items-center justify-center w-12 h-12 rounded-lg text-2xl hover:bg-[#1a1a1a] transition-colors relative ${
                isSelected ? 'ring-2 ring-[#c41e3a]' : ''
              }`}
            >
              <span>{emoji}</span>
              {isSelected && (
                <span className="absolute -top-1 -right-1 text-xs bg-[#c41e3a] text-white rounded-full w-4 h-4 flex items-center justify-center">
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