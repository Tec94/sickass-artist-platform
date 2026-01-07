import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { FullProfile } from '../components/Profile/FullProfile'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

export function Profile() {
  const { user, isSignedIn, isLoading } = useAuth()
  const navigate = useNavigate()
  const animate = useScrollAnimation()

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>
  }

  if (!isSignedIn || !user) {
    return (
      <div className="p-8 text-center bg-black/50 rounded-2xl border border-gray-800">
        <p className="text-gray-400 mb-6">Please sign in to view your profile.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="profile-page-container">
      <header ref={animate} data-animate className="profile-page-header">
        <h1 className="page-title">Identity</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/merch/orders')}
            className="edit-profile-btn"
          >
            <iconify-icon icon="solar:box-bold-duotone"></iconify-icon>
            <span>Orders</span>
          </button>
          <button
            onClick={() => navigate('/profile/edit')}
            className="edit-profile-btn border-beam"
          >
            <iconify-icon icon="solar:user-edit-linear"></iconify-icon>
            <span>Modify Profile</span>
          </button>
        </div>
      </header>

      <div className="profile-page-content">
        <FullProfile user={user} />
      </div>

      <style>{`
        .profile-page-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .profile-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: white;
          margin: 0;
        }

        .edit-profile-btn {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px 24px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .edit-profile-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--color-primary);
        }

        .profile-page-content {
          flex: 1;
        }
      `}</style>
    </div>
  )
}
