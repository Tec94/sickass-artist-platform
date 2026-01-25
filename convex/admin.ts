import { query, mutation } from "./_generated/server"
import { v, ConvexError } from "convex/values"
import { DEFAULT_MODERATION_POLICY } from "./moderationUtils"

// Helper to check if user has admin privileges
async function requireAdmin(ctx: any) {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
        throw new ConvexError("Not authenticated")
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
        .first()

    if (!user) {
        throw new ConvexError("User not found")
    }

    if (user.role !== "admin" && user.role !== "mod" && user.role !== "artist") {
        throw new ConvexError("Insufficient permissions. Admin, mod, or artist role required.")
    }

    return user
}

const SUPPORTED_MEDIA_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
]

const DEFAULT_CHAT_SERVER_SETTINGS = {
    slowModeSeconds: 0,
    maxImageMb: 6,
    maxVideoMb: 24,
    allowedMediaTypes: SUPPORTED_MEDIA_TYPES,
    enabledStickerPackIds: [] as any[],
    retentionDays: undefined as number | undefined,
}

const buildProductSearchText = (name: string, description: string, tags: string[]) =>
    [name, description, tags.join(" ")].join(" ").toLowerCase()

const normalizeWordList = (items: string[] | undefined) =>
    Array.from(
        new Set((items || []).map((item) => item.toLowerCase().trim()).filter(Boolean))
    ).slice(0, 500)

// ==================== USER MANAGEMENT ====================

export const getUsers = query({
    args: {
        page: v.number(),
        pageSize: v.number(),
        search: v.optional(v.string()),
        role: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { page, pageSize, search, role } = args

        let allUsers

        // If role filter provided, use index
        if (role && role !== "all") {
            allUsers = await ctx.db
                .query("users")
                .withIndex("by_role", (q) => q.eq("role", role as any))
                .collect()
        } else {
            allUsers = await ctx.db.query("users").collect()
        }

        // Filter by search if provided
        let filteredUsers = allUsers
        if (search && search.trim()) {
            const searchLower = search.toLowerCase()
            filteredUsers = allUsers.filter(user =>
                user.displayName.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.username.toLowerCase().includes(searchLower)
            )
        }

        // Paginate
        const startIdx = page * pageSize
        const paginatedUsers = filteredUsers.slice(startIdx, startIdx + pageSize)

        return {
            items: paginatedUsers,
            totalCount: filteredUsers.length,
            hasMore: startIdx + pageSize < filteredUsers.length,
            page,
        }
    },
})

export const updateUserRole = mutation({
    args: {
        userId: v.id("users"),
        newRole: v.union(
            v.literal("artist"),
            v.literal("admin"),
            v.literal("mod"),
            v.literal("crew"),
            v.literal("fan")
        ),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const user = await ctx.db.get(args.userId)
        if (!user) {
            throw new ConvexError("User not found")
        }

        await ctx.db.patch(args.userId, {
            role: args.newRole,
            updatedAt: Date.now(),
        })

        return { success: true, userId: args.userId, newRole: args.newRole }
    },
})

export const updateUserTier = mutation({
    args: {
        userId: v.id("users"),
        newTier: v.union(
            v.literal("bronze"),
            v.literal("silver"),
            v.literal("gold"),
            v.literal("platinum")
        ),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const user = await ctx.db.get(args.userId)
        if (!user) {
            throw new ConvexError("User not found")
        }

        await ctx.db.patch(args.userId, {
            fanTier: args.newTier,
            updatedAt: Date.now(),
        })

        return { success: true, userId: args.userId, newTier: args.newTier }
    },
})

// ==================== PRODUCT MANAGEMENT ====================

