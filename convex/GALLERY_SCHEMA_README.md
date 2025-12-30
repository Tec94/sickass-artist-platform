# Gallery & UGC Schema Documentation

This document describes the three new tables added to the Convex schema for gallery content and user-generated content (UGC) management.

## Tables Overview

### 1. galleryContent

Official gallery content created by the artist/admin.

**Fields:**
- `contentId` (string) - Unique identifier for the content
- `type` (union) - Content type: 'show' | 'bts' | 'edit' | 'wip' | 'exclusive'
- `title` (string) - Content title
- `description` (string) - Content description
- `imageUrl` (string) - Full-size image URL (CDN path from Convex storage)
- `thumbnailUrl` (string) - Thumbnail URL (CDN path)
- `creatorId` (Id<'users'>) - Reference to the creator user
- `requiredFanTier` (optional) - Minimum tier required to view: 'bronze' | 'silver' | 'gold' | 'platinum'
- `tags` (array<string>) - Content tags for categorization
- `likeCount` (number) - Number of likes
- `viewCount` (number) - Number of views
- `pinned` (boolean) - Whether content is pinned/featured
- `createdAt` (number) - Creation timestamp
- `updatedAt` (number) - Last update timestamp

**Indexes:**
- `by_type` - Query by content type
- `by_creator` - Query by creator user ID
- `by_tier` - Query by required fan tier

---

### 2. ugcContent

User-generated content submitted by fans.

**Fields:**
- `ugcId` (string) - Unique identifier for UGC
- `creatorId` (Id<'users'>) - Reference to the creator user
- `creatorDisplayName` (string) - Denormalized creator display name
- `creatorAvatar` (string) - Denormalized creator avatar URL
- `creatorTier` (union) - Denormalized creator tier: 'bronze' | 'silver' | 'gold' | 'platinum'
- `title` (string) - Content title
- `description` (string) - Content description
- `imageUrls` (array<string>) - Multiple image URLs
- `uploadedFile` (optional string) - File reference for Convex storage
- `likeCount` (number) - Number of likes
- `viewCount` (number) - Number of views
- `downloadCount` (number) - Number of downloads
- `category` (union) - Content category: 'user-edit' | 'fan-art' | 'repost'
- `tags` (array<string>) - Content tags
- `isApproved` (boolean) - Moderation approval status (starts as false)
- `createdAt` (number) - Creation timestamp
- `updatedAt` (number) - Last update timestamp

**Indexes:**
- `by_creator` - Query by creator user ID
- `by_category` - Query by content category
- `by_createdAt` - Query by creation date (for sorting)
- `by_approved` - Query by approval status (for moderation)

**Note:** Creator information is denormalized for performance to avoid join queries.

---

### 3. galleryLikes

Tracks user likes for both gallery and UGC content.

**Fields:**
- `userId` (Id<'users'>) - User who liked the content
- `contentId` (string) - ID of the liked content (contentId or ugcId)
- `type` (union) - Type of content: 'gallery' | 'ugc'
- `createdAt` (number) - Like timestamp

**Indexes:**
- `by_user_type` - Query likes by user and content type
- `by_content_type` - Query likes by content ID and type

**Important:** This table must enforce a unique constraint on (userId, contentId, type) to prevent duplicate likes. This is enforced in the mutation logic, not at the schema level.

---

## Usage Notes

### CDN URLs
Image URLs (imageUrl, thumbnailUrl, imageUrls) should contain Convex storage paths or CDN-transformed URLs (e.g., Cloudinary). These are strings, not binary data.

### Denormalization
The ugcContent table stores creatorDisplayName, creatorAvatar, and creatorTier to avoid join queries. This is intentional for performance optimization.

### Unique Constraints
- galleryContent.contentId should be unique (enforce in mutations)
- ugcContent.ugcId should be unique (enforce in mutations)
- galleryLikes (userId, contentId, type) should be unique (enforce in mutations)

### Approval Workflow
UGC content starts with `isApproved: false` and must be manually approved by admins. Use the `by_approved` index to query pending content for moderation.

---

## Migration Notes

These tables were added in Task 1 of the Gallery & UGC feature development.

**Next Steps:**
- Task 2: Create convex/gallery.ts with queries/mutations
- Task 3: Create convex/ugc.ts with queries/mutations
- Task 4: Implement gallery UI components
- Task 5: Implement UGC submission and display

---

## Generated Types

After running `npx convex dev`, TypeScript types will be generated in:
- `convex/_generated/dataModel.d.ts`

The generated types will include:
- `Doc<'galleryContent'>` - Full document type for gallery content
- `Doc<'ugcContent'>` - Full document type for UGC
- `Doc<'galleryLikes'>` - Full document type for likes
- `Id<'galleryContent'>` - Type-safe ID for gallery content
- `Id<'ugcContent'>` - Type-safe ID for UGC
- `Id<'galleryLikes'>` - Type-safe ID for likes

---

## Related Files

- `convex/schema.ts` - Schema definition
- `convex/_generated/dataModel.d.ts` - Generated TypeScript types
- `convex/gallery.ts` (TBD) - Gallery queries/mutations
- `convex/ugc.ts` (TBD) - UGC queries/mutations
