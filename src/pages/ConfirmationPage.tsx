import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { formatEventDate } from '../utils/eventFormatters'

export const ConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  // We'll need a way to get the ticket details. 
  // Let's assume we can fetch it via getUserTickets or similar if we don't have a direct query for it.
  // For MVP, we'll try to find the ticket in the user's tickets.
  const userTickets = useQuery(api.events.getUserTickets, { upcomingOnly: false })
  
  const ticket = userTickets?.find(t => t._id === orderId)
  const event = ticket?.event

  if (userTickets === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!ticket || !event) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Order Not Found</h1>
        <p className="text-zinc-400 mb-8">We couldn't find the ticket you're looking for.</p>
        <Link 
          to="/events"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
        >
          Browse Events
        </Link>
      </div>
    )
  }

  const handleDownload = () => {
    // Placeholder for download logic
    alert('Ticket download started! (In a real app, this would generate a PDF)')
  }

  const handleAddToCalendar = () => {
    // Placeholder for calendar logic
    alert('Added to Google Calendar!')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `My ticket for ${event.title}`,
        text: `I'm going to ${event.title} in ${event.city}!`,
        url: window.location.href,
      })
    } else {
      alert('Link copied to clipboard!')
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-green-500/10 border-b border-green-500/20 p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-green-400 font-medium">Order #{ticket.confirmationCode}</p>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
              <div className="w-full md:w-1/3">
                <img 
                  src={event.imageUrl} 
                  alt={event.title}
                  className="w-full aspect-[3/4] object-cover rounded-2xl"
                />
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
                <div className="space-y-3 text-zinc-400 mb-6">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatEventDate(event.startAtUtc, event.timezone)}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.city}
                  </div>
                </div>

                <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-zinc-400">Ticket Type</span>
                    <span className="text-white font-bold capitalize">{ticket.ticketType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-zinc-400">Quantity</span>
                    <span className="text-white font-bold">{ticket.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-700">
                    <span className="text-zinc-400">Ticket Number</span>
                    <span className="text-blue-400 font-mono font-bold">{ticket.ticketNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
              <button
                onClick={handleAddToCalendar}
                className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all border border-zinc-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add to Calendar
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all border border-zinc-700 sm:col-span-2 md:col-span-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 12.684a3 3 0 100-2.684 3 3 0 000 2.684z" />
                </svg>
                Share Ticket
              </button>
            </div>
          </div>

          <div className="bg-zinc-800/30 p-8 border-t border-zinc-800 text-center">
            <p className="text-zinc-400 mb-6">
              A confirmation email has been sent to your registered email address.
              See you at the event!
            </p>
            <Link 
              to="/events"
              className="text-blue-500 hover:text-blue-400 font-bold transition-colors inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
