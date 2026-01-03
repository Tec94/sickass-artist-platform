import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { useQueueOperations, useCheckoutOperations, EventError } from '../../hooks/useEventOperations'
import { formatDateTime, getTimeRemaining } from '../../utils/eventValidation'
import { ErrorToast } from '../ErrorBoundary'

interface EventQueueManagerProps {
  eventId: Id<'events'>
  onQueueJoined?: (data: { seq: number; position: number; expiresAtUtc: number }) => void
  onCheckoutStarted?: (data: { checkoutSessionId: Id<'checkoutSessions'>; expiresAtUtc: number }) => void
}

export function EventQueueManager({ eventId, onQueueJoined, onCheckoutStarted }: EventQueueManagerProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<Id<'eventTickets'> | null>(null)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [errorDetails, setErrorDetails] = useState<EventError | null>(null)
  const [checkoutSession, setCheckoutSession] = useState<{
    id: Id<'checkoutSessions'>
    expiresAtUtc: number
  } | null>(null)

  const { joinQueue, leaveQueue, isJoining, isLeaving, error: queueError, clearError } = useQueueOperations()
  const { startCheckout, purchaseTicket, isStarting, isPurchasing, error: checkoutError, clearError: clearCheckoutError } = useCheckoutOperations()

  // Get event details and queue state
  const eventDetail = useQuery(
    api.events.getEventDetail,
    { eventId },
    { enabled: !!eventId }
  )

  const queueState = useQuery(
    api.events.getQueueState,
    { eventId },
    { enabled: !!eventId }
  )

  // Handle queue errors
  useEffect(() => {
    if (queueError) {
      setErrorDetails(queueError)
      setShowErrorToast(true)
      clearError()
    }
  }, [queueError, clearError])

  // Handle checkout errors
  useEffect(() => {
    if (checkoutError) {
      setErrorDetails(checkoutError)
      setShowErrorToast(true)
      clearCheckoutError()
    }
  }, [checkoutError, clearCheckoutError])

  const handleJoinQueue = async () => {
    try {
      const result = await joinQueue(eventId)
      onQueueJoined?.(result)
    } catch (err) {
      console.error('Failed to join queue:', err)
    }
  }

  const handleLeaveQueue = async () => {
    try {
      await leaveQueue(eventId)
    } catch (err) {
      console.error('Failed to leave queue:', err)
    }
  }

  const handleStartCheckout = async () => {
    if (!selectedTicketTypeId) return

    try {
      const result = await startCheckout({
        eventId,
        ticketTypeId: selectedTicketTypeId,
        quantity,
      })
      setCheckoutSession({
        id: result.checkoutSessionId,
        expiresAtUtc: result.expiresAtUtc,
      })
      onCheckoutStarted?.(result)
    } catch (err) {
      console.error('Failed to start checkout:', err)
    }
  }

  const handlePurchase = async () => {
    if (!checkoutSession || !selectedTicketTypeId) return

    try {
      const result = await purchaseTicket(
        eventId,
        selectedTicketTypeId,
        quantity,
        checkoutSession.id
      )
      
      // Show success message
      alert(`Purchase successful! Confirmation code: ${result.confirmationCode}`)
      
      // Reset state
      setCheckoutSession(null)
      setSelectedTicketTypeId(null)
      setQuantity(1)
    } catch (err) {
      console.error('Purchase failed:', err)
    }
  }

  const canJoinQueue = !queueState?.status || queueState.status === 'expired' || queueState.status === 'left'
  const canLeaveQueue = queueState?.status === 'waiting' || queueState?.status === 'admitted'
  const canStartCheckout = queueState?.status === 'admitted' && !checkoutSession && selectedTicketTypeId

  if (!eventDetail) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Queue & Purchase</h3>

      {/* Queue Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Queue Status</h4>
        
        {queueState ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                queueState.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                queueState.status === 'admitted' ? 'bg-green-100 text-green-800' :
                queueState.status === 'expired' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {queueState.status || 'Not in queue'}
              </span>
            </div>
            
            {queueState.position !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Position:</span>
                <span className="text-sm font-medium">#{queueState.position + 1}</span>
              </div>
            )}
            
            {queueState.estimatedWaitMinutes !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Est. Wait:</span>
                <span className="text-sm font-medium">{queueState.estimatedWaitMinutes} minutes</span>
              </div>
            )}
            
            {queueState.expiresAtUtc && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Expires in:</span>
                <span className="text-sm font-medium text-red-600">
                  {getTimeRemaining(queueState.expiresAtUtc)}
                </span>
              </div>
            )}

            {queueState.cooldownUntilUtc && queueState.cooldownUntilUtc > Date.now() && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cooldown:</span>
                <span className="text-sm font-medium text-orange-600">
                  {Math.ceil((queueState.cooldownUntilUtc - Date.now()) / (60 * 1000))} minutes remaining
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Not in queue</p>
        )}
      </div>

      {/* Queue Actions */}
      <div className="mb-6 space-y-3">
        {canJoinQueue && (
          <button
            onClick={handleJoinQueue}
            disabled={isJoining}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isJoining ? 'Joining Queue...' : 'Join Queue'}
          </button>
        )}

        {canLeaveQueue && (
          <button
            onClick={handleLeaveQueue}
            disabled={isLeaving}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLeaving ? 'Leaving Queue...' : 'Leave Queue'}
          </button>
        )}
      </div>

      {/* Checkout Section */}
      {queueState?.status === 'admitted' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Purchase Tickets</h4>
          
          {/* Ticket Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Ticket Type
            </label>
            <select
              value={selectedTicketTypeId || ''}
              onChange={(e) => setSelectedTicketTypeId(e.target.value as Id<'eventTickets'>)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="">Choose a ticket type...</option>
              {eventDetail.ticketTypes.map((ticketType) => (
                <option key={ticketType._id} value={ticketType._id}>
                  {ticketType.type.toUpperCase()} - ${(ticketType.price / 100).toFixed(2)} 
                  ({ticketType.availableQuantity} available)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity (Max 10 per transaction)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              min={1}
              max={10}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <p className="mt-1 text-xs text-gray-500">
              Max 10 per transaction
            </p>
          </div>

          {/* Checkout Actions */}
          <div className="space-y-3">
            {!checkoutSession && canStartCheckout && (
              <button
                onClick={handleStartCheckout}
                disabled={isStarting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isStarting ? 'Starting Checkout...' : 'Start Checkout'}
              </button>
            )}

            {checkoutSession && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">Checkout Session Active</span>
                    <span className="text-xs text-green-600">
                      Expires in {getTimeRemaining(checkoutSession.expiresAtUtc)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isPurchasing ? 'Processing Purchase...' : `Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Time Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Event Information</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div>
            <span className="font-medium">Event:</span> {eventDetail.event.title}
          </div>
          <div>
            <span className="font-medium">When:</span> {formatDateTime(eventDetail.event.startAtUtc, eventDetail.event.timezone)}
          </div>
          <div>
            <span className="font-medium">Where:</span> {eventDetail.event.venueName}, {eventDetail.event.city}
          </div>
          <div>
            <span className="font-medium">Capacity:</span> {eventDetail.event.capacity} | 
            <span className="ml-1 font-medium">Sold:</span> {eventDetail.event.ticketsSold}
          </div>
        </div>
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