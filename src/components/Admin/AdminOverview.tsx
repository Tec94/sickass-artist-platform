// React hooks not currently used
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAdminAccess } from '../../hooks/useAdminAccess'

export type AdminTab =
  | 'overview'
  | 'merch'
  | 'events'
  | 'chat'
  | 'forum'
  | 'moderation'
  | 'queues'
  | 'quests'
  | 'users'
  | 'points'
  | 'rewards'
  | 'redemptions'
  | 'system'

interface AdminOverviewProps {
  onNavigate: (tab: AdminTab) => void
}

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  trend?: string
  color: string
}

const StatCard = ({ title, value, icon, trend, color }: StatCardProps) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color }}>
      <iconify-icon icon={icon} width="24" height="24"></iconify-icon>
    </div>
    <div className="stat-content">
      <span className="stat-value">{value}</span>
      <span className="stat-title">{title}</span>
      {trend && <span className="stat-trend">{trend}</span>}
    </div>
  </div>
)

export function AdminOverview({ onNavigate }: AdminOverviewProps) {
  // Fetch stats from admin API
  const { canUseAdminQueries } = useAdminAccess()
  const stats = useQuery(api.admin.getAdminStats, canUseAdminQueries ? {} : 'skip')

  const quickActions: { label: string; icon: string; tab: AdminTab; action: string }[] = [
    { label: 'Add Product', icon: 'solar:box-linear', tab: 'merch', action: 'add' },
    { label: 'Create Event', icon: 'solar:calendar-linear', tab: 'events', action: 'add' },
    { label: 'Create Channel', icon: 'solar:chat-square-dots-linear', tab: 'chat', action: 'add' },
    { label: 'New Category', icon: 'solar:clipboard-list-linear', tab: 'forum', action: 'add' },
    { label: 'Moderation Hub', icon: 'solar:shield-warning-linear', tab: 'moderation', action: 'review' },
    { label: 'View Users', icon: 'solar:users-group-rounded-linear', tab: 'users', action: 'view' },
  ]

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <h2>Dashboard Overview</h2>
        <p>Quick access to platform statistics and actions</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard 
          title="Total Products" 
          value={stats?.productCount ?? '—'} 
          icon="solar:box-linear"
          color="rgba(139, 0, 0, 0.3)"
        />
        <StatCard 
          title="Total Events" 
          value={stats?.eventCount ?? '—'} 
          icon="solar:calendar-linear"
          color="rgba(139, 0, 0, 0.3)"
        />
        <StatCard 
          title="Chat Channels" 
          value={stats?.channelCount ?? '—'} 
          icon="solar:chat-square-dots-linear"
          color="rgba(139, 0, 0, 0.3)"
        />
        <StatCard 
          title="Forum Categories" 
          value={stats?.categoryCount ?? '—'} 
          icon="solar:clipboard-list-linear"
          color="rgba(139, 0, 0, 0.3)"
        />
        <StatCard 
          title="Total Users" 
          value={stats?.userCount ?? '—'} 
          icon="solar:users-group-rounded-linear"
          color="rgba(0, 128, 0, 0.3)"
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          {quickActions.map((action, i) => (
            <button 
              key={i}
              className="quick-action-btn"
              onClick={() => onNavigate(action.tab)}
            >
              <iconify-icon icon={action.icon} width="18" height="18"></iconify-icon>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon"><iconify-icon icon="solar:chat-square-dots-linear" width="16" height="16"></iconify-icon></div>
            <div className="activity-content">
              <span className="activity-text">New message in #general</span>
              <span className="activity-time">2 minutes ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon"><iconify-icon icon="solar:box-linear" width="16" height="16"></iconify-icon></div>
            <div className="activity-content">
              <span className="activity-text">Product "Tour Hoodie" updated</span>
              <span className="activity-time">15 minutes ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon"><iconify-icon icon="solar:users-group-rounded-linear" width="16" height="16"></iconify-icon></div>
            <div className="activity-content">
              <span className="activity-text">New user registration</span>
              <span className="activity-time">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-overview {
          padding: 24px;
        }

        .overview-header {
          margin-bottom: 32px;
        }

        .overview-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px 0;
        }

        .overview-header p {
          color: #808080;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          border-color: #8b0000;
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c41e3a;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
        }

        .stat-title {
          font-size: 14px;
          color: #808080;
        }

        .stat-trend {
          font-size: 12px;
          color: #4ade80;
          margin-top: 4px;
        }

        .quick-actions-section {
          margin-bottom: 40px;
        }

        .quick-actions-section h3,
        .recent-activity h3 {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 16px 0;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          color: #e0e0e0;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-action-btn:hover {
          background: #8b0000;
          border-color: #8b0000;
          color: #fff;
        }

        .recent-activity {
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 20px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #0a0a0a;
          border-radius: 8px;
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          background: rgba(139, 0, 0, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c41e3a;
        }

        .activity-content {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .activity-text {
          color: #e0e0e0;
          font-size: 14px;
        }

        .activity-time {
          color: #606060;
          font-size: 12px;
        }

        @media (max-width: 768px) {
          .admin-overview {
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  )
}
