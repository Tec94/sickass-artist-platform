# Gallery & UGC Schema

Database schema for gallery content and user-generated content (UGC) management.

## Tables

### galleryContent
Official gallery content created by artist/admin.

**Fields:**
- `contentId` - Unique identifier
- `type`: 'show' | 'bts' | 'edit' | 'wip' | 'exclusive'
- `title`, `description`
- `imageUrl`, `thumbnailUrl` - CDN paths from Convex storage
- `creatorId` - Reference to users table
- `requiredFanTier` - Min tier: 'bronze' | 'silver' | 'gold' | 'platinum'
- `tags` - Array of strings for categorization
- `likeCount`, `viewCount`
- `pinned` - Featured content flag

**Indexes:** `by_type`, `by_creator`, `by_tier`

### ugcContent
User-generated content submitted by fans.

**Fields:**
- `ugcId` - Unique identifier
- `creatorId` - Reference to users table
- **Denormalized creator info**: `creatorDisplayName`, `creatorAvatar`, `creatorTier`
- `title`, `description`
- `imageUrls` - Multiple images array
- `uploadedFile` - Convex storage reference
- `likeCount`, `viewCount`, `downloadCount`
- `category`: 'user-edit' | 'fan-art' | 'repost'
- `tags` - Array of strings
- `isApproved` - Moderation status (starts as false)

**Indexes:** `by_creator`, `by_category`, `by_createdAt`, `by_approved`

**Note:** Creator info denormalized for performance (avoids join queries).

### galleryLikes
Tracks user likes for both gallery and UGC content.

**Fields:**
- `userId`, `contentId`, `type`: 'gallery' | 'ugc'
- `createdAt`

**Indexes:** `by_user_type`, `by_content_type`

**Unique Constraint:** Must enforce `(userId, contentId, type)` uniqueness in mutation logic (not schema level).

## Usage Notes

### CDN URLs
Image URLs contain Convex storage paths or CDN-transformed URLs (e.g., Cloudinary). Strings, not binary data.

### Denormalization
ugcContent stores creator info to avoid join queries. Intentional for performance optimization. Never update these snapshots.

### Unique Constraints
- `galleryContent.contentId` - Enforce in mutations
- `ugcContent.ugcId` - Enforce in mutations
- `galleryLikes (userId, contentId, type)` - Enforce in mutations

### Approval Workflow
UGC starts with `isApproved: false`. Use `by_approved` index to query pending content for moderation.

## Generated Types

After `npx convex dev`, TypeScript types generated in `convex/_generated/dataModel.d.ts`:
- `Doc<'galleryContent'>`, `Doc<'ugcContent'>`, `Doc<'galleryLikes'>`
- `Id<'galleryContent'>`, `Id<'ugcContent'>`, `Id<'galleryLikes'>`

## Related Files

- `convex/schema.ts` - Schema definition
- `convex/gallery.ts` - Gallery queries/mutations
- `convex/ugc.ts` - UGC queries/mutations
