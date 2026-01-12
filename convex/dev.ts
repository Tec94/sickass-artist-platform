import { mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

/**
 * Temporary mutation to promote a user to admin.
 * Can be run from the Convex Dashboard by providing your email.
 * TO BE REMOVED AFTER USE.
 */
export const promoteToAdmin = mutation({
    args: {
        email: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        let user;

        if (args.email) {
            user = await ctx.db
                .query("users")
                .withIndex("by_clerkId") // Note: We don't have an email index, using query filter instead
                .filter(q => q.eq(q.field("email"), args.email))
                .first();
        } else {
            const identity = await ctx.auth.getUserIdentity();
            if (!identity) {
                throw new ConvexError("Not authenticated. Please provide your email address in the 'args' section of the dashboard.");
            }
            user = await ctx.db
                .query("users")
                .withIndex("by_clerkId", q => q.eq("clerkId", identity.subject))
                .first();
        }

        if (!user) {
            throw new ConvexError("User not found.");
        }

        await ctx.db.patch(user._id, {
            role: "admin",
            updatedAt: Date.now()
        });

        return {
            success: true,
            userId: user._id,
            email: user.email,
            newRole: "admin"
        };
    },
});

/**
 * Initialize streak milestones
 * Run once: npx convex run dev:initializeStreakMilestones
 */
export const initializeStreakMilestones = mutation({
    args: {},
    handler: async (ctx) => {
        const milestones = [
            { day: 7, points: 50, description: "7-day streak achievement!" },
            { day: 14, points: 100, description: "14-day streak achievement!" },
            { day: 30, points: 200, description: "30-day streak achievement!" },
            { day: 60, points: 400, description: "60-day streak achievement!" },
            { day: 90, points: 500, description: "90-day streak achievement!" },
            { day: 180, points: 1000, description: "180-day streak achievement!" },
            { day: 365, points: 2000, description: "365-day streak achievement!" },
            { day: 730, points: 5000, description: "730-day streak achievement!" },
        ];

        let created = 0;
        let skipped = 0;

        for (const milestone of milestones) {
            const existing = await ctx.db
                .query("streakMilestones")
                .withIndex("by_day", (q) => q.eq("day", milestone.day))
                .first();

            if (!existing) {
                await ctx.db.insert("streakMilestones", {
                    day: milestone.day,
                    rewardPoints: milestone.points,
                    description: milestone.description,
                });
                created++;
            } else {
                skipped++;
            }
        }

        return { success: true, created, skipped, total: milestones.length };
    },
});

