# Testing Guide

Consolidated testing procedures for all platform features.

---

## Quick Reference

| Feature | Test Command | Manual Testing |
|---------|-------------|----------------|
| All | `npm test` | - |
| E2E | `npm run test:e2e` | - |
| Performance | `Ctrl+Shift+P` | Console dashboard |
| Analytics | DevTools Console | Look for `[Analytics]` logs |
| Offline | DevTools Network | Toggle offline mode |

---

## Performance Testing

### Access Dashboard
1. Open any page in development mode
2. Click the Activity icon (📊) in the header
3. Or press `Ctrl+Shift+P` for console report

### Console Commands
```javascript
// Quick summary table
console.table(window.__perfMonitor.getReport().summary)

// Get detailed report
const report = window.__perfMonitor.getReport()

// Export metrics to JSON
const data = window.__perfMonitor.export()
```

### Performance Targets

| Metric | Target | Acceptable |
|--------|--------|------------|
| LCP | < 2.5s | < 4s |
| FID | < 100ms | < 300ms |
| CLS | < 0.1 | < 0.25 |
| Image Load | < 800ms avg | < 2s p95 |
| Lightbox Open | < 300ms | < 500ms |
| Filter Apply | < 500ms | < 1s |

### Troubleshooting

**No metrics appearing?**
- Check console for `[PERF]` logs
- Verify `window.__perfMonitor` exists
- Wait a few seconds after page load

**High LCP scores?**
- Check image load times in dashboard
- Verify image optimization (WebP, responsive)
- Look for render-blocking resources

---

## Analytics Testing

### Manual Testing
1. Open browser DevTools → Console
2. Navigate through pages
3. Interact with buttons (like, CTA, etc.)
4. Check console for `[Analytics] Flushing events:` logs
5. Verify events contain correct data

### Consent Banner Testing
1. Clear localStorage
2. Refresh page
3. Consent banner should appear at bottom
4. Click Accept → banner disappears, events tracked
5. Click Decline → banner disappears, no events tracked

### IndexedDB Fallback Testing
1. Open DevTools → Application → IndexedDB
2. Find `sickass-analytics` database
3. Trigger events while offline
4. Check `analyticsQueue` store for pending events
5. Go back online
6. Events should be sent on next flush

---

## Offline Support Testing

### Service Worker Registration
1. Check browser console for "Service Worker registered" message
2. Verify in DevTools > Application > Service Workers

### Offline Mode
1. Turn off network in DevTools (Network tab → Offline)
2. Navigate to site - should show cached page or offline.html
3. Verify offline indicator appears at bottom-left

### Queue Management
1. Go offline
2. Perform actions (like, vote, message)
3. Check offline indicator shows queued count
4. Go online
5. Verify sync happens with exponential backoff

### Queue Size Limit
1. Queue 100+ items while offline
2. Verify oldest items are dropped

### Timeout Testing
1. Queue items and wait 1+ hour
2. Verify items marked as expired

### Conflict Resolution
1. Modify same item on two devices
2. Sync offline changes
3. Verify conflict modal appears
4. Test both resolution choices (server/local)

---

## Skeleton Testing

### Visual Testing
1. Throttle network to "Slow 3G" in DevTools
2. Navigate to Gallery, Forum, Merch pages
3. Verify skeletons appear immediately
4. Check shimmer animation is smooth (60fps)

### CLS Measurement
1. Open Chrome DevTools → Performance
2. Record page load
3. Check CLS value in summary (should be < 0.1)

### Timeout Testing
1. Block API endpoints in DevTools
2. Wait 5 seconds
3. Verify timeout error state appears
4. Test retry button functionality

### Responsive Testing
1. Resize window to mobile/tablet breakpoints
2. Verify skeleton sizes adjust correctly
3. Check grid columns change appropriately

---

## Points System Testing

### Via Convex Dashboard

