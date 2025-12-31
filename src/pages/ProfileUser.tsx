import { useQuery } from 'convex/react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { FullProfile } from '../components/Profile/FullProfile'

export function ProfileUser() {
  const navigate = useNavigate()
  const { userId } = useParams()

  const user = useQuery(
    api.users.getById,
    userId ? { userId: userId as Id<'users'> } : 'skip'
  )

  if (!userId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-300">Invalid profile.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
        >
          Go back
        </button>
      </div>
    )
  }

  if (user === undefined) {
    return <div className="p-8 text-center text-gray-300">Loading profile...</div>
  }

  if (user === null) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-300">User not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
          >
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
        </div>

        <FullProfile user={user} />
      </div>
    </div>
  )
}
