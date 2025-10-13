# Store Credit System Implementation Plan

**Created:** 2025-10-13  
**Status:** 📋 Planning Phase  
**Priority:** High

---

## 📋 Executive Summary

This document outlines a comprehensive plan to convert the current **Participation Points System** into a **Store Credit System** for the BUG Gaming Club website. The plan addresses conversion strategy, technical implementation, database changes, UI/UX updates, and impact on existing features.

---

## 🎯 Goals & Objectives

### Primary Goals
1. **Simplify the rewards system** - Make it easier for users to understand and use
2. **Remove expiration complexity** - Eliminate the 12-month expiration requirement
3. **Increase perceived value** - Store credit feels more valuable than "points"
4. **Maintain engagement** - Keep users motivated to participate in events
5. **Preserve existing balances** - Don't penalize current users

### Success Criteria
- ✅ All existing points balances converted to store credit
- ✅ No user loses value in the conversion
- ✅ System is easier to understand and use
- ✅ All existing features continue to work
- ✅ Zero downtime during migration

---

## 🔄 Conversion Strategy

### Option A: Full Replacement (RECOMMENDED)

**Replace the points system entirely with store credit**

**Pros:**
- Simpler system - one currency instead of two
- Easier to understand for users
- Less code complexity
- No confusion about which to use
- Cleaner database schema

**Cons:**
- Requires migration of all existing data
- Need to update all references in code
- One-time conversion event

**Recommendation:** ✅ **Proceed with Option A**

### Option B: Parallel Systems (NOT RECOMMENDED)

**Run both points and store credit simultaneously**

**Pros:**
- Gradual transition possible
- Users can choose which to use
- Fallback if issues arise

**Cons:**
- Confusing for users
- Double the complexity
- Maintenance burden
- Database bloat
- UI clutter

**Recommendation:** ❌ **Do not pursue Option B**

---

## 💱 Conversion Rate & Migration

### Conversion Formula

**Current System:**
- 200 points = $1.00 discount
- 1,000 points = $5.00 discount

**New System:**
- $1.00 store credit = $1.00 discount
- Direct 1:1 value

**Conversion Rate:**
```
Store Credit ($) = Points ÷ 200
```

**Examples:**
- 1,000 points → $5.00 store credit
- 2,000 points → $10.00 store credit
- 5,000 points → $25.00 store credit
- 10,000 points → $50.00 store credit

### Migration Strategy

**Phase 1: Pre-Migration (1 week before)**
1. Announce the conversion to all users
2. Explain the new system and benefits
3. Show users their future store credit balance
4. Allow users to spend points before conversion (optional)
5. Freeze new points awards 24 hours before migration

**Phase 2: Migration (Scheduled maintenance window)**
1. Take system offline for 30-60 minutes
2. Run conversion script on all user accounts
3. Convert `points_transactions` to `store_credit_transactions`
4. Update user balances
5. Deploy new code
6. Run validation tests
7. Bring system back online

**Phase 3: Post-Migration (1 week after)**
1. Monitor for issues
2. Provide user support
3. Send confirmation emails with new balances
4. Update documentation
5. Collect user feedback

---

## 🔑 Key Differences: Points vs Store Credit

| Feature | Points System | Store Credit System |
|---------|--------------|---------------------|
| **Expiration** | 12 months | Never expires |
| **Conversion** | 200 points = $1 | $1 credit = $1 |
| **Display** | "1,000 points" | "$5.00 credit" |
| **Earning** | Event attendance, volunteering | Same activities |
| **Spending** | Shop discounts only | Shop discounts only |
| **Caps** | 50% item, $30 order | Same caps (configurable) |
| **Monthly Limit** | 10,000 points/month | $50/month (configurable) |
| **Multipliers** | 1.5x, 2.0x, 3.0x | Same multipliers |
| **Welcome Bonus** | 1,500 points | $7.50 credit |
| **Complexity** | High (expiration tracking) | Low (simple balance) |
| **User Understanding** | Moderate | High |

---

## 🗄️ Database Schema Changes

### New Collections

#### `store_credit_settings` (replaces `points_settings`)
```typescript
{
  id: 'default',
  perItemDiscountCap: 50,           // 50% max discount per item
  perOrderDiscountCap: 3000,        // $30.00 max discount per order (cents)
  monthlyEarningCap: 5000,          // $50.00 max per month (cents)
  earningValues: {
    eventAttendance: 100,           // $1.00 for event attendance (cents)
    volunteerWork: 250,             // $2.50 for volunteer work (cents)
    eventHosting: 500,              // $5.00 for event hosting (cents)
    contributionMin: 50,            // $0.50 minimum (cents)
    contributionMax: 150,           // $1.50 maximum (cents)
  },
  approvedEmailDomains: ['.edu', 'belhaven.edu'],
  approvedEmails: [],
  updatedAt: Date,
  updatedBy: string,
}
```