export const createProduct = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        longDescription: v.optional(v.string()),
        price: v.number(),
        category: v.string(),
        tags: v.array(v.string()),
        images: v.array(v.string()),
        status: v.union(v.literal("active"), v.literal("draft"), v.literal("archived")),
        model3dUrl: v.optional(v.string()),
        modelPosterUrl: v.optional(v.string()),
        modelConfig: v.optional(v.object({
            autoRotate: v.optional(v.boolean()),
            cameraOrbit: v.optional(v.string()),
            minFov: v.optional(v.number()),
            maxFov: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        const admin = await requireAdmin(ctx)

        if (!args.name || args.name.length < 1) {
            throw new ConvexError("Product name is required")
        }

        if (args.price < 0) {
            throw new ConvexError("Price must be non-negative")
        }

        const now = Date.now()
        const searchText = buildProductSearchText(args.name, args.description, args.tags)
        const productId = await ctx.db.insert("merchProducts", {
            name: args.name,
            description: args.description,
            longDescription: args.longDescription,
            price: args.price,
            category: args.category as "apparel" | "accessories" | "vinyl" | "limited" | "other",
            tags: args.tags,
            searchText,
            imageUrls: args.images,
            thumbnailUrl: args.images[0] || "",
            model3dUrl: args.model3dUrl,
            modelPosterUrl: args.modelPosterUrl,
            modelConfig: args.modelConfig,
            totalStock: 0,
            lowStockThreshold: 10,
            status: args.status,
            isPreOrder: false,
            isDropProduct: false,
            createdAt: now,
            updatedAt: now,
            createdBy: admin._id,
        })

        return { success: true, productId }
    },
})

export const generateMerchUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx)
        return await ctx.storage.generateUploadUrl()
    },
})

export const resolveMerchUpload = mutation({
    args: {
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)
        const url = await ctx.storage.getUrl(args.storageId)
        if (!url) {
            throw new ConvexError("Upload not found. Please retry.")
        }
        return { url }
    },
})

export const updateProduct = mutation({
    args: {
        productId: v.id("merchProducts"),
        updates: v.object({
            name: v.optional(v.string()),
            description: v.optional(v.string()),
            longDescription: v.optional(v.string()),
            price: v.optional(v.number()),
            category: v.optional(v.string()),
            tags: v.optional(v.array(v.string())),
            images: v.optional(v.array(v.string())),
            status: v.optional(v.union(v.literal("active"), v.literal("draft"), v.literal("archived"))),
            model3dUrl: v.optional(v.string()),
            modelPosterUrl: v.optional(v.string()),
            modelConfig: v.optional(v.object({
                autoRotate: v.optional(v.boolean()),
                cameraOrbit: v.optional(v.string()),
                minFov: v.optional(v.number()),
                maxFov: v.optional(v.number()),
            })),
        }),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const product = await ctx.db.get(args.productId)
        if (!product) {
            throw new ConvexError("Product not found")
        }

        if (args.updates.price !== undefined && args.updates.price < 0) {
            throw new ConvexError("Price must be non-negative")
        }

        const nextName = args.updates.name ?? product.name
        const nextDescription = args.updates.description ?? product.description
        const nextTags = args.updates.tags ?? product.tags ?? []
        const searchText = buildProductSearchText(nextName, nextDescription, nextTags)

        // Build update object with proper types
        const updateData: Record<string, any> = {
            updatedAt: Date.now(),
            searchText,
        }
        if (args.updates.name !== undefined) updateData.name = args.updates.name
        if (args.updates.description !== undefined) updateData.description = args.updates.description
        if (args.updates.longDescription !== undefined) updateData.longDescription = args.updates.longDescription
        if (args.updates.price !== undefined) updateData.price = args.updates.price
        if (args.updates.category !== undefined) {
            updateData.category = args.updates.category as "apparel" | "accessories" | "vinyl" | "limited" | "other"
        }
        if (args.updates.tags !== undefined) updateData.tags = args.updates.tags
        if (args.updates.images !== undefined) {
            updateData.imageUrls = args.updates.images
            updateData.thumbnailUrl = args.updates.images[0] || product.thumbnailUrl
        }
        if (args.updates.status !== undefined) updateData.status = args.updates.status
        if (args.updates.model3dUrl !== undefined) updateData.model3dUrl = args.updates.model3dUrl
        if (args.updates.modelPosterUrl !== undefined) updateData.modelPosterUrl = args.updates.modelPosterUrl
        if (args.updates.modelConfig !== undefined) updateData.modelConfig = args.updates.modelConfig

        await ctx.db.patch(args.productId, updateData)

        return { success: true, productId: args.productId }
    },
})

export const archiveProduct = mutation({
    args: {
        productId: v.id("merchProducts"),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const product = await ctx.db.get(args.productId)
        if (!product) {
            throw new ConvexError("Product not found")
        }

        await ctx.db.patch(args.productId, {
            status: "archived",
            updatedAt: Date.now(),
        })

        return { success: true, productId: args.productId }
    },
})

// ==================== CHAT SETTINGS & STICKERS ====================

