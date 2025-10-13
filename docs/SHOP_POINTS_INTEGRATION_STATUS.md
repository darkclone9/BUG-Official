# Shop & Points System Integration Status

## Overview

This document provides a comprehensive overview of how the User Points system is integrated with the Shop System in the BUG Gaming Club website.

---

## ✅ **Completed Integrations**

### **1. Points Display in Shop**

**Location:** `src/app/shop/page.tsx`

**Features:**
- ✅ Points Balance Widget displayed in shop header
- ✅ Shows current available points
- ✅ Displays discount value equivalent
- ✅ "How it works" information popover
- ✅ Links to earn more points and view history

**Component:** `src/components/shop/PointsBalanceWidget.tsx`

---

### **2. Product Page Points Calculator**

**Location:** `src/app/shop/[productId]/page.tsx`

**Features:**
- ✅ Points discount calculator for eligible products
- ✅ Interactive slider to select points to use
- ✅ Real-time discount calculation
- ✅ Shows final price after discount
- ✅ Respects 50% per-item cap
- ✅ Only shown for points-eligible products
- ✅ Only shown to logged-in users

**Component:** `src/components/shop/PointsDiscountCalculator.tsx`

---

### **3. Checkout Points Integration**

**Location:** `src/app/checkout/page.tsx`

**Features:**
- ✅ Loads user's available points
- ✅ Interactive slider to select points to use
- ✅ Real-time discount calculation
- ✅ Shows points discount breakdown
- ✅ Displays final total after discount
- ✅ Respects all caps (50% per item, $30 per order)
- ✅ Points sent to Stripe checkout session
- ✅ Points metadata stored in order

**Points Calculation:**
```typescript
const discountResult = calculateCartDiscount(orderItems, pointsToUse);
const estimatedTotal = subtotal - discountResult.discountCents + estimatedShipping;
```

---

### **4. Stripe Checkout Session Creation**

**Location:** `src/app/api/create-checkout-session/route.ts`

**Features:**
- ✅ Receives points to use from checkout
- ✅ Calculates discount using `calculateCartDiscount()`
- ✅ Applies discount to line items
- ✅ Stores points metadata in session
- ✅ Passes points info to webhook

**Metadata Stored:**
```typescript
metadata: {
  userId,
  pointsUsed: discountResult.pointsUsed.toString(),
  pointsDiscount: discountResult.discountCents.toString(),
  fulfillmentType,
  shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : '',
}
```

---

### **5. Order Completion & Points Deduction**

**Location:** `src/app/api/webhooks/stripe/route.ts`

**Features:**
- ✅ Webhook receives Stripe checkout completion
- ✅ Extracts points used from metadata
- ✅ Creates shop order with points info
- ✅ Deducts points from user balance
- ✅ Creates points transaction record
- ✅ Updates product stock
- ✅ Adds to pickup queue if applicable

**Points Deduction:**
```typescript
if (pointsUsed > 0) {
  await spendPoints(
    userId,
    pointsUsed,
    orderId,
    `Points used for order ${orderId}`
  );
}
```

---

### **6. Points Business Logic**

**Location:** `src/lib/points.ts`

**Functions:**
- ✅ `calculateCartDiscount()` - Calculate discount for entire cart
- ✅ `calculateMaxItemDiscount()` - Calculate max discount per item
- ✅ `calculateMaxOrderDiscount()` - Calculate max discount per order
- ✅ `pointsToDiscount()` - Convert points to discount amount
- ✅ `discountToPoints()` - Convert discount to points required
- ✅ `formatCents()` - Format cents as currency
- ✅ `formatPointsAsDiscount()` - Format points as discount value

**Key Rules:**
- 1,000 points = $5.00 discount (200 points = $1.00)
- Maximum 50% off any single item
- Maximum $30.00 off per order
- Shipping & taxes always paid in full
- Points expire after 12 months
- Monthly earning cap of 10,000 points

---

### **7. Points Database Functions**

**Location:** `src/lib/database.ts`

**Functions:**
- ✅ `getUserAvailablePoints()` - Get user's current points balance
- ✅ `spendPoints()` - Deduct points for purchase
- ✅ `awardPointsEnhanced()` - Award points with multipliers
- ✅ `getPointsSettings()` - Get current points settings
- ✅ `updatePointsSettings()` - Update points configuration

---

### **8. Cart System**

**Location:** `src/contexts/CartContext.tsx`

**Features:**
- ✅ Add products to cart
- ✅ Update quantities
- ✅ Remove items
- ✅ Calculate subtotal
- ✅ Persist cart in localStorage
- ✅ Clear cart after checkout

**Note:** Cart does NOT store points selection - points are selected at checkout

---

### **9. Order Success Page**

**Location:** `src/app/checkout/success/page.tsx`

**Features:**
- ✅ Displays order confirmation
- ✅ Clears cart after successful purchase
- ✅ Shows order details
- ✅ Links to order history

---

## 🔄 **Integration Flow**

### **Complete Purchase Flow with Points:**

1. **Browse Shop** → User sees Points Balance Widget
2. **View Product** → User sees Points Discount Calculator (if eligible)
3. **Add to Cart** → Product added to cart
4. **Go to Checkout** → User selects points to use with slider
5. **Calculate Discount** → System calculates discount respecting all caps
6. **Create Stripe Session** → Discount applied to line items, metadata stored
7. **Complete Payment** → User pays discounted amount via Stripe
8. **Webhook Triggered** → Stripe sends checkout.session.completed event
9. **Process Order** → System creates order, deducts points, updates stock
10. **Success Page** → User sees confirmation, cart cleared

---

## 📊 **Points Calculation Examples**

### **Example 1: Single Item Purchase**

