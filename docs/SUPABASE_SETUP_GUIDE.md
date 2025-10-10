# Supabase Setup Guide - Step by Step

## 🎯 Goal
Migrate from Firebase to Supabase to save $25-50+/month in database costs.

## 📋 Prerequisites
- ✅ Supabase project created
- ✅ Password: `LastOfUs1883@!#$`
- ⏳ Need to get API credentials

---

## Step 1: Get Supabase Credentials

### 1.1 Access Your Project
1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Sign in
3. Select your BUG Gaming Club project

### 1.2 Get API Keys
1. Click **Settings** (⚙️) in left sidebar
2. Click **API**
3. Copy these values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **service_role key:** (⚠️ Keep secret!)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 1.3 Get Database URL
1. Still in Settings, click **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with `LastOfUs1883@!#$`

---

## Step 2: Update Environment Variables

Once you provide the credentials, I'll update `.env.local` with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres.xxxxxxxxxxxxx:LastOfUs1883@!#$@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## Step 3: Run Database Migrations

### 3.1 Using Supabase Dashboard (Easiest)

1. In your Supabase project, click **SQL Editor** in left sidebar
2. Click **New query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for success message

7. Create another new query
8. Copy the contents of `supabase/migrations/002_row_level_security.sql`
9. Paste and run

### 3.2 Verify Tables Created

1. Click **Table Editor** in left sidebar
2. You should see all these tables:
   - users
   - user_profiles
   - tournaments
   - teams
   - matches
   - conversations
   - messages
   - products
   - orders
   - announcements
   - events

---

## Step 4: Set Up Storage Buckets

### 4.1 Create Storage Buckets

1. Click **Storage** in left sidebar
2. Click **New bucket**
3. Create these buckets:

   **Bucket 1: avatars**
   - Name: `avatars`
   - Public: ✅ Yes
   - File size limit: 5 MB
   - Allowed MIME types: `image/*`

   **Bucket 2: banners**
   - Name: `banners`
   - Public: ✅ Yes
   - File size limit: 10 MB
   - Allowed MIME types: `image/*`

   **Bucket 3: products**
   - Name: `products`
   - Public: ✅ Yes
   - File size limit: 10 MB
   - Allowed MIME types: `image/*`

   **Bucket 4: tournaments**
   - Name: `tournaments`
   - Public: ✅ Yes
   - File size limit: 10 MB
   - Allowed MIME types: `image/*`

### 4.2 Set Storage Policies

For each bucket, add these policies:

**Policy 1: Public Read**
```sql
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Users can update own files**
```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

Repeat for each bucket (change `'avatars'` to bucket name).

---

## Step 5: Enable Authentication

### 5.1 Configure Auth Providers

1. Click **Authentication** in left sidebar
2. Click **Providers**
3. Enable these providers:

   **Email:**
   - ✅ Enable Email provider
   - ✅ Confirm email: Optional (or required)
   - ✅ Secure email change: Enabled

   **Google (Optional):**
   - Enable if you want Google sign-in
   - Add OAuth credentials

### 5.2 Configure Email Templates

1. Click **Email Templates**
2. Customize:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

---

## Step 6: Export Data from Firebase

### 6.1 Export Collections

I'll create a script to export your Firebase data:

```bash
npm run export-firebase
```

This will create JSON files in `firebase-export/`:
- `users.json`
- `tournaments.json`
- `messages.json`
- `products.json`
- etc.

### 6.2 Transform Data

The script will also transform the data to match Supabase schema.

---

## Step 7: Import Data to Supabase

### 7.1 Using SQL Editor

1. Go to **SQL Editor**
2. Run the import script I'll generate
3. Verify data imported correctly

### 7.2 Verify Import

1. Go to **Table Editor**
2. Click on each table
3. Verify data is present

---

## Step 8: Update Application Code

I'll update all the code to use Supabase instead of Firebase:

### Files to Update:
- ✅ `src/lib/supabase/client.ts` - Already created
- ✅ `src/lib/supabase/server.ts` - Already created
- ⏳ `src/contexts/AuthContext.tsx` - Update to use Supabase Auth
- ⏳ `src/lib/database.ts` - Update all database functions
- ⏳ All components using Firebase

---

## Step 9: Test Everything

### 9.1 Test Authentication
- Sign up new user
- Sign in
- Sign out
- Password reset

### 9.2 Test Database Operations
- Create/read/update/delete users
- Create tournaments
- Send messages
- Create orders

### 9.3 Test Storage
- Upload avatar
- Upload banner
- View uploaded files

### 9.4 Test Real-time
- Send message
- Verify real-time update
- Test presence

---

## Step 10: Deploy

### 10.1 Update Production Environment Variables

Add Supabase credentials to your production environment (Vercel, etc.):
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 10.2 Deploy Application

```bash
git add .
git commit -m "feat: Migrate from Firebase to Supabase"
git push origin main
```

---

## 📊 Cost Comparison

### Before (Firebase)
- **Free tier limits:** 50K reads/day, 20K writes/day
- **Overage costs:** $0.06 per 100K reads, $0.18 per 100K writes
- **Estimated monthly cost:** $25-50+

### After (Supabase)
- **Free tier limits:** 500MB database, unlimited API requests
- **Overage costs:** None on free tier
- **Estimated monthly cost:** $0 (free tier) or $25 (Pro tier with 8GB)

### Savings: $25-50+/month! 🎉

---

## 🚀 Next Steps

**What I need from you:**

1. **Provide Supabase credentials:**
   - Project URL
   - Anon key
   - Service role key
   - Database connection string

2. **I'll then:**
   - Update `.env.local`
   - Run database migrations
   - Set up storage buckets
   - Export Firebase data
   - Import to Supabase
   - Update all application code
   - Test everything
   - Deploy

**Ready to proceed?** Please provide your Supabase credentials and I'll handle the rest! 🚀