export const updateServerSettings = mutation({
    args: {
        slowModeSeconds: v.optional(v.number()),
        maxImageMb: v.optional(v.number()),
        maxVideoMb: v.optional(v.number()),
        allowedMediaTypes: v.optional(v.array(v.string())),
        enabledStickerPackIds: v.optional(v.array(v.id("chatStickerPacks"))),
        retentionDays: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const admin = await requireAdmin(ctx)

        const allowedSlowModes = new Set([0, 5, 10, 30])
        if (args.slowModeSeconds !== undefined && !allowedSlowModes.has(args.slowModeSeconds)) {
            throw new ConvexError("Slow mode must be one of: 0, 5, 10, 30 seconds")
        }

        if (args.maxImageMb !== undefined && (args.maxImageMb < 1 || args.maxImageMb > 100)) {
            throw new ConvexError("Image limit must be between 1MB and 100MB")
        }
        if (args.maxVideoMb !== undefined && (args.maxVideoMb < 1 || args.maxVideoMb > 500)) {
            throw new ConvexError("Video limit must be between 1MB and 500MB")
        }

        if (args.allowedMediaTypes) {
            const invalid = args.allowedMediaTypes.filter((type) => !SUPPORTED_MEDIA_TYPES.includes(type))
            if (invalid.length > 0) {
                throw new ConvexError(`Unsupported media types: ${invalid.join(", ")}`)
            }
        }

        const now = Date.now()
        const existing = await ctx.db.query("chatServerSettings").first()

        const baseEnabledPackIds = args.enabledStickerPackIds ?? existing?.enabledStickerPackIds ?? []
        const enabledStickerPackIds: any[] = []
        for (const packId of baseEnabledPackIds) {
            const pack = await ctx.db.get(packId)
            if (!pack || !pack.isActive) {
                if (args.enabledStickerPackIds) {
                    throw new ConvexError("Cannot enable an inactive or missing sticker pack")
                }
                continue
            }
            enabledStickerPackIds.push(packId)
        }

        const retentionDaysValue = args.retentionDays !== undefined
            ? (args.retentionDays > 0 ? args.retentionDays : undefined)
            : existing?.retentionDays
        if (retentionDaysValue !== undefined && (retentionDaysValue < 1 || retentionDaysValue > 365)) {
            throw new ConvexError("Retention must be between 1 and 365 days")
        }

        const nextSettings = {
            slowModeSeconds: args.slowModeSeconds ?? existing?.slowModeSeconds ?? DEFAULT_CHAT_SERVER_SETTINGS.slowModeSeconds,
            maxImageMb: args.maxImageMb ?? existing?.maxImageMb ?? DEFAULT_CHAT_SERVER_SETTINGS.maxImageMb,
            maxVideoMb: args.maxVideoMb ?? existing?.maxVideoMb ?? DEFAULT_CHAT_SERVER_SETTINGS.maxVideoMb,
            allowedMediaTypes: args.allowedMediaTypes
                ? [...args.allowedMediaTypes]
                : existing?.allowedMediaTypes ?? [...DEFAULT_CHAT_SERVER_SETTINGS.allowedMediaTypes],
            enabledStickerPackIds,
            retentionDays: retentionDaysValue,
            updatedAt: now,
            updatedBy: admin._id,
        }

        if (existing) {
            await ctx.db.patch(existing._id, nextSettings)
            return { ...existing, ...nextSettings }
        }

        const settingsId = await ctx.db.insert("chatServerSettings", nextSettings)
        return await ctx.db.get(settingsId)
    },
})

export const createStickerPack = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const admin = await requireAdmin(ctx)

        const name = args.name.trim()
        if (name.length < 2) {
            throw new ConvexError("Sticker pack name is too short")
        }

        const packs = await ctx.db.query("chatStickerPacks").collect()
        const duplicate = packs.find((pack) => pack.name.toLowerCase() === name.toLowerCase())
        if (duplicate) {
            throw new ConvexError("A sticker pack with this name already exists")
        }

        const packId = await ctx.db.insert("chatStickerPacks", {
            name,
            description: args.description?.trim(),
            isActive: true,
            createdAt: Date.now(),
            createdBy: admin._id,
        })

        return await ctx.db.get(packId)
    },
})

