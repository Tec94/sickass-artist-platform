import { useState } from 'react'
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  ClipboardList, 
  Clock, 
  Users, 
  Settings,
  ChevronLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { 
  AdminOverview, 
  AdminMerch, 
  AdminChat, 
  AdminForum, 
  AdminQueues, 
  AdminUsers, 
  AdminSystem 
} from '../components/Admin'
import type { AdminTab } from '../components/Admin/AdminOverview'

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'merch', label: 'Merch', icon: <Package size={18} /> },
  { id: 'chat', label: 'Chat', icon: <MessageSquare size={18} /> },
  { id: 'forum', label: 'Forum', icon: <ClipboardList size={18} /> },
  { id: 'queues', label: 'Queues', icon: <Clock size={18} /> },
  { id: 'users', label: 'Users', icon: <Users size={18} /> },
  { id: 'system', label: 'System', icon: <Settings size={18} /> },
]

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleNavigate = (tab: AdminTab) => {
    setActiveTab(tab)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview onNavigate={handleNavigate} />
      case 'merch':
        return <AdminMerch />
      case 'chat':
        return <AdminChat />
      case 'forum':
        return <AdminForum />
      case 'queues':
        return <AdminQueues />
      case 'users':
        return <AdminUsers />
      case 'system':
        return <AdminSystem />
      default:
        return <AdminOverview onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            {!sidebarCollapsed && <span className="logo-text">Admin Panel</span>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={sidebarCollapsed ? tab.label : undefined}
            >
              {tab.icon}
              {!sidebarCollapsed && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
            title={sidebarCollapsed ? 'Back to Site' : undefined}
          >
            <ChevronLeft size={18} />
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
            onChange={(e) => setActiveTab(e.target.value as AdminTab)}
          >
            {tabs.map(tab => (
              <option key={tab.id} value={tab.id}>{tab.label}</option>
            ))}
          </select>
        </div>

        <div className="admin-content">
          {renderContent()}
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
          gap: 4px;
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
