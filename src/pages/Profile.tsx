import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { FullProfile } from '../components/Profile/FullProfile'
import { FanStatusBadge } from '../components/Profile/FanStatusBadge'

export function Profile() {
  const { user, isSignedIn, isLoading } = useAuth()
  const navigate = useNavigate()

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile...</div>
  }

  if (!isSignedIn || !user) {
    return (
      <div className="p-8 text-center">
        <p>Please sign in to view your profile.</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header with edit button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Profile</h1>
          <button
            onClick={() => navigate('/profile/edit')}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-semibold"
          >
            Edit Profile
          </button>
        </div>

        {/* Fan status badge */}
        <div className="mb-8">
          <FanStatusBadge user={user} size="lg" />
        </div>

        {/* Full profile */}
        <FullProfile user={user} />
      </div>
    </div>
  )
}