export const toggleStickerPackActive = mutation({
    args: {
        packId: v.id("chatStickerPacks"),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const pack = await ctx.db.get(args.packId)
        if (!pack) {
            throw new ConvexError("Sticker pack not found")
        }

        await ctx.db.patch(args.packId, { isActive: args.isActive })

        if (!args.isActive) {
            const settings = await ctx.db.query("chatServerSettings").first()
            if (settings && settings.enabledStickerPackIds.includes(args.packId)) {
                await ctx.db.patch(settings._id, {
                    enabledStickerPackIds: settings.enabledStickerPackIds.filter((id: any) => id !== args.packId),
                    updatedAt: Date.now(),
                })
            }
        }

        return { success: true }
    },
})

export const listStickerPacks = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx)

        const packs = await ctx.db.query("chatStickerPacks").collect()
        const settings = await ctx.db.query("chatServerSettings").first()
        const enabledIds = new Set(settings?.enabledStickerPackIds ?? [])

        const packsWithCounts = await Promise.all(
            packs.map(async (pack) => {
                const stickers = await ctx.db
                    .query("chatStickers")
                    .withIndex("by_pack", (q) => q.eq("packId", pack._id))
                    .collect()

                return {
                    ...pack,
                    stickerCount: stickers.length,
                    isEnabled: enabledIds.has(pack._id),
                }
            })
        )

        return packsWithCounts.sort((a, b) => a.name.localeCompare(b.name))
    },
})

export const generateStickerUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx)
        return await ctx.storage.generateUploadUrl()
    },
})

export const uploadSticker = mutation({
    args: {
        packId: v.id("chatStickerPacks"),
        name: v.string(),
        storageId: v.id("_storage"),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const pack = await ctx.db.get(args.packId)
        if (!pack || !pack.isActive) {
            throw new ConvexError("Sticker pack not found or inactive")
        }

        const url = await ctx.storage.getUrl(args.storageId)
        if (!url) {
            throw new ConvexError("Upload not found")
        }

        const tags = normalizeWordList(args.tags)

        const stickerId = await ctx.db.insert("chatStickers", {
            packId: args.packId,
            name: args.name.trim(),
            imageUrl: url,
            storageId: args.storageId,
            tags,
            createdAt: Date.now(),
            isActive: true,
        })

        return await ctx.db.get(stickerId)
    },
})

// ==================== MODERATION POLICY & FLAGS ====================

export const updateModerationPolicy = mutation({
    args: {
        warningWindowDays: v.optional(v.number()),
        warningThreshold: v.optional(v.number()),
        timeoutDurationsMs: v.optional(v.array(v.number())),
        banThreshold: v.optional(v.number()),
        denylist: v.optional(v.array(v.string())),
        allowlist: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const admin = await requireAdmin(ctx)

        const existing = await ctx.db.query("moderationPolicy").first()
        const base = existing ?? DEFAULT_MODERATION_POLICY

        const warningWindowDays = args.warningWindowDays ?? base.warningWindowDays
        if (warningWindowDays < 1 || warningWindowDays > 180) {
            throw new ConvexError("Warning window must be between 1 and 180 days")
        }

        const warningThreshold = args.warningThreshold ?? base.warningThreshold
        if (warningThreshold < 1 || warningThreshold > 10) {
            throw new ConvexError("Warning threshold must be between 1 and 10")
        }

        const timeoutDurationsMs = args.timeoutDurationsMs
            ? Array.from(new Set(args.timeoutDurationsMs.filter((d) => d > 0))).sort((a, b) => a - b).slice(0, 10)
            : base.timeoutDurationsMs
        if (timeoutDurationsMs.length === 0) {
            throw new ConvexError("At least one timeout duration is required")
        }

        const banThreshold = args.banThreshold ?? base.banThreshold
        if (banThreshold < 1 || banThreshold > 5) {
            throw new ConvexError("Ban threshold must be between 1 and 5")
        }

        const denylist = normalizeWordList(args.denylist ?? base.denylist)
        const allowlist = normalizeWordList(args.allowlist ?? base.allowlist)

        const nextPolicy = {
            warningWindowDays,
            warningThreshold,
            timeoutDurationsMs,
            banThreshold,
            denylist,
            allowlist,
            updatedAt: Date.now(),
            updatedBy: admin._id,
        }

        if (existing) {
            await ctx.db.patch(existing._id, nextPolicy)
            return { ...existing, ...nextPolicy }
        }

        const policyId = await ctx.db.insert("moderationPolicy", nextPolicy)
        return await ctx.db.get(policyId)
    },
})

