import { query, mutation } from "./_generated/server"
import { v, ConvexError } from "convex/values"

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
        const productId = await ctx.db.insert("merchProducts", {
            name: args.name,
            description: args.description,
            longDescription: args.longDescription,
            price: args.price,
            category: args.category as "apparel" | "accessories" | "vinyl" | "limited" | "other",
            tags: args.tags,
            imageUrls: args.images,
            thumbnailUrl: args.images[0] || "",
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

        // Build update object with proper types
        const updateData: Record<string, any> = {
            updatedAt: Date.now(),
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
