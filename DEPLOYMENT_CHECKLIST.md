# Production Deployment Checklist

## Pre-Deployment

### Environment Configuration

- [ ] **Firebase Configuration**
  - [ ] Production Firebase project created
  - [ ] Firestore database created in production mode
  - [ ] Authentication enabled (Email/Password, Google)
  - [ ] Security rules configured
  - [ ] Firestore indexes deployed
  - [ ] Environment variables set in hosting platform

- [ ] **Stripe Configuration**
  - [ ] Production Stripe account created
  - [ ] Live API keys obtained
  - [ ] Webhook endpoint configured
  - [ ] Stripe Tax enabled
  - [ ] Test mode disabled
  - [ ] Payment methods configured

- [ ] **Email Service**
  - [ ] SendGrid account created (or alternative)
  - [ ] API key obtained
  - [ ] Sender email verified
  - [ ] Email templates tested
  - [ ] Unsubscribe links added

- [ ] **Domain & Hosting**
  - [ ] Domain purchased and configured
  - [ ] SSL certificate enabled
  - [ ] DNS records configured
  - [ ] Hosting platform selected (Vercel recommended)

### Code Preparation

- [ ] **Build & Test**
  - [ ] Run `npm run build` successfully
  - [ ] Fix all TypeScript errors
  - [ ] Fix all ESLint warnings
  - [ ] Test all pages load correctly
  - [ ] Test responsive design on mobile/tablet/desktop

- [ ] **Shop System Testing**
  - [ ] Product browsing works
  - [ ] Search and filters work
  - [ ] Cart functionality works
  - [ ] Checkout flow completes
  - [ ] Stripe payment processes
  - [ ] Webhook receives events
  - [ ] Orders created in Firestore
  - [ ] Points deducted correctly
  - [ ] Email notifications sent
  - [ ] Pickup queue updates

- [ ] **Admin Testing**
  - [ ] Admin login works
  - [ ] Product CRUD operations work
  - [ ] Points approval works
  - [ ] Pickup queue management works
  - [ ] Settings updates work
  - [ ] Permissions enforced correctly

- [ ] **Security**
  - [ ] Firestore security rules tested
  - [ ] API routes protected
  - [ ] Admin routes protected
  - [ ] Webhook signature verification enabled
  - [ ] Environment variables secured
  - [ ] No sensitive data in client code

### Database Setup

- [ ] **Firestore Collections**
  - [ ] `users` collection created
  - [ ] `points_settings` document created with defaults
  - [ ] `shop_products` collection ready
  - [ ] `shop_orders` collection ready
  - [ ] `points_transactions` collection ready
  - [ ] `pickup_queue` collection ready
  - [ ] `role_change_logs` collection ready

- [ ] **Initial Data**
  - [ ] Points settings configured
  - [ ] Admin users created with roles
  - [ ] Test products created (optional)

- [ ] **Indexes**
  - [ ] All composite indexes deployed
  - [ ] Index creation completed (can take time)

### Environment Variables

Create `.env.local` (development) and configure in hosting platform (production):

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Email (Optional)
SENDGRID_API_KEY=