export const updateFeatureFlag = mutation({
    args: {
        key: v.string(),
        enabled: v.boolean(),
    },
    handler: async (ctx, args) => {
        const admin = await requireAdmin(ctx)
        const key = args.key.trim()
        if (key.length < 2 || key.length > 64) {
            throw new ConvexError("Feature flag key must be between 2 and 64 characters")
        }

        const existing = await ctx.db
            .query("adminFeatureFlags")
            .withIndex("by_key", (q) => q.eq("key", key))
            .first()

        const next = {
            key,
            enabled: args.enabled,
            updatedAt: Date.now(),
            updatedBy: admin._id,
        }

        if (existing) {
            await ctx.db.patch(existing._id, next)
            return { ...existing, ...next }
        }

        const flagId = await ctx.db.insert("adminFeatureFlags", next)
        return await ctx.db.get(flagId)
    },
})

export const getFeatureFlags = query({
    args: {},
    handler: async (ctx) => {
        const flags = await ctx.db.query("adminFeatureFlags").collect()
        return flags.reduce<Record<string, boolean>>((acc, flag) => {
            acc[flag.key] = flag.enabled
            return acc
        }, {})
    },
})

export const seedModerationData = mutation({
    args: {},
    handler: async (ctx) => {
        const admin = await requireAdmin(ctx)

        const existingSeed = await ctx.db
            .query("moderationReports")
            .withIndex("by_status_createdAt", (q) => q.eq("status", "open"))
            .order("desc")
            .take(50)
        if (existingSeed.some((report) => report.note === "seeded-demo")) {
            return { seeded: false, reason: "Seed data already present" }
        }

        const channel = await ctx.db.query("channels").first()
        if (!channel) {
            throw new ConvexError("Create at least one channel before seeding moderation data")
        }

        const now = Date.now()
        let seedMessage = await ctx.db
            .query("messages")
            .withIndex("by_channel", (q) => q.eq("channelId", channel._id))
            .order("desc")
            .take(1)
        let messageId = seedMessage[0]?._id

        if (!messageId) {
            messageId = await ctx.db.insert("messages", {
                channelId: channel._id,
                authorId: admin._id,
                authorDisplayName: admin.displayName,
                authorAvatar: admin.avatar,
                authorTier: admin.fanTier,
                content: "Seeded moderation sample message",
                messageType: "text",
                editedAt: undefined,
                isPinned: false,
                isDeleted: false,
                deletedAt: undefined,
                deletedBy: undefined,
                reactionEmojis: [],
                reactionCount: 0,
                upVoteCount: 0,
                downVoteCount: 0,
                netVoteCount: 0,
                idempotencyKey: `seed-${now}`,
                createdAt: now,
            })
            await ctx.db.patch(channel._id, {
                messageCount: channel.messageCount + 1,
                lastMessageAt: now,
                lastMessageId: messageId,
                updatedAt: now,
            })
        }

        const users = await ctx.db.query("users").take(3)
        const reporters = users.length > 0 ? users : [admin]

        for (const reporter of reporters) {
            await ctx.db.insert("moderationReports", {
                contentType: "chat_message",
                contentId: messageId,
                reportedBy: reporter._id,
                reason: "harassment",
                note: "seeded-demo",
                status: "open",
                createdAt: now,
            })
        }

        const category = await ctx.db.query("categories").first()
        if (category) {
            const threadId = await ctx.db.insert("threads", {
                title: "Seeded moderation thread",
                content: "This thread exists to seed the moderation queue.",
                authorId: admin._id,
                authorDisplayName: admin.displayName,
                authorAvatar: admin.avatar,
                authorTier: admin.fanTier,
                categoryId: category._id,
                tags: ["seeded"],
                upVoterIds: [],
                downVoterIds: [],
                upVoteCount: 0,
                downVoteCount: 0,
                netVoteCount: 0,
                replyCount: 0,
                viewCount: 0,
                isDeleted: false,
                moderationStatus: "active",
                createdAt: now,
                updatedAt: now,
            })

            await ctx.db.patch(category._id, {
                threadCount: (category.threadCount || 0) + 1,
                lastThreadAt: now,
            })

            const replyId = await ctx.db.insert("replies", {
                threadId,
                authorId: admin._id,
                authorDisplayName: admin.displayName,
                authorAvatar: admin.avatar,
                authorTier: admin.fanTier,
                content: "Seeded moderation reply",
                upVoterIds: [],
                downVoterIds: [],
                upVoteCount: 0,
                downVoteCount: 0,
                isDeleted: false,
                moderationStatus: "active",
                createdAt: now,
            })

            await ctx.db.patch(threadId, {
                replyCount: 1,
                lastReplyAt: now,
                lastReplyById: admin._id,
                updatedAt: now,
            })

            await ctx.db.insert("moderationReports", {
                contentType: "forum_reply",
                contentId: replyId,
                reportedBy: admin._id,
                reason: "spam",
                note: "seeded-demo",
                status: "open",
                createdAt: now,
            })
        }

        return { seeded: true }
    },
})

