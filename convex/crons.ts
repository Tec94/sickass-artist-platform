import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

// Convex cron jobs configuration
// These run automatically on the specified intervals
const crons = cronJobs();
crons.interval(
  "cleanupExpiredTypingIndicators",
  { minutes: 5 },
  api.scheduler.cleanupExpiredTypingIndicators
);
crons.interval(
  "expireOldQueueEntries",
  { minutes: 5 },
  api.scheduler.expireOldQueueEntries
);
crons.interval(
  "cleanupExpiredCheckoutSessions",
  { minutes: 5 },
  api.scheduler.cleanupExpiredCheckoutSessions
);
crons.interval(
  "reconcileEventData",
  { minutes: 30 },
  api.scheduler.reconcileEventData
);

export default crons;