**Scenario:**
- Product: T-Shirt ($20.00)
- User has: 2,000 points
- User selects: 1,000 points

**Calculation:**
- 1,000 points = $5.00 discount
- Max 50% discount = $10.00
- Applied discount = $5.00 (within cap)
- Final price = $15.00

### **Example 2: Multiple Items with Cap**

**Scenario:**
- Item 1: Hoodie ($40.00)
- Item 2: T-Shirt ($20.00)
- Subtotal: $60.00
- User has: 10,000 points
- User selects: 10,000 points

**Calculation:**
- 10,000 points = $50.00 discount
- Max order discount = $30.00
- Applied discount = $30.00 (capped)
- Final price = $30.00

### **Example 3: Per-Item Cap**

**Scenario:**
- Product: Sticker ($2.00)
- User has: 1,000 points
- User selects: 1,000 points

**Calculation:**
- 1,000 points = $5.00 discount
- Max 50% discount = $1.00
- Applied discount = $1.00 (capped by item)
- Final price = $1.00

---

## ⚠️ **Pending Integrations**

### **Sales Promotions Integration**

**Status:** ❌ **NOT YET INTEGRATED**

**What's Missing:**
- Sales promotions are created in admin panel
- But NOT applied during checkout
- Need to integrate with checkout flow

**Required Changes:**
1. Fetch active sales promotions in checkout
2. Apply promotional discounts to eligible products
3. Combine with points discounts (or choose best)
4. Display promotion info in checkout
5. Store promotion metadata in order

**Files to Modify:**
- `src/app/checkout/page.tsx` - Add promotion fetching and display
- `src/app/api/create-checkout-session/route.ts` - Apply promotions
- `src/lib/points.ts` - Add promotion calculation functions
- `src/app/api/webhooks/stripe/route.ts` - Track promotion usage

---

## 🎯 **Points System Features**

### **Earning Points**

Users can earn points through:
- ✅ Event attendance (100 points)
- ✅ Volunteer work (250 points)
- ✅ Event hosting (500 points)
- ✅ Contributions (50-150 points)
- ✅ Welcome bonuses (configurable)
- ✅ Point giveaways (admin-initiated)
- ✅ Points multiplier campaigns (1.5x - 3.0x)

### **Spending Points**

Users can spend points on:
- ✅ Shop merchandise discounts
- ❌ Event registration (not implemented)
- ❌ Tournament entry fees (not implemented)

### **Points Management**

**Access:** President & Co-President only

Features:
- ✅ Award points to users
- ✅ Approve points transactions
- ✅ Edit points settings
- ✅ Create multiplier campaigns
- ✅ Create welcome bonuses
- ✅ Create point giveaways
- ✅ View points history

---

## 🔒 **Security & Validation**

### **Frontend Validation**
- ✅ Check user is logged in
- ✅ Validate points available
- ✅ Enforce maximum points usage
- ✅ Show real-time calculations

### **Backend Validation**
- ✅ Verify user has enough points
- ✅ Recalculate discount server-side
- ✅ Enforce all caps (item, order)
- ✅ Atomic points deduction
- ✅ Transaction logging

### **Firestore Rules**
- ✅ Only President/Co-President can manage points
- ✅ Users can read their own transactions
- ✅ Points settings readable by all
- ✅ Write operations require authentication

---

## 📈 **Analytics & Tracking**

### **What's Tracked**

- ✅ Points earned per user
- ✅ Points spent per user
- ✅ Points used per order
- ✅ Discount amount per order
- ✅ Transaction history
- ✅ Monthly points earned
- ✅ Points expiration dates

### **What's NOT Tracked**

- ❌ Most popular products with points
- ❌ Average points used per order
- ❌ Points redemption rate
- ❌ Points expiration notifications

---

## 🚀 **Future Enhancements**

### **High Priority**

1. **Integrate Sales Promotions** - Apply promotional discounts at checkout
2. **Points Expiration Notifications** - Email users before points expire
3. **Points History Page** - Dedicated page for transaction history
4. **Points Leaderboard** - Show top point earners

### **Medium Priority**

5. **Referral Points** - Award points for referring new members
6. **Birthday Points** - Automatic birthday bonus
7. **Streak Bonuses** - Reward consecutive event attendance
8. **Points Gifting** - Allow users to gift points to friends

### **Low Priority**

9. **Points Badges** - Achievements for point milestones
10. **Points Challenges** - Time-limited point earning challenges
11. **Points Marketplace** - Trade points for exclusive items
12. **Points Auction** - Bid points on limited items

---

## 📚 **Related Documentation**

- [Points System Business Logic](../src/lib/points.ts)
- [Admin Promotions Guide](./ADMIN_PROMOTIONS_GUIDE.md)
- [Shop Pricing Update](./SHOP_PRICING_UPDATE.md)
- [Welcome Points System](./WELCOME_POINTS_SYSTEM.md)
- [Points Management Restrictions](./POINTS_MANAGEMENT_RESTRICTIONS.md)

---

## ✅ **Integration Checklist**

- [x] Points balance widget in shop
- [x] Points calculator on product pages
- [x] Points selection in checkout
- [x] Points discount calculation
- [x] Stripe session with points metadata
- [x] Points deduction on order completion
- [x] Points transaction logging
- [x] Cart system
- [x] Order success page
- [x] Points earning system
- [x] Points management (admin)
- [x] Firestore security rules
- [ ] Sales promotions integration
- [ ] Points expiration notifications
- [ ] Points history page
- [ ] Analytics dashboard

---

**Last Updated:** 2025-10-13  
**Status:** ✅ **Core Integration Complete** (Sales Promotions Pending)  
**Next Steps:** Integrate sales promotions with checkout flow