**Award Points:**
```javascript
await mutations.points.awardPoints({
  userId: "user_123",
  type: "thread_post",
  amount: 20,
  description: "Test post",
  idempotencyKey: "test-1"
})
```

**Check Balance:**
```javascript
await queries.points.getUserBalance({ userId: "user_123" })
// Expected: { availablePoints: 20, totalPoints: 20, redeemedPoints: 0 }
```

**Verify Idempotency:**
```javascript
// Call with same idempotencyKey
await mutations.points.awardPoints({
  userId: "user_123",
  type: "thread_post",
  amount: 20,
  description: "Test post",
  idempotencyKey: "test-1"  // Same key
})
// Should return existing transaction, balance unchanged
```

**Check Leaderboard:**
```javascript
await queries.points.getPointsLeaderboard()
// Should show user_123 with 20 points
```

### Integration Testing
1. Create a forum thread → verify +20 points
2. Reply to thread → verify +10 points
3. Send chat message → verify +3 points
4. Check transaction history shows all changes

---

## Rewards Testing

### Core Functionality
- [ ] Users can browse rewards by category
- [ ] Users can sort rewards by price/newest
- [ ] Users can redeem rewards with sufficient points
- [ ] Coupon codes generate uniquely
- [ ] Stock decrements on redemption
- [ ] Points deduct correctly
- [ ] Insufficient points show error
- [ ] Out of stock items cannot be redeemed

### Admin Functions
- [ ] Admin can approve pending redemptions
- [ ] Admin can add tracking IDs
- [ ] Admin can refund redemptions
- [ ] Refunds restore points and stock

### Edge Cases
- [ ] Double-redemption prevented by idempotency
- [ ] Expired rewards cannot be redeemed
- [ ] Inactive rewards don't show in shop
- [ ] Stock protection (no over-redemption)

---

## Events & Ticketing Testing

### Queue Testing
1. Create high-demand event
2. Join queue → verify sequence number assigned
3. Wait for expiry (or set short timeout) → verify expired status
4. Attempt rejoin → verify cooldown enforced

### Checkout Throttling
1. Open multiple browser tabs
2. Start checkout in each tab
3. Verify limit (5 concurrent) enforced
4. Verify auto-retry message appears

### Oversell Prevention
1. Set ticket quantity to 1
2. Open two browsers, add to cart in both
3. Complete checkout in first browser
4. Attempt checkout in second → verify "sold out" error

### Timezone Display
1. Create event in different timezone
2. Verify times display correctly in user's local timezone
3. Check venue timezone snapshot preserved

---

## Merchandise Testing

### Cart Operations
- [ ] Add item to cart
- [ ] Verify price locked at add-time
- [ ] Update quantity
- [ ] Remove item
- [ ] Cart persists across page refresh

### Stock Validation
- [ ] Cannot add more than available stock
- [ ] Stock reserved when added to cart
- [ ] Stock released when item removed
- [ ] Atomic decrement on purchase

### Checkout Flow
- [ ] Validate shipping address
- [ ] Calculate tax and shipping
- [ ] Apply discount codes
- [ ] Process payment
- [ ] Generate order confirmation

---

## Browser Compatibility

| Browser | Service Worker | IndexedDB | Performance API |
|---------|---------------|-----------|-----------------|
| Chrome/Edge | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Safari 11.1+ | ✅ | ✅ | ✅ |
| IE11 | ❌ | ❌ | ⚠️ |

---

## Common Issues

### "Service Worker not registering"
- Ensure HTTPS (or localhost)
- Check console for registration errors
- Verify sw.js exists in public folder

### "Analytics not tracking"
- Check consent status in localStorage
- Verify `analytics_consent` is true
- Look for blocked PII keys

### "Performance dashboard empty"
- Wait for page load to complete
- Check if `window.__perfMonitor` exists
- Verify development mode

### "Points not awarding"
- Check idempotency key is unique
- Verify user exists in database
- Check for validation errors in console
