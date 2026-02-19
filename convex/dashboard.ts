import { query } from "./_generated/server"

const DASHBOARD_EXPERIENCE_FLAG_KEYS = {
    hardeningV1: "dashboard_cinematic_hardening_v1",
    headerCollapseV1: "dashboard_header_cinematic_collapse_v1",
    contentHygieneV1: "dashboard_content_hygiene_v1",
} as const

const DASHBOARD_EXPERIENCE_DEFAULTS = {
    hardeningV1: false,
    headerCollapseV1: true,
    contentHygieneV1: false,
} as const

/**
 * Optimized dashboard data query
 * Returns all data needed for the dashboard in a single query
 * to minimize network round-trips
 */
export const getDashboardData = query({
    args: {},
    handler: async (ctx) => {
        try {
            // Run all queries in parallel for performance
            const [
                products,
                threads,
                messages,
                galleryContent,
                events,
            ] = await Promise.all([
                // Top products (for "Top Merch" widget)
                ctx.db
                    .query("merchProducts")
                    .filter((q) => q.neq(q.field("status"), "archived"))
                    .order("desc")
                    .take(8),

                // Top forum threads by vote count (for "Trending Forum" widget)
                ctx.db
                    .query("threads")
                    .filter((q) => q.eq(q.field("deletedAt"), undefined))
                    .order("desc")
                    .take(20),

                // Recent messages for announcements (from any channel, recent first)
                ctx.db
                    .query("messages")
                    .order("desc")
                    .take(50),

                // Gallery content for trending (sorted by likes/views)
                ctx.db
                    .query("galleryContent")
                    .order("desc")
                    .take(20),

                // Upcoming events
                ctx.db
                    .query("events")
                    .filter((q) => q.gte(q.field("startAtUtc"), Date.now()))
                    .order("asc")
                    .take(5),
            ])

            // Process top merch - sort by price as a proxy for popularity
            // (In production, you'd join with orderItems to get actual sales)
            const topMerch = products
                .filter(p => p.status === "active")
                .slice(0, 4)
                .map(p => ({
                    _id: p._id,
                    name: p.name,
                    price: p.price,
                    image: p.imageUrls?.[0] || p.thumbnailUrl || "",
                    category: p.category,
                }))

            // Process trending forum posts - sort by engagement
            const trendingForum = threads
                .sort((a, b) => {
                    const scoreA = (a.netVoteCount || 0) + (a.replyCount || 0) * 2 + (a.viewCount || 0) * 0.1
                    const scoreB = (b.netVoteCount || 0) + (b.replyCount || 0) * 2 + (b.viewCount || 0) * 0.1
                    return scoreB - scoreA
                })
                .slice(0, 4)
                .map(t => ({
                    _id: t._id,
                    title: t.title,
                    authorDisplayName: t.authorDisplayName,
                    authorAvatar: t.authorAvatar,
                    replyCount: t.replyCount || 0,
                    netVoteCount: t.netVoteCount || 0,
                    viewCount: t.viewCount || 0,
                    createdAt: t.createdAt,
                }))

            // Get announcements channel and its recent messages
            const channels = await ctx.db.query("channels").collect()
            const announcementChannel = channels.find(c =>
                c.slug === "announcements" ||
                c.name.toLowerCase().includes("announcement")
            )

            let recentAnnouncements: any[] = []
            if (announcementChannel) {
                const announcementMessages = messages
                    .filter(m => m.channelId === announcementChannel._id)
                    .slice(0, 5)

                recentAnnouncements = announcementMessages.map(m => ({
                    _id: m._id,
                    content: m.content,
                    authorDisplayName: m.authorDisplayName,
                    authorAvatar: m.authorAvatar,
                    createdAt: m.createdAt,
                }))
            } else {
                // Fallback: show recent messages from any channel
                recentAnnouncements = messages.slice(0, 5).map(m => ({
                    _id: m._id,
                    content: m.content,
                    authorDisplayName: m.authorDisplayName,
                    authorAvatar: m.authorAvatar,
                    createdAt: m.createdAt,
                }))
            }

            // Process trending gallery - sort by engagement
            const trendingGallery = galleryContent
                .sort((a, b) => {
                    const scoreA = (a.likeCount || 0) * 2 + (a.viewCount || 0)
                    const scoreB = (b.likeCount || 0) * 2 + (b.viewCount || 0)
                    return scoreB - scoreA
                })
                .slice(0, 4)
                .map(g => ({
                    _id: g._id,
                    contentId: g.contentId,
                    title: g.title,
                    thumbnailUrl: g.thumbnailUrl,
                    type: g.type,
                    likeCount: g.likeCount || 0,
                    viewCount: g.viewCount || 0,
                }))

            // Artist moments - BTS, WIPs, Sneaks
            // Valid gallery types: show, bts, edit, wip, exclusive
            const artistMoments = galleryContent
                .filter(g =>
                    g.type === "bts" ||
                    g.type === "edit" ||
                    g.type === "wip" ||
                    g.tags?.some(t =>
                        t.toLowerCase().includes("wip") ||
                        t.toLowerCase().includes("sneak") ||
                        t.toLowerCase().includes("behind")
                    )
                )
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 4)
                .map(g => ({
                    _id: g._id,
                    contentId: g.contentId,
                    title: g.title,
                    thumbnailUrl: g.thumbnailUrl,
                    type: g.type,
                    createdAt: g.createdAt,
                }))

            // Upcoming events
            const upcomingEvents = events.slice(0, 3).map(e => ({
                _id: e._id,
                title: e.title,
                startAtUtc: e.startAtUtc,
                imageUrl: e.imageUrl,
                city: e.city,
                ticketsSold: e.ticketsSold,
                capacity: e.capacity,
            }))

            return {
                topMerch,
                trendingForum,
                recentAnnouncements,
                trendingGallery,
                artistMoments,
                upcomingEvents,
                // Metadata
                fetchedAt: Date.now(),
            }
        } catch (error) {
            console.error("Dashboard data fetch error:", error)
            // Return empty data on error to prevent UI crash
            return {
                topMerch: [],
                trendingForum: [],
                recentAnnouncements: [],
                trendingGallery: [],
                artistMoments: [],
                upcomingEvents: [],
                fetchedAt: Date.now(),
                error: "Failed to load some dashboard data",
            }
        }
    },
})

