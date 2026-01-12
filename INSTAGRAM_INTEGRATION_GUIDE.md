# Instagram Integration Guide

## Overview
This guide explains how the Instagram integration works, including syncing posts from your Instagram Business Account and displaying them on your artist platform.

## Architecture

### Components
1. **Instagram Schema** (`convex/schema.ts`) - Database table for storing Instagram posts
2. **Instagram Module** (`convex/instagram.ts`) - Backend logic for syncing and managing posts
3. **Cron Job** (`convex/crons.ts`) - Automatic sync every 4 hours
4. **Admin Panel** (`src/components/Admin/AdminInstagram.tsx`) - Admin interface for managing posts
5. **Public Gallery** (`src/components/InstagramGallery.tsx`) - Public-facing Instagram feed

### Data Flow
```
Instagram API → Cron Job (every 4 hours) → Database → Admin Panel → Public Gallery
                      ↓
              Manual Sync Button (Admin)
```

## Setup Instructions

### Step 1: Get Instagram Business Account Credentials

1. **Create Facebook App**
   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Create a new app with "Business" type
   - Add "Instagram Basic Display" product

2. **Get Instagram Business Account ID**
   - Navigate to Instagram Settings > Business
   - Connect your Instagram account to your Facebook Page
   - Note your Instagram Business Account ID

3. **Generate Access Token**
   - Use the Graph API Explorer to generate a token
   - Select your app and required permissions:
     - `instagram_basic`
     - `instagram_manage_insights`
     - `pages_read_engagement`
   - Exchange for a long-lived token (60 days)
   - **Important**: Set up token refresh automation

4. **Get Webhook Secret** (Optional)
   - For real-time updates
   - Configure webhook in your Facebook App settings

### Step 2: Configure Environment Variables

#### Local Development (.env.local)
Create a `.env.local` file in your project root:
```bash
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_id
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token
INSTAGRAM_WEBHOOK_SECRET=your_webhook_secret
```

#### Convex Deployment (Environment Variables)
Add environment variables to your Convex deployment:

```bash
# Using Convex CLI
npx convex env set INSTAGRAM_BUSINESS_ACCOUNT_ID your_instagram_business_id
npx convex env set INSTAGRAM_ACCESS_TOKEN your_long_lived_access_token
npx convex env set INSTAGRAM_WEBHOOK_SECRET your_webhook_secret
```

Or via Convex Dashboard:
1. Go to https://dashboard.convex.dev/
2. Select your deployment
3. Go to Settings > Environment Variables
4. Add the three Instagram variables

### Step 3: Deploy Schema Changes

```bash
# Push schema changes to Convex
npx convex deploy
```

This will create the `instagramPosts` table with the following fields:
- `igPostId` - Instagram post ID
- `igAccountId` - Business account ID
- `mediaUrl` - Full media URL
- `thumbnailUrl` - Thumbnail for grid display
- `caption` - Post caption
- `mediaType` - "image", "video", or "carousel"
- `likeCount`, `commentCount`, `viewCount` - Engagement metrics
- `isFeatured` - Admin-curated featured status
- `displayOrder` - Sort order for featured posts

### Step 4: Test Manual Sync

1. Log in as an admin user
2. Navigate to Admin Panel → Instagram tab
3. Click "Sync Now" button
4. Verify posts appear in the grid

### Step 5: Configure Gallery Display

Add the Instagram Gallery to any page:

```tsx
import { InstagramGallery } from '@/components/InstagramGallery'

export function MyPage() {
  return (
    <div>
      <h1>Instagram Feed</h1>
      <InstagramGallery />
    </div>
  )
}
```

## Features

### Automatic Sync
- Syncs every 4 hours via cron job
- Fetches latest 50 posts from Instagram API
- Updates existing posts with latest metrics
- Caches posts for 24 hours

### Manual Sync (Admin)
- Admin-triggered via "Sync Now" button
- Useful for immediate updates after posting
- Same process as automatic sync

### Featured Posts
- Admin can feature/unfeature individual posts
- Featured posts appear in public gallery
- Configurable display order (0 = highest priority)
- Non-featured posts still visible in admin panel