#### `store_credit_transactions` (replaces `points_transactions`)
```typescript
{
  id: string,
  userId: string,
  amountCents: number,              // Amount in cents (positive = earned, negative = spent)
  reason: string,
  category: StoreCreditCategory,
  timestamp: Date,
  adminId: string,
  multiplierApplied?: number,       // e.g., 1.5, 2.0
  multiplierCampaignId?: string,
  approvalStatus: 'pending' | 'approved' | 'denied',
  approvedBy?: string,
  approvedAt?: Date,
  deniedReason?: string,
  orderId?: string,                 // For purchase transactions
  eventId?: string,                 // For event-related transactions
}
```

#### `store_credit_multipliers` (replaces `points_multipliers`)
```typescript
{
  id: string,
  name: string,
  description: string,
  multiplier: number,               // e.g., 1.5, 2.0
  startDate: Date,
  endDate: Date,
  isActive: boolean,
  applicableCategories: StoreCreditCategory[],
  createdAt: Date,
  createdBy: string,
}
```

#### `welcome_credit_promotions` (replaces `welcome_points_promotions`)
```typescript
{
  id: string,
  name: string,
  description: string,
  creditAmountCents: number,        // e.g., 750 = $7.50
  startDate: Date,
  endDate?: Date,
  maxUsers: number,
  currentCount: number,
  isActive: boolean,
  createdAt: Date,
  createdBy: string,
  updatedAt: Date,
}
```

### Modified User Fields

**Remove:**
- `points` (legacy)
- `weeklyPoints` (legacy)
- `monthlyPoints` (legacy)
- `pointsBalance`
- `pointsEarned`
- `pointsSpent`
- `pointsExpired`
- `monthlyPointsEarned`

**Add:**
- `storeCreditBalance` (number, in cents)
- `storeCreditEarned` (number, in cents, lifetime total)
- `storeCreditSpent` (number, in cents, lifetime total)
- `monthlyStoreCreditEarned` (number, in cents, this month)
- `lastMonthlyReset` (Date, for cap tracking)

### Migration Script Structure

```typescript
// Pseudo-code for migration
async function migratePointsToStoreCredit() {
  const users = await getAllUsers();
  
  for (const user of users) {
    // Calculate current available points
    const availablePoints = await getUserAvailablePoints(user.uid);
    
    // Convert to store credit (cents)
    const storeCreditCents = Math.floor((availablePoints / 200) * 100);
    
    // Update user record
    await updateUser(user.uid, {
      storeCreditBalance: storeCreditCents,
      storeCreditEarned: storeCreditCents,
      storeCreditSpent: 0,
      monthlyStoreCreditEarned: 0,
      // Remove old fields
      points: deleteField(),
      pointsBalance: deleteField(),
      pointsEarned: deleteField(),
      pointsSpent: deleteField(),
      pointsExpired: deleteField(),
    });
    
    // Create migration transaction record
    await createStoreCreditTransaction({
      userId: user.uid,
      amountCents: storeCreditCents,
      reason: `Migration from points system (${availablePoints} points)`,
      category: 'migration',
      approvalStatus: 'approved',
      adminId: 'system',
    });
  }
  
  // Migrate historical transactions (for record-keeping)
  await migratePointsTransactions();
}
```

---

## 🎨 UI/UX Changes Required

### 1. Shop Pages

**Files to Update:**
- `src/app/shop/page.tsx`
- `src/components/shop/PointsBalanceWidget.tsx` → Rename to `StoreCreditBalanceWidget.tsx`
- `src/components/shop/PointsDiscountCalculator.tsx` → Rename to `StoreCreditDiscountCalculator.tsx`

**Changes:**
- Replace "Points" with "Store Credit"
- Display as currency ($5.00) instead of points (1,000)
- Update tooltips and help text
- Remove expiration warnings
- Simplify UI (no expiration dates to show)

**Example:**
```tsx
// Before
<span>1,000 points</span>
<span>Worth $5.00 in discounts</span>

// After
<span>$5.00 store credit</span>
```

### 2. Checkout Page

**Files to Update:**
- `src/app/checkout/page.tsx`

**Changes:**
- Update slider labels from "Points to use" to "Store credit to use"
- Display credit amounts in dollars
- Update discount calculation display
- Remove expiration warnings

### 3. User Profile/Dashboard

**Files to Update:**
- `src/app/profile/page.tsx`
- `src/app/dashboard/page.tsx`

**Changes:**
- Display store credit balance prominently
- Show earning history in dollars
- Update transaction history display
- Remove expiration date column

