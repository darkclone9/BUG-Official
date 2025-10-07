# Environment Configuration Guide

This document describes all environment variables used in the BUG Gaming Club application.

## ✅ Current Setup Status

Your environment is configured with:

- ✅ Firebase (Client & Storage configured)
- ✅ Stripe (Test keys configured)
- ✅ GitHub Integration (Bug reports)
- ✅ Gemini AI
- ✅ Messaging System (Enabled)
- ⚠️ Firebase Admin SDK (Needs configuration for server-side features)
- ⚠️ SendGrid (Optional - for email notifications)
- ⚠️ FCM Push Notifications (Optional - for mobile notifications)

## Table of Contents

- [Quick Fix: Messaging Errors](#quick-fix-messaging-errors)
- [Firebase Configuration](#firebase-configuration)
- [Stripe Configuration](#stripe-configuration)
- [Application Configuration](#application-configuration)
- [Email Notifications](#email-notifications)
- [Feature Flags](#feature-flags)
- [Messaging Configuration](#messaging-configuration)

---

## Quick Fix: Messaging Errors

If you're seeing "Failed to load conversations" errors:

1. **Restart your development server:**

   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Clear browser cache:**

   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Or clear site data in DevTools (F12 → Application → Clear storage)

3. **Verify you're logged in:**

   - The messaging system requires authentication
   - Go to `/login` if you're not logged in

4. **Check browser console (F12):**
   - Look for any Firebase/Firestore errors
   - Share error messages if issues persist

**Note:** The recent fix removed the need for Firestore composite indexes, so messaging should work immediately after restarting the dev server.

---

## Firebase Configuration

### Required Variables

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**How to get these:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon > Project settings
4. Scroll to "Your apps" and copy the config values

### Firebase Admin SDK (Server-side)

```bash
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PROJECT_ID=your_project_id
```

**How to get these:**

1. Firebase Console > Project settings > Service accounts
2. Click "Generate new private key"
3. Extract values from the downloaded JSON file

---

## Stripe Configuration

### Required Variables

```bash
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Setup Instructions:**

1. **API Keys:**

   - Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - Copy the Publishable key and Secret key
   - Use TEST keys (`pk_test_...`, `sk_test_...`) for development
   - Use LIVE keys for production

2. **Webhook Secret:**
   - Install Stripe CLI: `npm install -g stripe`
   - Run: `stripe login`
   - Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copy the webhook signing secret (whsec\_...)
   - For production, create a webhook endpoint in Stripe Dashboard

---

## Application Configuration

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- **Development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com`

Used for Stripe redirects and email links.

---

## Email Notifications

### SendGrid (Optional)

```bash
SENDGRID_API_KEY=SG.YOUR_API_KEY_HERE
```

**How to get:**

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Go to Settings > API Keys
3. Create a new API key with "Mail Send" permissions

**Used for:**

- Order confirmation emails
- Pickup notifications
- Daily digest for unread messages (when messaging is enabled)

---

## Feature Flags

Control which features are enabled in your environment.

### Messaging System

```bash
# Main toggle - set to true to enable messaging
NEXT_PUBLIC_MESSAGING_ENABLED=false
```

**Sub-features** (only work when `MESSAGING_ENABLED=true`):

```bash
NEXT_PUBLIC_MESSAGING_DM_ENABLED=true              # Direct messages
NEXT_PUBLIC_MESSAGING_TOURNAMENT_ENABLED=true     # Tournament lobby chat
NEXT_PUBLIC_MESSAGING_TEAM_ENABLED=true           # Team channels
NEXT_PUBLIC_MESSAGING_MATCH_ENABLED=true          # Match threads
NEXT_PUBLIC_MESSAGING_NOTIFICATIONS_ENABLED=true  # In-app notifications
NEXT_PUBLIC_MESSAGING_MENTIONS_ENABLED=true       # @mention support
NEXT_PUBLIC_MESSAGING_ATTACHMENTS_ENABLED=true    # File uploads
NEXT_PUBLIC_MESSAGING_REACTIONS_ENABLED=true      # Message reactions
```

### Experimental Features

```bash
NEXT_PUBLIC_TYPING_INDICATORS_ENABLED=false  # Real-time typing status
NEXT_PUBLIC_MESSAGE_SEARCH_ENABLED=false     # Full-text message search
NEXT_PUBLIC_PRESENCE_STATUS_ENABLED=false    # Online/offline presence
```

**Note:** Experimental features may have performance or cost implications.

---

## Messaging Configuration

These variables are only needed when messaging is enabled.

### Firebase Cloud Messaging (Push Notifications)

```bash
NEXT_PUBLIC_FCM_VAPID_KEY=your_vapid_key
FCM_SERVER_KEY=your_server_key
```

**How to get:**

1. Firebase Console > Project settings > Cloud Messaging
2. Under "Web configuration," find your VAPID key
3. Copy the Server key from the same section

**Used for:**

- Push notifications for mentions and DMs when user is not active
- Background message notifications

### Content Moderation (Optional)

```bash
MODERATION_API_KEY=your_api_key
MODERATION_API_ENDPOINT=https://api.moderationservice.com
```

**Suggested services:**

- [OpenAI Moderation API](https://platform.openai.com/docs/guides/moderation)
- [Google Cloud Natural Language API](https://cloud.google.com/natural-language)
- [Azure Content Moderator](https://azure.microsoft.com/en-us/services/cognitive-services/content-moderator/)

**Used for:**

- Automated message filtering
- Flagging inappropriate content
- Reducing moderation workload

### Rate Limiting

```bash
NEXT_PUBLIC_MESSAGE_RATE_LIMIT=10        # Messages per window
NEXT_PUBLIC_MESSAGE_RATE_WINDOW=60000    # Window in milliseconds (60s)
```

**Default:** 10 messages per 60 seconds per user per conversation

---

## Environment-Specific Configurations

### Development (.env.local)

```bash
# All variables above with TEST/development values
NEXT_PUBLIC_MESSAGING_ENABLED=true  # Enable for testing
```

### Production (.env.production)

```bash
# Use LIVE Stripe keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Production base URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Controlled feature rollout
NEXT_PUBLIC_MESSAGING_ENABLED=true  # Enable after testing
```

### Staging (.env.staging)

```bash
# Use TEST Stripe keys but production-like config
NEXT_PUBLIC_BASE_URL=https://staging.yourdomain.com
NEXT_PUBLIC_MESSAGING_ENABLED=true  # Test features here first
```

---

## Security Best Practices

1. **Never commit `.env.local` to version control**

   - Already in `.gitignore`
   - Use placeholder values in `.env.example`

2. **Use different Firebase projects for dev/prod**

   - Separate development and production data
   - Different security rules for testing

3. **Rotate keys regularly**

   - Stripe keys if compromised
   - Firebase service account keys
   - API keys for third-party services

4. **Restrict API key permissions**

   - Firebase: Use security rules, not API restrictions
   - Stripe: Use restricted keys when possible
   - SendGrid: Limit to Mail Send only

5. **Monitor usage**
   - Set billing alerts in Firebase
   - Monitor Stripe for unusual activity
   - Track API usage for rate limiting

---

## Troubleshooting

### Firebase Connection Issues

- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Check Firebase project is active
- Verify domain is added to authorized domains in Firebase Console

### Stripe Webhook Failures

- Ensure webhook secret matches between CLI and .env
- Check webhook endpoint is accessible
- Verify Stripe CLI is running for local development

### Messaging Not Appearing

- Verify `NEXT_PUBLIC_MESSAGING_ENABLED=true`
- Check browser console for errors
- Verify Firestore security rules allow read/write

### Email Not Sending

- Verify SendGrid API key is valid
- Check sender email is verified in SendGrid
- Look for errors in SendGrid dashboard

---

## Quick Start Checklist

- [ ] Copy `.env.local` from `.env.example`
- [ ] Add Firebase configuration
- [ ] Add Stripe test keys
- [ ] Run `stripe listen` for webhooks
- [ ] Set `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
- [ ] Keep `NEXT_PUBLIC_MESSAGING_ENABLED=false` initially
- [ ] Start dev server: `npm run dev`
- [ ] Enable messaging when ready to test

---

## Need Help?

- **Firebase:** [Firebase Documentation](https://firebase.google.com/docs)
- **Stripe:** [Stripe Documentation](https://stripe.com/docs)
- **Next.js:** [Next.js Documentation](https://nextjs.org/docs)
- **Project Issues:** [GitHub Issues](https://github.com/darkclone9/BUG-Official/issues)
