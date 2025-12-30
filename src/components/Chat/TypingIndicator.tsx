import type { TypingUser } from '../../types/chat'

interface TypingIndicatorProps {
  typingUsers: TypingUser[]
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  // Format typing text based on number of users
  let typingText = ''
  if (typingUsers.length === 1) {
    typingText = `${typingUsers[0].displayName} is typing`
  } else if (typingUsers.length === 2) {
    typingText = `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing`
  } else if (typingUsers.length === 3) {
    typingText = `${typingUsers[0].displayName}, ${typingUsers[1].displayName}, and ${typingUsers[2].displayName} are typing`
  } else {
    typingText = `${typingUsers[0].displayName}, ${typingUsers[1].displayName}, and ${typingUsers.length - 2} others are typing`
  }

  return (
    <div className="flex items-center gap-1 text-gray-400 text-sm">
      <span>{typingText}</span>
      <span className="typing-dots">
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </span>

      <style>{`
        .typing-dots {
          display: inline-flex;
          gap: 1px;
        }
        
        .dot {
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.2; }
          30% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}