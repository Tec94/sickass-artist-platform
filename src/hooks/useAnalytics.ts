import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { analytics, trackPageView } from '../utils/analytics'
import { useUser } from '../contexts/UserContext'

/**
 * Hook to automatically track page views and handle analytics lifecycle
 * Usage: Call this at the top of page components to track page views
 */
export const useAnalytics = () => {
  const location = useLocation()
  const { userProfile } = useUser()

  // Update current user when userProfile changes
  useEffect(() => {
    if (userProfile) {
      analytics.setCurrentUser({
        id: userProfile._id,
        tier: userProfile.tier,
      })
    } else {
      analytics.setCurrentUser(null)
    }
  }, [userProfile])

  // Track page views on location change
  useEffect(() => {
    trackPageView(location.pathname)

    return () => {
      analytics.trackEvent('page_unload', { path: location.pathname })
    }
  }, [location.pathname])

  return analytics
}
