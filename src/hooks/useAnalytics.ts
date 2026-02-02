import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { analytics, trackPageView } from '../utils/analytics'
import { useUser } from '../contexts/UserContext'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * Hook to automatically track page views and handle analytics lifecycle
 * Usage: Call this at the top of page components to track page views
 */
export const useAnalytics = () => {
  const location = useLocation()
  const { userProfile } = useUser()
  const ingestEvents = useMutation(api.analytics.ingestEvents)
  const hasAnalyticsEndpoint = Boolean(import.meta.env.VITE_CONVEX_DEPLOYMENT_URL)

  // Update current user when userProfile changes
  useEffect(() => {
    if (userProfile) {
      analytics.setCurrentUser({
        id: userProfile._id,
        tier: userProfile.role as 'artist' | 'admin' | 'mod' | 'fan',
      })
    } else {
      analytics.setCurrentUser(null)
    }
  }, [userProfile])

  useEffect(() => {
    if (!hasAnalyticsEndpoint && import.meta.env.DEV) {
      return
    }

    analytics.setTransport(async (events) => {
      await ingestEvents({ events })
    })

    return () => {
      analytics.setTransport(null)
    }
  }, [hasAnalyticsEndpoint, ingestEvents])

  // Track page views on location change
  useEffect(() => {
    trackPageView(location.pathname)

    return () => {
      analytics.trackEvent('page_unload', { path: location.pathname })
    }
  }, [location.pathname])

  return analytics
}
