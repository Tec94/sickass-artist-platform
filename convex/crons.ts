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

// Quest system crons
crons.daily(
  'daily-quest-assignment',
  { hourUTC: 0, minuteUTC: 0 }, // Midnight UTC
  internal.quests.dailyQuestAssignment
)

crons.weekly(
  'weekly-quest-assignment',
  { dayOfWeek: 'sunday', hourUTC: 0, minuteUTC: 0 }, // Sunday midnight UTC
  internal.quests.weeklyQuestAssignment
)

crons.interval(
  'cleanup-expired-quests',
  { hours: 1 }, // Every hour
  internal.quests.cleanupExpiredQuests
)

// Leaderboard computation cron
crons.interval(
  'hourly-leaderboard-computation',
  { hours: 1 }, // Every hour
  internal.leaderboard.hourlyLeaderboardComputation
)

crons.interval(
  'chat-retention-prune',
  { hours: 1 },
  internal.chat.pruneMessagesForRetention,
  {}
)

// Spotify sync cron - Daily at 2 AM UTC
crons.daily(
  'spotify-sync',
  { hourUTC: 2, minuteUTC: 0 }, // 2 AM UTC daily
  internal.spotifySync.syncSpotifyTracksInternal
)

export default crons;
