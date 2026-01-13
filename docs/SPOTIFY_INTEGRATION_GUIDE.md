# Spotify Integration Guide

## Overview

This guide explains how to set up and use the Spotify integration for the artist platform. The integration allows you to automatically sync and display your music tracks with 30-second previews, album artwork, and metadata.

## Features

- ✅ Daily automatic sync of artist tracks from Spotify
- ✅ 30-second track preview streaming
- ✅ Album artwork and metadata display
- ✅ Graceful handling of missing previews (direct Spotify link)
- ✅ Admin panel for manual sync and track management
- ✅ Public music page for fans

## Setup Instructions

### Step 1: Create a Spotify Developer Application

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create an App"**
4. Fill in the application details:
   - **App Name**: e.g., "Artist Platform Integration"
   - **App Description**: e.g., "Music integration for artist platform"
   - **Redirect URIs**: Not needed for Client Credentials flow
5. Accept the terms and click **"Create"**

### Step 2: Get Your API Credentials

1. Click on your newly created app in the dashboard
2. You'll see:
   - **Client ID**: Copy this value
   - **Client Secret**: Click "Show Client Secret" and copy this value

### Step 3: Find Your Spotify Artist ID

There are two ways to get your Spotify Artist ID:

#### Option A: From Spotify Web Player
1. Open [Spotify Web Player](https://open.spotify.com/)
2. Navigate to your artist profile
3. Look at the URL: `https://open.spotify.com/artist/YOUR_ARTIST_ID`
4. Copy the ID after `/artist/`

#### Option B: Using the Spotify API
1. Use the [Spotify API Console](https://developer.spotify.com/console/get-search-item/)
2. Search for your artist name
3. Look for `"id"` in the response under the artist object

### Step 4: Configure Environment Variables

#### For Local Development (.env.local)

Create or update your `.env.local` file:

```bash
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_ARTIST_ID=your_artist_id_here
```

#### For Production (Convex Deployment)

Set the environment variables in your Convex deployment:

```bash
npx convex env set SPOTIFY_CLIENT_ID your_client_id
npx convex env set SPOTIFY_CLIENT_SECRET your_client_secret
npx convex env set SPOTIFY_ARTIST_ID your_artist_id
```

### Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the Admin Panel (only accessible with admin role)
3. Go to the Instagram/System tab (Spotify admin coming soon)
4. Click **"Sync Now"** to manually trigger a sync
5. Navigate to `/music` to see your synced tracks
6. Try playing a preview

## How It Works

### Sync Process

1. **Automatic Daily Sync**: Every day at 2 AM UTC, the system fetches your top tracks from Spotify
2. **Data Cached**: Track metadata is stored in the database (spotifySongs table)
3. **Updates**: Existing tracks are updated with latest popularity and metadata
4. **New Tracks**: New tracks are added automatically

### Track Data Stored

For each track, we store:
- Spotify Track ID (unique identifier)
- Title, Artist, Album Title
- Album Cover Image URL
- Preview URL (30-second clip, if available)
- Duration (milliseconds)
- Release Date
- External Spotify Link
- ISRC Code
- Popularity Score (0-100)
- Sync Timestamp

### Preview Streaming

- Tracks with preview URLs can be played directly in the browser
- Audio element with controls for play/pause
- Auto-resets to beginning when preview ends
- Shows "Preview not available" with direct Spotify link for tracks without previews

## API Reference

### Convex Functions

#### Queries

**`api.spotify.getArtistTracks`**
- Returns all cached artist tracks sorted by release date (newest first)
- No authentication required
- Returns: `Array<Doc<'spotifySongs'>>`

**`api.spotify.getNewReleases`**
- Returns tracks released in the last 30 days (max 12)
- No authentication required
- Returns: `Array<Doc<'spotifySongs'>>`

**`api.spotify.searchSongs({ query, limit? })`**
- Search cached tracks by title, artist, or album
- `query`: Search string
- `limit`: Max results (default 20, max 100)
- Returns: `Array<Doc<'spotifySongs'>>`

**`api.spotify.getTrackPreview({ spotifyTrackId })`**
- Get specific track details with preview info
- `spotifyTrackId`: Spotify track ID
- Returns: Track object with hasPreview boolean

**`api.spotify.getSyncStatus`**
- Get sync status for admin panel
- Returns: `{ totalTracks, lastSyncedAt, status: 'fresh' | 'stale' | 'never' }`

#### Mutations (Admin Only)

**`api.spotify.adminTriggerSync`**
- Manually trigger a Spotify sync
- Requires admin role
- Returns: `{ success: true, scheduled: true }`

**`api.spotify.syncArtistTracks({ adminId })`**
- Legacy signature for manual sync
- `adminId`: User ID with admin role
- Returns: `{ success: true, scheduled: true }`

## Components

### SpotifyPlayer

Individual track player with album art and preview controls.

**Props:**
```typescript
{
  previewUrl?: string | null
  title: string
  artist: string
  albumCover: string
  spotifyUrl: string
}
```

**Features:**
- Play/pause toggle
- Visual album art background
- Fallback for missing preview
- Direct "Open in Spotify" link

### SpotifyPlaylist

Grid of SpotifyPlayer components.

**Props:**
```typescript
{
  tracks: Doc<'spotifySongs'>[]
}
```

**Features:**
- Responsive grid (1/2/3 columns)
- Hover effects
- Loading states

## Music Page

Public-facing page at `/music`:
- View all tracks or filter by "New Releases"
- Play 30-second previews
- Click through to Spotify for full tracks
- Responsive design
- Loading skeletons

## Admin Panel Integration

Access admin features at `/R?tab=instagram` (Spotify tab coming):
- View sync status
- See total track count
- Last sync timestamp
- Manual "Sync Now" button
- List all synced tracks with metadata
- Direct links to Spotify

## Troubleshooting

### "Missing Spotify credentials" Error

**Solution**: Ensure all three environment variables are set:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_ARTIST_ID`

For Convex deployments, use: `npx convex env set KEY value`

### "Spotify auth failed" Error

**Solution**:
- Verify your Client ID and Secret are correct
- Make sure they're not expired or revoked
- Check if your Spotify app is active in the Developer Dashboard

### No Tracks Syncing

**Solution**:
- Verify the Artist ID is correct
- Check if the artist has tracks on Spotify
- Look at Convex logs for detailed error messages
- Try the manual "Sync Now" button in admin panel

### Preview Not Playing

**Solution**:
- Some tracks don't have previews (licensing restrictions)
- Check browser console for errors
- Ensure audio element is allowed by browser (some require user interaction first)
- Try clicking the "Open in Spotify" link as fallback

### "No tracks available yet" Message

**Solution**:
- Wait for the first daily sync (2 AM UTC)
- Or manually trigger sync from admin panel
- Check Convex logs for sync errors

## Rate Limits & Quotas

### Spotify API Limits
- **Client Credentials**: ~1 hour token expiry (cached automatically)
- **Top Tracks Endpoint**: No documented rate limit for standard usage
- **Recommended**: Daily sync (already configured)

### Best Practices
- Don't sync more than once per hour
- Monitor token expiry and refresh automatically (handled by code)
- Cache all data locally (already implemented)

## Security Notes

1. **Never commit credentials**: Keep `.env.local` out of version control
2. **Use environment variables**: Always use Convex env vars for production
3. **Admin-only sync**: Manual sync requires admin role
4. **Client Credentials Flow**: No user authentication needed (server-side only)

## Future Enhancements

Potential improvements for the integration:

- [ ] Full album sync (not just top tracks)
- [ ] Playlist import/export
- [ ] User-specific listening history
- [ ] Recently played tracks
- [ ] Artist analytics from Spotify
- [ ] Related artists integration
- [ ] Genre and mood filters
- [ ] Lyrics display (if available via external API)
- [ ] Spotify embed player (iframe alternative)
- [ ] Download/purchase links

## API Response Examples

### Top Tracks Response

```json
{
  "tracks": [
    {
      "id": "track_id_here",
      "name": "Track Title",
      "artists": [{ "name": "Artist Name" }],
      "album": {
        "name": "Album Name",
        "images": [
          { "url": "https://i.scdn.co/image/..." }
        ],
        "release_date": "2024-01-15"
      },
      "preview_url": "https://p.scdn.co/mp3-preview/...",
      "duration_ms": 180000,
      "external_urls": { "spotify": "https://open.spotify.com/track/..." },
      "external_ids": { "isrc": "USUM12345678" },
      "popularity": 85
    }
  ]
}
```

## Support

For issues or questions:
1. Check Convex logs: `npx convex logs`
2. Verify environment variables: `npx convex env list`
3. Test API credentials with curl:
   ```bash
   curl -X POST "https://accounts.spotify.com/api/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=client_credentials" \
     -u "CLIENT_ID:CLIENT_SECRET"
   ```

## References

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Client Credentials Flow](https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/)
- [Get Artist's Top Tracks](https://developer.spotify.com/documentation/web-api/reference/get-an-artists-top-tracks)
- [Convex Environment Variables](https://docs.convex.dev/production/environment-variables)
