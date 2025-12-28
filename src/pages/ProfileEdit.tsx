import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function ProfileEdit() {
  const { user, isSignedIn, isLoading } = useAuth()
  const navigate = useNavigate()
  const updateUserMutation = useMutation(api.users.update)

  const [formData, setFormData] = useState({
    username: user?.username || '',
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    socials: {
      twitter: user?.socials?.twitter || '',
      instagram: user?.socials?.instagram || '',
      tiktok: user?.socials?.tiktok || '',
    },
  })

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (!isSignedIn || !user) {
    return (
      <div className="p-8 text-center">
        <p>Please sign in to edit your profile.</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    )
  }

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('socials.')) {
      const socialKey = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socials: {
          ...prev.socials,
          [socialKey]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      await updateUserMutation({
        userId: user._id,
        updates: {
          displayName: formData.displayName,
          bio: formData.bio,
          location: formData.location,
          socials: formData.socials,
        },
      })
      navigate('/profile')
    } catch (err) {
      setError('Failed to update profile')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Edit Profile</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={e => handleChange('displayName', e.target.value)}
              maxLength={50}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="Your display name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={e => handleChange('bio', e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="Tell us about yourself (max 500 chars)"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/500
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={e => handleChange('location', e.target.value)}
              maxLength={50}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="City, Country"
            />
          </div>

          {/* Socials */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Social Media
            </h3>

            <div className="space-y-4">
              {(['twitter', 'instagram', 'tiktok'] as const).map(platform => (
                <div key={platform}>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 capitalize">
                    {platform} Handle
                  </label>
                  <div className="flex">
                    <span className="px-4 py-2 bg-gray-800 border border-gray-700 border-r-0 rounded-l-lg text-gray-500 text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.socials[platform]}
                      onChange={e =>
                        handleChange(`socials.${platform}`, e.target.value)
                      }
                      maxLength={30}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-r-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      placeholder={`Your ${platform} handle`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black font-semibold rounded-lg transition"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
