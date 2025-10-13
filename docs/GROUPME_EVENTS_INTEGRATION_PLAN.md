# GroupMe Events Integration Plan

**Created:** 2025-10-13  
**Status:** 📋 Planning Phase  
**Priority:** High

---

## 📋 Executive Summary

This document outlines a comprehensive technical plan for integrating GroupMe event creation with the BUG Gaming Club website's event management system. When an admin creates an event on the website, the system will automatically create a corresponding calendar event in GroupMe and post announcements to designated GroupMe chats.

---

## 🎯 Goals & Objectives

### Primary Goals
1. **Automate GroupMe event creation** - Reduce manual work for admins
2. **Increase event visibility** - Ensure all members see events in GroupMe
3. **Maintain single source of truth** - Website is the primary event management system
4. **Sync event updates** - Keep GroupMe events in sync with website changes
5. **Provide flexibility** - Make GroupMe posting optional per event

### Success Criteria
- ✅ Events created on website automatically appear in GroupMe
- ✅ Event updates on website sync to GroupMe
- ✅ Event cancellations remove GroupMe events
- ✅ Admins can choose which chats to post to
- ✅ System handles API failures gracefully
- ✅ No manual GroupMe event creation needed

---

## 🔑 GroupMe API Overview

### API Capabilities

**GroupMe API Base URL:** `https://api.groupme.com/v3`

**Key Features:**
1. **Calendar Events** - Create, update, delete calendar events in groups
2. **Messages** - Post messages to groups
3. **Bots** - Automated posting via bot accounts
4. **Groups** - Manage group information

### Authentication

**Access Token Required:**
- User access token (for calendar events)
- Bot token (for posting messages)

**How to Get Access Token:**
1. Go to https://dev.groupme.com/
2. Log in with GroupMe account
3. Click "Access Token" in top right
4. Copy token (keep secure!)

### API Endpoints

#### 1. Create Calendar Event
```
POST https://api.groupme.com/v3/conversations/{group_id}/events/create
```

**Request Body:**
```json
{
  "event": {
    "name": "BUG Gaming Tournament",
    "description": "Super Smash Bros tournament",
    "start_at": "2025-10-20T18:00:00Z",
    "end_at": "2025-10-20T21:00:00Z",
    "location": "Student Center Room 201",
    "is_all_day": false
  }
}
```

**Response:**
```json
{
  "response": {
    "event": {
      "id": "12345",
      "name": "BUG Gaming Tournament",
      "created_at": 1697654321
    }
  }
}
```

#### 2. Update Calendar Event
```
POST https://api.groupme.com/v3/conversations/{group_id}/events/{event_id}/update
```

#### 3. Delete Calendar Event
```
POST https://api.groupme.com/v3/conversations/{group_id}/events/{event_id}/delete
```

#### 4. Post Message to Group
```
POST https://api.groupme.com/v3/groups/{group_id}/messages
```

**Request Body:**
```json
{
  "message": {
    "source_guid": "unique-guid",
    "text": "🎮 New Event: BUG Gaming Tournament on Oct 20 at 6:00 PM!"
  }
}
```

#### 5. Post Message via Bot
```
POST https://api.groupme.com/v3/bots/post
```

**Request Body:**
```json
{
  "bot_id": "bot123",
  "text": "🎮 New Event: BUG Gaming Tournament on Oct 20 at 6:00 PM!"
}
```

---

## 🏗️ Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Creates Event                   │
│                  (Website Event Form)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Save Event to Firestore                     │
│              (events collection)                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Check: Should post to GroupMe?                   │
│         (postToGroupMe checkbox)                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼ YES
┌─────────────────────────────────────────────────────────┐
│           Create GroupMe Calendar Event                  │
│           (API: /events/create)                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│        Post Announcement to Selected Chats               │
│        (Main chat, topic-specific chat)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│      Store GroupMe Event ID in Firestore                 │
│      (for future updates/deletions)                      │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Event Creation:**
   - Admin fills out event form
   - Selects "Post to GroupMe" checkbox
   - Selects which chats to post to
   - Submits form
   - Website creates event in Firestore
   - Website calls GroupMe API to create calendar event
   - Website posts announcement messages to selected chats
   - Website stores GroupMe event ID in Firestore

