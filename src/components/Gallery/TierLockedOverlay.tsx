import { memo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GalleryContentItem } from '../../types/gallery'
import { FanTier } from '../../types/gallery'

interface TierLockedOverlayProps {
  item: GalleryContentItem
  onClose: () => void
}

const tierColors: Record<FanTier, string> = {
  bronze: 'text-amber-500',
  silver: 'text-gray-400',
  gold: 'text-yellow-500',
  platinum: 'text-cyan-500',
}

export const TierLockedOverlay = memo(function TierLockedOverlay({
  item,
  onClose,
}: TierLockedOverlayProps) {
  const tier = item.requiredFanTier
  const navigate = useNavigate()
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  if (!tier) {
    onClose()
    return null
  }

  const tierColor = tierColors[tier]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 relative border border-gray-700"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-title"
        aria-describedby="lock-description"
      >
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-800 rounded transition-colors"
          aria-label="Close"
        >
          <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
        </button>

        <div className="text-center">
          <iconify-icon icon="solar:lock-password-linear" width="64" height="64" class={`mx-auto mb-4 ${tierColor}`}></iconify-icon>
          <h2 id="lock-title" className="text-xl font-bold mb-2 text-white">
            This Content Requires
          </h2>
          <p className={`text-2xl font-bold mb-6 uppercase ${tierColor}`}>
            {tier} Tier
          </p>
          <p id="lock-description" className="text-gray-400 mb-8">
            Upgrade your membership to access exclusive content
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/billing')}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Upgrade Now
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
