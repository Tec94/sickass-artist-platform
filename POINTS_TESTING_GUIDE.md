# Points System Testing Guide

## Implementation Summary

The point transaction system has been successfully implemented with the following components:

### Created Files:
1. **convex/points.ts** - Core point transaction system with mutations and queries
2. **src/hooks/usePoints.ts** - React hook for frontend point tracking
3. **src/components/PointsDisplay.tsx** - UI component for displaying points

### Modified Files:
1. **convex/forum.ts** - Added point awards for thread creation (+20 points)
2. **convex/forum.ts** - Added point awards for forum replies (+10 points)
3. **convex/chat.ts** - Added point awards for chat messages (+3 points)

## Features Implemented

### ✅ Core Functionality
- Atomic point mutations with transaction logging
- Race condition prevention via idempotency keys
- Immutable transaction audit trail
- User balance queries (availablePoints, totalPoints, redeemedPoints)
- Points leaderboard (top 100 users)
- Admin point adjustment function

### ✅ Point Awards
- **Thread Post**: 20 points
- **Forum Reply**: 10 points
- **Chat Message**: 3 points
- All other types defined and ready for future implementation

### ✅ Database Integration
- Uses existing `userRewards` and `pointTransactions` tables
- Automatic creation of userRewards record if missing
- Safe integer overflow protection
- Proper indexing for fast queries

## Testing Instructions

### Test 1: Award Points (Basic)
```javascript
// In Convex Dashboard (https://dashboard.convex.dev)
// Navigate to your app > Functions > points/awardPoints

// Test awarding points to a user
const result = await mutations.points.awardPoints({
  userId: "YOUR_USER_ID", // Replace with actual user ID from users table
  type: "thread_post",
  amount: 20,
  description: "Test post",
  idempotencyKey: "test-1"
})

console.log(result) // Should return: { transactionId: "...", success: true }
```

### Test 2: Idempotency Check
```javascript
// Try the same transaction again - should return existing transaction
const result2 = await mutations.points.awardPoints({
  userId: "YOUR_USER_ID",
  type: "thread_post",
  amount: 20,
  description: "Test post",
  idempotencyKey: "test-1" // Same key as before
})

console.log(result2) // Should return same transactionId, no double-award
```

### Test 3: Check Balance
```javascript
// Check user's balance
const balance = await queries.points.getUserBalance({ 
  userId: "YOUR_USER_ID" 
})

console.log(balance)
// Should show: { availablePoints: 20, totalPoints: 20, redeemedPoints: 0 }
```

### Test 4: Multiple Transactions
```javascript
// Award more points with different idempotency key
await mutations.points.awardPoints({
  userId: "YOUR_USER_ID",
  type: "forum_reply",
  amount: 10,
  description: "Test reply",
  idempotencyKey: "test-2"
})

await mutations.points.awardPoints({
  userId: "YOUR_USER_ID",
  type: "chat_message",
  amount: 3,
  description: "Test message",
  idempotencyKey: "test-3"
})

// Check balance again
const newBalance = await queries.points.getUserBalance({ 
  userId: "YOUR_USER_ID" 
})

console.log(newBalance)
// Should show: { availablePoints: 33, totalPoints: 33, redeemedPoints: 0 }
```

### Test 5: Transaction History
```javascript
// Get transaction history
const history = await queries.points.getUserTransactionHistory({
  userId: "YOUR_USER_ID",
  limit: 10
})

console.log(history)
// Should show all 3 transactions in reverse chronological order
```

### Test 6: Leaderboard
```javascript
// Get points leaderboard
const leaderboard = await queries.points.getPointsLeaderboard()

console.log(leaderboard)
// Should show top 100 users sorted by totalPoints (descending)
```

### Test 7: Spend Points
```javascript
// Test spending points
const spendResult = await mutations.points.spendPoints({
  userId: "YOUR_USER_ID",
  amount: 10,
  reason: "Redeemed test reward",
  idempotencyKey: "spend-test-1"
})

console.log(spendResult) // Should return: { success: true }

// Check balance after spending
const finalBalance = await queries.points.getUserBalance({ 
  userId: "YOUR_USER_ID" 
})

console.log(finalBalance)
// Should show: { availablePoints: 23, totalPoints: 33, redeemedPoints: 10 }
```

### Test 8: Integration Test (Create Forum Thread)
```javascript
// This test requires authentication
// 1. Log in to your app as a user
// 2. Navigate to the forum
// 3. Create a new thread
// 4. Check your points balance - should increase by 20 points
// 5. Check pointTransactions table - should have a new entry with type "thread_post"
```

### Test 9: Integration Test (Send Chat Message)
```javascript
// This test requires authentication
// 1. Log in to your app as a user
// 2. Navigate to a chat channel
// 3. Send a message
// 4. Check your points balance - should increase by 3 points
// 5. Check pointTransactions table - should have a new entry with type "chat_message"
```

### Test 10: Admin Adjust Points
```javascript
// Test admin adjustment (requires admin user)
await mutations.points.adminAdjustPoints({
  userId: "TARGET_USER_ID",
  amount: 50, // Positive amount to add points
  reason: "Manual bonus for testing",
  adminId: "ADMIN_USER_ID"
})

// Test negative adjustment
await mutations.points.adminAdjustPoints({
  userId: "TARGET_USER_ID",
  amount: -20, // Negative amount to deduct points
  reason: "Manual deduction for testing",
  adminId: "ADMIN_USER_ID"
})
```

## Success Criteria

- ✅ awardPoints mutation works without errors
- ✅ Idempotency prevents duplicate transactions
- ✅ Balance queries return correct totals
- ✅ Leaderboard query works and returns sorted results
- ✅ Forum posts increment user points
- ✅ Forum replies increment user points
- ✅ Chat messages increment user points
- ✅ Transaction history shows all changes
- ✅ Spend points works and updates balances correctly
- ✅ Admin adjust points works for both positive and negative amounts

## Performance Notes

- All queries use proper indexes for fast lookups
- Leaderboard query collects all userRewards and sorts in-memory (acceptable for moderate user counts)
- For production with >10k users, consider caching leaderboard results
- Transaction history query limited to 1000 records max for safety

## Security Features

- Admin-only functions properly validate admin role
- All point amounts validated (positive integers only)
- Suspiciously high awards (>10000 points) are rejected
- Overflow protection with MAX_SAFE_INTEGER checks
- Idempotency keys prevent double-spending

## Future Enhancements

The following point types are defined but not yet integrated:
- `gallery_like` (1 point)
- `ugc_like` (1 point)
- `event_checkin` (75 points)
- `ticket_purchase` (variable, based on 10% of ticket price)
- `livestream_join` (25 points)
- `quest_complete` (variable)
- `daily_bonus` (10 points)
- `streak_bonus` (variable)

These can be easily integrated by calling `awardPoints` from the respective mutation functions.