// ==================== CHANNEL MANAGEMENT ====================

export const createChannel = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        requiredRole: v.optional(v.union(
            v.literal("artist"),
            v.literal("admin"),
            v.literal("mod"),
            v.literal("crew"),
            v.literal("fan")
        )),
        requiredFanTier: v.optional(v.union(
            v.literal("bronze"),
            v.literal("silver"),
            v.literal("gold"),
            v.literal("platinum")
        )),
        category: v.optional(v.union(
            v.literal("general"),
            v.literal("mod"),
            v.literal("fan-only"),
            v.literal("announcements")
        )),
    },
    handler: async (ctx, args) => {
        const admin = await requireAdmin(ctx)

        if (!args.name || args.name.length < 1) {
            throw new ConvexError("Channel name is required")
        }

        // Generate slug from name
        const slug = args.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")

        // Check for duplicate slug
        const existing = await ctx.db
            .query("channels")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first()

        if (existing) {
            throw new ConvexError("A channel with this name already exists")
        }

        const now = Date.now()
        const channelId = await ctx.db.insert("channels", {
            name: args.name,
            slug,
            description: args.description,
            requiredRole: args.requiredRole,
            requiredFanTier: args.requiredFanTier,
            category: args.category || "general",
            createdBy: admin._id,
            createdAt: now,
            updatedAt: now,
            messageCount: 0,
        })

        return { success: true, channelId, slug }
    },
})

export const updateChannel = mutation({
    args: {
        channelId: v.id("channels"),
        updates: v.object({
            name: v.optional(v.string()),
            description: v.optional(v.string()),
            requiredRole: v.optional(v.union(
                v.literal("artist"),
                v.literal("admin"),
                v.literal("mod"),
                v.literal("crew"),
                v.literal("fan")
            )),
            requiredFanTier: v.optional(v.union(
                v.literal("bronze"),
                v.literal("silver"),
                v.literal("gold"),
                v.literal("platinum")
            )),
            category: v.optional(v.union(
                v.literal("general"),
                v.literal("mod"),
                v.literal("fan-only"),
                v.literal("announcements")
            )),
        }),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const channel = await ctx.db.get(args.channelId)
        if (!channel) {
            throw new ConvexError("Channel not found")
        }

        await ctx.db.patch(args.channelId, {
            ...args.updates,
            updatedAt: Date.now(),
        })

        return { success: true, channelId: args.channelId }
    },
})

export const deleteChannel = mutation({
    args: {
        channelId: v.id("channels"),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const channel = await ctx.db.get(args.channelId)
        if (!channel) {
            throw new ConvexError("Channel not found")
        }

        // Delete all messages in this channel first
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
            .collect()

        for (const msg of messages) {
            await ctx.db.delete(msg._id)
        }

        await ctx.db.delete(args.channelId)

        return { success: true }
    },
})

// ==================== FORUM MANAGEMENT ====================

export const createCategory = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        slug: v.string(),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
        requiredTier: v.optional(v.union(
            v.literal("bronze"),
            v.literal("silver"),
            v.literal("gold"),
            v.literal("platinum")
        )),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        if (!args.name || args.name.length < 1) {
            throw new ConvexError("Category name is required")
        }

        // Check for duplicate slug
        const existing = await ctx.db
            .query("categories")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first()

        if (existing) {
            throw new ConvexError("A category with this slug already exists")
        }

        const now = Date.now()
        const categoryId = await ctx.db.insert("categories", {
            name: args.name,
            description: args.description,
            slug: args.slug,
            icon: args.icon || "📁",
            color: args.color || "#8b0000",
            requiredFanTier: args.requiredTier,
            order: 0,
            threadCount: 0,
            createdAt: now,
        })

        return { success: true, categoryId }
    },
})

