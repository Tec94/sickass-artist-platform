import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

// Convex cron jobs configuration
// These run automatically on the specified intervals
const crons = cronJobs();

// Cleanup expired entries (queue entries, checkout sessions, archived events)
crons.interval(
  "cleanupExpiredEntries",
  { minutes: 5 },
  api.events.cleanupExpiredEntries
);

export default crons;