# Print-on-Demand (Optional)
PRINTFUL_API_KEY=
```

## Deployment Steps

### 1. Vercel Deployment (Recommended)

- [ ] Connect GitHub repository to Vercel
- [ ] Configure environment variables in Vercel dashboard
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `.next`
- [ ] Deploy to production
- [ ] Verify deployment successful

### 2. Stripe Webhook Configuration

- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Select events:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
- [ ] Copy webhook signing secret
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel
- [ ] Test webhook with Stripe CLI or test payment

### 3. Firebase Configuration

- [ ] Update Firebase project settings with production domain
- [ ] Add authorized domains in Firebase Console
- [ ] Deploy Firestore security rules:
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] Deploy Firestore indexes:
  ```bash
  firebase deploy --only firestore:indexes
  ```

### 4. DNS Configuration

- [ ] Point domain to Vercel
- [ ] Wait for DNS propagation
- [ ] Verify SSL certificate active
- [ ] Test HTTPS access

## Post-Deployment

### Verification

- [ ] **Homepage**
  - [ ] Loads correctly
  - [ ] Navigation works
  - [ ] Theme toggle works

- [ ] **Shop**
  - [ ] Products display
  - [ ] Search works
  - [ ] Filters work
  - [ ] Product details load

- [ ] **Checkout**
  - [ ] Cart works
  - [ ] Checkout page loads
  - [ ] Stripe Checkout opens
  - [ ] Test payment completes
  - [ ] Order created in database
  - [ ] Confirmation email sent

- [ ] **Admin**
  - [ ] Login works
  - [ ] Admin dashboard loads
  - [ ] Product management works
  - [ ] Points approval works

- [ ] **Performance**
  - [ ] Page load times acceptable
  - [ ] Images optimized
  - [ ] No console errors
  - [ ] Mobile performance good

### Monitoring Setup

- [ ] **Error Tracking**
  - [ ] Set up Sentry or similar
  - [ ] Configure error reporting
  - [ ] Test error capture

- [ ] **Analytics**
  - [ ] Google Analytics configured
  - [ ] Conversion tracking set up
  - [ ] E-commerce tracking enabled

- [ ] **Uptime Monitoring**
  - [ ] Set up uptime monitor
  - [ ] Configure alerts
  - [ ] Test notifications

### Documentation

- [ ] **User Documentation**
  - [ ] How to shop guide
  - [ ] Points system explanation
  - [ ] Checkout instructions
  - [ ] FAQ page

- [ ] **Admin Documentation**
  - [ ] Product management guide
  - [ ] Points approval workflow
  - [ ] Pickup queue process
  - [ ] Settings configuration

### Marketing & Launch

- [ ] **Announcement**
  - [ ] Prepare launch announcement
  - [ ] Social media posts ready
  - [ ] Email to members
  - [ ] Website banner

- [ ] **Initial Products**
  - [ ] Add initial product catalog
  - [ ] Set competitive pricing
  - [ ] Upload product images
  - [ ] Write descriptions

- [ ] **Promotions**
  - [ ] Launch promotion planned
  - [ ] Points multiplier campaign
  - [ ] Discount codes (if applicable)

## Maintenance

### Regular Tasks

- [ ] **Weekly**
  - [ ] Review error logs
  - [ ] Check order fulfillment
  - [ ] Process pickup queue
  - [ ] Approve pending points

- [ ] **Monthly**
  - [ ] Review analytics
  - [ ] Update products
  - [ ] Check inventory
  - [ ] Review points settings

- [ ] **Quarterly**
  - [ ] Security audit
  - [ ] Performance review
  - [ ] User feedback review
  - [ ] Feature planning

### Backup Strategy

- [ ] **Firestore Backups**
  - [ ] Enable automatic backups
  - [ ] Test restore process
  - [ ] Document backup location

- [ ] **Code Backups**
  - [ ] GitHub repository backed up
  - [ ] Environment variables documented
  - [ ] Deployment process documented

## Rollback Plan

In case of critical issues:

1. **Immediate Actions**
   - [ ] Revert to previous Vercel deployment
   - [ ] Disable shop if necessary
   - [ ] Post maintenance notice

2. **Investigation**
   - [ ] Check error logs
   - [ ] Review recent changes
   - [ ] Identify root cause

3. **Fix & Redeploy**
   - [ ] Fix issue in development
   - [ ] Test thoroughly
   - [ ] Deploy fix
   - [ ] Verify resolution

## Support

### Contact Information

- **Technical Issues**: [Your email]
- **Payment Issues**: [Stripe support]
- **Hosting Issues**: [Vercel support]

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## Sign-Off

- [ ] **Development Team**: Deployment tested and approved
- [ ] **Admin Team**: Admin features verified
- [ ] **Finance Team**: Payment processing verified
- [ ] **Marketing Team**: Launch materials ready

**Deployment Date**: _______________

**Deployed By**: _______________

**Notes**: _______________

