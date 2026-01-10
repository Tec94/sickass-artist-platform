import { useState, useEffect } from 'react'
import { analytics } from '../utils/analytics'
import '../styles/consent-banner.css'

export const ConsentBanner = () => {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof localStorage === 'undefined') return true
    return localStorage.getItem('consent_dismissed') === 'true'
  })

  // Check if consent was already given (for returning users)
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const consentGiven = localStorage.getItem('analytics_consent') === 'true'
      const consentDismissed = localStorage.getItem('consent_dismissed') === 'true'
      if (consentGiven || consentDismissed) {
        setDismissed(true)
      }
    }
  }, [])

  if (dismissed) return null

  const handleAccept = () => {
    analytics.setConsent(true)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('consent_dismissed', 'true')
    }
    setDismissed(true)
  }

  const handleDecline = () => {
    analytics.setConsent(false)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('consent_dismissed', 'true')
    }
    setDismissed(true)
  }

  return (
    <div className="consent-banner">
      <div className="consent-content">
        <h3>We value your privacy</h3>
        <p>
          We use analytics to understand how you use our platform and improve your experience. 
          No personal information is collected.
        </p>
      </div>

      <div className="consent-actions">
        <button 
          onClick={handleDecline}
          className="button button-secondary"
          aria-label="Decline analytics"
        >
          Decline
        </button>
        <button 
          onClick={handleAccept}
          className="button button-primary"
          aria-label="Accept analytics"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
