# Messaging System Enhancements - Implementation Guide

## Overview
This document outlines the implementation plan for email/SMS notifications and GroupMe integration for the BUG Gaming Club messaging system.

---

## Issue 2.2: Email/SMS Notifications for Messages

### Current State
- ✅ In-app message notifications exist (`MessageNotification` type)
- ✅ Unread message counts displayed in UI
- ❌ No email notifications when users receive messages
- ❌ No SMS/phone notifications

### Requirements
1. Send email notifications when users receive new messages
2. Send SMS notifications when users receive new messages
3. Allow users to configure notification preferences (email, SMS, or both)
4. Avoid notification spam (batch notifications, quiet hours, etc.)

---

### Implementation Plan

#### Phase 1: Email Notifications

**Services to Use:**
- **Recommended**: [Resend](https://resend.com/) - Modern email API, generous free tier
- **Alternative**: SendGrid, AWS SES, or Mailgun

**Steps:**

1. **Install Resend SDK**
   ```bash
   npm install resend
   ```

2. **Create Email Templates** (`src/lib/email/templates/`)
   - `newMessageEmail.tsx` - React email template for new messages
   - Use [@react-email/components](https://react.email/) for beautiful emails

3. **Create Email Service** (`src/lib/email/emailService.ts`)
   ```typescript
   import { Resend } from 'resend';
   
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   export async function sendNewMessageEmail(
     recipientEmail: string,
     senderName: string,
     messagePreview: string,
     conversationId: string
   ) {
     await resend.emails.send({
       from: 'BUG Gaming Club <notifications@buggamingclub.com>',
       to: recipientEmail,
       subject: `New message from ${senderName}`,
       react: NewMessageEmail({ senderName, messagePreview, conversationId }),
     });
   }
   ```

4. **Update Message Sending Logic** (`src/lib/database.ts`)
   - Modify `sendMessage()` function
   - Check user's notification preferences
   - Call `sendNewMessageEmail()` if enabled

5. **Add User Preferences** (`src/types/types.ts`)
   ```typescript
   export interface NotificationPreferences {
     emailNotifications: boolean;
     smsNotifications: boolean;
     messageEmailNotifications: boolean;  // Specific to messages
     messageSMSNotifications: boolean;
     quietHoursEnabled: boolean;
     quietHoursStart?: string;  // "22:00"
     quietHoursEnd?: string;    // "08:00"
     batchNotifications: boolean;  // Group multiple messages
   }
   ```

6. **Create Settings UI** (`src/app/settings/page.tsx`)
   - Add "Notifications" tab
   - Toggle switches for email/SMS preferences
   - Quiet hours configuration
   - Test notification button

**Estimated Time:** 2-3 days

---

#### Phase 2: SMS Notifications

**Services to Use:**
- **Recommended**: [Twilio](https://www.twilio.com/) - Industry standard for SMS
- **Alternative**: AWS SNS, Vonage (Nexmo)

**Twilio Pricing:**
- $15/month for phone number
- $0.0079 per SMS sent (US)
- Free trial: $15 credit

**Steps:**

1. **Install Twilio SDK**
   ```bash
   npm install twilio
   ```

2. **Create SMS Service** (`src/lib/sms/smsService.ts`)
   ```typescript
   import twilio from 'twilio';
   
   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );
   
   export async function sendNewMessageSMS(
     recipientPhone: string,
     senderName: string,
     messagePreview: string
   ) {
     await client.messages.create({
       body: `New message from ${senderName}: ${messagePreview.substring(0, 100)}...`,
       from: process.env.TWILIO_PHONE_NUMBER,
       to: recipientPhone,
     });
   }
   ```

3. **Add Phone Number to User Profile**
   - Update `User` type with `phoneNumber` field
   - Add phone verification flow (Twilio Verify API)
   - Store verified phone numbers only

4. **Update Message Sending Logic**
   - Check SMS notification preference
   - Verify phone number exists and is verified
   - Call `sendNewMessageSMS()` if enabled

5. **Rate Limiting**
   - Implement notification throttling
   - Max 1 SMS per conversation per hour
   - Batch multiple messages into single SMS

**Estimated Time:** 3-4 days

---

#### Phase 3: Notification Preferences UI

**Features:**
- Toggle email notifications on/off
- Toggle SMS notifications on/off
- Set quiet hours (no notifications during sleep)
- Choose notification frequency (instant, hourly digest, daily digest)
- Test notification buttons

**Implementation:**
1. Create `NotificationSettings` component
2. Add to `/settings` page
3. Store preferences in Firestore `users` collection
4. Update `updateUserProfile()` function

**Estimated Time:** 1-2 days

---

### Security Considerations

1. **Email Verification**
   - Only send to verified email addresses
   - Implement email verification flow if not already present

2. **Phone Verification**
   - Use Twilio Verify API for phone number verification
   - Never send SMS to unverified numbers

3. **Rate Limiting**
   - Prevent notification spam
   - Max notifications per user per day
   - Exponential backoff for repeated messages

4. **Privacy**
   - Don't include full message content in notifications
   - Use preview text only (first 100 characters)
   - Include unsubscribe link in emails

---

### Cost Estimation

**Email (Resend):**
- Free tier: 3,000 emails/month
- Paid: $20/month for 50,000 emails
- **Estimated cost for 100 active users:** $0-20/month

**SMS (Twilio):**
- Phone number: $15/month
- SMS: $0.0079 per message
- **Estimated cost for 100 active users (10 SMS/user/month):** $15 + $7.90 = $22.90/month

**Total estimated cost:** $20-43/month for 100 active users

---

## Issue 2.3: GroupMe Integration Research

### Overview
GroupMe is a popular group messaging app. Most BUG Gaming Club members prefer GroupMe for communication. This section explores integration options.

---

### GroupMe API Capabilities

**Official API:** [GroupMe Developers](https://dev.groupme.com/)

**Features:**
- ✅ Send messages to groups
- ✅ Receive messages via webhooks
- ✅ Create groups programmatically
- ✅ Add/remove members
- ✅ Get group info and member list
- ❌ No direct message (DM) support via API
- ❌ Limited to groups only

**Authentication:**
- OAuth 2.0 for user authorization
- Access tokens for API calls
- Users must authorize app to access their GroupMe account

---

### Integration Options

#### Option 1: Bot Integration (Recommended for MVP)

**How it works:**
1. Create a GroupMe bot for the BUG Gaming Club group
2. Bot receives messages via webhook
3. Bot can send messages to the group
4. Sync important announcements from website to GroupMe

**Pros:**
- ✅ Simple to implement
- ✅ No user authentication required
- ✅ Good for announcements and notifications
- ✅ Free to use

**Cons:**
- ❌ One-way communication (website → GroupMe)
- ❌ Can't read user messages from GroupMe
- ❌ Limited to single group

**Implementation:**
```typescript
// src/lib/groupme/botService.ts
import axios from 'axios';

const BOT_ID = process.env.GROUPME_BOT_ID;

export async function sendGroupMeMessage(text: string) {
  await axios.post('https://api.groupme.com/v3/bots/post', {
    bot_id: BOT_ID,
    text: text,
  });
}

// Usage: Send tournament announcements to GroupMe
await sendGroupMeMessage('🎮 New tournament starting! Check the website for details.');
```

**Estimated Time:** 1 day

---

#### Option 2: Full OAuth Integration

**How it works:**
1. Users link their GroupMe accounts via OAuth
2. App can access user's groups and messages
3. Sync messages between website and GroupMe
4. Two-way communication

**Pros:**
- ✅ Full two-way sync
- ✅ Access to all user's groups
- ✅ Can read and send messages
- ✅ Rich integration

**Cons:**
- ❌ Complex implementation
- ❌ Requires user authorization
- ❌ Privacy concerns (accessing all messages)
- ❌ Rate limits (150 requests/hour per user)

**Implementation Steps:**
1. Register app on GroupMe Developers
2. Implement OAuth flow
3. Store access tokens securely
4. Create webhook endpoints
5. Sync messages bidirectionally
6. Handle rate limits and errors

**Estimated Time:** 2-3 weeks

---

#### Option 3: Webhook-Based Sync (Hybrid Approach)

**How it works:**
1. Create GroupMe bot with webhook
2. Bot receives all group messages
3. Parse messages and sync to website
4. Send website messages to GroupMe via bot

**Pros:**
- ✅ Two-way communication
- ✅ No user authentication needed
- ✅ Simpler than full OAuth
- ✅ Works for entire group

**Cons:**
- ❌ Limited to one group
- ❌ All messages are public
- ❌ No DM support
- ❌ Potential message duplication

**Implementation:**
```typescript
// src/app/api/webhooks/groupme/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  
  // Ignore bot's own messages
  if (data.sender_type === 'bot') return;
  
  // Sync message to website
  await createAnnouncementFromGroupMe({
    title: `GroupMe: ${data.name}`,
    content: data.text,
    author: data.name,
    timestamp: new Date(data.created_at * 1000),
  });
  
  return new Response('OK');
}
```

**Estimated Time:** 1 week

---

### Recommended Approach

**Phase 1: Bot Integration (Immediate)**
- Create GroupMe bot for announcements
- Send tournament/event notifications to GroupMe
- One-way: Website → GroupMe
- **Time:** 1 day
- **Cost:** Free

**Phase 2: Webhook Sync (Future Enhancement)**
- Add webhook to receive GroupMe messages
- Sync important messages to website announcements
- Two-way: Website ↔ GroupMe
- **Time:** 1 week
- **Cost:** Free

**Phase 3: Full OAuth (Long-term)**
- Only if users demand full integration
- Allow users to link GroupMe accounts
- Sync DMs and multiple groups
- **Time:** 2-3 weeks
- **Cost:** Free (within rate limits)

---

### GroupMe Bot Setup Guide

1. **Create Bot:**
   - Go to https://dev.groupme.com/bots
   - Click "Create Bot"
   - Select your group
   - Name: "BUG Gaming Club Bot"
   - Avatar: Upload club logo
   - Callback URL: `https://yourdomain.com/api/webhooks/groupme`

2. **Get Bot ID:**
   - Copy the Bot ID from the bot page
   - Add to `.env.local`: `GROUPME_BOT_ID=your_bot_id`

3. **Test Bot:**
   ```bash
   curl -X POST https://api.groupme.com/v3/bots/post \
     -d '{"bot_id":"YOUR_BOT_ID","text":"Hello from BUG Gaming Club!"}'
   ```

4. **Integrate with Website:**
   - Send tournament announcements
   - Send event reminders
   - Send leaderboard updates

---

### Privacy & Compliance

**GroupMe Terms of Service:**
- ✅ Bots are allowed
- ✅ Webhooks are allowed
- ⚠️ Must respect user privacy
- ⚠️ Don't spam or abuse API
- ⚠️ Follow rate limits

**Best Practices:**
- Only send relevant notifications
- Allow users to opt-out
- Don't store GroupMe messages long-term
- Respect rate limits (150 req/hour)
- Handle errors gracefully

---

## Summary & Next Steps

### Completed
- ✅ Issue 2.1: New DM initiation button

### Ready to Implement
- 📋 Issue 2.2: Email notifications (2-3 days)
- 📋 Issue 2.2: SMS notifications (3-4 days)
- 📋 Issue 2.3: GroupMe bot integration (1 day)

### Future Enhancements
- 📋 GroupMe webhook sync (1 week)
- 📋 GroupMe full OAuth integration (2-3 weeks)
- 📋 Push notifications (web/mobile)
- 📋 Discord integration
- 📋 Slack integration

### Recommended Priority
1. **Email notifications** - Most users have email, low cost
2. **GroupMe bot** - Quick win, high user value
3. **SMS notifications** - Higher cost, opt-in only
4. **GroupMe webhook sync** - If users want two-way sync

---

## Questions for Decision

1. **Budget:** What's the monthly budget for SMS notifications?
2. **GroupMe:** Do we want one-way (bot) or two-way (webhook) integration?
3. **Email Service:** Resend, SendGrid, or AWS SES?
4. **SMS Service:** Twilio, AWS SNS, or Vonage?
5. **Priority:** Email first, or GroupMe first?

---

*Last Updated: 2025-10-15*

