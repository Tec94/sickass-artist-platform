import { useState, useRef, useCallback } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Doc, Id } from '../../../convex/_generated/dataModel'
import { showToast } from '../../lib/toast'
import { useAuth } from '../../hooks/useAuth'

type ProductCategory = 'apparel' | 'accessories' | 'vinyl' | 'limited' | 'other'
type ProductStatus = 'active' | 'draft' | 'archived'

type ModelConfigFormData = {
  autoRotate: boolean
  cameraOrbit: string
  minFov?: number
  maxFov?: number
}

interface ProductFormData {
  name: string
  description: string
  price: number
  category: ProductCategory
  tags: string[]
  images: string[]
  status: ProductStatus
  model3dUrl: string
  modelPosterUrl: string
  modelConfig: ModelConfigFormData
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  category: 'apparel',
  tags: [],
  images: [],
  status: 'draft',
  model3dUrl: '',
  modelPosterUrl: '',
  modelConfig: {
    autoRotate: true,
    cameraOrbit: '',
    minFov: undefined,
    maxFov: undefined,
  },
}

const MAX_MODEL_MB = 40
const MAX_POSTER_MB = 10

function buildModelConfig(data: ModelConfigFormData) {
  const config: { autoRotate: boolean; cameraOrbit?: string; minFov?: number; maxFov?: number } = {
    autoRotate: data.autoRotate,
  }
  const trimmedOrbit = data.cameraOrbit.trim()
  if (trimmedOrbit) config.cameraOrbit = trimmedOrbit
  if (data.minFov && data.minFov > 0) config.minFov = data.minFov
  if (data.maxFov && data.maxFov > 0) config.maxFov = data.maxFov
  return config
}