2. **Event Update:**
   - Admin edits event on website
   - Website updates Firestore
   - If GroupMe event ID exists, update GroupMe event
   - Optionally post update message to chats

3. **Event Cancellation:**
   - Admin cancels event on website
   - Website updates status in Firestore
   - If GroupMe event ID exists, delete GroupMe event
   - Post cancellation message to chats

---

## 🗄️ Database Schema Changes

### Enhanced ClubEvent Type

**File:** `src/types/types.ts`

**Add New Fields:**
```typescript
export interface ClubEvent {
  // ... existing fields ...
  
  // GroupMe Integration Fields
  postToGroupMe?: boolean;              // Whether to post to GroupMe
  groupMeEventId?: string;              // GroupMe calendar event ID
  groupMeChats?: string[];              // Which chats to post to
  groupMeMessageIds?: {                 // Message IDs for each chat
    [chatId: string]: string;
  };
  groupMeLastSynced?: Date;             // Last sync timestamp
  groupMeError?: string;                // Last error message (if any)
}
```

### GroupMe Configuration Collection

**New Collection:** `groupme_config`

**Document ID:** `default`

**Structure:**
```typescript
interface GroupMeConfig {
  id: 'default';
  accessToken: string;                  // User access token (encrypted)
  botToken?: string;                    // Bot token (encrypted)
  chats: {
    id: string;                         // GroupMe group ID
    name: string;                       // Display name
    type: 'main' | 'topic' | 'other';   // Chat type
    isActive: boolean;                  // Whether to show in UI
  }[];
  defaultChats: string[];               // Default selected chats
  enableAutoPost: boolean;              // Global enable/disable
  messageTemplate: string;              // Message template
  updatedAt: Date;
  updatedBy: string;
}
```

---

## 🔐 Security & Environment Variables

### Environment Variables

**File:** `.env.local`

**Add:**
```env
# GroupMe API Configuration
GROUPME_ACCESS_TOKEN=your_access_token_here
GROUPME_BOT_TOKEN=your_bot_token_here

# GroupMe Group IDs
GROUPME_MAIN_CHAT_ID=12345678
GROUPME_GAMING_CHAT_ID=87654321
GROUPME_EVENTS_CHAT_ID=11223344
```

### Security Best Practices

1. **Never expose tokens in client-side code**
   - Store in environment variables
   - Access only from server-side API routes
   - Encrypt in database if stored

2. **Use API routes for GroupMe calls**
   - Create `/api/groupme/create-event` endpoint
   - Create `/api/groupme/update-event` endpoint
   - Create `/api/groupme/delete-event` endpoint
   - Create `/api/groupme/post-message` endpoint

3. **Validate permissions**
   - Only admins can trigger GroupMe posts
   - Check user roles before API calls
   - Log all GroupMe operations

4. **Handle token rotation**
   - Tokens may expire
   - Implement token refresh logic
   - Alert admins if token is invalid

---

## 🎨 UI/UX Changes

### Event Creation Form Enhancements

**File:** `src/components/admin/CreateEventModal.tsx`

**Add New Section:**
```tsx
{/* GroupMe Integration */}
<div className="space-y-4 border-t pt-4">
  <div className="flex items-center justify-between">
    <Label htmlFor="postToGroupMe">Post to GroupMe</Label>
    <Checkbox
      id="postToGroupMe"
      checked={formData.postToGroupMe}
      onCheckedChange={(checked) => 
        setFormData({ ...formData, postToGroupMe: checked })
      }
    />
  </div>
  
  {formData.postToGroupMe && (
    <>
      <div className="space-y-2">
        <Label>Select Chats</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="main-chat" defaultChecked />
            <label htmlFor="main-chat">Main Chat</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="gaming-chat" defaultChecked />
            <label htmlFor="gaming-chat">Gaming Chat</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="events-chat" />
            <label htmlFor="events-chat">Events Chat</label>
          </div>
        </div>
      </div>
      
      <div className="bg-muted p-3 rounded-lg text-sm">
        <p className="text-muted-foreground">
          ℹ️ This will create a calendar event in GroupMe and post 
          an announcement to the selected chats.
        </p>
      </div>
    </>
  )}
</div>
```

