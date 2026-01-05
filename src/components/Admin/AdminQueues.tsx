import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle,
  Play,
  FastForward,
  RotateCcw,
  Trash2,
  RefreshCw,
  Calendar,
  AlertCircle,
  Wifi,
  WifiOff,
  Activity
} from 'lucide-react'
import { showToast } from '../../lib/toast'

interface QueueStats {
  waiting: number
  admitted: number
  expired: number
  total: number
}

export function AdminQueues() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Fetch events for dropdown
  const eventsData = useQuery(api.events.getEvents, { 
    page: 0, 
    pageSize: 50, 
    sortBy: 'asc' 
  })

  // Placeholder queue stats - would come from a queue query
  const queueStats: QueueStats = {
    waiting: 0,
    admitted: 0,
    expired: 0,
    total: 0
  }

  const handleAdmitNext = (count: number) => {
    if (!selectedEventId) {
      showToast('Select an event first', { type: 'error' })
      return
    }
    // TODO: Call mutation when backend is ready
    showToast(`Admitted ${count} user(s)`, { type: 'success' })
  }

  const handleExpireAll = () => {
    if (!selectedEventId) return
    if (!confirm('Expire all waiting queue entries?')) return
    // TODO: Call mutation when backend is ready
    showToast('All waiting entries expired', { type: 'success' })
  }

  const handleClearQueue = () => {
    if (!selectedEventId) return
    if (!confirm('Clear entire queue? This cannot be undone.')) return
    // TODO: Call mutation when backend is ready
    showToast('Queue cleared', { type: 'success' })
  }

  return (
    <div className="admin-queues">
      {/* Header */}
      <div className="queues-header">
        <div>
          <h2>Queue Testing</h2>
          <p>Test and manage event queues and offline queue sync</p>
        </div>
      </div>

      {/* Event Queue Section */}
      <div className="section">
        <div className="section-header">
          <Calendar size={20} />
          <h3>Event Queue Management</h3>
        </div>

        {/* Event Selector */}
        <div className="event-selector">
          <select 
            value={selectedEventId || ''}
            onChange={(e) => setSelectedEventId(e.target.value || null)}
          >
            <option value="">Select an event...</option>
            {eventsData?.items?.map(event => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {selectedEventId ? (
          <>
            {/* Queue Stats */}
            <div className="stats-grid">
              <div className="stat-card waiting">
                <Clock size={24} />
                <div className="stat-info">
                  <span className="stat-value">{queueStats.waiting}</span>
                  <span className="stat-label">Waiting</span>
                </div>
              </div>
              <div className="stat-card admitted">
                <CheckCircle size={24} />
                <div className="stat-info">
                  <span className="stat-value">{queueStats.admitted}</span>
                  <span className="stat-label">Admitted</span>
                </div>
              </div>
              <div className="stat-card expired">
                <XCircle size={24} />
                <div className="stat-info">
                  <span className="stat-value">{queueStats.expired}</span>
                  <span className="stat-label">Expired</span>
                </div>
              </div>
              <div className="stat-card total">
                <Users size={24} />
                <div className="stat-info">
                  <span className="stat-value">{queueStats.total}</span>
                  <span className="stat-label">Total</span>
                </div>
              </div>
            </div>

            {/* Queue Actions */}
            <div className="actions-grid">
              <button className="action-btn primary" onClick={() => handleAdmitNext(1)}>
                <Play size={18} />
                Admit Next
              </button>
              <button className="action-btn primary" onClick={() => handleAdmitNext(5)}>
                <FastForward size={18} />
                Admit Next 5
              </button>
              <button className="action-btn primary" onClick={() => handleAdmitNext(10)}>
                <FastForward size={18} />
                Admit Next 10
              </button>
              <button className="action-btn warning" onClick={handleExpireAll}>
                <RotateCcw size={18} />
                Expire All Waiting
              </button>
              <button className="action-btn danger" onClick={handleClearQueue}>
                <Trash2 size={18} />
                Clear Queue
              </button>
            </div>

            {/* Queue Entries */}
            <div className="queue-entries">
              <h4>Queue Entries</h4>
              <div className="entries-table">
                <div className="table-header">
                  <span>Position</span>
                  <span>User</span>
                  <span>Status</span>
                  <span>Joined At</span>
                  <span>Actions</span>
                </div>
                <div className="empty-message">
                  <Users size={24} />
                  <p>No queue entries for this event</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Calendar size={48} />
            <h4>Select an Event</h4>
            <p>Choose an event from the dropdown to view and manage its queue</p>
          </div>
        )}
      </div>

      {/* Offline Queue Section */}
      <div className="section">
        <div className="section-header">
          <Activity size={20} />
          <h3>Offline Queue Status</h3>
        </div>

        <div className="offline-stats">
          <div className="offline-card">
            <div className="offline-icon online">
              <Wifi size={20} />
            </div>
            <div className="offline-info">
              <span className="offline-label">Connection Status</span>
              <span className="offline-value online">Online</span>
            </div>
          </div>

          <div className="offline-card">
            <div className="offline-icon">
              <Clock size={20} />
            </div>
            <div className="offline-info">
              <span className="offline-label">Pending Actions</span>
              <span className="offline-value">0</span>
            </div>
          </div>

          <div className="offline-card">
            <div className="offline-icon">
              <CheckCircle size={20} />
            </div>
            <div className="offline-info">
              <span className="offline-label">Completed</span>
              <span className="offline-value">0</span>
            </div>
          </div>

          <div className="offline-card">
            <div className="offline-icon warning">
              <AlertCircle size={20} />
            </div>
            <div className="offline-info">
              <span className="offline-label">Failed</span>
              <span className="offline-value">0</span>
            </div>
          </div>
        </div>

        <div className="offline-actions">
          <button className="action-btn secondary">
            <RefreshCw size={16} />
            Force Sync
          </button>
          <button className="action-btn secondary">
            <Trash2 size={16} />
            Clear Failed
          </button>
        </div>

        <div className="offline-log">
          <h4>Recent Sync Activity</h4>
          <div className="log-entries">
            <div className="log-entry">
              <span className="log-icon success"><CheckCircle size={14} /></span>
              <span className="log-text">Queue synced successfully</span>
              <span className="log-time">5 min ago</span>
            </div>
            <div className="log-entry">
              <span className="log-icon success"><CheckCircle size={14} /></span>
              <span className="log-text">3 pending actions processed</span>
              <span className="log-time">10 min ago</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-queues {
          padding: 24px;
        }

        .queues-header {
          margin-bottom: 24px;
        }

        .queues-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px 0;
        }

        .queues-header p {
          color: #808080;
          margin: 0;
        }

        .section {
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          color: #c41e3a;
        }

        .section-header h3 {
          margin: 0;
          color: #fff;
          font-size: 18px;
        }

        .event-selector {
          margin-bottom: 24px;
        }

        .event-selector select {
          width: 100%;
          max-width: 400px;
          padding: 12px 16px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: #e0e0e0;
          font-size: 14px;
          cursor: pointer;
          outline: none;
        }

        .event-selector select:focus {
          border-color: #8b0000;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #0a0a0a;
          border-radius: 10px;
        }

        .stat-card svg {
          opacity: 0.8;
        }

        .stat-card.waiting svg { color: #fbbf24; }
        .stat-card.admitted svg { color: #4ade80; }
        .stat-card.expired svg { color: #ef4444; }
        .stat-card.total svg { color: #60a5fa; }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
        }

        .stat-label {
          font-size: 13px;
          color: #808080;
        }

        .actions-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.primary {
          background: #8b0000;
          color: #fff;
        }

        .action-btn.primary:hover {
          background: #a00000;
        }

        .action-btn.secondary {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          color: #e0e0e0;
        }

        .action-btn.secondary:hover {
          background: #2a2a2a;
        }

        .action-btn.warning {
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
        }

        .action-btn.warning:hover {
          background: rgba(251, 191, 36, 0.2);
        }

        .action-btn.danger {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .action-btn.danger:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .queue-entries h4 {
          margin: 0 0 16px 0;
          color: #fff;
          font-size: 16px;
        }

        .entries-table {
          background: #0a0a0a;
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 80px 1fr 100px 150px 100px;
          gap: 16px;
          padding: 12px 16px;
          background: #1a1a1a;
          font-size: 12px;
          font-weight: 600;
          color: #808080;
          text-transform: uppercase;
        }

        .empty-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 40px 20px;
          color: #606060;
        }

        .empty-message p {
          margin: 0;
          font-size: 13px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #606060;
        }

        .empty-state svg {
          opacity: 0.3;
          margin-bottom: 16px;
        }

        .empty-state h4 {
          margin: 0 0 8px 0;
          color: #808080;
          font-size: 18px;
        }

        .empty-state p {
          margin: 0;
        }

        /* Offline Queue Section */
        .offline-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .offline-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #0a0a0a;
          border-radius: 8px;
        }

        .offline-icon {
          width: 40px;
          height: 40px;
          background: #1a1a1a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #606060;
        }

        .offline-icon.online {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
        }

        .offline-icon.warning {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
        }

        .offline-info {
          display: flex;
          flex-direction: column;
        }

        .offline-label {
          font-size: 12px;
          color: #606060;
        }

        .offline-value {
          font-size: 16px;
          font-weight: 600;
          color: #e0e0e0;
        }

        .offline-value.online {
          color: #4ade80;
        }

        .offline-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .offline-log h4 {
          margin: 0 0 12px 0;
          color: #fff;
          font-size: 14px;
        }

        .log-entries {
          background: #0a0a0a;
          border-radius: 8px;
          padding: 12px;
        }

        .log-entry {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #1a1a1a;
        }

        .log-entry:last-child {
          border-bottom: none;
        }

        .log-icon {
          display: flex;
        }

        .log-icon.success {
          color: #4ade80;
        }

        .log-text {
          flex: 1;
          font-size: 13px;
          color: #e0e0e0;
        }

        .log-time {
          font-size: 12px;
          color: #606060;
        }

        @media (max-width: 1024px) {
          .stats-grid,
          .offline-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .admin-queues {
            padding: 16px;
          }

          .stats-grid,
          .offline-stats {
            grid-template-columns: 1fr;
          }

          .table-header {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
