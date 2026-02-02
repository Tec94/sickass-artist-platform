import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { showToast } from '../../lib/toast'
import { useAuth } from '../../hooks/useAuth'
import { useTokenAuth } from '../ConvexAuthProvider'

type ChannelAccessLevel = 'public' | 'members' | 'vip'

interface ChannelFormData {
  name: string
  description: string
  accessLevel: ChannelAccessLevel
}

const initialFormData: ChannelFormData = {
  name: '',
  description: '',
  accessLevel: 'public'
}

export function AdminChat() {
  const { user, isLoading: isUserLoading } = useAuth()
  const { hasValidToken, isTokenLoading } = useTokenAuth()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<Id<'channels'> | null>(null)
  const [formData, setFormData] = useState<ChannelFormData>(initialFormData)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  const isRoleAllowed = !!user && ['admin', 'mod', 'artist'].includes(user.role)
  const canManageChannels = hasValidToken && isRoleAllowed

  // Fetch channels
  const channels = useQuery(api.admin.listChannels, canManageChannels ? {} : 'skip')

  // Admin mutations
  const createChannel = useMutation(api.admin.createChannel)
  const updateChannel = useMutation(api.admin.updateChannel)
  const deleteChannel = useMutation(api.admin.deleteChannel)
  const seedDefaultChannels = useMutation(api.admin.seedDefaultChannels)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      showToast('Channel name is required', { type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      // Map access level to backend schema
      const requiredRole =
        formData.accessLevel === 'members' || formData.accessLevel === 'vip'
          ? ('fan' as const)
          : undefined
      const requiredFanTier = formData.accessLevel === 'vip' ? ('gold' as const) : undefined

      if (editingId) {
        await updateChannel({
          channelId: editingId,
          updates: {
            name: formData.name,
            description: formData.description,
            requiredRole,
            requiredFanTier,
          },
        })
        showToast('Channel updated successfully!', { type: 'success' })
      } else {
        await createChannel({
          name: formData.name,
          description: formData.description,
          requiredRole,
          requiredFanTier,
        })
        showToast('Channel created successfully!', { type: 'success' })
      }
      setShowForm(false)
      setEditingId(null)
      setFormData(initialFormData)
    } catch (error) {
      console.error('Error saving channel:', error)
      showToast(
        error instanceof Error ? error.message : 'Failed to save channel. Please try again.',
        { type: 'error' }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (channel: { _id: Id<'channels'>; name: string; description?: string; requiredRole?: string | null; requiredFanTier?: string | null }) => {
    const accessLevel: ChannelAccessLevel = channel.requiredFanTier
      ? 'vip'
      : channel.requiredRole
      ? 'members'
      : 'public'

    setFormData({
      name: channel.name,
      description: channel.description || '',
      accessLevel,
    })
    setEditingId(channel._id)
    setShowForm(true)
  }

  const handleDelete = async (channelId: Id<'channels'>) => {
    if (!confirm('Are you sure you want to delete this channel? All messages will be lost.')) return
    
    try {
      await deleteChannel({ channelId })
      showToast('Channel deleted successfully!', { type: 'success' })
    } catch (error) {
      console.error('Error deleting channel:', error)
      showToast(
        error instanceof Error ? error.message : 'Failed to delete channel. Please try again.',
        { type: 'error' }
      )
    }
  }

  const getAccessIcon = (level: ChannelAccessLevel) => {
    switch (level) {
      case 'public': return 'solar:global-linear'
      case 'members': return 'solar:users-group-rounded-linear'
      case 'vip': return 'solar:crown-linear'
    }
  }

  const getChannelAccess = (channel: { requiredRole?: string | null; requiredFanTier?: string | null }) => {
    if (channel.requiredFanTier) {
      return { level: 'vip' as const, label: 'VIP' }
    }
    if (channel.requiredRole) {
      return { level: 'members' as const, label: 'Members' }
    }
    return { level: 'public' as const, label: 'Public' }
  }

  const handleSeedDefaults = async () => {
    setIsSeeding(true)
    try {
      await seedDefaultChannels()
      showToast('Default channels checked', { type: 'success' })
    } catch (error) {
      console.error('Error seeding channels:', error)
      showToast(
        error instanceof Error ? error.message : 'Failed to seed channels. Please try again.',
        { type: 'error' }
      )
    } finally {
      setIsSeeding(false)
    }
  }

  const filteredChannels = channels?.filter(ch => 
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (isTokenLoading || isUserLoading) {
    return (
      <div className="admin-chat">
        <div className="empty-state">
          <iconify-icon icon="solar:spinner-linear" width="48" height="48" class="animate-spin"></iconify-icon>
          <h3>Loading admin tools</h3>
          <p>Syncing your session…</p>
        </div>
      </div>
    )
  }

  if (!hasValidToken) {
    return (
      <div className="admin-chat">
        <div className="empty-state">
          <iconify-icon icon="solar:shield-warning-linear" width="48" height="48"></iconify-icon>
          <h3>Session not ready</h3>
          <p>Please refresh or sign out and back in to access admin tools.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="admin-chat">
        <div className="empty-state">
          <iconify-icon icon="solar:user-cross-linear" width="48" height="48"></iconify-icon>
          <h3>User profile missing</h3>
          <p>We couldn’t load your profile. Try refreshing the page.</p>
        </div>
      </div>
    )
  }

  if (!isRoleAllowed) {
    return (
      <div className="admin-chat">
        <div className="empty-state">
          <iconify-icon icon="solar:shield-warning-linear" width="48" height="48"></iconify-icon>
          <h3>Access denied</h3>
          <p>Your account doesn’t have access to manage chat channels.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-chat">
      {/* Header */}
      <div className="chat-header">
        <div>
          <h2>Chat Channel Management</h2>
          <p>Create and manage chat channels for the community</p>
        </div>
        <div className="header-actions">
          <button className="seed-btn" onClick={handleSeedDefaults} disabled={isSeeding}>
            <iconify-icon icon="solar:database-linear" width="18" height="18"></iconify-icon>
            {isSeeding ? 'Seeding...' : 'Seed Defaults'}
          </button>
          <button className="add-btn" onClick={() => {
            setFormData(initialFormData)
            setEditingId(null)
            setShowForm(true)
          }}>
            <iconify-icon icon="solar:add-circle-linear" width="18" height="18"></iconify-icon>
            Create Channel
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <iconify-icon icon="solar:magnifer-linear" width="18" height="18"></iconify-icon>
        <input 
          type="text"
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Channel Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Channel' : 'Create New Channel'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="channel-form">
              <div className="form-group">
                <label>Channel Name *</label>
                <div className="input-with-icon">
                  <iconify-icon icon="solar:hashtag-linear" width="16" height="16"></iconify-icon>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    placeholder="general"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="What's this channel about?"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Access Level</label>
                <div className="access-options">
                  <button 
                    type="button"
                    className={`access-option ${formData.accessLevel === 'public' ? 'active' : ''}`}
                    onClick={() => setFormData(p => ({ ...p, accessLevel: 'public' }))}
                  >
                    <iconify-icon icon="solar:global-linear" width="20" height="20"></iconify-icon>
                    <span>Public</span>
                    <small>Anyone can view and chat</small>
                  </button>
                  <button 
                    type="button"
                    className={`access-option ${formData.accessLevel === 'members' ? 'active' : ''}`}
                    onClick={() => setFormData(p => ({ ...p, accessLevel: 'members' }))}
                  >
                    <iconify-icon icon="solar:users-group-rounded-linear" width="20" height="20"></iconify-icon>
                    <span>Members Only</span>
                    <small>Logged in users only</small>
                  </button>
                  <button 
                    type="button"
                    className={`access-option ${formData.accessLevel === 'vip' ? 'active' : ''}`}
                    onClick={() => setFormData(p => ({ ...p, accessLevel: 'vip' }))}
                  >
                    <iconify-icon icon="solar:crown-linear" width="20" height="20"></iconify-icon>
                    <span>VIP</span>
                    <small>Premium members only</small>
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <iconify-icon icon="solar:spinner-linear" width="16" height="16" class="animate-spin"></iconify-icon>
                  ) : (
                    <iconify-icon icon="solar:diskette-linear" width="16" height="16"></iconify-icon>
                  )}
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Channel' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Channels List */}
      <div className="channels-grid">
        {filteredChannels.length === 0 && (
          <div className="empty-state">
            <iconify-icon icon="solar:chat-square-dots-linear" width="48" height="48"></iconify-icon>
            <h3>No channels found</h3>
            <p>Create your first channel to get started</p>
          </div>
        )}

        {filteredChannels.map(channel => {
          const access = getChannelAccess(channel)
          return (
          <div key={channel._id} className="channel-card">
            <div className="channel-icon">
              <iconify-icon icon="solar:hashtag-linear" width="24" height="24"></iconify-icon>
            </div>
            <div className="channel-info">
              <div className="channel-name-row">
                <h4># {channel.name}</h4>
                <span className="access-badge">
                  <iconify-icon icon={getAccessIcon(access.level)} width="14" height="14"></iconify-icon> 
                  {access.label}
                </span>
              </div>
              <p className="channel-desc">{channel.description || 'No description'}</p>
              <div className="channel-stats">
                <span><iconify-icon icon="solar:chat-square-dots-linear" width="14" height="14"></iconify-icon> {channel.messageCount ?? 0} messages</span>
                <span><iconify-icon icon="solar:users-group-rounded-linear" width="14" height="14"></iconify-icon> — members</span>
              </div>
            </div>
            <div className="channel-actions">
              <button onClick={() => handleEdit(channel)} title="Edit">
                <iconify-icon icon="solar:pen-linear" width="16" height="16"></iconify-icon>
              </button>
              <button onClick={() => handleDelete(channel._id)} title="Delete" className="delete">
                <iconify-icon icon="solar:trash-bin-trash-linear" width="16" height="16"></iconify-icon>
              </button>
            </div>
          </div>
        )})}
      </div>

      {/* Moderation Section */}
      <div className="moderation-section">
        <div className="section-header">
          <iconify-icon icon="solar:shield-check-linear" width="20" height="20"></iconify-icon>
          <h3>Chat Moderation</h3>
        </div>
        
        <div className="moderation-tools">
          <div className="mod-card">
            <iconify-icon icon="solar:danger-triangle-linear" width="24" height="24"></iconify-icon>
            <div>
              <h4>Flagged Messages</h4>
              <p>0 messages pending review</p>
            </div>
            <button className="view-btn">View All</button>
          </div>
          
          <div className="mod-card">
            <iconify-icon icon="solar:lock-linear" width="24" height="24"></iconify-icon>
            <div>
              <h4>Banned Users</h4>
              <p>0 users currently banned</p>
            </div>
            <button className="view-btn">Manage</button>
          </div>
        </div>
      </div>

      <style>{`
        .admin-chat {
          padding: 24px;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .chat-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px 0;
        }

        .chat-header p {
          color: #808080;
          margin: 0;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #8b0000;
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover {
          background: #a00000;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 10px;
          margin-bottom: 24px;
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
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
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
          padding: 4px;
        }

        .close-btn:hover {
          color: #fff;
        }

        .channel-form {
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

        .input-with-icon {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
        }

        .input-with-icon svg {
          color: #606060;
        }

        .input-with-icon input {
          flex: 1;
          background: transparent;
          border: none;
          color: #e0e0e0;
          font-size: 14px;
          outline: none;
        }

        .form-group textarea {
          width: 100%;
          padding: 12px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: #e0e0e0;
          font-size: 14px;
          outline: none;
          resize: vertical;
        }

        .access-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .access-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          color: #808080;
          transition: all 0.2s;
        }

        .access-option:hover {
          border-color: #3a3a3a;
        }

        .access-option.active {
          border-color: #8b0000;
          background: rgba(139, 0, 0, 0.1);
        }

        .access-option.active svg,
        .access-option.active span {
          color: #c41e3a;
        }

        .access-option svg {
          color: #606060;
        }

        .access-option span {
          font-weight: 600;
          color: #e0e0e0;
        }

        .access-option small {
          margin-left: auto;
          font-size: 12px;
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

        .cancel-btn:hover {
          background: #1a1a1a;
          color: #e0e0e0;
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

        .submit-btn:hover {
          background: #a00000;
        }

        /* Channels Grid */
        .channels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #606060;
        }

        .empty-state svg {
          opacity: 0.3;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          color: #808080;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          margin: 0;
        }

        .channel-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .channel-card:hover {
          border-color: #2a2a2a;
        }

        .channel-icon {
          width: 48px;
          height: 48px;
          background: rgba(139, 0, 0, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c41e3a;
          flex-shrink: 0;
        }

        .channel-info {
          flex: 1;
          min-width: 0;
        }

        .channel-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }

        .channel-info h4 {
          margin: 0;
          color: #fff;
          font-size: 16px;
        }

        .access-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: rgba(139, 0, 0, 0.1);
          border-radius: 4px;
          font-size: 11px;
          color: #808080;
        }

        .channel-desc {
          margin: 0 0 8px 0;
          color: #606060;
          font-size: 13px;
        }

        .channel-stats {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #606060;
        }

        .channel-stats span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .channel-actions {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .channel-actions button {
          width: 36px;
          height: 36px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: #808080;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .channel-actions button:hover {
          background: #2a2a2a;
          color: #e0e0e0;
        }

        .channel-actions button.delete:hover {
          background: rgba(139, 0, 0, 0.3);
          border-color: #8b0000;
          color: #c41e3a;
        }

        /* Moderation Section */
        .moderation-section {
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 24px;
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

        .moderation-tools {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .mod-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #0a0a0a;
          border-radius: 10px;
        }

        .mod-card svg {
          color: #606060;
        }

        .mod-card h4 {
          margin: 0;
          color: #e0e0e0;
          font-size: 14px;
        }

        .mod-card p {
          margin: 4px 0 0 0;
          color: #606060;
          font-size: 12px;
        }

        .view-btn {
          margin-left: auto;
          padding: 8px 16px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          color: #808080;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background: #2a2a2a;
          color: #e0e0e0;
        }

        @media (max-width: 768px) {
          .admin-chat {
            padding: 16px;
          }

          .chat-header {
            flex-direction: column;
            gap: 16px;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
          }

          .add-btn,
          .seed-btn {
            width: 100%;
            justify-content: center;
          }

          .channels-grid {
            grid-template-columns: 1fr;
          }

          .channel-card {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
