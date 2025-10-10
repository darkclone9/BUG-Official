# Firebase to Supabase Migration Guide

## Overview
This guide covers the complete migration from Firebase to Supabase for the BUG Gaming Club website.

## Why Supabase?

### Cost Comparison
**Firebase Free Tier:**
- 50,000 document reads/day
- 20,000 document writes/day
- 20,000 document deletes/day
- 1 GB storage
- Quickly becomes expensive with real-time features

**Supabase Free Tier:**
- 500 MB database space
- Unlimited API requests
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users
- Real-time subscriptions included
- Much more predictable pricing

### Feature Comparison
| Feature | Firebase | Supabase |
|---------|----------|----------|
| Database | NoSQL (Firestore) | PostgreSQL (SQL) |
| Auth | Firebase Auth | Supabase Auth (built on GoTrue) |
| Storage | Cloud Storage | S3-compatible storage |
| Real-time | Firestore listeners | PostgreSQL real-time |
| Functions | Cloud Functions | Edge Functions (Deno) |
| Pricing | Pay-per-use (expensive) | Predictable tiers |

## Migration Steps

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Project Settings** → **API**
4. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (for client-side)
   - **service_role key** (for server-side, keep secret!)
5. Go to **Project Settings** → **Database**
6. Copy the **Connection String** (for direct database access)

### Step 2: Install Supabase Client

```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
```

### Step 3: Update Environment Variables

Create/update `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_PASSWORD=LastOfUs1883@!#$

# Keep Firebase for gradual migration (optional)
# NEXT_PUBLIC_FIREBASE_API_KEY=...
```

### Step 4: Database Schema Migration

#### Firebase Collections → Supabase Tables

**Users Collection:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid TEXT UNIQUE NOT NULL, -- Firebase UID for migration
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  pronouns TEXT,
  location TEXT,
  timezone TEXT,
  custom_status TEXT,
  theme_color TEXT DEFAULT '#3b82f6',
  points INTEGER DEFAULT 0,
  role TEXT DEFAULT 'member',
  roles TEXT[] DEFAULT ARRAY['member'],
  is_active BOOLEAN DEFAULT true,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ,
  join_date TIMESTAMPTZ DEFAULT NOW(),
  last_login_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = uid);
```

**Tournaments Collection:**
```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  game TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  status TEXT DEFAULT 'upcoming',
  prize_pool TEXT,
  rules TEXT,
  format TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Admins can manage tournaments" ON tournaments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND 'admin' = ANY(roles)
  )
);
```

**Messages Collection:**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'direct', 'tournament', 'team', 'match'
  participant_ids TEXT[] NOT NULL,
  tournament_id UUID REFERENCES tournaments(id),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  attachments JSONB,
  mentions TEXT[],
  reactions JSONB,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_conversations_participants ON conversations USING GIN(participant_ids);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
```

### Step 5: Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for Next.js components
export const createSupabaseClient = () => createClientComponentClient();

// Admin client (server-side only)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

### Step 6: Migration Strategy

**Option A: Big Bang Migration (Recommended for small apps)**
1. Export all Firebase data
2. Transform to Supabase schema
3. Import to Supabase
4. Update all code
5. Switch over

**Option B: Gradual Migration**
1. Set up Supabase alongside Firebase
2. Migrate one feature at a time
3. Dual-write to both databases
4. Gradually move reads to Supabase
5. Deprecate Firebase

### Step 7: Data Export from Firebase

Create `scripts/export-firebase-data.ts`:

```typescript
// Export all collections to JSON files
// Then transform and import to Supabase
```

## Next Steps

1. ✅ Create Supabase project
2. ⏳ Get API credentials
3. ⏳ Run database schema migrations
4. ⏳ Export Firebase data
5. ⏳ Import to Supabase
6. ⏳ Update application code
7. ⏳ Test thoroughly
8. ⏳ Deploy

## Cost Savings

**Current Firebase (estimated):**
- $25-50/month for moderate usage

**Supabase Free Tier:**
- $0/month for up to 500MB database
- $25/month for Pro tier (8GB database, more bandwidth)

**Potential Savings:** $25-50/month or more!