/**
 * Get quick stats for dashboard header
 */
export const getQuickStats = query({
    args: {},
    handler: async (ctx) => {
        const [events, products, threads, users] = await Promise.all([
            ctx.db.query("events").collect(),
            ctx.db.query("merchProducts").filter((q) => q.neq(q.field("status"), "archived")).collect(),
            ctx.db.query("threads").filter((q) => q.eq(q.field("deletedAt"), undefined)).collect(),
            ctx.db.query("users").collect(),
        ])

        const upcomingEvents = events.filter(e => e.startAtUtc > Date.now())

        return {
            upcomingEventCount: upcomingEvents.length,
            activeProductCount: products.length,
            activeThreadCount: threads.length,
            totalUserCount: users.length,
        }
    },
})

export const getDashboardExperienceFlags = query({
    args: {},
    handler: async (ctx) => {
        const entries = await Promise.all(
            Object.entries(DASHBOARD_EXPERIENCE_FLAG_KEYS).map(async ([key, flagKey]) => {
                const row = await ctx.db
                    .query("adminFeatureFlags")
                    .withIndex("by_key", (q) => q.eq("key", flagKey))
                    .first()

                return [key, Boolean(row?.enabled)] as const
            }),
        )

        return {
            ...DASHBOARD_EXPERIENCE_DEFAULTS,
            ...Object.fromEntries(entries),
        }
    },
})
