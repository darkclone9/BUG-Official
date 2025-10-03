# BUG Gaming Club Shop - Setup Guide

## Overview

The BUG Gaming Club Shop is a full-featured e-commerce system with participation points integration, built on Next.js 15, Firebase, and Stripe.

## Features

### Customer Features
- 🛍️ Product browsing with filtering and search
- 🛒 Shopping cart with persistent storage
- ✨ Points-based discount system (1,000 points = $1.00)
- 💳 Secure Stripe checkout
- 📦 Campus pickup or shipping options
- 📱 Fully responsive design
- 📧 Order confirmation emails
- 📊 Order history tracking

### Admin Features
- 📦 Product management (CRUD)
- ✅ Points transaction approval
- 🎯 Pickup queue management
- ⚙️ Points system configuration
- 📈 Order management
- 👥 Role-based permissions

## Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore
- Stripe account
- (Optional) SendGrid or email service

## Installation

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: Email Service (SendGrid)
SENDGRID_API_KEY=SG...
```

### 2. Firestore Setup

#### Required Collections

The shop system uses these Firestore collections:

1. **users** - User profiles with points
2. **points_settings** - System configuration
3. **points_transactions** - Points transaction history
4. **points_multipliers** - Multiplier campaigns
5. **shop_products** - Product catalog
6. **shop_orders** - Order history
7. **pickup_queue** - Campus pickup management
8. **role_change_logs** - Audit trail

#### Firestore Indexes

Add these composite indexes to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "points_transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "points_transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "shop_orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "shop_orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

#### Initial Points Settings

Create a document in `points_settings` collection with ID `default`:

```json
{
  "pointsPerDollar": 1000,
  "maxDiscountPerItem": 50,
  "maxDiscountPerOrder": 3000,
  "monthlyEarningCap": 10000,
  "expirationMonths": 12,
  "autoApproveThreshold": 100,
  "defaultMultiplier": 1.0
}
```

### 3. Stripe Setup

#### Create Products in Stripe Dashboard

1. Go to Stripe Dashboard → Products
2. Create products or use the shop admin to create them
3. Enable Stripe Tax in your account

#### Configure Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
5. Copy the webhook signing secret
6. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

#### Local Testing with Stripe CLI

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret from output
# Add to .env.local as STRIPE_WEBHOOK_SECRET
```

### 4. Role Setup

Assign admin roles to users in Firestore:

```javascript
// In users collection, update a user document:
{
  "roles": ["admin"],  // or ["head_admin"], ["officer"], etc.
  // ... other user fields
}
```

**Role Hierarchy:**
- `president` (100) - Full access
- `co_president` (90) - Full access except president management
- `head_admin` (80) - Shop and points management
- `admin` (70) - Order and points approval
- `officer` (60) - Points approval
- `member` (10) - Regular user

## Usage

### For Customers

#### Shopping
1. Browse products at `/shop`
2. Click product to view details
3. Add to cart with quantity and variant
4. View cart by clicking cart icon
5. Proceed to checkout

#### Checkout
1. Select fulfillment method (campus pickup or shipping)
2. Use points slider to apply discount
3. Review order summary
4. Click "Proceed to Payment"
5. Complete Stripe checkout
6. Receive confirmation email

#### Order History
1. Go to `/profile/orders`
2. View all past orders
3. Track order status

### For Admins

#### Access Admin Panel
- Navigate to `/admin/shop`
- Requires admin permissions

#### Product Management
1. Click "Products" tab
2. Click "Add Product" to create new product
3. Fill in product details:
   - Name, description, price
   - Category, stock, images
4. Click "Create Product"
5. Edit or delete products as needed

#### Points Approval
1. Click "Points Approval" tab
2. Review pending transactions
3. Click "Approve" or "Deny"
4. If denying, provide reason

#### Pickup Queue
1. Click "Pickup Queue" tab
2. View pending pickups
3. Mark as "Ready" when prepared
4. Click "Complete Pickup" when customer picks up
5. Enter who picked up the order

#### Points Settings
1. Click "Points Settings" tab
2. Modify system parameters
3. Click "Save Changes"

## Points System

### Earning Points

Points are awarded for:
- Event attendance
- Tournament participation
- Volunteering
- Special achievements

**Approval Workflow:**
1. Admin awards points to user
2. Transaction created with "pending" status
3. Admin approves or denies
4. If approved, points added to user balance
5. User notified via email (if configured)

### Using Points

**Conversion Rate:** 1,000 points = $1.00 discount

**Discount Caps:**
- Maximum 50% off any single item
- Maximum $30.00 off per order
- Shipping and taxes always paid in full

**Monthly Earning Cap:** 10,000 points per user

**Expiration:** Points expire after 12 months

### Points Calculation Example

```
Cart:
- T-Shirt: $20.00
- Sticker: $5.00
Subtotal: $25.00

User has 15,000 points available
User applies 15,000 points

Calculation:
- T-Shirt: $20.00 → 50% cap = $10.00 max discount
- Sticker: $5.00 → 50% cap = $2.50 max discount
- Total possible discount: $12.50
- Points needed: 12,500 points
- Points used: 12,500 points
- Remaining: 2,500 points

Final:
- Subtotal: $25.00
- Points Discount: -$12.50
- Shipping: $5.00 (or Free for campus pickup)
- Tax: ~$1.50
- Total: ~$19.00
```

## Email Notifications

### Setup Email Service (Optional)

The system includes email templates for:
- Order confirmation
- Pickup ready notification
- Shipping notification

To enable emails, configure SendGrid in `src/lib/email.ts`:

```typescript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: order.userEmail,
  from: 'noreply@buggamingclub.com',
  subject: 'Order Confirmation',
  html: emailHtml,
};

await sgMail.send(msg);
```

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct
2. Verify webhook secret in `.env.local`
3. Check Stripe Dashboard → Webhooks → Recent events
4. Use Stripe CLI for local testing

### Points Not Applying

1. Check user has available points
2. Verify points settings are configured
3. Check product is points eligible
4. Review discount caps

### Orders Not Creating

1. Check Firestore permissions
2. Verify webhook is receiving events
3. Check server logs for errors
4. Ensure all required fields are present

### Permission Errors

1. Verify user roles in Firestore
2. Check permission functions in `src/lib/permissions.ts`
3. Ensure user is logged in

## Production Deployment

### Pre-Deployment Checklist

- [ ] Update `NEXT_PUBLIC_BASE_URL` to production URL
- [ ] Use production Stripe keys
- [ ] Configure production webhook endpoint
- [ ] Deploy Firestore indexes
- [ ] Set up email service
- [ ] Test checkout flow end-to-end
- [ ] Test webhook processing
- [ ] Verify admin permissions
- [ ] Test points system
- [ ] Enable Stripe Tax
- [ ] Set up monitoring and error tracking

### Deployment Steps

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your hosting platform (Vercel, etc.)

3. Configure environment variables in hosting platform

4. Update Stripe webhook URL to production

5. Test all features in production

## Support

For issues or questions:
- Email: belhavengamingclub@gmail.com
- Check logs in Firebase Console
- Review Stripe Dashboard for payment issues

## License

© 2025 BUG Gaming Club. All rights reserved.

