import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { showToast } from '../../lib/toast'
import { useAdminAccess } from '../../hooks/useAdminAccess'

interface CategoryFormData {
  name: string
  description: string
  color: string
  icon: string
}

const initialCategoryForm: CategoryFormData = {
  name: '',
  description: '',
  color: '#8b0000',
  icon: '💬'
}

const iconOptions = ['💬', '🎵', '🎨', '📢', '🎮', '💡', '🎤', '🎸', '🎹', '🎧']
const colorOptions = ['#8b0000', '#1e40af', '#065f46', '#7c2d12', '#581c87', '#0f766e']

export function AdminForum() {
  const { canUseAdminQueries, canUseAdminActions } = useAdminAccess()
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<Id<'categories'> | null>(null)
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>(initialCategoryForm)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Id<'categories'> | null>(null)
  const [_isSubmitting, setIsSubmitting] = useState(false)

  // Fetch data
  const categories = useQuery(api.forum.getCategories, canUseAdminQueries ? {} : 'skip')

  // Admin mutations
  const createCategory = useMutation(api.admin.createCategory)
  const updateCategory = useMutation(api.admin.updateCategory)
  const deleteCategoryMut = useMutation(api.admin.deleteCategory)
  // Unused mutations - reserved for future thread moderation features
  // const pinThread = useMutation(api.admin.pinThread)
  // const lockThread = useMutation(api.admin.lockThread)
  // const deleteThreadMut = useMutation(api.admin.deleteThread)

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canUseAdminActions) {
      showToast('Session not ready or access denied', { type: 'error' })
      return
    }
    
    if (!categoryForm.name.trim()) {
      showToast('Category name is required', { type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      if (editingCategoryId) {
        await updateCategory({
          categoryId: editingCategoryId,
          updates: {
            name: categoryForm.name,
            description: categoryForm.description,
            icon: categoryForm.icon,
            color: categoryForm.color,
          },
        })
        showToast('Category updated successfully!', { type: 'success' })
      } else {
        await createCategory({
          name: categoryForm.name,
          description: categoryForm.description,
          slug: categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
          icon: categoryForm.icon,
          color: categoryForm.color,
        })
        showToast('Category created successfully!', { type: 'success' })
      }
      setShowCategoryForm(false)
      setEditingCategoryId(null)
      setCategoryForm(initialCategoryForm)
    } catch (error) {
      console.error('Error saving category:', error)
      showToast(
        error instanceof Error ? error.message : 'Failed to save category. Please try again.',
        { type: 'error' }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCategory = (category: { _id: Id<'categories'>; name: string; description?: string }) => {
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      color: '#8b0000',
      icon: '💬'
    })
    setEditingCategoryId(category._id)
    setShowCategoryForm(true)
  }

  const handleDeleteCategory = async (categoryId: Id<'categories'>) => {
    if (!canUseAdminActions) {
      showToast('Session not ready or access denied', { type: 'error' })
      return
    }
    if (!confirm('Delete this category? All threads will be moved to General.')) return
    
    try {
      await deleteCategoryMut({ categoryId })
      showToast('Category deleted successfully!', { type: 'success' })
      if (selectedCategory === categoryId) {
        setSelectedCategory(null)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      showToast(
        error instanceof Error ? error.message : 'Failed to delete category. Please try again.',
        { type: 'error' }
      )
    }
  }

  // Unused handler functions - reserved for future thread moderation features
  // const _handlePinThread = async (_threadId: Id<'threads'>, _isPinned: boolean) => { ... }
  // const _handleLockThread = async (_threadId: Id<'threads'>, _isLocked: boolean) => { ... }
  // const _handleDeleteThread = async (_threadId: Id<'threads'>) => { ... }

  return (
    <div className="admin-forum">
      {/* Header */}
      <div className="forum-header">
        <div>
          <h2>Forum Moderation</h2>
          <p>Manage categories, threads, and moderate content</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="forum-layout">
        {/* Categories Panel */}
        <div className="categories-panel">
          <div className="panel-header">
            <h3>Categories</h3>
            <button className="icon-btn" onClick={() => {
              setCategoryForm(initialCategoryForm)
              setEditingCategoryId(null)
              setShowCategoryForm(true)
            }} title="Add Category">
              <iconify-icon icon="solar:plus-linear" width="18" height="18"></iconify-icon>
            </button>
          </div>

          <div className="categories-list">
            {categories?.map(category => (
              <div 
                key={category._id}
                className={`category-item ${selectedCategory === category._id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category._id)}
              >
                <div className="category-icon">💬</div>
                <div className="category-info">
                  <span className="category-name">{category.name}</span>
                  <span className="category-count">{category.threadCount || 0} threads</span>
                </div>
                <div className="category-actions" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleEditCategory(category)} title="Edit">
                    <iconify-icon icon="solar:pen-linear" width="14" height="14"></iconify-icon>
                  </button>
                  <button onClick={() => handleDeleteCategory(category._id)} title="Delete">
                    <iconify-icon icon="solar:trash-bin-trash-linear" width="14" height="14"></iconify-icon>
                  </button>
                </div>
              </div>
            ))}

            {(!categories || categories.length === 0) && (
              <div className="empty-message">
                <iconify-icon icon="solar:folder-open-linear" width="24" height="24"></iconify-icon>
                <p>No categories yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Threads Panel */}
        <div className="threads-panel">
          <div className="panel-header">
            <h3>Threads</h3>
            <div className="search-input">
              <iconify-icon icon="solar:magnifer-linear" width="16" height="16"></iconify-icon>
              <input 
                type="text"
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="threads-list">
            {/* Placeholder thread items */}
            <div className="thread-item">
              <div className="thread-status">
                <iconify-icon icon="solar:pin-linear" width="14" height="14" class="pinned"></iconify-icon>
              </div>
              <div className="thread-content">
                <h4>Welcome to the Community Forum</h4>
                <div className="thread-meta">
                  <span>by Admin</span>
                  <span>•</span>
                  <span>12 replies</span>
                  <span>•</span>
                  <span>2 hours ago</span>
                </div>
              </div>
              <div className="thread-actions">
                <button title="Unpin"><iconify-icon icon="solar:pin-linear" width="16" height="16"></iconify-icon></button>
                <button title="Lock"><iconify-icon icon="solar:lock-linear" width="16" height="16"></iconify-icon></button>
                <button title="Delete" className="delete"><iconify-icon icon="solar:trash-bin-trash-linear" width="16" height="16"></iconify-icon></button>
              </div>
            </div>

            <div className="thread-item">
              <div className="thread-status">
                <iconify-icon icon="solar:lock-linear" width="14" height="14" class="locked"></iconify-icon>
              </div>
              <div className="thread-content">
                <h4>Forum Rules and Guidelines</h4>
                <div className="thread-meta">
                  <span>by Moderator</span>
                  <span>•</span>
                  <span>0 replies</span>
                  <span>•</span>
                  <span>1 day ago</span>
                </div>
              </div>
              <div className="thread-actions">
                <button title="Pin"><iconify-icon icon="solar:pin-linear" width="16" height="16"></iconify-icon></button>
                <button title="Unlock"><iconify-icon icon="solar:lock-unlock-linear" width="16" height="16"></iconify-icon></button>
                <button title="Delete" className="delete"><iconify-icon icon="solar:trash-bin-trash-linear" width="16" height="16"></iconify-icon></button>
              </div>
            </div>

            {!selectedCategory && (
              <div className="empty-message center">
                <iconify-icon icon="solar:chat-square-dots-linear" width="32" height="32"></iconify-icon>
                <p>Select a category to view threads</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flagged Content Section */}
      <div className="flagged-section">
        <div className="section-header">
          <iconify-icon icon="solar:flag-linear" width="20" height="20"></iconify-icon>
          <h3>Flagged Content</h3>
          <span className="badge">0</span>
        </div>
        
        <div className="flagged-list">
          <div className="empty-message">
            <iconify-icon icon="solar:danger-triangle-linear" width="24" height="24"></iconify-icon>
            <p>No flagged content to review</p>
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="modal-overlay" onClick={() => setShowCategoryForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategoryId ? 'Edit Category' : 'Create Category'}</h3>
              <button className="close-btn" onClick={() => setShowCategoryForm(false)}>
                <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="category-form">
              <div className="form-group">
                <label>Category Name *</label>
                <input 
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Music Production"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What topics belong in this category?"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Icon</label>
                  <div className="icon-picker">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        className={`icon-option ${categoryForm.icon === icon ? 'active' : ''}`}
                        onClick={() => setCategoryForm(p => ({ ...p, icon }))}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <div className="color-picker">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${categoryForm.color === color ? 'active' : ''}`}
                        style={{ background: color }}
                        onClick={() => setCategoryForm(p => ({ ...p, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowCategoryForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <iconify-icon icon="solar:diskette-linear" width="16" height="16"></iconify-icon>
                  {editingCategoryId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-forum {
          padding: 24px;
        }

        .forum-header {
          margin-bottom: 24px;
        }

        .forum-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px 0;
        }

        .forum-header p {
          color: #808080;
          margin: 0;
        }

        .forum-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        .categories-panel,
        .threads-panel {
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #1a1a1a;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 16px;
          color: #fff;
        }

        .icon-btn {
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

        .icon-btn:hover {
          background: #8b0000;
          border-color: #8b0000;
          color: #fff;
        }

        .search-input {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
        }

        .search-input svg {
          color: #606060;
        }

        .search-input input {
          background: transparent;
          border: none;
          color: #e0e0e0;
          font-size: 13px;
          outline: none;
          width: 150px;
        }

        .categories-list {
          padding: 12px;
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-item:hover {
          background: #1a1a1a;
        }

        .category-item.active {
          background: rgba(139, 0, 0, 0.2);
          border: 1px solid #8b0000;
        }

        .category-icon {
          width: 36px;
          height: 36px;
          background: rgba(139, 0, 0, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .category-info {
          flex: 1;
          min-width: 0;
        }

        .category-name {
          display: block;
          color: #e0e0e0;
          font-weight: 500;
          font-size: 14px;
        }

        .category-count {
          font-size: 12px;
          color: #606060;
        }

        .category-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .category-item:hover .category-actions {
          opacity: 1;
        }

        .category-actions button {
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #606060;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-actions button:hover {
          background: #2a2a2a;
          color: #e0e0e0;
        }

        .threads-list {
          padding: 12px;
          max-height: 400px;
          overflow-y: auto;
        }

        .thread-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #0a0a0a;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .thread-status {
          width: 24px;
          flex-shrink: 0;
          padding-top: 2px;
        }

        .thread-status .pinned {
          color: #fbbf24;
        }

        .thread-status .locked {
          color: #ef4444;
        }

        .thread-content {
          flex: 1;
          min-width: 0;
        }

        .thread-content h4 {
          margin: 0 0 4px 0;
          color: #e0e0e0;
          font-size: 14px;
        }

        .thread-meta {
          display: flex;
          gap: 8px;
          font-size: 12px;
          color: #606060;
        }

        .thread-actions {
          display: flex;
          gap: 4px;
        }

        .thread-actions button {
          width: 32px;
          height: 32px;
          background: #1a1a1a;
          border: none;
          border-radius: 6px;
          color: #606060;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .thread-actions button:hover {
          background: #2a2a2a;
          color: #e0e0e0;
        }

        .thread-actions button.delete:hover {
          background: rgba(139, 0, 0, 0.3);
          color: #c41e3a;
        }

        .empty-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 40px 20px;
          color: #606060;
          text-align: center;
        }

        .empty-message.center {
          padding: 60px 20px;
        }

        .empty-message p {
          margin: 0;
          font-size: 13px;
        }

        .flagged-section {
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 20px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: #c41e3a;
        }

        .section-header h3 {
          margin: 0;
          color: #fff;
          font-size: 18px;
        }

        .section-header .badge {
          padding: 2px 8px;
          background: #2a2a2a;
          border-radius: 12px;
          font-size: 12px;
          color: #808080;
        }

        .flagged-list {
          background: #0a0a0a;
          border-radius: 8px;
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

        .category-form {
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
        .form-group textarea {
          width: 100%;
          padding: 12px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: #e0e0e0;
          font-size: 14px;
          outline: none;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #8b0000;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .icon-picker,
        .color-picker {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .icon-option {
          width: 40px;
          height: 40px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          font-size: 20px;
          cursor: pointer;
        }

        .icon-option:hover,
        .icon-option.active {
          border-color: #8b0000;
          background: rgba(139, 0, 0, 0.1);
        }

        .color-option {
          width: 32px;
          height: 32px;
          border: 2px solid transparent;
          border-radius: 6px;
          cursor: pointer;
        }

        .color-option:hover,
        .color-option.active {
          border-color: #fff;
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

        @media (max-width: 900px) {
          .forum-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .admin-forum {
            padding: 16px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