### 4. Admin Panel

**Files to Update:**
- `src/app/admin/promotions/page.tsx`
- `src/components/admin/PointsMultiplierManagement.tsx` → Rename to `StoreCreditMultiplierManagement.tsx`
- `src/components/admin/PointGiveaways.tsx` → Rename to `StoreCreditGiveaways.tsx`
- `src/components/admin/WelcomeBonus.tsx`

**Changes:**
- Update all forms to use dollar amounts
- Change "Award Points" to "Award Store Credit"
- Update validation (dollar amounts instead of points)
- Update campaign creation forms

### 5. Leaderboard

**Files to Update:**
- `src/app/leaderboard/page.tsx`

**Decision Required:**
- Keep points-based leaderboard for participation tracking?
- Or switch to store credit earned leaderboard?
- Or create separate "Participation Score" system?

**Recommendation:** Keep a separate "Participation Points" for leaderboard that doesn't convert to money, and have "Store Credit" as the spendable currency.

---

## 🔐 Security & Firestore Rules

### Updated Firestore Rules

```javascript
// Store credit settings
match /store_credit_settings/{settingId} {
  allow read: if true;
  allow create, update, delete: if isPresidentOrCoPresident();
}

// Store credit transactions
match /store_credit_transactions/{transactionId} {
  // Users can read their own transactions
  allow read: if request.auth.uid == resource.data.userId;
  
  // President/Co-President can read all transactions
  allow read: if isPresidentOrCoPresident();
  
  // Only President/Co-President can create/modify transactions
  allow create, update, delete: if isPresidentOrCoPresident();
}

// Store credit multipliers
match /store_credit_multipliers/{multiplierId} {
  allow read: if isPresidentOrCoPresident() || resource.data.isActive == true;
  allow create, update, delete: if isPresidentOrCoPresident();
}

// Welcome credit promotions
match /welcome_credit_promotions/{promotionId} {
  allow read: if isPresidentOrCoPresident() || resource.data.isActive == true;
  allow create, update, delete: if isPresidentOrCoPresident();
}
```

### Security Considerations

1. **Prevent Balance Manipulation**
   - All credit awards must go through approval workflow
   - Server-side validation of all transactions
   - Audit trail for all changes

2. **Prevent Overspending**
   - Check balance before allowing checkout
   - Recalculate discount server-side
   - Atomic transactions for spending

3. **Prevent Monthly Cap Bypass**
   - Track monthly earnings server-side
   - Reset caps on schedule
   - Validate before awarding credit

4. **Prevent Unauthorized Access**
   - Only President/Co-President can manage credit
   - Users can only view their own transactions
   - Admin actions logged with UID

---

## 📊 Impact on Existing Features

### Points Multiplier Campaigns
**Status:** ✅ Compatible with minor changes

**Changes Required:**
- Rename to "Store Credit Multiplier Campaigns"
- Update multiplier values to work with cents
- Example: 2.0x multiplier on $1.00 = $2.00 credit

**Files to Update:**
- `src/components/admin/PointsMultiplierManagement.tsx`
- `src/lib/database.ts` - `createPointsMultiplier()` → `createStoreCreditMultiplier()`

### Welcome Bonuses
**Status:** ✅ Compatible with minor changes

**Changes Required:**
- Convert point amounts to dollar amounts
- Example: 1,500 points → $7.50 credit

**Files to Update:**
- `src/components/admin/WelcomeBonus.tsx`
- `src/lib/database.ts` - `awardWelcomePoints()` → `awardWelcomeCredit()`

### Point Giveaways
**Status:** ✅ Compatible with minor changes

**Changes Required:**
- Update forms to use dollar amounts
- Update validation logic

**Files to Update:**
- `src/components/admin/PointGiveaways.tsx`

### Sales Promotions
**Status:** ✅ No changes required

**Reason:** Sales promotions are separate from points/credit system

### Event Check-in System
**Status:** ✅ Compatible with changes

**Changes Required:**
- Update QR code check-in to award store credit instead of points
- Update earning amounts (100 points → $1.00 credit)

**Files to Update:**
- Event check-in components
- `src/lib/database.ts` - `awardPointsEnhanced()` → `awardStoreCreditEnhanced()`

### Leaderboard System
**Status:** ⚠️ Requires decision

**Options:**
1. **Option A:** Keep points for leaderboard, separate from store credit
2. **Option B:** Use store credit earned for leaderboard
3. **Option C:** Create new "Participation Score" system

**Recommendation:** Option A - Keep points for gamification, store credit for spending

---

## 🚀 Implementation Phases

### Phase 1: Planning & Preparation (Week 1)
- [ ] Review and approve this implementation plan
- [ ] Create detailed technical specifications
- [ ] Design new UI mockups
- [ ] Write migration scripts
- [ ] Set up test environment