export function AdminMerch() {
  const { isSignedIn, user } = useAuth()
  const hasAdminAccess = Boolean(user && (user.role === 'admin' || user.role === 'mod' || user.role === 'artist'))
  const includeDrafts = user?.role === 'admin'
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<Id<'merchProducts'> | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [searchQuery, setSearchQuery] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingAsset, setUploadingAsset] = useState<'model' | 'poster' | null>(null)

  const modelFileRef = useRef<HTMLInputElement>(null)
  const posterFileRef = useRef<HTMLInputElement>(null)

  // Fetch products
  const products = useQuery(api.merch.getProducts, {
    page: 0,
    pageSize: 50,
    search: searchQuery || undefined,
    includeDrafts: includeDrafts ? true : undefined,
  })

  // Admin mutations
  const createProduct = useMutation(api.admin.createProduct)
  const updateProduct = useMutation(api.admin.updateProduct)
  const archiveProduct = useMutation(api.admin.archiveProduct)
  const generateUploadUrl = useMutation(api.admin.generateMerchUploadUrl)
  const resolveUpload = useMutation(api.admin.resolveMerchUpload)

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setEditingId(null)
    setShowForm(false)
    setTagInput('')
    setImageUrlInput('')
    setUploadingAsset(null)
  }, [])

  const uploadAsset = useCallback(
    async (file: File, kind: 'model' | 'poster') => {
      if (!isSignedIn || !hasAdminAccess) {
        showToast('You must be signed in with admin privileges to upload assets.', { type: 'error' })
        return
      }

      if (kind === 'model' && !file.name.toLowerCase().endsWith('.glb')) {
        showToast('3D models must be provided as .glb files.', { type: 'error' })
        return
      }
      if (kind === 'poster' && !file.type.startsWith('image/')) {
        showToast('Poster uploads must be image files.', { type: 'error' })
        return
      }

      const maxBytes = (kind === 'model' ? MAX_MODEL_MB : MAX_POSTER_MB) * 1024 * 1024
      if (file.size > maxBytes) {
        showToast(`File exceeds the ${kind === 'model' ? MAX_MODEL_MB : MAX_POSTER_MB}MB limit.`, { type: 'error' })
        return
      }

      setUploadingAsset(kind)
      try {
        const uploadUrl = await generateUploadUrl({})
        const response = await fetch(uploadUrl, { method: 'POST', body: file })
        if (!response.ok) {
          throw new Error(`Upload failed (${response.status})`)
        }
        const payload = (await response.json()) as { storageId?: Id<'_storage'> }
        if (!payload.storageId) {
          throw new Error('Upload did not return a storage id')
        }
        const { url } = await resolveUpload({ storageId: payload.storageId })
        if (kind === 'model') {
          setFormData((prev) => ({ ...prev, model3dUrl: url }))
        } else {
          setFormData((prev) => ({ ...prev, modelPosterUrl: url }))
        }
        showToast(kind === 'model' ? '3D model uploaded.' : 'Poster uploaded.', { type: 'success' })
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to upload asset.', { type: 'error' })
      } finally {
        setUploadingAsset(null)
        if (kind === 'model' && modelFileRef.current) modelFileRef.current.value = ''
        if (kind === 'poster' && posterFileRef.current) posterFileRef.current.value = ''
      }
    },
    [generateUploadUrl, hasAdminAccess, isSignedIn, resolveUpload]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!isSignedIn || !hasAdminAccess) {
        showToast('You must be signed in with admin privileges to perform this action', { type: 'error' })
        return
      }

      if (!formData.name.trim()) {
        showToast('Product name is required', { type: 'error' })
        return
      }

      if (formData.price <= 0) {
        showToast('Price must be greater than 0', { type: 'error' })
        return
      }

      if (
        formData.modelConfig.minFov &&
        formData.modelConfig.maxFov &&
        formData.modelConfig.minFov > formData.modelConfig.maxFov
      ) {
        showToast('Minimum field of view cannot exceed maximum field of view.', { type: 'error' })
        return
      }

      const trimmedModelUrl = formData.model3dUrl.trim()
      const trimmedPosterUrl = formData.modelPosterUrl.trim()
      const hasModel = trimmedModelUrl.length > 0
      const modelConfig = hasModel ? buildModelConfig(formData.modelConfig) : undefined

      setIsSubmitting(true)
      try {
        if (editingId) {
          const updates: Parameters<typeof updateProduct>[0]['updates'] = {
            name: formData.name,
            description: formData.description,
            price: Math.round(formData.price * 100),
            category: formData.category,
            tags: formData.tags,
            images: formData.images,
            status: formData.status,
          }
          if (hasModel) updates.model3dUrl = trimmedModelUrl
          if (trimmedPosterUrl) updates.modelPosterUrl = trimmedPosterUrl
          if (modelConfig) updates.modelConfig = modelConfig

          await updateProduct({ productId: editingId, updates })
          showToast('Product updated successfully!', { type: 'success' })
        } else {
          const payload: Parameters<typeof createProduct>[0] = {
            name: formData.name,
            description: formData.description,
            price: Math.round(formData.price * 100),
            category: formData.category,
            tags: formData.tags,
            images: formData.images,
            status: formData.status,
          }
          if (hasModel) payload.model3dUrl = trimmedModelUrl
          if (trimmedPosterUrl) payload.modelPosterUrl = trimmedPosterUrl
          if (modelConfig) payload.modelConfig = modelConfig

          await createProduct(payload)
          showToast('Product created successfully!', { type: 'success' })
        }
        resetForm()
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to save product. Please try again.', {
          type: 'error',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [createProduct, editingId, formData, hasAdminAccess, isSignedIn, resetForm, updateProduct]
  )

  const handleEdit = useCallback((product: Doc<'merchProducts'>) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price / 100,
      category: product.category as ProductCategory,
      tags: product.tags || [],
      images: product.imageUrls || [],
      status: product.status as ProductStatus,
      model3dUrl: product.model3dUrl || '',
      modelPosterUrl: product.modelPosterUrl || '',
      modelConfig: {
        autoRotate: product.modelConfig?.autoRotate ?? true,
        cameraOrbit: product.modelConfig?.cameraOrbit || '',
        minFov: product.modelConfig?.minFov,
        maxFov: product.modelConfig?.maxFov,
      },
    })
    setTagInput('')
    setImageUrlInput('')
    setEditingId(product._id)
    setShowForm(true)
  }, [])

  const handleDelete = async (productId: Id<'merchProducts'>) => {
    if (!isSignedIn || !hasAdminAccess) {
      showToast('You must be signed in with admin privileges to perform this action', { type: 'error' })
      return
    }
    
    if (!confirm('Are you sure you want to archive this product?')) return
    
    try {
      await archiveProduct({ productId })
      showToast('Product archived successfully!', { type: 'success' })
    } catch (error) {
      console.error('Error archiving product:', error)
      showToast(
        error instanceof Error ? error.message : 'Failed to archive product. Please try again.',
        { type: 'error' }
      )
    }
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
          setTagInput('')
          setImageUrlInput('')
          setShowForm(true)
        }}>
          <iconify-icon icon="solar:plus-linear" width="18" height="18"></iconify-icon>
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <iconify-icon icon="solar:magnifer-linear" width="18" height="18"></iconify-icon>
        <input 
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="close-btn" onClick={resetForm}>
                <iconify-icon icon="solar:close-circle-linear" width="20" height="20"></iconify-icon>
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
                      <button type="button" onClick={() => removeTag(tag)}>
                        <iconify-icon icon="solar:close-circle-linear" width="12" height="12"></iconify-icon>
                      </button>
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
                        <iconify-icon icon="solar:close-circle-linear" width="14" height="14"></iconify-icon>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group model-section">
                <div className="model-header">
                  <label>3D Model (.glb)</label>
                  <span className="hint-text">Hero products can include an interactive model viewer.</span>
                </div>
                <div className="upload-row">
                  <input
                    type="url"
                    value={formData.model3dUrl}
                    onChange={(e) => setFormData(p => ({ ...p, model3dUrl: e.target.value }))}
                    placeholder="https://.../figurine.glb"
                  />
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={() => modelFileRef.current?.click()}
                    disabled={uploadingAsset === 'model'}
                  >
                    {uploadingAsset === 'model' ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                <input
                  ref={modelFileRef}
                  type="file"
                  accept=".glb,model/gltf-binary"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void uploadAsset(file, 'model')
                  }}
                />
              </div>

              <div className="form-group">
                <label>Model Poster Image</label>
                <div className="upload-row">
                  <input
                    type="url"
                    value={formData.modelPosterUrl}
                    onChange={(e) => setFormData(p => ({ ...p, modelPosterUrl: e.target.value }))}
                    placeholder="https://.../poster.jpg"
                  />
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={() => posterFileRef.current?.click()}
                    disabled={uploadingAsset === 'poster'}
                  >
                    {uploadingAsset === 'poster' ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                <input
                  ref={posterFileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void uploadAsset(file, 'poster')
                  }}
                />
              </div>

              <div className="form-row model-config-row">
                <div className="form-group">
                  <label>Auto-rotate</label>
                  <button
                    type="button"
                    className={`toggle-btn ${formData.modelConfig.autoRotate ? 'active' : ''}`}
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        modelConfig: { ...prev.modelConfig, autoRotate: !prev.modelConfig.autoRotate },
                      }))
                    }
                  >
                    {formData.modelConfig.autoRotate ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <div className="form-group">
                  <label>Camera Orbit</label>
                  <input
                    type="text"
                    value={formData.modelConfig.cameraOrbit}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        modelConfig: { ...prev.modelConfig, cameraOrbit: e.target.value },
                      }))
                    }
                    placeholder="0deg 75deg 2.2m"
                  />
                </div>
              </div>

              <div className="form-row model-config-row">
                <div className="form-group">
                  <label>Min FOV (deg)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formData.modelConfig.minFov ?? ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        modelConfig: { ...prev.modelConfig, minFov: value ? Number(value) : undefined },
                      }))
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Max FOV (deg)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formData.modelConfig.maxFov ?? ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        modelConfig: { ...prev.modelConfig, maxFov: value ? Number(value) : undefined },
                      }))
                    }}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={resetForm} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <iconify-icon icon="solar:spinner-linear" width="16" height="16" className="animate-spin"></iconify-icon>
                  ) : (
                    <iconify-icon icon="solar:diskette-linear" width="16" height="16"></iconify-icon>
                  )}
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
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
            <iconify-icon icon="solar:box-linear" width="48" height="48"></iconify-icon>
            <h3>No products found</h3>
            <p>Create your first product to get started</p>
          </div>
        )}

        {products?.items?.map(product => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              {product.imageUrls?.[0] ? (
                <img src={product.imageUrls[0]} alt={product.name} />
              ) : (
                <div className="no-image">
                  <iconify-icon icon="solar:gallery-linear" width="24" height="24"></iconify-icon>
                </div>
              )}
              {product.model3dUrl && <span className="model-badge">3D</span>}
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
                <iconify-icon icon="solar:pen-linear" width="16" height="16"></iconify-icon>
              </button>
              <button onClick={() => handleDelete(product._id)} title="Archive" className="delete">
                <iconify-icon icon="solar:archive-linear" width="16" height="16"></iconify-icon>
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
          max-width: 720px;
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

        .model-config-row {
          grid-template-columns: 1fr 2fr;
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

        .model-section {
          padding: 16px;
          border: 1px solid #1f1f1f;
          border-radius: 12px;
          background: #0d0d0d;
        }

        .model-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
        }

        .hint-text {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .upload-row {
          display: flex;
          gap: 8px;
        }

        .upload-btn {
          padding: 10px 16px;
          background: #8b0000;
          border: 1px solid #8b0000;
          border-radius: 8px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .upload-btn:hover {
          background: #a00000;
        }

        .upload-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .toggle-btn {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #2a2a2a;
          background: #0a0a0a;
          color: #e0e0e0;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-btn.active {
          border-color: #c41e3a;
          color: white;
          background: rgba(196, 30, 58, 0.15);
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
          position: relative;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .model-badge {
          position: absolute;
          bottom: 6px;
          left: 6px;
          padding: 2px 6px;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
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

        @media (max-width: 1024px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }

          .model-config-row {
            grid-template-columns: 1fr 1fr;
          }
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

          .form-row,
          .model-config-row {
            grid-template-columns: 1fr;
          }

          .upload-row {
            flex-direction: column;
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
