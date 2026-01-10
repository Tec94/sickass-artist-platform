import { useOfflineQueue } from '../hooks/useOfflineQueue'
import '../styles/offline-indicator.css'

export const OfflineIndicator = () => {
  const { isOnline, queuedCount } = useOfflineQueue()

  if (isOnline && queuedCount === 0) return null

  return (
    <div className={`offline-indicator ${isOnline ? 'syncing' : 'offline'}`}>
      <div className="indicator-content">
        <iconify-icon
          icon={isOnline ? 'solar:refresh-linear' : 'solar:wifi-off-linear'}
          className={isOnline ? 'spinning' : ''}
        />
        <span>
          {isOnline
            ? queuedCount > 0
              ? `Syncing ${queuedCount} ${queuedCount === 1 ? 'change' : 'changes'}...`
              : 'Changes synced!'
            : `Offline – ${queuedCount} ${queuedCount === 1 ? 'change' : 'changes'} queued`}
        </span>
      </div>

      {queuedCount > 0 && <div className="queue-badge">{queuedCount}</div>}
    </div>
  )
}