### Post Management (Admin Panel)
- View all synced posts in grid layout
- See engagement metrics (likes, comments)
- Feature/unfeature posts
- Adjust display order
- Direct links to Instagram posts
- Visual indicators for video and carousel posts

### Public Gallery
- Displays featured posts only
- Grid layout with hover effects
- Lightbox modal for full-size view
- Engagement stats on hover
- Direct link to Instagram post
- Responsive mobile design

## API Reference

### Queries

#### `getFeaturedInstagramPosts`
Get featured posts for public display.
```typescript
const posts = useQuery(api.instagram.getFeaturedInstagramPosts, { limit: 12 })
```

#### `getAllInstagramPosts`
Get all posts (admin view).
```typescript
const posts = useQuery(api.instagram.getAllInstagramPosts, { limit: 50 })
```

#### `getInstagramStatus`
Get sync status information.
```typescript
const status = useQuery(api.instagram.getInstagramStatus)
// Returns: { totalPosts, lastSyncedAt, nextSyncAt, status: 'fresh' | 'stale' | 'never' }
```

### Mutations

#### `adminTriggerSync`
Manually trigger Instagram sync (admin only).
```typescript
const triggerSync = useMutation(api.instagram.adminTriggerSync)
await triggerSync({})
```

#### `adminToggleFeature`
Feature or unfeature a post (admin only).
```typescript
const toggleFeature = useMutation(api.instagram.adminToggleFeature)
await toggleFeature({
  postId: 'kg1234567890',
  isFeatured: true,
  displayOrder: 0
})
```

## Troubleshooting

### "Missing Instagram credentials" Error
- Ensure environment variables are set in Convex deployment
- Check variable names match exactly
- Redeploy functions after adding variables

### "Instagram API error: 400"
- Access token may be expired (expires every 60 days)
- Generate new long-lived token
- Update `INSTAGRAM_ACCESS_TOKEN` in Convex

### Posts Not Syncing
- Check Instagram Business Account ID is correct
- Verify account has posts
- Check Convex logs for API errors
- Ensure cron job is enabled

### Images Not Loading
- Instagram media URLs can expire
- Sync posts regularly to refresh URLs
- Check CORS if serving from different domain

### Admin Can't Feature Posts
- Verify user has `admin` role in database
- Check browser console for errors
- Ensure mutations are deployed

## Best Practices

### Token Management
- Set up automatic token refresh (Facebook provides APIs)
- Store token refresh date in database
- Alert admins 1 week before expiration
- Keep backup tokens

### Sync Frequency
- 4 hours is recommended for most use cases
- Increase frequency during high-activity periods
- Reduce frequency if hitting rate limits
- Manual sync available for urgent updates

### Featured Posts
- Feature your best content first
- Update featured posts weekly
- Use displayOrder to highlight new content
- Limit to 12-24 featured posts for performance

### Performance
- Use `limit` parameter to control query size
- Featured posts are cached by Convex
- Images lazy-load in gallery
- Responsive images reduce bandwidth

### Rate Limits
- Instagram API: 200 calls/hour per user
- Each sync = 1 API call
- 4-hour interval = 6 calls/day (well under limit)
- Manual syncs count toward limit

## Future Enhancements

### Planned Features
- [ ] Instagram Stories sync
- [ ] Real-time webhook updates
- [ ] Advanced filtering (hashtags, mentions)
- [ ] Analytics dashboard
- [ ] Bulk feature/unfeature
- [ ] Auto-feature based on engagement
- [ ] Comment moderation
- [ ] Multi-account support

### API Improvements
- [ ] Token refresh automation
- [ ] Retry logic with exponential backoff
- [ ] Error tracking and alerting
- [ ] Performance monitoring
- [ ] Cache optimization

## Support

For issues or questions:
1. Check Convex logs in dashboard
2. Review Instagram API documentation
3. Test API calls manually with Graph API Explorer
4. Check network requests in browser DevTools

## Resources

- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Convex Documentation](https://docs.convex.dev/)
- [Meta for Developers](https://developers.facebook.com/)
