import { useState, useCallback } from 'react'
import { useConvex } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

// Form data structure
export interface EventFormData {
  title: string
  description: string
  imageUrl: string
  startAtUtc: number
  endAtUtc: number
  venueId: Id<'venues'>
  capacity: number
  saleStatus: 'upcoming' | 'on_sale' | 'sold_out' | 'cancelled'
  searchText: string
  dedupeKey: string
}

export interface TicketTypeInput {
  name: string
  type: 'general' | 'vip' | 'early_bird'
  price: number
  quantity: number
  description?: string
}

export interface AdminEventFormData {
  title: string
  description: string
  imageUrl: string
  startDate: string // YYYY-MM-DD
  startTime: string // HH:mm
  endDate: string   // YYYY-MM-DD
  endTime: string   // HH:mm
  venueTimezone: string
  venueName: string
  venueAddress: string
  venueCity: string
  capacity: number
  saleStatus: 'upcoming' | 'on_sale'
  ticketTypes: TicketTypeInput[]
}

export interface FormErrors {
  [key: string]: string
}

const DEFAULT_FORM_DATA: AdminEventFormData = {
  title: '',
  description: '',
  imageUrl: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  venueTimezone: 'America/New_York',
  venueName: '',
  venueAddress: '',
  venueCity: '',
  capacity: 100,
  saleStatus: 'upcoming',
  ticketTypes: [
    { name: 'General Admission', type: 'general', price: 50, quantity: 100 }
  ],
}

export function useAdminEventForm() {
  const convex = useConvex()
  const [formData, setFormData] = useState<AdminEventFormData>(DEFAULT_FORM_DATA)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const updateField = useCallback(<K extends keyof AdminEventFormData>(
    field: K,
    value: AdminEventFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts editing
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const updateTicketType = useCallback((index: number, field: keyof TicketTypeInput, value: string | number) => {
    setFormData(prev => {
      const ticketTypes = [...prev.ticketTypes]
      ticketTypes[index] = { ...ticketTypes[index], [field]: value }
      return { ...prev, ticketTypes }
    })
  }, [])

  const addTicketType = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        { name: '', type: 'general', price: 0, quantity: 0 }
      ]
    }))
  }, [])

  const removeTicketType = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
    }))
  }, [])

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    // Title validation
    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be 1–200 chars'
    }

    // Description validation
    if (!formData.description || formData.description.trim().length === 0) {
      newErrors.description = 'Description is required'
    }

    // Image URL validation
    if (!formData.imageUrl || formData.imageUrl.trim().length === 0) {
      newErrors.imageUrl = 'Event image is required'
    }

    // Date/time validation
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }

    // Validate end is after start
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)
      
      if (endDateTime <= startDateTime) {
        newErrors.endDate = 'End time must be after start time'
      }
    }

    // Venue validation
    if (!formData.venueName || formData.venueName.trim().length === 0) {
      newErrors.venueName = 'Venue name is required'
    }
    if (!formData.venueAddress || formData.venueAddress.trim().length === 0) {
      newErrors.venueAddress = 'Venue address is required'
    }
    if (!formData.venueCity || formData.venueCity.trim().length === 0) {
      newErrors.venueCity = 'City is required'
    }

    // Capacity validation
    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be >= 1'
    }

    // Ticket types validation
    if (formData.ticketTypes.length === 0) {
      newErrors.ticketTypes = 'At least one ticket type required'
    } else {
      formData.ticketTypes.forEach((ticket, index) => {
        if (!ticket.name || ticket.name.trim().length === 0) {
          newErrors[`ticketType_${index}_name`] = 'Ticket name is required'
        }
        if (ticket.price < 0) {
          newErrors[`ticketType_${index}_price`] = 'Price must be >= 0'
        }
        if (ticket.quantity < 1) {
          newErrors[`ticketType_${index}_quantity`] = 'Quantity must be >= 1'
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const reset = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA)
    setErrors({})
    setSubmitError(null)
  }, [])

  const submit = useCallback(async () => {
    if (!validate()) {
      return null
    }

    setLoading(true)
    setSubmitError(null)

    try {
      // First, create or find the venue
      // Note: In a real app, you might want to search for existing venues first
      // @ts-expect-error - venues module will be generated by convex
      const venue = await convex.mutation(api.venues?.createVenue || 'skip', {
        name: formData.venueName,
        address: formData.venueAddress,
        city: formData.venueCity,
        timezone: formData.venueTimezone,
        capacity: formData.capacity,
      })

      if (!venue) {
        throw new Error('Failed to create venue')
      }

      // Parse dates to UTC timestamps
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

      // Create event
      const eventPayload: EventFormData = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        startAtUtc: startDateTime.getTime(),
        endAtUtc: endDateTime.getTime(),
        venueId: venue._id,
        capacity: formData.capacity,
        saleStatus: formData.saleStatus,
        searchText: `${formData.title} ${formData.venueName} ${formData.venueCity}`.toLowerCase(),
        dedupeKey: `${venue._id}:${startDateTime.getTime()}:${formData.title.toLowerCase().replace(/\s+/g, '-')}`,
      }

      // @ts-expect-error - events module will be generated by convex
      const event = await convex.mutation(api.events?.createEvent || 'skip', eventPayload)

      if (!event) {
        throw new Error('Failed to create event')
      }

      // Create ticket types
      for (const ticketType of formData.ticketTypes) {
        // @ts-expect-error - events module will be generated by convex
        await convex.mutation(api.events?.createTicketType || 'skip', {
          eventId: event._id,
          type: ticketType.type,
          price: ticketType.price,
          quantity: ticketType.quantity,
          description: ticketType.description || '',
          saleStartsAtUtc: startDateTime.getTime(),
          saleEndsAtUtc: endDateTime.getTime(),
        })
      }

      return event
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event'
      setSubmitError(errorMessage)
      console.error('Event creation error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [convex, formData, validate])

  return {
    formData,
    errors,
    loading,
    submitError,
    updateField,
    updateTicketType,
    addTicketType,
    removeTicketType,
    validate,
    submit,
    reset,
  }
}
