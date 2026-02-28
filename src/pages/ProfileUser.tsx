import { useQuery } from 'convex/react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { FullProfile } from '../components/Profile/FullProfile'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

export function ProfileUser() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const animate = useScrollAnimation()

  const user = useQuery(
    api.users.getById,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  )

  if (!userId) {
    return (
      <div className="profile-error-container">
        <p className="error-text">Identity mismatch: Invalid profile target.</p>
        <button onClick={() => navigate(-1)} className="back-btn-simple">
          Return to previous
        </button>
      </div>
    )
  }

  if (user === undefined) {
    return (
      <div className="profile-loading-container">
         <iconify-icon icon="solar:refresh-linear" className="animate-spin"></iconify-icon>
         <span>Fetching identity...</span>
      </div>
    )
  }

  if (user === null) {
    return (
      <div className="profile-error-container">
        <p className="error-text">Identity not found in database.</p>
        <button onClick={() => navigate(-1)} className="back-btn-simple">
          Return to previous
        </button>
      </div>
    )
  }

  return (
    <div className="profile-user-page app-surface-page">
      <header ref={animate} data-animate className="profile-user-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <iconify-icon icon="solar:arrow-left-linear"></iconify-icon>
          <span>Retract</span>
        </button>
        <h1 className="user-profile-title">Artist Profile</h1>
      </header>

      <div className="profile-user-content">
        <FullProfile user={user} />
      </div>

      <style>{`
        .profile-user-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          height: 100%;
        }

        .profile-user-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 40px;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .back-btn:hover { background: rgba(255, 255, 255, 0.1); border-color: var(--color-primary); }

        .user-profile-title {
          font-size: 18px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--color-text-dim);
          margin: 0;
        }

        .profile-loading-container, .profile-error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          height: 300px;
          color: var(--color-text-dim);
        }

        .error-text { font-weight: 600; font-size: 14px; }

        .back-btn-simple {
          background: transparent;
          border: 1px solid var(--color-card-border);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
        }
      `}</style>
    </div>
  )
}
