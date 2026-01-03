import { useNavigate } from 'react-router-dom'
import { useAdminEventForm } from '../hooks/useAdminEventForm'

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
]

export function AdminEventForm() {
  const navigate = useNavigate()
  const {
    formData,
    errors,
    loading,
    submitError,
    updateField,
    updateTicketType,
    addTicketType,
    removeTicketType,
    submit,
  } = useAdminEventForm()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const event = await submit()
      if (event) {
        navigate('/admin/events')
      }
    } catch (err) {
      // Error is handled by the hook
      console.error('Submit failed:', err)
    }
  }

  return (
    <div className="admin-event-form-page">
      <div className="form-container">
        <div className="form-header">
          <button
            type="button"
            onClick={() => navigate('/admin/events')}
            className="back-button"
          >
            <iconify-icon icon="solar:arrow-left-bold"></iconify-icon>
            <span>Back to Events</span>
          </button>
          <h1 className="form-title">Create New Event</h1>
          <p className="form-subtitle">Fill in the details to create a new event</p>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          {/* Event Details Section */}
          <section className="form-section">
            <h2 className="section-title">Event Details</h2>
            
            <div className="form-field">
              <label htmlFor="title" className="field-label">
                Event Title <span className="required">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className={`field-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g. Summer Music Festival 2024"
                maxLength={200}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
              <span className="field-hint">{formData.title.length}/200 characters</span>
            </div>

            <div className="form-field">
              <label htmlFor="description" className="field-label">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className={`field-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Describe your event..."
                rows={5}
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="imageUrl" className="field-label">
                Event Image URL <span className="required">*</span>
              </label>
              <input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                className={`field-input ${errors.imageUrl ? 'error' : ''}`}
                placeholder="https://example.com/event-image.jpg"
              />
              {errors.imageUrl && <span className="field-error">{errors.imageUrl}</span>}
              {formData.imageUrl && (
                <img src={formData.imageUrl} alt="Preview" className="image-preview" />
              )}
            </div>
          </section>

          {/* Date & Time Section */}
          <section className="form-section">
            <h2 className="section-title">Date & Time</h2>
            
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="startDate" className="field-label">
                  Start Date <span className="required">*</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className={`field-input ${errors.startDate ? 'error' : ''}`}
                />
                {errors.startDate && <span className="field-error">{errors.startDate}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="startTime" className="field-label">
                  Start Time <span className="required">*</span>
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => updateField('startTime', e.target.value)}
                  className={`field-input ${errors.startTime ? 'error' : ''}`}
                />
                {errors.startTime && <span className="field-error">{errors.startTime}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="endDate" className="field-label">
                  End Date <span className="required">*</span>
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                  className={`field-input ${errors.endDate ? 'error' : ''}`}
                />
                {errors.endDate && <span className="field-error">{errors.endDate}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="endTime" className="field-label">
                  End Time <span className="required">*</span>
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => updateField('endTime', e.target.value)}
                  className={`field-input ${errors.endTime ? 'error' : ''}`}
                />
                {errors.endTime && <span className="field-error">{errors.endTime}</span>}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="venueTimezone" className="field-label">
                Timezone <span className="required">*</span>
              </label>
              <select
                id="venueTimezone"
                value={formData.venueTimezone}
                onChange={(e) => updateField('venueTimezone', e.target.value)}
                className="field-select"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Venue Section */}
          <section className="form-section">
            <h2 className="section-title">Venue Information</h2>
            
            <div className="form-field">
              <label htmlFor="venueName" className="field-label">
                Venue Name <span className="required">*</span>
              </label>
              <input
                id="venueName"
                type="text"
                value={formData.venueName}
                onChange={(e) => updateField('venueName', e.target.value)}
                className={`field-input ${errors.venueName ? 'error' : ''}`}
                placeholder="e.g. Madison Square Garden"
              />
              {errors.venueName && <span className="field-error">{errors.venueName}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="venueAddress" className="field-label">
                Address <span className="required">*</span>
              </label>
              <input
                id="venueAddress"
                type="text"
                value={formData.venueAddress}
                onChange={(e) => updateField('venueAddress', e.target.value)}
                className={`field-input ${errors.venueAddress ? 'error' : ''}`}
                placeholder="e.g. 4 Pennsylvania Plaza"
              />
              {errors.venueAddress && <span className="field-error">{errors.venueAddress}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="venueCity" className="field-label">
                City <span className="required">*</span>
              </label>
              <input
                id="venueCity"
                type="text"
                value={formData.venueCity}
                onChange={(e) => updateField('venueCity', e.target.value)}
                className={`field-input ${errors.venueCity ? 'error' : ''}`}
                placeholder="e.g. New York"
              />
              {errors.venueCity && <span className="field-error">{errors.venueCity}</span>}
            </div>
          </section>

          {/* Capacity & Status Section */}
          <section className="form-section">
            <h2 className="section-title">Capacity & Sales</h2>
            
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="capacity" className="field-label">
                  Total Capacity <span className="required">*</span>
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => updateField('capacity', parseInt(e.target.value) || 0)}
                  className={`field-input ${errors.capacity ? 'error' : ''}`}
                />
                {errors.capacity && <span className="field-error">{errors.capacity}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="saleStatus" className="field-label">
                  Sale Status <span className="required">*</span>
                </label>
                <select
                  id="saleStatus"
                  value={formData.saleStatus}
                  onChange={(e) => updateField('saleStatus', e.target.value as 'upcoming' | 'on_sale')}
                  className="field-select"
                >
                  <option value="upcoming">Upcoming (Sales Not Started)</option>
                  <option value="on_sale">On Sale</option>
                </select>
              </div>
            </div>
          </section>

          {/* Ticket Types Section */}
          <section className="form-section">
            <div className="section-header">
              <h2 className="section-title">Ticket Types</h2>
              <button
                type="button"
                onClick={addTicketType}
                className="add-button"
              >
                <iconify-icon icon="solar:add-circle-bold"></iconify-icon>
                <span>Add Ticket Type</span>
              </button>
            </div>

            {errors.ticketTypes && (
              <span className="field-error section-error">{errors.ticketTypes}</span>
            )}

            <div className="ticket-types-list">
              {formData.ticketTypes.map((ticket, index) => (
                <div key={index} className="ticket-type-card">
                  <div className="ticket-type-header">
                    <h3 className="ticket-type-title">Ticket Type #{index + 1}</h3>
                    {formData.ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(index)}
                        className="remove-button"
                      >
                        <iconify-icon icon="solar:trash-bin-trash-bold"></iconify-icon>
                      </button>
                    )}
                  </div>

                  <div className="ticket-type-fields">
                    <div className="form-field">
                      <label className="field-label">Ticket Name <span className="required">*</span></label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                        className={`field-input ${errors[`ticketType_${index}_name`] ? 'error' : ''}`}
                        placeholder="e.g. General Admission"
                      />
                      {errors[`ticketType_${index}_name`] && (
                        <span className="field-error">{errors[`ticketType_${index}_name`]}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label">Type <span className="required">*</span></label>
                      <select
                        value={ticket.type}
                        onChange={(e) => updateTicketType(index, 'type', e.target.value)}
                        className="field-select"
                      >
                        <option value="general">General</option>
                        <option value="vip">VIP</option>
                        <option value="early_bird">Early Bird</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="form-field">
                        <label className="field-label">Price ($) <span className="required">*</span></label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ticket.price}
                          onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value) || 0)}
                          className={`field-input ${errors[`ticketType_${index}_price`] ? 'error' : ''}`}
                        />
                        {errors[`ticketType_${index}_price`] && (
                          <span className="field-error">{errors[`ticketType_${index}_price`]}</span>
                        )}
                      </div>

                      <div className="form-field">
                        <label className="field-label">Quantity <span className="required">*</span></label>
                        <input
                          type="number"
                          min="1"
                          value={ticket.quantity}
                          onChange={(e) => updateTicketType(index, 'quantity', parseInt(e.target.value) || 0)}
                          className={`field-input ${errors[`ticketType_${index}_quantity`] ? 'error' : ''}`}
                        />
                        {errors[`ticketType_${index}_quantity`] && (
                          <span className="field-error">{errors[`ticketType_${index}_quantity`]}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-field">
                      <label className="field-label">Description (Optional)</label>
                      <textarea
                        value={ticket.description || ''}
                        onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                        className="field-textarea"
                        placeholder="e.g. Includes access to all areas"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Submit Section */}
          <div className="form-actions">
            {submitError && (
              <div className="submit-error">
                <iconify-icon icon="solar:danger-triangle-bold"></iconify-icon>
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Creating Event...</span>
                </>
              ) : (
                <>
                  <iconify-icon icon="solar:check-circle-bold"></iconify-icon>
                  <span>Create Event</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .admin-event-form-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .form-container {
          background: var(--color-card-bg);
          border: 1px solid var(--color-card-border);
          border-radius: 16px;
          overflow: hidden;
        }

        .form-header {
          padding: 32px;
          border-bottom: 1px solid var(--color-card-border);
          background: rgba(0, 0, 0, 0.2);
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-card-border);
          border-radius: 8px;
          color: var(--color-text-dim);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 16px;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .form-title {
          font-size: 28px;
          font-weight: 800;
          color: white;
          margin: 0 0 8px 0;
        }

        .form-subtitle {
          font-size: 14px;
          color: var(--color-text-dim);
          margin: 0;
        }

        .event-form {
          padding: 32px;
        }

        .form-section {
          margin-bottom: 40px;
        }

        .form-section:last-child {
          margin-bottom: 0;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 0 0 20px 0;
        }

        .section-error {
          display: block;
          margin-bottom: 16px;
        }

        .form-field {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .field-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin-bottom: 8px;
        }

        .required {
          color: rgb(239, 68, 68);
        }

        .field-input,
        .field-textarea,
        .field-select {
          width: 100%;
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--color-card-border);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .field-input:focus,
        .field-textarea:focus,
        .field-select:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .field-input.error,
        .field-textarea.error,
        .field-select.error {
          border-color: rgb(239, 68, 68);
        }

        .field-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .field-error {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: rgb(239, 68, 68);
        }

        .field-hint {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: var(--color-text-dim);
        }

        .image-preview {
          margin-top: 12px;
          max-width: 100%;
          max-height: 200px;
          border-radius: 8px;
          object-fit: cover;
        }

        .add-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(6, 182, 212, 0.2);
          border: 1px solid var(--color-primary);
          border-radius: 8px;
          color: var(--color-primary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-button:hover {
          background: rgba(6, 182, 212, 0.3);
          transform: translateY(-2px);
        }

        .ticket-types-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ticket-type-card {
          padding: 20px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--color-card-border);
          border-radius: 12px;
        }

        .ticket-type-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-card-border);
        }

        .ticket-type-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-primary);
          margin: 0;
        }

        .remove-button {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgb(239, 68, 68);
          border-radius: 6px;
          color: rgb(239, 68, 68);
          font-size: 20px;
          padding: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-button:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .ticket-type-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-actions {
          margin-top: 40px;
          padding-top: 32px;
          border-top: 1px solid var(--color-card-border);
        }

        .submit-error {
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgb(239, 68, 68);
          border-radius: 8px;
          color: rgb(239, 68, 68);
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .submit-button {
          width: 100%;
          padding: 16px;
          background: var(--color-primary);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-button:hover:not(:disabled) {
          background: #0891b2;
          transform: translateY(-2px);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .admin-event-form-page {
            padding: 20px 10px;
          }

          .form-header {
            padding: 24px 20px;
          }

          .event-form {
            padding: 24px 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-title {
            font-size: 24px;
          }

          .section-title {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  )
}
