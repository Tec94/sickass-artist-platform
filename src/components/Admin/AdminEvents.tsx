import { Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { formatEventDate, formatPrice, getSaleStatusBadge } from '../../utils/eventFormatters'
import { showToast } from '../../lib/toast'
import { useAdminAccess } from '../../hooks/useAdminAccess'

export function AdminEvents() {
  const { canUseAdminQueries, canUseAdminActions } = useAdminAccess()
  const eventsData = useQuery(
    api.events.getEvents,
    canUseAdminQueries ? { page: 0, pageSize: 50 } : 'skip'
  )

  const myTickets = useQuery(
    api.events.getUserTickets,
    canUseAdminQueries ? { upcomingOnly: false } : 'skip'
  )
  const deleteEvent = useMutation(api.events.deleteEvent)

  const events = eventsData?.items || []
  const loading = !eventsData

  const handleDelete = async (eventId: string, title: string) => {
    if (!canUseAdminActions) {
      showToast('Session not ready or access denied', { type: 'error' })
      return
    }
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return
    }

    try {
      await deleteEvent({ eventId: eventId as Id<'events'> })
      showToast('Event deleted successfully', { type: 'success' })
    } catch (err) {
      showToast('Failed to delete event', { type: 'error' })
    }
  }

  // Calculate revenue from tickets sold
  const calculateRevenue = (eventId: string) => {
    if (!myTickets) return 0
    
    const eventTickets = myTickets.filter((t: any) => t.event?._id === eventId)
    // This is a simplified calculation - in a real app, you'd query actual sales data
    return eventTickets.reduce((sum: number, ticket: any) => {
      // Estimate price based on ticket type (this should come from actual purchase data)
      const estimatedPrice = ticket.ticketType === 'vip' ? 150 : ticket.ticketType === 'early_bird' ? 30 : 50
      return sum + (ticket.quantity * estimatedPrice)
    }, 0)
  }

  if (loading) {
    return (
      <div className="admin-events-list">
        <div className="loading-container">
          <iconify-icon icon="solar:spinner-linear" width="32" height="32" class="animate-spin"></iconify-icon>
          <p className="loading-text">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-events-list">
      <div className="list-container">
        {/* Header */}
        <div className="list-header">
          <div className="header-content">
            <h2 className="panel-title">Manage Events</h2>
            <p className="panel-subtitle">Create and manage your event listings</p>
          </div>
          <Link to="/admin/events/new" className="create-btn">
            <iconify-icon icon="solar:add-circle-bold" width="20" height="20"></iconify-icon>
            <span>Create Event</span>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <iconify-icon icon="solar:calendar-bold" style={{ color: '#ef4444' }}></iconify-icon>
            </div>
            <div className="stat-content">
              <div className="stat-value">{events.length}</div>
              <div className="stat-label">Total Events</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
              <iconify-icon icon="solar:ticket-bold" style={{ color: '#22c55e' }}></iconify-icon>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {events.reduce((sum: number, e: any) => sum + e.ticketsSold, 0)}
              </div>
              <div className="stat-label">Total Tickets Sold</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
              <iconify-icon icon="solar:dollar-minimalistic-bold" style={{ color: '#a855f7' }}></iconify-icon>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {formatPrice(events.reduce((sum: number, e: any) => sum + calculateRevenue(e._id), 0))}
              </div>
              <div className="stat-label">Estimated Revenue</div>
            </div>
          </div>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="empty-state">
            <iconify-icon icon="solar:calendar-minimalistic-linear" width="48" height="48" class="empty-icon"></iconify-icon>
            <h3 className="empty-title">No Events Found</h3>
            <p className="empty-description">
              You haven't created any events yet.
            </p>
            <Link to="/admin/events/new" className="empty-action">
              <iconify-icon icon="solar:add-circle-bold" width="18" height="18"></iconify-icon>
              <span>Create First Event</span>
            </Link>
          </div>
        ) : (
          <div className="cards-list">
            {events.map((event: any) => {
              const statusBadge = getSaleStatusBadge(event.saleStatus)
              const revenue = calculateRevenue(event._id)
              const soldPercentage = (event.ticketsSold / event.capacity) * 100

              return (
                <div key={event._id} className="event-item-card">
                  <div className="card-image-wrapper">
                    <img src={event.imageUrl} alt={event.title} className="card-image" />
                    <div className={`badge status-${event.saleStatus}`}>
                      {statusBadge.text}
                    </div>
                  </div>

                  <div className="card-main-content">
                    <div className="card-info">
                      <h4 className="card-title">{event.title}</h4>
                      
                      <div className="card-meta">
                        <div className="meta-row">
                          <iconify-icon icon="solar:calendar-bold" width="14" height="14"></iconify-icon>
                          <span>{formatEventDate(event.startAtUtc, 'America/New_York')}</span>
                        </div>
                        <div className="meta-row">
                          <iconify-icon icon="solar:map-point-bold" width="14" height="14"></iconify-icon>
                          <span>{event.city}</span>
                        </div>
                      </div>

                      <div className="stats-row">
                        <div className="mini-stat">
                          <span className="label">Tickets Sold</span>
                          <div className="value-bar-group">
                            <span className="value">{event.ticketsSold} / {event.capacity}</span>
                            <div className="mini-progress">
                              <div 
                                className="fill" 
                                style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="mini-stat">
                          <span className="label">Revenue</span>
                          <span className="value accent">{formatPrice(revenue)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions">
                      <Link 
                        to={`/events/${event._id}`} 
                        className="btn secondary"
                        title="View Event"
                      >
                        <iconify-icon icon="solar:eye-linear" width="18" height="18"></iconify-icon>
                      </Link>
                      <button className="btn secondary" disabled title="Edit Event (Coming Soon)">
                        <iconify-icon icon="solar:pen-linear" width="18" height="18"></iconify-icon>
                      </button>
                      <button 
                        className="btn danger"
                        onClick={() => handleDelete(event._id, event.title)}
                        title="Delete Event"
                      >
                        <iconify-icon icon="solar:trash-bin-trash-linear" width="18" height="18"></iconify-icon>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .admin-events-list {
          padding: 24px;
        }

        .list-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .panel-title {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px 0;
        }

        .panel-subtitle {
          color: #808080;
          margin: 0;
          font-size: 14px;
        }

        .create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #8b0000;
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .create-btn:hover {
          background: #a00000;
          transform: translateY(-2px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 8px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 12px;
          color: #606060;
          font-weight: 500;
        }

        /* Cards List */
        .cards-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .event-item-card {
          display: flex;
          gap: 20px;
          padding: 16px;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          transition: border-color 0.2s;
        }

        .event-item-card:hover {
          border-color: #2a2a2a;
        }

        .card-image-wrapper {
          position: relative;
          width: 140px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-on_sale { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
        .status-upcoming { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
        .status-sold_out { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

        .card-main-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-width: 0;
        }

        .card-info {
          flex: 1;
          min-width: 0;
        }

        .card-title {
          margin: 0 0 8px 0;
          font-size: 17px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #808080;
        }

        .meta-row iconify-icon {
          color: #8b0000;
        }

        .stats-row {
          display: flex;
          gap: 24px;
        }

        .mini-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mini-stat .label {
          font-size: 11px;
          text-transform: uppercase;
          color: #606060;
          font-weight: 600;
        }

        .mini-stat .value {
          font-size: 14px;
          font-weight: 700;
          color: #e0e0e0;
        }

        .mini-stat .value.accent {
          color: #fbbf24;
        }

        .value-bar-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mini-progress {
          width: 100px;
          height: 4px;
          background: #1a1a1a;
          border-radius: 2px;
          overflow: hidden;
        }

        .mini-progress .fill {
          height: 100%;
          background: #8b0000;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          margin-left: 20px;
        }

        .btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn.secondary {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          color: #808080;
        }

        .btn.secondary:hover:not(:disabled) {
          background: #2a2a2a;
          color: #fff;
        }

        .btn.secondary:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .btn.danger {
          background: rgba(139, 0, 0, 0.1);
          border: 1px solid rgba(139, 0, 0, 0.3);
          color: #c41e3a;
        }

        .btn.danger:hover {
          background: #8b0000;
          color: #fff;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 20px;
          gap: 16px;
          color: #606060;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: #0d0d0d;
          border: 1px dashed #2a2a2a;
          border-radius: 12px;
        }

        .empty-icon {
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .empty-title {
          color: #808080;
          margin: 0 0 8px 0;
        }

        .empty-description {
          color: #606060;
          margin: 0 0 24px 0;
          font-size: 14px;
        }

        .empty-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: #e0e0e0;
          text-decoration: none;
          font-weight: 500;
        }

        .empty-action:hover {
          background: #2a2a2a;
          border-color: #8b0000;
          color: #fff;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .event-item-card {
            flex-direction: column;
          }
          .card-image-wrapper {
            width: 100%;
            height: 160px;
          }
          .card-main-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .card-actions {
            margin-left: 0;
            width: 100%;
          }
          .card-actions .btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  )
}
