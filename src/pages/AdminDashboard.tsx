import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  AdminOverview, 
  AdminMerch, 
  AdminEvents,
  AdminChat, 
  AdminForum, 
  AdminModerationHub,
  AdminQueues, 
  AdminUsers, 
  AdminSystem,
  AdminPoints,
  AdminRewards,
  AdminRedemptions,
  AdminQuests
} from '../components/Admin'
import type { AdminTab } from '../components/Admin/AdminOverview'
import { useAdminAccess } from '../hooks/useAdminAccess'

const navGroups: { id: string; label: string; tabs: { id: AdminTab; label: string; icon: string }[] }[] = [
  {
    id: 'overview',
    label: 'Overview',
    tabs: [{ id: 'overview', label: 'Overview', icon: 'solar:chart-square-linear' }],
  },
  {
    id: 'commerce',
    label: 'Commerce',
    tabs: [
      { id: 'merch', label: 'Merch', icon: 'solar:box-linear' },
      { id: 'events', label: 'Events', icon: 'solar:calendar-linear' },
    ],
  },
  {
    id: 'community',
    label: 'Community Ops',
    tabs: [
      { id: 'chat', label: 'Chat', icon: 'solar:chat-square-dots-linear' },
      { id: 'forum', label: 'Forum', icon: 'solar:clipboard-list-linear' },
      { id: 'moderation', label: 'Moderation', icon: 'solar:shield-warning-linear' },
      { id: 'queues', label: 'Waitlist', icon: 'solar:clock-circle-linear' },
    ],
  },
  {
    id: 'engagement',
    label: 'Engagement & Loyalty',
    tabs: [
      { id: 'quests', label: 'Quests', icon: 'solar:shield-star-linear' },
      { id: 'points', label: 'Points & XP', icon: 'solar:star-linear' },
      { id: 'rewards', label: 'Rewards', icon: 'solar:gift-linear' },
      { id: 'redemptions', label: 'Redemptions', icon: 'solar:ticket-linear' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    tabs: [
      { id: 'users', label: 'Users', icon: 'solar:users-group-rounded-linear' },
      { id: 'system', label: 'System', icon: 'solar:settings-linear' },
    ],
  },
]

const allTabs = navGroups.flatMap((group) => group.tabs)

export function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab') as AdminTab | null
  const initialTab = allTabs.some((tab) => tab.id === tabFromUrl) ? (tabFromUrl as AdminTab) : 'overview'
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map((group) => [group.id, false]))
  )
  const navigate = useNavigate()
  const { user, isReady, hasValidToken, hasAdminAccess, tokenMatchesUser } = useAdminAccess()

  // Sync state with URL params
  useEffect(() => {
    const nextTab = searchParams.get('tab') as AdminTab
    if (nextTab && nextTab !== activeTab && allTabs.some(t => t.id === nextTab)) {
      setActiveTab(nextTab)
    }
  }, [searchParams, activeTab])

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const handleNavigate = (tab: AdminTab) => {
    handleTabChange(tab)
  }

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview onNavigate={handleNavigate} />
      case 'merch':
        return <AdminMerch />
      case 'events':
        return <AdminEvents />
      case 'chat':
        return <AdminChat />
      case 'forum':
        return <AdminForum />
      case 'moderation':
        return <AdminModerationHub />
      case 'queues':
        return <AdminQueues />
      case 'quests':
        return <AdminQuests />
      case 'users':
        return <AdminUsers />
      case 'points':
        return <AdminPoints />
      case 'rewards':
        return <AdminRewards />
      case 'redemptions':
        return <AdminRedemptions />
      case 'system':
        return <AdminSystem />
      default:
        return <AdminOverview onNavigate={handleNavigate} />
    }
  }

  const canRenderAdmin = isReady && hasValidToken && tokenMatchesUser && !!user && hasAdminAccess

  const renderAccessState = () => {
    if (!isReady) {
      return (
        <div className="admin-state">
          <iconify-icon icon="solar:spinner-linear" width="32" height="32" class="animate-spin"></iconify-icon>
          <h3>Session syncing</h3>
          <p>Preparing your admin session…</p>
        </div>
      )
    }

    if (!hasValidToken || !tokenMatchesUser) {
      return (
        <div className="admin-state">
          <iconify-icon icon="solar:shield-warning-linear" width="32" height="32"></iconify-icon>
          <h3>Session not ready</h3>
          <p>Please refresh or sign out and back in to access admin tools.</p>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="admin-state">
          <iconify-icon icon="solar:user-cross-linear" width="32" height="32"></iconify-icon>
          <h3>Sign in required</h3>
          <p>Please sign in to access the admin dashboard.</p>
        </div>
      )
    }

    if (!hasAdminAccess) {
      return (
        <div className="admin-state">
          <iconify-icon icon="solar:shield-warning-linear" width="32" height="32"></iconify-icon>
          <h3>Access denied</h3>
          <p>Your account doesn’t have permission to access admin tools.</p>
        </div>
      )
    }

    return null
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">
              <iconify-icon icon="solar:bolt-bold-duotone" width="24" height="24" class="text-white"></iconify-icon>
            </span>
            {!sidebarCollapsed && <span className="logo-text">Admin Panel</span>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <iconify-icon icon="solar:alt-arrow-left-linear" width="18" height="18"></iconify-icon>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map(group => {
            const isGroupCollapsed = !sidebarCollapsed && collapsedGroups[group.id]
            return (
              <div key={group.id} className="nav-group">
                {!sidebarCollapsed && (
                  <button
                    className={`nav-group-header ${isGroupCollapsed ? 'collapsed' : ''}`}
                    onClick={() => toggleGroup(group.id)}
                    type="button"
                    aria-expanded={!isGroupCollapsed}
                  >
                    <span className="nav-group-title">{group.label}</span>
                    <iconify-icon
                      icon="solar:alt-arrow-down-linear"
                      width="16"
                      height="16"
                      class={`nav-group-icon ${isGroupCollapsed ? 'collapsed' : ''}`}
                    ></iconify-icon>
                  </button>
                )}
                <div className={`nav-group-items ${isGroupCollapsed ? 'collapsed' : ''}`}>
                  {group.tabs.map(tab => (
                    <button
                      key={tab.id}
                      className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => handleTabChange(tab.id)}
                      title={sidebarCollapsed ? tab.label : undefined}
                    >
                      <iconify-icon icon={tab.icon} width="18" height="18"></iconify-icon>
                      {!sidebarCollapsed && <span>{tab.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
            title={sidebarCollapsed ? 'Back to Site' : undefined}
          >
            <iconify-icon icon="solar:alt-arrow-left-linear" width="18" height="18"></iconify-icon>
            {!sidebarCollapsed && <span>Back to Site</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Mobile Header */}
        <div className="mobile-header">
          <h1>Admin Panel</h1>
          <select 
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value as AdminTab)}
          >
            {navGroups.map(group => (
              <optgroup key={group.id} label={group.label}>
                {group.tabs.map(tab => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="admin-content">
          {canRenderAdmin ? renderContent() : renderAccessState()}
        </div>
      </main>

      <style>{`
        .admin-dashboard {
          display: flex;
          min-height: 100vh;
          background: #0a0a0a;
        }

        /* Sidebar */
        .admin-sidebar {
          width: 250px;
          background: #111;
          border-right: 1px solid #1a1a1a;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          transition: width 0.2s ease;
        }

        .admin-sidebar.collapsed {
          width: 72px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 16px;
          border-bottom: 1px solid #1a1a1a;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #8b0000, #c41e3a);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
        }

        .collapsed .logo-text {
          display: none;
        }

        .collapse-btn {
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #808080;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .collapse-btn:hover {
          background: #1a1a1a;
          color: #e0e0e0;
        }

        .collapsed .collapse-btn {
          transform: rotate(180deg);
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 6px 12px;
          background: transparent;
          border: none;
          color: #606060;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
        }

        .nav-group-header:hover {
          color: #a0a0a0;
        }

        .nav-group-icon {
          transition: transform 0.2s ease;
        }

        .nav-group-icon.collapsed {
          transform: rotate(-90deg);
        }

        .nav-group-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-group-items.collapsed {
          display: none;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #808080;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .nav-item:hover {
          background: #1a1a1a;
          color: #e0e0e0;
        }

        .nav-item.active {
          background: rgba(139, 0, 0, 0.2);
          color: #c41e3a;
        }

        .collapsed .nav-item {
          justify-content: center;
          padding: 12px;
        }

        .collapsed .nav-item span {
          display: none;
        }

        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid #1a1a1a;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: #808080;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #1a1a1a;
          color: #e0e0e0;
          border-color: #3a3a3a;
        }

        .collapsed .back-btn {
          justify-content: center;
          padding: 12px;
        }

        .collapsed .back-btn span {
          display: none;
        }

        /* Main Content */
        .admin-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .mobile-header {
          display: none;
          padding: 16px;
          background: #111;
          border-bottom: 1px solid #1a1a1a;
          justify-content: space-between;
          align-items: center;
        }

        .mobile-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .mobile-header select {
          padding: 8px 12px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          color: #e0e0e0;
          font-size: 14px;
        }

        .admin-content {
          flex: 1;
          overflow-y: auto;
        }

        .admin-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px 20px;
          color: #808080;
          text-align: center;
        }

        .admin-state h3 {
          margin: 0;
          color: #e0e0e0;
          font-size: 18px;
        }

        .admin-state p {
          margin: 0;
          color: #808080;
        }

        @media (max-width: 1024px) {
          .admin-sidebar {
            width: 72px;
          }

          .logo-text,
          .nav-item span,
          .back-btn span {
            display: none;
          }

          .nav-item,
          .back-btn {
            justify-content: center;
          }

          .collapse-btn {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            display: none;
          }

          .mobile-header {
            display: flex;
          }
        }
      `}</style>
    </div>
  )
}
