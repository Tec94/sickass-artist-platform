import { useState } from 'react'
import type { EventDetail, UserTicket } from '../types/events'
import { generateICS, downloadICS } from '../utils/icsGenerator'
import { openGoogleCalendar } from '../utils/googleCalendarLink'

interface CalendarExportModalProps {
  isOpen: boolean
  onClose: () => void
  event: EventDetail | UserTicket['event']
  confirmationCode?: string
}

export function CalendarExportModal({
  isOpen,
  onClose,
  event,
  confirmationCode,
}: CalendarExportModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) return null

  const handleICSDownload = () => {
    setError(null)
    setIsExporting(true)

    try {
      const icsContent = generateICS(event, confirmationCode)
      const filename = `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-event`
      downloadICS(icsContent, filename)
    } catch (err) {
      console.error('Failed to generate ICS file:', err)
      setError('Export failed. Try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleGoogleCalendar = () => {
    setError(null)
    setIsExporting(true)

    try {
      openGoogleCalendar(event, confirmationCode)
      // Close modal after a short delay to allow the new tab to open
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (err) {
      console.error('Failed to open Google Calendar:', err)
      setError('Export failed. Try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content calendar-export-modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Export to Calendar</h2>
          <button
            onClick={onClose}
            className="modal-close-button"
            aria-label="Close modal"
          >
            <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
          </button>
        </div>

        {/* Event Info */}
        <div className="event-info-preview">
          <h3 className="event-title">{event.title}</h3>
          <div className="event-details">
            <div className="detail-item">
              <iconify-icon icon="solar:calendar-bold" class="detail-icon"></iconify-icon>
              <span>{new Date(event.startAtUtc).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <iconify-icon icon="solar:clock-circle-bold" class="detail-icon"></iconify-icon>
              <span>{new Date(event.startAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="detail-item">
              <iconify-icon icon="solar:map-point-bold" class="detail-icon"></iconify-icon>
              <span>{event.city}</span>
            </div>
          </div>
          {confirmationCode && (
            <div className="confirmation-code">
              <span className="confirmation-label">Confirmation:</span>
              <code className="confirmation-value">{confirmationCode}</code>
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="export-options">
          <button
            onClick={handleICSDownload}
            disabled={isExporting}
            className="export-button ics-button"
          >
            <iconify-icon icon="solar:download-bold" class="button-icon"></iconify-icon>
            <div className="button-content">
              <span className="button-title">Download ICS File</span>
              <span className="button-description">
                Import to any calendar app (Apple Calendar, Outlook, etc.)
              </span>
            </div>
          </button>

          <button
            onClick={handleGoogleCalendar}
            disabled={isExporting}
            className="export-button google-button"
          >
            <iconify-icon icon="logos:google-icon" class="button-icon"></iconify-icon>
            <div className="button-content">
              <span className="button-title">Add to Google Calendar</span>
              <span className="button-description">
                Opens Google Calendar with event pre-filled
              </span>
            </div>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <iconify-icon icon="solar:danger-triangle-bold"></iconify-icon>
            <span>{error}</span>
          </div>
        )}

        <style>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
            backdrop-filter: blur(4px);
          }

          .calendar-export-modal {
            background: var(--color-card-bg);
            border: 1px solid var(--color-card-border);
            border-radius: 16px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: modalSlideIn 0.3s ease;
          }

          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 24px 16px;
            border-bottom: 1px solid var(--color-card-border);
          }

          .modal-title {
            font-size: 20px;
            font-weight: 700;
            color: white;
            margin: 0;
          }

          .modal-close-button {
            background: none;
            border: none;
            color: var(--color-text-dim);
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
          }

          .modal-close-button:hover {
            color: white;
          }

          .event-info-preview {
            padding: 20px 24px;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid var(--color-card-border);
          }

          .event-title {
            font-size: 16px;
            font-weight: 700;
            color: white;
            margin: 0 0 12px 0;
          }

          .event-details {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .detail-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--color-text-dim);
          }

          .detail-icon {
            color: var(--color-primary);
            font-size: 16px;
          }

          .confirmation-code {
            margin-top: 12px;
            padding: 12px;
            background: rgba(6, 182, 212, 0.1);
            border: 1px solid var(--color-primary);
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
          }

          .confirmation-label {
            color: var(--color-text-dim);
          }

          .confirmation-value {
            color: var(--color-primary);
            font-weight: 700;
            font-family: 'Courier New', monospace;
          }

          .export-options {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .export-button {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--color-card-border);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }

          .export-button:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.08);
            border-color: var(--color-primary);
            transform: translateY(-2px);
          }

          .export-button:active:not(:disabled) {
            transform: translateY(0);
          }

          .export-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .button-icon {
            font-size: 32px;
            flex-shrink: 0;
          }

          .ics-button .button-icon {
            color: var(--color-primary);
          }

          .button-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
          }

          .button-title {
            font-size: 16px;
            font-weight: 700;
            color: white;
          }

          .button-description {
            font-size: 12px;
            color: var(--color-text-dim);
            line-height: 1.4;
          }

          .error-message {
            margin: 0 24px 24px;
            padding: 12px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgb(239, 68, 68);
            border-radius: 8px;
            color: rgb(239, 68, 68);
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .error-message iconify-icon {
            font-size: 20px;
            flex-shrink: 0;
          }

          @media (max-width: 640px) {
            .calendar-export-modal {
              max-width: 100%;
              margin: 0 10px;
            }

            .modal-header {
              padding: 20px 20px 12px;
            }

            .event-info-preview {
              padding: 16px 20px;
            }

            .export-options {
              padding: 20px;
            }

            .export-button {
              padding: 14px;
              gap: 12px;
            }

            .button-icon {
              font-size: 28px;
            }

            .button-title {
              font-size: 15px;
            }

            .button-description {
              font-size: 11px;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
