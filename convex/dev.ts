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

