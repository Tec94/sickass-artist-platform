import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";

// Convex cron jobs configuration
// These run automatically on the specified intervals
const crons = cronJobs();

// Cleanup expired entries (queue entries, checkout sessions, archived events)
crons.interval(
  "cleanupExpiredEntries",
  { minutes: 5 },
  api.events.cleanupExpiredEntries
);

crons.interval(
  'auto-activate-drops',
  { minutes: 5 }, // Every 5 minutes
  internal.drops.autoActivateDrops
)

crons.interval(
  'cleanup-preorders',
  { hours: 1 }, // Every hour
  internal.drops.cleanupExpiredPreOrders
)

export default crons;
