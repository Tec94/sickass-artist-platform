import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api } from "./_generated/api";

const VALID_ROLES = ["artist", "admin", "mod", "crew", "fan"] as const;
const VALID_FAN_TIERS = ["bronze", "silver", "gold", "platinum"] as const;

export const calculateLevel = (xp: number): number => {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 900) return 4;
  return Math.floor(4 + (xp - 900) / 400) + 1;
};

export const isValidUsername = (username: string): boolean => {
  if (username.length < 3 || username.length > 20) return false;
  return /^[a-zA-Z0-9_]+$/.test(username);
};

export const isValidRole = (role: string): boolean => {
  return VALID_ROLES.includes(role as (typeof VALID_ROLES)[number]);
};

export const isValidFanTier = (tier: string): boolean => {
  return VALID_FAN_TIERS.includes(tier as (typeof VALID_FAN_TIERS)[number]);
};

export const getMe = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return user;
  },
});

// Get current user from auth context
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    return user;
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    return user;
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return user;
  },
});

export const getByRole = query({
  args: {
    role: v.union(
      v.literal("artist"),
      v.literal("admin"),
      v.literal("mod"),
      v.literal("crew"),
      v.literal("fan")
    )
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
    return users;
  },
});

export const getByFanTier = query({
  args: {
    tier: v.union(
      v.literal("bronze"),
      v.literal("silver"),
      v.literal("gold"),
      v.literal("platinum")
    )
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_fanTier", (q) => q.eq("fanTier", args.tier))
      .collect();
    return users;
  },
});

export const create = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    displayName: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!isValidUsername(args.username)) {
      throw new ConvexError("Invalid username: must be 3-20 alphanumeric characters");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingUser) {
      throw new ConvexError("Username already taken");
    }

    const existingUserByClerkId = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUserByClerkId) {
      throw new ConvexError("User already exists with this Clerk ID");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      username: args.username,
      displayName: args.displayName || args.username,
      bio: "",
      avatar: args.avatar || "",
      role: "fan",
      fanTier: "bronze",
      socials: {},
      location: "",
      xp: 0,
      level: 1,
      badges: [],
      votedPoints: 0,
      createdAt: now,
      updatedAt: now,
      lastSignIn: now,
    });

    const user = await ctx.db.get(userId);
    return { userId, user };
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      username: v.optional(v.string()),
      displayName: v.optional(v.string()),
      bio: v.optional(v.string()),
      avatar: v.optional(v.string()),
      socials: v.optional(v.object({
        twitter: v.optional(v.string()),
        instagram: v.optional(v.string()),
        tiktok: v.optional(v.string()),
      })),
      location: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const { username, bio } = args.updates;

    if (username) {
      if (!isValidUsername(username)) {
        throw new ConvexError("Invalid username: must be 3-20 alphanumeric characters");
      }

      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first();

      if (existingUser && existingUser._id !== args.userId) {
        throw new ConvexError("Username already taken");
      }
    }

    if (bio && bio.length > 500) {
      throw new ConvexError("Bio must be 500 characters or less");
    }

    const updatedUser = await ctx.db.patch(args.userId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    return updatedUser;
  },
});

export const updateRole = mutation({
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
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const updated = await ctx.db.patch(args.userId, {
      role: args.newRole,
      updatedAt: Date.now(),
    });

    return updated;
  },
});

export const updateFanTier = mutation({
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
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const updated = await ctx.db.patch(args.userId, {
      fanTier: args.newTier,
      updatedAt: Date.now(),
    });

    return updated;
  },
});

export const addXP = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    if (args.amount < 0) {
      throw new ConvexError("XP amount must be positive");
    }

    const newXP = user.xp + args.amount;
    const newLevel = calculateLevel(newXP);
    const levelUp = newLevel > user.level;

    const updated = await ctx.db.patch(args.userId, {
      xp: newXP,
      level: newLevel,
      updatedAt: Date.now(),
    });

    return {
      user: updated,
      levelUp,
      oldLevel: user.level,
      newLevel,
    };
  },
});

export const addBadge = mutation({
  args: {
    userId: v.id("users"),
    badgeName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    if (user.badges.includes(args.badgeName)) {
      throw new ConvexError("User already has this badge");
    }

    const updated = await ctx.db.patch(args.userId, {
      badges: [...user.badges, args.badgeName],
      updatedAt: Date.now(),
    });

    return updated;
  },
});

export const recordLogin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(args.userId, {
      lastSignIn: Date.now(),
      updatedAt: Date.now(),
    });

    try {
      await ctx.runMutation(api.streaks.updateStreak, {
        userId: args.userId,
      });
    } catch (error) {
      console.error("Failed to update streak:", error);
    }

    return { success: true };
  },
});