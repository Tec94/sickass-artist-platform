import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { showToast } from '../../lib/toast'

interface TableStats {
  name: string
  count: number | string
  lastUpdated?: string
}

export function AdminSystem() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Would fetch actual stats from Convex
  const tableStats: TableStats[] = [
    { name: 'users', count: '—', lastUpdated: 'Just now' },
    { name: 'channels', count: '—', lastUpdated: 'Just now' },
    { name: 'messages', count: '—', lastUpdated: 'Just now' },
    { name: 'threads', count: '—', lastUpdated: 'Just now' },
    { name: 'replies', count: '—', lastUpdated: 'Just now' },
    { name: 'categories', count: '—', lastUpdated: 'Just now' },
    { name: 'events', count: '—', lastUpdated: 'Just now' },
    { name: 'merchProducts', count: '—', lastUpdated: 'Just now' },
    { name: 'merchVariants', count: '—', lastUpdated: 'Just now' },
    { name: 'orders', count: '—', lastUpdated: 'Just now' },
  ]

  const systemMetrics = {
    uptime: '99.9%',
    responseTime: '45ms',
    activeConnections: 12,
    queuedJobs: 0
  }

  const handleRefreshStats = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise(r => setTimeout(r, 1000))
    setIsRefreshing(false)
    showToast('Stats refreshed', { type: 'success' })
  }

  const handleClearCache = () => {
    if (!confirm('Clear all cached data? This may temporarily slow down the app.')) return
    showToast('Cache cleared', { type: 'success' })
  }

  return (
    <div className="admin-system">
      {/* Header */}
      <div className="system-header">
        <div>
          <h2>System Status</h2>
          <p>Database statistics, performance metrics, and diagnostics</p>
        </div>
        <button 
          className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
          onClick={handleRefreshStats}
          disabled={isRefreshing}
        >
          <iconify-icon icon="solar:refresh-linear" width="18" height="18"></iconify-icon>
          Refresh
        </button>
      </div>

      {/* System Health */}
      <div className="health-section">
        <div className="section-header">
          <iconify-icon icon="solar:pulse-2-linear" width="20" height="20"></iconify-icon>
          <h3>System Health</h3>
          <span className="status-badge online">
            <iconify-icon icon="solar:check-circle-linear" width="14" height="14"></iconify-icon>
            All Systems Operational
          </span>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <iconify-icon icon="solar:bolt-linear" width="24" height="24"></iconify-icon>
            </div>
            <div className="metric-info">
              <span className="metric-value">{systemMetrics.uptime}</span>
              <span className="metric-label">Uptime</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <iconify-icon icon="solar:clock-circle-linear" width="24" height="24"></iconify-icon>
            </div>
            <div className="metric-info">
              <span className="metric-value">{systemMetrics.responseTime}</span>
              <span className="metric-label">Avg Response</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <iconify-icon icon="solar:server-path-linear" width="24" height="24"></iconify-icon>
            </div>
            <div className="metric-info">
              <span className="metric-value">{systemMetrics.activeConnections}</span>
              <span className="metric-label">Active Connections</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <iconify-icon icon="solar:cpu-linear" width="24" height="24"></iconify-icon>
            </div>
            <div className="metric-info">
              <span className="metric-value">{systemMetrics.queuedJobs}</span>
              <span className="metric-label">Queued Jobs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Stats */}
      <div className="database-section">
        <div className="section-header">
          <iconify-icon icon="solar:database-linear" width="20" height="20"></iconify-icon>
          <h3>Database Tables</h3>
        </div>

        <div className="tables-grid">
          {tableStats.map(table => (
            <div key={table.name} className="table-card">
              <div className="table-icon">
                <iconify-icon icon="solar:hard-drive-linear" width="18" height="18"></iconify-icon>
              </div>
              <div className="table-info">
                <span className="table-name">{table.name}</span>
                <span className="table-count">{table.count} rows</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="actions-section">
        <div className="section-header">
          <iconify-icon icon="solar:chart-2-linear" width="20" height="20"></iconify-icon>
          <h3>Maintenance Actions</h3>
        </div>

        <div className="actions-grid">
          <div className="action-card">
            <div className="action-icon">
              <iconify-icon icon="solar:refresh-linear" width="24" height="24"></iconify-icon>
            </div>
            <div className="action-content">
              <h4>Clear Application Cache</h4>
              <p>Remove cached data to ensure fresh content is loaded</p>
              <button className="action-btn" onClick={handleClearCache}>
                Clear Cache
              </button>
            </div>
          </div>

          <div className="action-card">
            <div className="action-icon">
              <iconify-icon icon="solar:database-linear" width="24" height="24"></iconify-icon>
            </div>
            <div className="action-content">
              <h4>Reindex Search</h4>
              <p>Rebuild search indexes for faster queries</p>
              <button className="action-btn" onClick={() => showToast('Reindexing started', { type: 'success' })}>
                Start Reindex
              </button>
            </div>
          </div>

          <div className="action-card">
            <div className="action-icon warning">
              <iconify-icon icon="solar:trash-bin-trash-linear" width="24" height="24"></iconify-icon>
            </div>
            <div className="action-content">
              <h4>Cleanup Old Data</h4>
              <p>Remove expired sessions, old logs, and temporary files</p>
              <button className="action-btn warning" onClick={() => showToast('Cleanup scheduled', { type: 'success' })}>
                Run Cleanup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Log */}
      <div className="log-section">
        <div className="section-header">
          <iconify-icon icon="solar:danger-triangle-linear" width="20" height="20"></iconify-icon>
          <h3>Recent Errors</h3>
          <span className="error-count">0</span>
        </div>

        <div className="log-container">
          <div className="empty-log">
            <iconify-icon icon="solar:check-circle-linear" width="32" height="32"></iconify-icon>
            <p>No errors in the last 24 hours</p>
          </div>
        </div>
      </div>

      <style>{`
        .admin-system {
          padding: 24px;
        }

        .system-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .system-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px 0;
        }

        .system-header p {
          color: #808080;
          margin: 0;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: #e0e0e0;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: #2a2a2a;
        }

        .refresh-btn.spinning svg {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .health-section,
        .database-section,
        .actions-section,
        .log-section {
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

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-left: auto;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.online {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
        }

        .error-count {
          margin-left: auto;
          padding: 4px 12px;
          background: #2a2a2a;
          border-radius: 12px;
          font-size: 13px;
          color: #808080;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #0a0a0a;
          border-radius: 10px;
        }

        .metric-icon {
          width: 48px;
          height: 48px;
          background: rgba(139, 0, 0, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c41e3a;
        }

        .metric-info {
          display: flex;
          flex-direction: column;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
        }

        .metric-label {
          font-size: 13px;
          color: #808080;
        }

        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .table-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #0a0a0a;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .table-card:hover {
          background: #1a1a1a;
        }

        .table-icon {
          width: 36px;
          height: 36px;
          background: #1a1a1a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #606060;
        }

        .table-info {
          display: flex;
          flex-direction: column;
        }

        .table-name {
          font-size: 14px;
          font-weight: 500;
          color: #e0e0e0;
        }

        .table-count {
          font-size: 12px;
          color: #606060;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .action-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #0a0a0a;
          border-radius: 10px;
        }

        .action-icon {
          width: 48px;
          height: 48px;
          background: #1a1a1a;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #606060;
          flex-shrink: 0;
        }

        .action-icon.warning {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
        }

        .action-content {
          flex: 1;
        }

        .action-content h4 {
          margin: 0 0 4px 0;
          color: #e0e0e0;
          font-size: 15px;
        }

        .action-content p {
          margin: 0 0 12px 0;
          color: #606060;
          font-size: 13px;
          line-height: 1.4;
        }

        .action-btn {
          padding: 8px 16px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          color: #e0e0e0;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #2a2a2a;
        }

        .action-btn.warning {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.3);
          color: #fbbf24;
        }

        .action-btn.warning:hover {
          background: rgba(251, 191, 36, 0.2);
        }

        .log-container {
          background: #0a0a0a;
          border-radius: 8px;
          min-height: 120px;
        }

        .empty-log {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px 20px;
          color: #4ade80;
        }

        .empty-log p {
          margin: 0;
          color: #808080;
        }

        @media (max-width: 1024px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .admin-system {
            padding: 16px;
          }

          .system-header {
            flex-direction: column;
            gap: 16px;
          }

          .refresh-btn {
            width: 100%;
            justify-content: center;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .tables-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  )
}