### Phase 2: Development (Weeks 2-3)
- [ ] Create new database collections
- [ ] Update TypeScript types
- [ ] Implement store credit business logic
- [ ] Update UI components
- [ ] Update admin panels
- [ ] Write unit tests

### Phase 3: Testing (Week 4)
- [ ] Test migration script on copy of production data
- [ ] Test all store credit features
- [ ] Test checkout flow
- [ ] Test admin functions
- [ ] User acceptance testing

### Phase 4: Migration (Week 5)
- [ ] Announce migration to users (1 week notice)
- [ ] Schedule maintenance window
- [ ] Run migration script
- [ ] Deploy new code
- [ ] Validate migration success
- [ ] Monitor for issues

### Phase 5: Post-Migration (Week 6)
- [ ] User support and bug fixes
- [ ] Collect feedback
- [ ] Update documentation
- [ ] Archive old points system code
- [ ] Celebrate success! 🎉

---

## 📝 Files to Create/Modify

### New Files to Create
1. `src/lib/storeCredit.ts` - Store credit business logic
2. `src/components/shop/StoreCreditBalanceWidget.tsx`
3. `src/components/shop/StoreCreditDiscountCalculator.tsx`
4. `src/components/admin/StoreCreditMultiplierManagement.tsx`
5. `src/components/admin/StoreCreditGiveaways.tsx`
6. `scripts/migratePointsToStoreCredit.ts` - Migration script
7. `docs/STORE_CREDIT_USER_GUIDE.md` - User documentation

### Files to Modify
1. `src/types/types.ts` - Add store credit types
2. `src/lib/database.ts` - Add store credit functions
3. `src/app/shop/page.tsx` - Update to use store credit
4. `src/app/checkout/page.tsx` - Update checkout flow
5. `src/app/api/create-checkout-session/route.ts` - Update Stripe integration
6. `src/app/api/webhooks/stripe/route.ts` - Update order processing
7. `firestore.rules` - Add store credit security rules
8. `src/lib/permissions.ts` - Update permission functions (if needed)

### Files to Archive/Remove (Post-Migration)
1. `src/lib/points.ts` - Archive for reference
2. `src/components/shop/PointsBalanceWidget.tsx` - Remove
3. `src/components/shop/PointsDiscountCalculator.tsx` - Remove
4. `src/components/admin/PointsMultiplierManagement.tsx` - Remove
5. `src/components/admin/PointGiveaways.tsx` - Remove

---

## ⚠️ Risks & Mitigation

### Risk 1: Data Loss During Migration
**Mitigation:**
- Full database backup before migration
- Test migration on copy of production data
- Rollback plan ready
- Keep old data for 90 days

### Risk 2: User Confusion
**Mitigation:**
- Clear communication before migration
- User guide and FAQ
- Email notifications with new balances
- Support team ready for questions

### Risk 3: Calculation Errors
**Mitigation:**
- Extensive testing of conversion formula
- Manual verification of sample accounts
- Server-side validation
- Audit trail for all transactions

### Risk 4: Integration Issues
**Mitigation:**
- Test all integrations (Stripe, checkout, etc.)
- Staged rollout if possible
- Monitor error logs closely
- Quick rollback capability

---

## 💰 Cost-Benefit Analysis

### Benefits
- ✅ Simpler system - easier to understand
- ✅ No expiration tracking - less complexity
- ✅ Higher perceived value - "$5" vs "1,000 points"
- ✅ Better user experience
- ✅ Less code to maintain
- ✅ Cleaner database schema

### Costs
- ⚠️ Development time (4-6 weeks)
- ⚠️ Migration complexity
- ⚠️ User communication effort
- ⚠️ Potential for bugs during transition
- ⚠️ Documentation updates

### ROI
**Estimated Time Savings:** 20% reduction in support questions  
**Estimated Engagement Increase:** 15% more users using store credit  
**Estimated Maintenance Savings:** 30% less code complexity

---

## ✅ Recommendation

**Proceed with full replacement of points system with store credit system.**

**Rationale:**
1. Significantly simpler for users to understand
2. No expiration complexity to manage
3. Higher perceived value increases engagement
4. Cleaner codebase and database schema
5. One-time migration effort pays off long-term

**Next Steps:**
1. Get stakeholder approval for this plan
2. Set migration date (recommend 4-6 weeks out)
3. Begin Phase 1: Planning & Preparation
4. Communicate timeline to users

---

**Document Status:** ✅ Ready for Review  
**Last Updated:** 2025-10-13  
**Author:** AI Assistant  
**Reviewers Needed:** President, Co-President, Development Team

