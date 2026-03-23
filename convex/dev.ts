import { mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api } from "./_generated/api";
import { findUserByCurrentIdentity } from "./domain/identity";

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
            const email = args.email;
            user = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", email))
                .first();
        } else {
            user = await findUserByCurrentIdentity(ctx);
            if (!user) {
                throw new ConvexError("Not authenticated. Please provide your email address in the 'args' section of the dashboard.");
            }
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

/**
 * Initialize default quests
 * Run once: npx convex run dev:initializeDefaultQuests "{adminId: 'YOUR_ADMIN_ID'}"
 */
export const initializeDefaultQuests = mutation({
    args: { adminId: v.id('users') },
    handler: async (ctx, _args) => {
        const baseQuests = [
            // Daily quests
            {
                questId: 'daily_login_001',
                type: 'daily' as const,
                name: 'Daily Check-in',
                description: 'Log in to the community',
                icon: '📱',
                rewardPoints: 10,
                targetValue: 1,
                progressType: 'single' as const,
                category: 'social' as const,
                priority: 1,
            },
            {
                questId: 'daily_chat_001',
                type: 'daily' as const,
                name: 'Community Chat',
                description: 'Send a message in chat',
                icon: '💬',
                rewardPoints: 15,
                targetValue: 1,
                progressType: 'single' as const,
                category: 'social' as const,
                priority: 2,
            },
            {
                questId: 'daily_engage_001',
                type: 'daily' as const,
                name: 'Engage 5 Times',
                description: 'Like or vote on 5 posts',
                icon: '👍',
                rewardPoints: 20,
                targetValue: 5,
                progressType: 'cumulative' as const,
                category: 'engagement' as const,
                priority: 3,
            },
            // Weekly quests
            {
                questId: 'weekly_forum_001',
                type: 'weekly' as const,
                name: 'Forum Contributor',
                description: 'Create a forum thread',
                icon: '📝',
                rewardPoints: 50,
                targetValue: 1,
                progressType: 'single' as const,
                category: 'creation' as const,
                priority: 1,
            },
            {
                questId: 'weekly_replies_001',
                type: 'weekly' as const,
                name: 'Helpful Replies',
                description: 'Reply to 3 forum posts',
                icon: '💡',
                rewardPoints: 75,
                targetValue: 3,
                progressType: 'cumulative' as const,
                category: 'creation' as const,
                priority: 2,
            },
        ]

        let created = 0

        for (const questData of baseQuests) {
            const now = Date.now()
            const startsAt = now
            const endsAt = now + 365 * 24 * 60 * 60 * 1000 // 1 year from now

            try {
                await ctx.runMutation(api.quests.createQuest, {
                    ...questData,
                    isActive: true,
                    startsAt,
                    endsAt,
                })
                created++
            } catch (error) {
                console.error(`Failed to create quest ${questData.questId}:`, error)
            }
        }

        return { created, total: baseQuests.length }
    },
});