### Event List Indicators

**Add GroupMe Status Badges:**
```tsx
{event.groupMeEventId && (
  <Badge variant="outline" className="gap-1">
    <MessageSquare className="h-3 w-3" />
    Posted to GroupMe
  </Badge>
)}

{event.groupMeError && (
  <Badge variant="destructive" className="gap-1">
    <AlertCircle className="h-3 w-3" />
    GroupMe Error
  </Badge>
)}
```

---

## 🔧 Implementation Details

### New API Routes

#### 1. Create GroupMe Event

**File:** `src/app/api/groupme/create-event/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { event, chatIds } = await request.json();
    
    // Validate user is admin
    // ... auth check ...
    
    const accessToken = process.env.GROUPME_ACCESS_TOKEN;
    
    // Create calendar event in each chat
    const eventIds: { [chatId: string]: string } = {};
    
    for (const chatId of chatIds) {
      const response = await fetch(
        `https://api.groupme.com/v3/conversations/${chatId}/events/create?token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: {
              name: event.name,
              description: event.description,
              start_at: event.date.toISOString(),
              end_at: event.endDate?.toISOString(),
              location: event.location,
              is_all_day: false,
            }
          })
        }
      );
      
      const data = await response.json();
      eventIds[chatId] = data.response.event.id;
    }
    
    return NextResponse.json({ success: true, eventIds });
  } catch (error) {
    console.error('GroupMe API error:', error);
    return NextResponse.json(
      { error: 'Failed to create GroupMe event' },
      { status: 500 }
    );
  }
}
```

#### 2. Post Message to Chats

**File:** `src/app/api/groupme/post-message/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const { message, chatIds } = await request.json();
    
    const accessToken = process.env.GROUPME_ACCESS_TOKEN;
    const messageIds: { [chatId: string]: string } = {};
    
    for (const chatId of chatIds) {
      const response = await fetch(
        `https://api.groupme.com/v3/groups/${chatId}/messages?token=${accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: {
              source_guid: `${Date.now()}-${Math.random()}`,
              text: message
            }
          })
        }
      );
      
      const data = await response.json();
      messageIds[chatId] = data.response.message.id;
    }
    
    return NextResponse.json({ success: true, messageIds });
  } catch (error) {
    console.error('GroupMe API error:', error);
    return NextResponse.json(
      { error: 'Failed to post message' },
      { status: 500 }
    );
  }
}
```

### Enhanced Event Creation Function

**File:** `src/lib/database.ts`

**Update `createEvent` function:**
```typescript
export const createEvent = async (
  event: ClubEvent,
  postToGroupMe: boolean = false,
  groupMeChats: string[] = []
): Promise<void> => {
  // Save event to Firestore
  await setDoc(doc(db, 'events', event.id), {
    ...event,
    date: Timestamp.fromDate(event.date),
    endDate: event.endDate ? Timestamp.fromDate(event.endDate) : null,
    registrationDeadline: event.registrationDeadline ? Timestamp.fromDate(event.registrationDeadline) : null,
    createdAt: Timestamp.fromDate(event.createdAt),
    updatedAt: Timestamp.fromDate(event.updatedAt),
    postToGroupMe,
    groupMeChats,
  });
  
  // If GroupMe posting is enabled, create event and post messages
  if (postToGroupMe && groupMeChats.length > 0) {
    try {
      // Create GroupMe calendar event
      const eventResponse = await fetch('/api/groupme/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, chatIds: groupMeChats })
      });
      
      const eventData = await eventResponse.json();
      
      // Post announcement message
      const message = formatEventMessage(event);
      const messageResponse = await fetch('/api/groupme/post-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, chatIds: groupMeChats })
      });
      
      const messageData = await messageResponse.json();
      
      // Update event with GroupMe IDs
      await updateDoc(doc(db, 'events', event.id), {
        groupMeEventId: Object.values(eventData.eventIds)[0], // Primary event ID
        groupMeMessageIds: messageData.messageIds,
        groupMeLastSynced: Timestamp.now(),
      });
    } catch (error) {
      console.error('GroupMe integration error:', error);
      // Store error but don't fail event creation
      await updateDoc(doc(db, 'events', event.id), {
        groupMeError: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};
```

### Message Formatting

**File:** `src/lib/groupme.ts` (new file)

```typescript
export function formatEventMessage(event: ClubEvent): string {
  const emoji = getEventEmoji(event.eventType);
  const dateStr = event.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = event.date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
  
  return `${emoji} New Event: ${event.name}

📅 ${dateStr} at ${timeStr}
📍 ${event.location}

${event.description}

${event.requiresRegistration ? '✅ Registration required' : ''}
${event.maxParticipants ? `👥 Limited to ${event.maxParticipants} participants` : ''}

Register now at: ${process.env.NEXT_PUBLIC_BASE_URL}/events/${event.id}`;
}

function getEventEmoji(eventType: EventType): string {
  const emojiMap: Record<EventType, string> = {
    tournament: '🏆',
    social_gathering: '🎉',
    workshop: '📚',
    meeting: '💼',
    stream: '📺',
    competition: '🎮',
    other: '📌',
  };
  return emojiMap[eventType] || '📌';
}
```

---

## ⚠️ Error Handling

### Failure Scenarios

1. **GroupMe API is down**
   - Event still created on website
   - Error logged in `groupMeError` field
   - Admin notified via toast message
   - Retry mechanism available

2. **Invalid access token**
   - Clear error message to admin
   - Link to token refresh instructions
   - Event creation not blocked

3. **Rate limiting**
   - Implement exponential backoff
   - Queue messages if needed
   - Notify admin of delays

4. **Network timeout**
   - Retry up to 3 times
   - Log failure
   - Allow manual retry from UI

### Retry Mechanism

**Add "Retry GroupMe Post" button to event details:**
```tsx
{event.groupMeError && (
  <Button
    variant="outline"
    onClick={() => retryGroupMePost(event.id)}
  >
    <RefreshCw className="h-4 w-4 mr-2" />
    Retry GroupMe Post
  </Button>
)}
```

---

## 📊 Permissions & Access Control

### Who Can Trigger GroupMe Posts?

**Recommended Roles:**
- President
- Co-President
- Head Admin
- Event Organizer (with approval)

**Permission Function:**

**File:** `src/lib/permissions.ts`

```typescript
export function canPostToGroupMe(userRoles: UserRole[]): boolean {
  return hasAnyRole(userRoles, [
    'president',
    'co_president',
    'head_admin',
    'event_organizer'
  ]);
}
```

### UI Conditional Rendering

```tsx
{canPostToGroupMe() && (
  <div className="space-y-4">
    {/* GroupMe integration UI */}
  </div>
)}
```

---

## 🚀 Implementation Phases

### Phase 1: Setup & Configuration (Week 1)
- [ ] Get GroupMe access token
- [ ] Set up environment variables
- [ ] Create GroupMe config collection
- [ ] Test API connectivity

### Phase 2: Core Integration (Week 2)
- [ ] Create API routes for GroupMe
- [ ] Update ClubEvent type
- [ ] Implement event creation with GroupMe
- [ ] Add UI controls to event form

### Phase 3: Sync & Updates (Week 3)
- [ ] Implement event update sync
- [ ] Implement event deletion sync
- [ ] Add error handling
- [ ] Add retry mechanism

### Phase 4: Testing & Polish (Week 4)
- [ ] Test all scenarios
- [ ] Add admin documentation
- [ ] Train admins on new feature
- [ ] Monitor for issues

---

## ✅ Recommendation

**Proceed with phased implementation starting with Phase 1.**

**Rationale:**
- Automates repetitive manual work
- Increases event visibility
- Maintains single source of truth
- Provides flexibility (optional per event)
- Graceful error handling

**Next Steps:**
1. Obtain GroupMe access token
2. Set up environment variables
3. Begin Phase 1 implementation
4. Test with non-production group first

---

**Document Status:** ✅ Ready for Review  
**Last Updated:** 2025-10-13  
**Author:** AI Assistant  
**Reviewers Needed:** President, Co-President, Development Team

