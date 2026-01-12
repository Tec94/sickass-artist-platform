import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { showToast } from '../../lib/toast'

type UserRole = 'artist' | 'admin' | 'mod' | 'crew' | 'fan'
type FanTier = 'bronze' | 'silver' | 'gold' | 'platinum'

interface UserEditData {
  displayName: string
  email: string
  role: UserRole
  fanTier: FanTier
}

const roleOptions: { value: UserRole; label: string; icon: string }[] = [
  { value: 'fan', label: 'Fan', icon: 'solar:user-linear' },
  { value: 'crew', label: 'Crew', icon: 'solar:users-group-rounded-linear' },
  { value: 'mod', label: 'Moderator', icon: 'solar:shield-check-linear' },
  { value: 'admin', label: 'Admin', icon: 'solar:crown-linear' },
  { value: 'artist', label: 'Artist', icon: 'solar:star-linear' },
]

const fanTierOptions: { value: FanTier; label: string; color: string }[] = [
  { value: 'bronze', label: 'Bronze', color: '#CD7F32' },
  { value: 'silver', label: 'Silver', color: '#C0C0C0' },
  { value: 'gold', label: 'Gold', color: '#FFD700' },
  { value: 'platinum', label: 'Platinum', color: '#E5E4E2' },
]

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [editingUserId, setEditingUserId] = useState<Id<'users'> | null>(null)
  const [editData, setEditData] = useState<UserEditData | null>(null)
  const [_isSaving, setIsSaving] = useState(false)

  // Fetch real users from Convex
  const usersData = useQuery(api.admin.getUsers, { 
    page: 0, 
    pageSize: 50, 
    search: searchQuery || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined 
  })

  // Mutations
  const updateUserRole = useMutation(api.admin.updateUserRole)
  const updateUserTier = useMutation(api.admin.updateUserTier)

  const users = usersData?.items || []

  const handleEditUser = (user: typeof users[0]) => {
    setEditData({
      displayName: user.displayName,
      email: user.email,
      role: user.role as UserRole,
      fanTier: user.fanTier as FanTier
    })
    setEditingUserId(user._id)
  }

  const handleSaveUser = async () => {
    if (!editData || !editingUserId) return
    
    setIsSaving(true)
    try {
      const originalUser = users.find(u => u._id === editingUserId)
      
      // Update role if changed
      if (originalUser && originalUser.role !== editData.role) {
        await updateUserRole({ userId: editingUserId, newRole: editData.role })
      }
      
      // Update tier if changed
      if (originalUser && originalUser.fanTier !== editData.fanTier) {
        await updateUserTier({ userId: editingUserId, newTier: editData.fanTier })
      }
      
      showToast('User updated successfully', { type: 'success' })
      setEditingUserId(null)
      setEditData(null)
    } catch (error: any) {
      showToast(error.message || 'Failed to update user', { type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const getRoleIcon = (role: UserRole) => {
    const option = roleOptions.find(r => r.value === role)
    return option?.icon || 'solar:user-linear'
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return '#ef4444'
      case 'mod': return '#8b5cf6'
      case 'artist': return '#f59e0b'
      case 'crew': return '#4ade80'
      default: return '#808080'
    }
  }

  const getFanTierColor = (tier: FanTier) => {
    return fanTierOptions.find(t => t.value === tier)?.color || '#808080'
  }

  return (
    <div className="admin-users">
      {/* Header */}
      <div className="users-header">
        <div>
          <h2>User Management</h2>
          <p>Manage user roles, fan tiers, and profile information</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="search-bar">
          <iconify-icon icon="solar:magnifer-linear" width="18" height="18"></iconify-icon>
          <input 
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="role-filter">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          >
            <option value="all">All Roles</option>
            {roleOptions.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          <iconify-icon icon="solar:alt-arrow-down-linear" width="16" height="16"></iconify-icon>
        </div>
      </div>

      {/* Users Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <iconify-icon icon="solar:users-group-rounded-linear" width="18" height="18"></iconify-icon>
          <span>{usersData?.totalCount ?? users.length} Total Users</span>
        </div>
        <div className="stat-item">
          <iconify-icon icon="solar:crown-linear" width="18" height="18"></iconify-icon>
          <span>{users.filter(u => u.fanTier !== 'bronze').length} Premium</span>
        </div>
        <div className="stat-item">
          <iconify-icon icon="solar:shield-check-linear" width="18" height="18"></iconify-icon>
          <span>{users.filter(u => u.role === 'admin' || u.role === 'mod').length} Staff</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table">
        <div className="table-header">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Fan Tier</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>

        <div className="table-body">
          {users.map(user => (
            <div key={user._id} className="table-row">
              <div className="user-cell">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.displayName} />
                  ) : (
                    <span>{user.displayName[0]}</span>
                  )}
                </div>
                <span className="user-name">{user.displayName}</span>
              </div>

              <div className="email-cell">
                <iconify-icon icon="solar:letter-linear" width="14" height="14"></iconify-icon>
                <span>{user.email}</span>
              </div>

              <div className="role-cell">
                <span 
                  className="role-badge"
                  style={{ 
                    background: `${getRoleColor(user.role)}20`,
                    color: getRoleColor(user.role),
                    borderColor: `${getRoleColor(user.role)}40`
                  }}
                >
                  <iconify-icon icon={getRoleIcon(user.role)} width="14" height="14"></iconify-icon>
                  {roleOptions.find(r => r.value === user.role)?.label}
                </span>
              </div>

              <div className="tier-cell">
                <span 
                  className="tier-badge"
                  style={{ color: getFanTierColor(user.fanTier) }}
                >
                  <iconify-icon icon="solar:star-linear" width="12" height="12"></iconify-icon>
                  {fanTierOptions.find(t => t.value === user.fanTier)?.label}
                </span>
              </div>

               <div className="date-cell">
                <iconify-icon icon="solar:calendar-linear" width="14" height="14"></iconify-icon>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="actions-cell">
                <button onClick={() => handleEditUser(user)} title="Edit User">
                  <iconify-icon icon="solar:pen-linear" width="16" height="16"></iconify-icon>
                </button>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="empty-row">
              <iconify-icon icon="solar:users-group-rounded-linear" width="24" height="24"></iconify-icon>
              <p>No users found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUserId && editData && (
        <div className="modal-overlay" onClick={() => setEditingUserId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="close-btn" onClick={() => setEditingUserId(null)}>
                <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
              </button>
            </div>

            <div className="edit-form">
              <div className="form-group">
                <label>Display Name</label>
                <input 
                  type="text"
                  value={editData.displayName}
                  onChange={(e) => setEditData(p => p ? { ...p, displayName: e.target.value } : null)}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(p => p ? { ...p, email: e.target.value } : null)}
                  disabled
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    value={editData.role}
                    onChange={(e) => setEditData(p => p ? { ...p, role: e.target.value as UserRole } : null)}
                  >
                    {roleOptions.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Fan Tier</label>
                  <select 
                    value={editData.fanTier}
                    onChange={(e) => setEditData(p => p ? { ...p, fanTier: e.target.value as FanTier } : null)}
                  >
                    {fanTierOptions.map(tier => (
                      <option key={tier.value} value={tier.value}>{tier.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setEditingUserId(null)}>
                  Cancel
                </button>
                <button type="button" className="submit-btn" onClick={handleSaveUser}>
                  <iconify-icon icon="solar:diskette-linear" width="16" height="16"></iconify-icon>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-users {
          padding: 24px;
        }

        .users-header {
          margin-bottom: 24px;
        }

        .users-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px 0;
        }

        .users-header p {
          color: #808080;
          margin: 0;
        }

        .filters-row {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }

        .search-bar {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 10px;
        }

        .search-bar input {
          flex: 1;
          background: transparent;
          border: none;
          color: #e0e0e0;
          font-size: 14px;
          outline: none;
        }

        .search-bar svg {
          color: #606060;
        }

        .role-filter {
          position: relative;
          display: flex;
          align-items: center;
        }

        .role-filter select {
          padding: 12px 40px 12px 16px;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 10px;
          color: #e0e0e0;
          font-size: 14px;
          cursor: pointer;
          appearance: none;
          outline: none;
        }

        .role-filter svg {
          position: absolute;
          right: 12px;
          color: #606060;
          pointer-events: none;
        }

        .stats-row {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 10px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #808080;
          font-size: 14px;
        }

        .stat-item svg {
          color: #c41e3a;
        }

        .users-table {
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 80px;
          gap: 16px;
          padding: 14px 20px;
          background: #0a0a0a;
          font-size: 12px;
          font-weight: 600;
          color: #808080;
          text-transform: uppercase;
        }

        .table-body {
          max-height: 500px;
          overflow-y: auto;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 80px;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid #1a1a1a;
          align-items: center;
          transition: background 0.2s;
        }

        .table-row:hover {
          background: #0a0a0a;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #8b0000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-avatar span {
          color: #fff;
          font-weight: 600;
          font-size: 14px;
        }

        .user-name {
          color: #e0e0e0;
          font-weight: 500;
        }

        .email-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #808080;
          font-size: 13px;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border: 1px solid;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #606060;
          font-size: 13px;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
        }

        .actions-cell button {
          width: 32px;
          height: 32px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          color: #808080;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .actions-cell button:hover {
          background: #2a2a2a;
          color: #e0e0e0;
        }

        .empty-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px 20px;
          color: #606060;
        }

        .empty-row p {
          margin: 0;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: #111;
          border: 1px solid #2a2a2a;
          border-radius: 16px;
          width: 100%;
          max-width: 450px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #1a1a1a;
        }

        .modal-header h3 {
          margin: 0;
          color: #fff;
          font-size: 20px;
        }

        .close-btn {
          background: none;
          border: none;
          color: #808080;
          cursor: pointer;
        }

        .edit-form {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          color: #808080;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: #e0e0e0;
          font-size: 14px;
          outline: none;
        }

        .form-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-group small {
          display: block;
          margin-top: 6px;
          color: #606060;
          font-size: 12px;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #8b0000;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #1a1a1a;
        }

        .cancel-btn {
          padding: 12px 24px;
          background: transparent;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: #808080;
          cursor: pointer;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #8b0000;
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .table-header,
          .table-row {
            grid-template-columns: 2fr 1fr 1fr 80px;
          }

          .email-cell,
          .date-cell {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .admin-users {
            padding: 16px;
          }

          .filters-row {
            flex-direction: column;
          }

          .table-header {
            display: none;
          }

          .table-row {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }

          .user-cell {
            width: 100%;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
