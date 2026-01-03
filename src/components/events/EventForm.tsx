import React, { useState, useEffect } from 'react'
import { Id } from '../../../convex/_generated/dataModel'
import { 
  validateEventForm, 
  validateTicketTypeForm, 
  formatPrice, 
  sanitizeInput,
  createFormHelpers,
  VALIDATION_CONSTANTS 
} from '../../utils/eventValidation'
import { useOptimisticEventCreation, useOptimisticTicketTypeCreation, EventError } from '../../hooks/useEventOperations'
import { ErrorToast } from '../ErrorBoundary'

interface EventFormProps {
  venueId?: Id<'venues'>
  onSuccess?: (eventId: Id<'events'>) => void
  onError?: (error: EventError) => void
}

export function EventForm({ venueId, onSuccess, onError }: EventFormProps) {
  const [formData, setFormData] = useState<{
    title: string
    description: string
    imageUrl: string
    thumbnailUrl: string
    startAtUtc: number
    endAtUtc: number
    capacity: number
    saleStatus: 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'
  }>({
    title: '',
    description: '',
    imageUrl: '',
    thumbnailUrl: '',
    startAtUtc: 0,
    endAtUtc: 0,
    capacity: 100,
    saleStatus: 'upcoming',
  })

  const [ticketTypes, setTicketTypes] = useState<Array<{
    type: 'general' | 'vip' | 'early_bird'
    price: number
    quantity: number
    description?: string
    saleStartsAtUtc: number
    saleEndsAtUtc: number
  }>>([])

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [ticketValidationErrors, setTicketValidationErrors] = useState<Record<string, string>>({})
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorDetails, setErrorDetails] = useState<EventError | null>(null)

  const { createEvent, isCreating, error: createEventError, clearError } = useOptimisticEventCreation()
  const { createTicketType, isCreating: isCreatingTicketType, error: ticketTypeError, clearError: clearTicketError } = useOptimisticTicketTypeCreation()
  
  const formHelpers = createFormHelpers()

  // Handle form validation
  useEffect(() => {
    const validation = validateEventForm({
      ...formData,
      venueId: venueId || '',
    })
    setValidationErrors(validation.errors)
  }, [formData, venueId])

  // Handle ticket type validation
  useEffect(() => {
    if (ticketTypes.length > 0) {
      const validation = validateTicketTypeForm(ticketTypes[0], formData.startAtUtc)
      setTicketValidationErrors(validation.errors)
    } else {
      setTicketValidationErrors({})
    }
  }, [ticketTypes, formData.startAtUtc])

  // Handle errors
  useEffect(() => {
    if (createEventError) {
      setErrorDetails(createEventError)
      setShowErrorToast(true)
      onError?.(createEventError)
    }
  }, [createEventError, onError])

  useEffect(() => {
    if (ticketTypeError) {
      setErrorDetails(ticketTypeError)
      setShowErrorToast(true)
      onError?.(ticketTypeError)
    }
  }, [ticketTypeError, onError])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? sanitizeInput(value, VALIDATION_CONSTANTS.TITLE_MAX) : value
    }))
    clearError()
  }

  const addTicketType = () => {
    const defaultTicketType = {
      type: 'general' as const,
      price: 5000, // $50.00
      quantity: 100,
      saleStartsAtUtc: Date.now(),
      saleEndsAtUtc: formData.startAtUtc || Date.now() + 3600000, // 1 hour before event
    }
    setTicketTypes([...ticketTypes, defaultTicketType])
  }

  const updateTicketType = (index: number, field: string, value: string | number) => {
    setTicketTypes(prev => prev.map((ticket, i) => 
      i === index ? { ...ticket, [field]: value } : ticket
    ))
    clearTicketError()
  }

  const removeTicketType = (index: number) => {
    setTicketTypes(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const eventValidation = validateEventForm({
      ...formData,
      venueId: venueId || '',
    })

    if (!eventValidation.isValid) {
      setValidationErrors(eventValidation.errors)
      return
    }

    if (ticketTypes.length === 0) {
      setTicketValidationErrors({ ticketTypes: 'At least one ticket type is required' })
      return
    }

    try {
      // Create search text and dedupe key
      const searchText = `${formData.title} ${formData.description}`.toLowerCase()
      const dedupeKey = `${venueId}:${formData.startAtUtc}:${formData.title.toLowerCase().replace(/\s+/g, '-')}`

      const eventId = await createEvent({
        ...formData,
        venueId: venueId!,
        searchText,
        dedupeKey,
      })

      // Create ticket types
      for (const ticketType of ticketTypes) {
        await createTicketType({
          eventId,
          ...ticketType,
        })
      }

      onSuccess?.(eventId)
    } catch (err) {
      console.error('Failed to create event:', err)
    }
  }

  const formatDateForInput = (timestamp: number): string => {
    return new Date(timestamp).toISOString().slice(0, 16)
  }

  const parseDateFromInput = (dateString: string): number => {
    return new Date(dateString).getTime()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Event</h2>
          <p className="mt-1 text-sm text-gray-600">
            Create a new event with ticket types and sales configuration.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Event Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={formHelpers.getFieldClassName(validationErrors, 'title')}
                placeholder="Enter event title"
                maxLength={VALIDATION_CONSTANTS.TITLE_MAX}
              />
              {formHelpers.hasFieldError(validationErrors, 'title') && (
                <p className="mt-1 text-sm text-red-600">
                  {formHelpers.getFieldError(validationErrors, 'title')}
                </p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                {formData.title.length}/{VALIDATION_CONSTANTS.TITLE_MAX} characters
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={formHelpers.getFieldClassName(validationErrors, 'description')}
                placeholder="Describe your event"
                maxLength={VALIDATION_CONSTANTS.DESCRIPTION_MAX}
              />
              {formHelpers.hasFieldError(validationErrors, 'description') && (
                <p className="mt-1 text-sm text-red-600">
                  {formHelpers.getFieldError(validationErrors, 'description')}
                </p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                {formData.description.length}/{VALIDATION_CONSTANTS.DESCRIPTION_MAX} characters
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Event Image URL *
              </label>
              <input
                type="url"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                className={formHelpers.getFieldClassName(validationErrors, 'imageUrl')}
                placeholder="https://example.com/event-image.jpg"
              />
              {formHelpers.hasFieldError(validationErrors, 'imageUrl') && (
                <p className="mt-1 text-sm text-red-600">
                  {formHelpers.getFieldError(validationErrors, 'imageUrl')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startAtUtc" className="block text-sm font-medium text-gray-700">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="startAtUtc"
                  value={formatDateForInput(formData.startAtUtc)}
                  onChange={(e) => handleInputChange('startAtUtc', parseDateFromInput(e.target.value))}
                  className={formHelpers.getFieldClassName(validationErrors, 'startAtUtc')}
                  min={formatDateForInput(Date.now())}
                />
                {formHelpers.hasFieldError(validationErrors, 'startAtUtc') && (
                  <p className="mt-1 text-sm text-red-600">
                    {formHelpers.getFieldError(validationErrors, 'startAtUtc')}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="endAtUtc" className="block text-sm font-medium text-gray-700">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="endAtUtc"
                  value={formatDateForInput(formData.endAtUtc)}
                  onChange={(e) => handleInputChange('endAtUtc', parseDateFromInput(e.target.value))}
                  className={formHelpers.getFieldClassName(validationErrors, 'endAtUtc')}
                  min={formatDateForInput(formData.startAtUtc || Date.now())}
                />
                {formHelpers.hasFieldError(validationErrors, 'endAtUtc') && (
                  <p className="mt-1 text-sm text-red-600">
                    {formHelpers.getFieldError(validationErrors, 'endAtUtc')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Capacity *
                </label>
                <input
                  type="number"
                  id="capacity"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                  className={formHelpers.getFieldClassName(validationErrors, 'capacity')}
                  min={VALIDATION_CONSTANTS.CAPACITY_MIN}
                  max={VALIDATION_CONSTANTS.CAPACITY_MAX}
                />
                {formHelpers.hasFieldError(validationErrors, 'capacity') && (
                  <p className="mt-1 text-sm text-red-600">
                    {formHelpers.getFieldError(validationErrors, 'capacity')}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="saleStatus" className="block text-sm font-medium text-gray-700">
                  Sale Status *
                </label>
                <select
                  id="saleStatus"
                  value={formData.saleStatus}
                  onChange={(e) => handleInputChange('saleStatus', e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="on_sale">On Sale</option>
                  <option value="sold_out">Sold Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ticket Types Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Ticket Types</h3>
              <button
                type="button"
                onClick={addTicketType}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Ticket Type
              </button>
            </div>

            {ticketTypes.length === 0 && (
              <p className="text-sm text-gray-500">No ticket types added yet. Add at least one ticket type.</p>
            )}

            {ticketTypes.map((ticketType, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    Ticket Type {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeTicketType(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Type</label>
                    <select
                      value={ticketType.type}
                      onChange={(e) => updateTicketType(index, 'type', e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="general">General</option>
                      <option value="vip">VIP</option>
                      <option value="early_bird">Early Bird</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Price (USD)</label>
                    <input
                      type="number"
                      value={ticketType.price / 100}
                      onChange={(e) => updateTicketType(index, 'price', Math.round(parseFloat(e.target.value) * 100) || 0)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      min={0}
                      max={9999.99}
                      step="0.01"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {formatPrice(ticketType.price)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      value={ticketType.quantity}
                      onChange={(e) => updateTicketType(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      min={1}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Sale Ends</label>
                    <input
                      type="datetime-local"
                      value={formatDateForInput(ticketType.saleEndsAtUtc)}
                      onChange={(e) => updateTicketType(index, 'saleEndsAtUtc', parseDateFromInput(e.target.value))}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      min={formatDateForInput(Date.now())}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Description (Optional)</label>
                  <input
                    type="text"
                    value={ticketType.description || ''}
                    onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="VIP meet & greet, early access, etc."
                    maxLength={200}
                  />
                </div>
              </div>
            ))}

            {Object.keys(ticketValidationErrors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <h4 className="text-sm font-medium text-red-800">Ticket Type Errors:</h4>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {Object.entries(ticketValidationErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isCreatingTicketType || Object.keys(validationErrors).length > 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isCreatingTicketType ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>

      {/* Error Toast */}
      {showErrorToast && errorDetails && (
        <ErrorToast
          error={errorDetails}
          onDismiss={() => setShowErrorToast(false)}
        />
      )}
    </div>
  )
}