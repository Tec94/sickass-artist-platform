import { useState, useCallback } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Doc, Id } from '../../../convex/_generated/dataModel'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Archive,
  Package,
  DollarSign,
  Tag,
  Image,
  Save,
  X,
  ChevronDown,
  AlertCircle
} from 'lucide-react'
import { showToast } from '../../lib/toast'

type ProductCategory = 'apparel' | 'accessories' | 'vinyl' | 'limited' | 'other'
type ProductStatus = 'active' | 'draft' | 'archived'

interface ProductFormData {
  name: string
  description: string
  price: number
  category: ProductCategory
  tags: string[]
  images: string[]
  status: ProductStatus
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  category: 'apparel',
  tags: [],
  images: [],
  status: 'draft'
}

export function AdminMerch() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<Id<'merchProducts'> | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [searchQuery, setSearchQuery] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [imageUrlInput, setImageUrlInput] = useState('')

  // Fetch products
  const products = useQuery(api.merch.getProducts, { 
    page: 0, 
    pageSize: 50,
    search: searchQuery || undefined
  })

  // Mutations would be added to convex/admin.ts
  // For now, we'll show the UI and display placeholder actions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      showToast('Product name is required', { type: 'error' })
      return
    }

    if (formData.price <= 0) {
      showToast('Price must be greater than 0', { type: 'error' })
      return
    }

    // TODO: Call mutation when backend is ready
    showToast(editingId ? 'Product updated!' : 'Product created!', { type: 'success' })
    setShowForm(false)
    setEditingId(null)
    setFormData(initialFormData)
  }

  const handleEdit = (product: Doc<'merchProducts'>) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category as ProductCategory,
      tags: product.tags || [],
      images: product.images || [],
      status: product.status as ProductStatus
    })
    setEditingId(product._id)
    setShowForm(true)
  }

  const handleDelete = async (productId: Id<'merchProducts'>) => {
    if (!confirm('Are you sure you want to archive this product?')) return
    // TODO: Call mutation when backend is ready
    showToast('Product archived', { type: 'success' })
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const addImageUrl = () => {
    if (imageUrlInput.trim() && !formData.images.includes(imageUrlInput.trim())) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }))
      setImageUrlInput('')
    }
  }

  const removeImage = (url: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(i => i !== url) }))
  }

  return (
    <div className="admin-merch">
      {/* Header */}
      <div className="merch-header">
        <div>
          <h2>Merchandise Management</h2>
          <p>Create, edit, and manage product listings</p>
        </div>
        <button className="add-btn" onClick={() => {
          setFormData(initialFormData)
          setEditingId(null)
          setShowForm(true)
        }}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={18} />
        <input 
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value as ProductCategory }))}
                  >
                    <option value="apparel">Apparel</option>
                    <option value="accessories">Accessories</option>
                    <option value="vinyl">Vinyl</option>
                    <option value="limited">Limited Edition</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as ProductStatus }))}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tag-input-row">
                  <input 
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button type="button" onClick={addTag}>Add</button>
                </div>
                <div className="tags-list">
                  {formData.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Images (URLs)</label>
                <div className="tag-input-row">
                  <input 
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Add image URL"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                  />
                  <button type="button" onClick={addImageUrl}>Add</button>
                </div>
                <div className="images-preview">
                  {formData.images.map((url, i) => (
                    <div key={i} className="image-preview-item">
                      <img src={url} alt={`Preview ${i + 1}`} />
                      <button type="button" onClick={() => removeImage(url)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <Save size={16} />
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="products-list">
        {products?.items?.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <h3>No products found</h3>
            <p>Create your first product to get started</p>
          </div>
        )}

        {products?.items?.map(product => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <div className="no-image"><Image size={24} /></div>
              )}
            </div>
            <div className="product-info">
              <h4>{product.name}</h4>
              <p className="product-desc">{product.description}</p>
              <div className="product-meta">
                <span className="price">${(product.price / 100).toFixed(2)}</span>
                <span className={`status status-${product.status}`}>{product.status}</span>
                <span className="category">{product.category}</span>
              </div>
            </div>
            <div className="product-actions">
              <button onClick={() => handleEdit(product)} title="Edit">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDelete(product._id)} title="Archive" className="delete">
                <Archive size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .admin-merch {
          padding: 24px;
        }

        .merch-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .merch-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px 0;
        }

        .merch-header p {
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
          max-width: 600px;
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

        .product-form {
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
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px;
          background: #0a0a0a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: #e0e0e0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          border-color: #8b0000;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }

        .tag-input-row {
          display: flex;
          gap: 8px;
        }

        .tag-input-row input {
          flex: 1;
        }

        .tag-input-row button {
          padding: 8px 16px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: #e0e0e0;
          cursor: pointer;
        }

        .tag-input-row button:hover {
          background: #2a2a2a;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(139, 0, 0, 0.2);
          border: 1px solid #8b0000;
          border-radius: 20px;
          color: #c41e3a;
          font-size: 12px;
        }

        .tag button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0;
          display: flex;
        }

        .images-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 12px;
        }

        .image-preview-item {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-preview-item button {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          border-radius: 50%;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
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

        /* Products List */
        .products-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
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

        .empty-state h3 {
          color: #808080;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          margin: 0;
        }

        .product-card {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .product-card:hover {
          border-color: #2a2a2a;
        }

        .product-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          width: 100%;
          height: 100%;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #404040;
        }

        .product-info {
          flex: 1;
          min-width: 0;
        }

        .product-info h4 {
          margin: 0 0 4px 0;
          color: #fff;
          font-size: 16px;
        }

        .product-desc {
          margin: 0 0 8px 0;
          color: #808080;
          font-size: 13px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-meta {
          display: flex;
          gap: 12px;
          font-size: 13px;
        }

        .price {
          color: #4ade80;
          font-weight: 600;
        }

        .status {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          text-transform: uppercase;
        }

        .status-active {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
        }

        .status-draft {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
        }

        .status-archived {
          background: rgba(127, 127, 127, 0.1);
          color: #7f7f7f;
        }

        .category {
          color: #606060;
        }

        .product-actions {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .product-actions button {
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

        .product-actions button:hover {
          background: #2a2a2a;
          color: #e0e0e0;
        }

        .product-actions button.delete:hover {
          background: rgba(139, 0, 0, 0.3);
          border-color: #8b0000;
          color: #c41e3a;
        }

        @media (max-width: 768px) {
          .admin-merch {
            padding: 16px;
          }

          .merch-header {
            flex-direction: column;
            gap: 16px;
          }

          .add-btn {
            width: 100%;
            justify-content: center;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .product-card {
            flex-direction: column;
          }

          .product-image {
            width: 100%;
            height: 150px;
          }
        }
      `}</style>
    </div>
  )
}