export const updateCategory = mutation({
    args: {
        categoryId: v.id("categories"),
        updates: v.object({
            name: v.optional(v.string()),
            description: v.optional(v.string()),
            icon: v.optional(v.string()),
            color: v.optional(v.string()),
            requiredTier: v.optional(v.union(
                v.literal("bronze"),
                v.literal("silver"),
                v.literal("gold"),
                v.literal("platinum")
            )),
        }),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const category = await ctx.db.get(args.categoryId)
        if (!category) {
            throw new ConvexError("Category not found")
        }

        await ctx.db.patch(args.categoryId, args.updates)

        return { success: true, categoryId: args.categoryId }
    },
})

export const deleteCategory = mutation({
    args: {
        categoryId: v.id("categories"),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const category = await ctx.db.get(args.categoryId)
        if (!category) {
            throw new ConvexError("Category not found")
        }

        // Check if category has threads
        const threads = await ctx.db
            .query("threads")
            .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
            .first()

        if (threads) {
            throw new ConvexError("Cannot delete category with existing threads. Move or delete threads first.")
        }

        await ctx.db.delete(args.categoryId)

        return { success: true }
    },
})

export const pinThread = mutation({
    args: {
        threadId: v.id("threads"),
        pinned: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const thread = await ctx.db.get(args.threadId)
        if (!thread) {
            throw new ConvexError("Thread not found")
        }

        // Note: threads schema doesn't have isPinned - this would need schema update
        // For now, just update the updatedAt timestamp
        await ctx.db.patch(args.threadId, {
            updatedAt: Date.now(),
        })

        return { success: true, threadId: args.threadId, pinned: args.pinned }
    },
})

export const lockThread = mutation({
    args: {
        threadId: v.id("threads"),
        locked: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const thread = await ctx.db.get(args.threadId)
        if (!thread) {
            throw new ConvexError("Thread not found")
        }

        // Note: threads schema doesn't have isLocked - this would need schema update
        // For now, just update the updatedAt timestamp
        await ctx.db.patch(args.threadId, {
            updatedAt: Date.now(),
        })

        return { success: true, threadId: args.threadId, locked: args.locked }
    },
})

export const deleteThread = mutation({
    args: {
        threadId: v.id("threads"),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const thread = await ctx.db.get(args.threadId)
        if (!thread) {
            throw new ConvexError("Thread not found")
        }

        // Soft delete by setting deletedAt
        await ctx.db.patch(args.threadId, {
            deletedAt: Date.now(),
            updatedAt: Date.now(),
        })

        // Decrement category thread count
        const category = await ctx.db.get(thread.categoryId)
        if (category) {
            await ctx.db.patch(thread.categoryId, {
                threadCount: Math.max(0, category.threadCount - 1),
            })
        }

        return { success: true }
    },
})

export const deleteReply = mutation({
    args: {
        replyId: v.id("replies"),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx)

        const reply = await ctx.db.get(args.replyId)
        if (!reply) {
            throw new ConvexError("Reply not found")
        }

        // Soft delete (replies don't have updatedAt in schema)
        await ctx.db.patch(args.replyId, {
            deletedAt: Date.now(),
        })

        // Decrement thread reply count
        const thread = await ctx.db.get(reply.threadId)
        if (thread) {
            await ctx.db.patch(reply.threadId, {
                replyCount: Math.max(0, thread.replyCount - 1),
                updatedAt: Date.now(),
            })
        }

        return { success: true }
    },
})

// ==================== ADMIN STATS ====================

export const getAdminStats = query({
    args: {},
    handler: async (ctx) => {
        const [products, channels, categories, users, events] = await Promise.all([
            ctx.db.query("merchProducts").collect(),
            ctx.db.query("channels").collect(),
            ctx.db.query("categories").collect(),
            ctx.db.query("users").collect(),
            ctx.db.query("events").collect(),
        ])

        return {
            productCount: products.filter(p => p.status !== "archived").length,
            channelCount: channels.length,
            categoryCount: categories.length,
            userCount: users.length,
            eventCount: events.length,
            adminCount: users.filter(u => u.role === "admin").length,
            modCount: users.filter(u => u.role === "mod").length,
        }
    },
})
