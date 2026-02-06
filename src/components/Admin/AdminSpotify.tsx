import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Doc } from '../../../convex/_generated/dataModel'
import { useState } from 'react'
import { showToast } from '../../lib/toast'
import { useAdminAccess } from '../../hooks/useAdminAccess'

export const AdminSpotify = () => {
  const { canUseAdminQueries, isAdmin, isReady, hasValidToken, hasAdminAccess, tokenMatchesUser } = useAdminAccess()
  const status = useQuery(api.spotify.getSyncStatus, canUseAdminQueries ? {} : 'skip')
  const tracks = useQuery(api.spotify.getArtistTracks, canUseAdminQueries ? {} : 'skip')
  const triggerSync = useMutation(api.spotify.adminTriggerSync)
  const seedEmbeddedTracks = useMutation(api.spotify.seedEmbeddedTracks)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const adminActionDisabled = !isAdmin || !isReady || !hasValidToken

  const handleSync = async () => {
    if (adminActionDisabled) {
      showToast('Admin role required to sync Spotify', { type: 'error' })
      return
    }
    try {
      setIsSyncing(true)
      await triggerSync()
      setTimeout(() => setIsSyncing(false), 3000)
    } catch (error) {
      console.error('Sync failed:', error)
      showToast(error instanceof Error ? error.message : 'Sync failed', { type: 'error' })
      setIsSyncing(false)
    }
  }

  const handleSeed = async () => {
    if (adminActionDisabled) {
      showToast('Admin role required to seed embedded tracks', { type: 'error' })
      return
    }
    try {
      setIsSeeding(true)
      const result = await seedEmbeddedTracks()
      showToast(
        `Seeded ${result.inserted ?? 0} tracks (${result.updated ?? 0} updated)`,
        { type: 'success' }
      )
    } catch (error) {
      console.error('Seed failed:', error)
      showToast(error instanceof Error ? error.message : 'Seed failed', { type: 'error' })
    } finally {
      setIsSeeding(false)
    }
  }

  if (!isReady || !hasValidToken || !tokenMatchesUser) {
    return <div className="text-white p-4">Session syncing…</div>
  }

  if (!hasAdminAccess) {
    return <div className="text-white p-4">Admin access required</div>
  }

  if (!status || !tracks) {
    return <div className="text-white p-4">Loading Spotify data...</div>
  }

  const getStatusBadge = () => {
    switch (status.status) {
      case 'fresh':
        return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Fresh</span>
      case 'stale':
        return <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded">Stale</span>
      case 'never':
        return <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Never synced</span>
    }
  }

  return (
    <div className="space-y-6 text-white">
      {/* Status Card */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Spotify Sync Status</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Total Tracks</div>
            <div className="text-3xl font-bold">{status.totalTracks}</div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-1">Last Synced</div>
            <div className="text-lg">
              {status.lastSyncedAt
                ? new Date(status.lastSyncedAt).toLocaleString()
                : 'Never'}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-1">Status</div>
            <div>{getStatusBadge()}</div>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing || adminActionDisabled}
          className="px-6 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>

        <button
          onClick={handleSeed}
          disabled={isSeeding || adminActionDisabled}
          className="ml-3 px-6 py-3 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
        >
          {isSeeding ? 'Seeding...' : 'Seed Embedded Tracks'}
        </button>

        {!isAdmin && (
          <p className="mt-3 text-xs text-gray-400">
            Spotify sync and seed actions require an admin role.
          </p>
        )}
      </div>

      {/* Tracks List */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Synced Tracks</h2>

        {tracks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No tracks synced yet. Click "Sync Now" to fetch tracks from Spotify.
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track: Doc<'spotifySongs'>) => (
              <div
                key={track._id}
                className="flex items-center gap-4 p-3 bg-gray-900 rounded-lg"
              >
                {/* Album Cover */}
                <img
                  src={track.albumCover}
                  alt={track.title}
                  className="w-16 h-16 rounded object-cover"
                />

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{track.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                  <p className="text-xs text-gray-500">{track.albumTitle}</p>
                </div>

                {/* Badges */}
                <div className="flex gap-2 items-center">
                  {track.previewUrl && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                      Preview
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded">
                    {track.popularity}%
                  </span>
                </div>

                {/* Actions */}
                <a
                  href={track.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition"
                >
                  Open in Spotify
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
