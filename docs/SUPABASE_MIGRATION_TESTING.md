# Supabase Migration Testing & Debugging Guide

## 🎯 Overview

This guide will help you verify that the Supabase migration was completed successfully and identify any issues that need to be fixed.

---

## 📋 Pre-Testing Checklist

### **Supabase Project Information**
- **Project URL:** https://nxnjhrbdhdijuaxiblfh.supabase.co
- **Project ID:** nxnjhrbdhdijuaxiblfh
- **Dashboard:** https://supabase.com/dashboard/project/nxnjhrbdhdijuaxiblfh

### **Migration Files Created**
- ✅ `supabase/migrations/000_run_all_migrations.sql` - Complete migration (schema + RLS)
- ✅ `supabase/migrations/001_initial_schema.sql` - Schema only
- ✅ `supabase/migrations/002_row_level_security.sql` - RLS policies only
- ✅ `supabase/migrations/003_storage_policies.sql` - Storage bucket policies
- ✅ `.env.local` - Supabase credentials configured

---

## 🧪 Testing Steps

### **Step 1: Verify Database Migration**

#### **1.1 Check if Migration Ran**
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/nxnjhrbdhdijuaxiblfh
2. Navigate to **SQL Editor**
3. Click **New query**
4. Run this query to check if tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Result:** You should see these 11 tables:
- `announcements`
- `conversations`
- `events`
- `matches`
- `messages`
- `orders`
- `products`
- `teams`
- `tournaments`
- `user_profiles`
- `users`

#### **1.2 If Tables Don't Exist**
If you don't see the tables, you need to run the migration:

1. In SQL Editor, click **New query**
2. Open `supabase/migrations/000_run_all_migrations.sql` in your code editor
3. Copy **ALL** the contents
4. Paste into SQL Editor
5. Click **Run**
6. Wait for completion (may take 30-60 seconds)
7. Check for any error messages

---

### **Step 2: Verify Table Schemas**

Run these queries to verify each table was created correctly:

#### **2.1 Users Table**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Expected Columns:**
- `id` (uuid)
- `email` (text)
- `display_name` (text)
- `avatar_url` (text)
- `role` (text)
- `roles` (text[])
- `points` (integer)
- `weekly_points` (integer)
- `monthly_points` (integer)
- `elo_rating` (integer)
- `join_date` (timestamp)
- `last_login_date` (timestamp)
- `is_active` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### **2.2 User Profiles Table**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

#### **2.3 Quick Check All Tables**
```sql
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;
```

**Expected Column Counts:**
- `users`: ~15 columns
- `user_profiles`: ~10 columns
- `tournaments`: ~15 columns
- `teams`: ~10 columns
- `matches`: ~12 columns
- `conversations`: ~8 columns
- `messages`: ~8 columns
- `products`: ~15 columns
- `orders`: ~12 columns
- `announcements`: ~10 columns
- `events`: ~12 columns

---

### **Step 3: Verify Row Level Security (RLS)**

#### **3.1 Check if RLS is Enabled**
```sql
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected Result:** `rowsecurity` should be `true` for all tables

#### **3.2 Check RLS Policies**
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Result:** You should see multiple policies for each table (e.g., "Users can view public profiles", "Users can update own profile", etc.)

#### **3.3 Check Helper Functions**
```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_admin', 'is_president', 'is_conversation_participant')
ORDER BY routine_name;
```

**Expected Result:** All 3 functions should exist

---

### **Step 4: Verify Storage Buckets**

#### **4.1 Check Buckets Exist**
1. Go to **Storage** in Supabase Dashboard
2. You should see 4 buckets:
   - `avatars` (Public: Yes)
   - `banners` (Public: Yes)
   - `products` (Public: Yes)
   - `tournaments` (Public: Yes)

#### **4.2 If Buckets Don't Exist**
Create them manually:

1. Click **New bucket**
2. Create each bucket:
   - Name: `avatars`, Public: **Yes**
   - Name: `banners`, Public: **Yes**
   - Name: `products`, Public: **Yes**
   - Name: `tournaments`, Public: **Yes**

#### **4.3 Apply Storage Policies**
1. Go to **SQL Editor**
2. Click **New query**
3. Open `supabase/migrations/003_storage_policies.sql`
4. Copy **ALL** contents
5. Paste into SQL Editor
6. Click **Run**

#### **4.4 Verify Storage Policies**
1. Go to **Storage**
2. Click on `avatars` bucket
3. Click **Policies** tab
4. You should see 4 policies:
   - Public can view avatar files
   - Authenticated users can upload avatars
   - Users can update own avatar files
   - Users can delete own avatar files

Repeat for other buckets.

---

### **Step 5: Test Application Connection**

#### **5.1 Verify Environment Variables**
Check `.env.local` has these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nxnjhrbdhdijuaxiblfh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **5.2 Test Client Connection**
Create a test file: `test-supabase-connection.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error);
    } else {
      console.log('✅ Database connection successful!');
    }

    // Test storage connection
    const { data: buckets, error: storageError } = await supabase
      .storage
      .listBuckets();

    if (storageError) {
      console.error('❌ Storage connection failed:', storageError);
    } else {
      console.log('✅ Storage connection successful!');
      console.log('Buckets:', buckets.map(b => b.name));
    }
  } catch (err) {
    console.error('❌ Connection test failed:', err);
  }
}

testConnection();
```

Run: `npx tsx test-supabase-connection.ts`

---

## 🐛 Common Issues & Fixes

### **Issue 1: Tables Don't Exist**
**Cause:** Migration SQL wasn't run  
**Fix:** Run `000_run_all_migrations.sql` in SQL Editor

### **Issue 2: RLS Policies Missing**
**Cause:** RLS portion of migration failed  
**Fix:** Run `002_row_level_security.sql` separately

### **Issue 3: Storage Buckets Don't Exist**
**Cause:** Buckets must be created manually  
**Fix:** Create buckets via Storage UI, then run `003_storage_policies.sql`

### **Issue 4: Connection Fails**
**Cause:** Wrong credentials in `.env.local`  
**Fix:** Verify credentials match Supabase dashboard

### **Issue 5: RLS Blocks All Queries**
**Cause:** RLS is too restrictive or helper functions missing  
**Fix:** Check helper functions exist, verify RLS policies

---

## 📊 Migration Status Report Template

After testing, document your findings:

```markdown
# Supabase Migration Status Report

**Date:** [Date]
**Tested By:** [Your Name]

## Database Migration
- [ ] All 11 tables created
- [ ] Table schemas correct
- [ ] Indexes created
- [ ] Triggers created

## Row Level Security
- [ ] RLS enabled on all tables
- [ ] Helper functions exist
- [ ] Policies active and working

## Storage
- [ ] 4 buckets created
- [ ] Buckets set to public
- [ ] Storage policies applied

## Application Connection
- [ ] Environment variables correct
- [ ] Client connection works
- [ ] Server connection works

## Issues Found
1. [List any issues]
2. [List any issues]

## Next Steps
- [ ] Fix identified issues
- [ ] Export data from Firebase
- [ ] Import data to Supabase
- [ ] Update application code
- [ ] Test application features
```

---

## ✅ Success Criteria

Migration is successful when:

1. ✅ All 11 tables exist in Supabase
2. ✅ RLS is enabled and policies are active
3. ✅ All 4 storage buckets exist with policies
4. ✅ Application can connect to Supabase
5. ✅ No errors in SQL Editor
6. ✅ Test queries return expected results

---

## 🚀 Next Steps After Successful Migration

1. **Export Firebase Data**
   - Export users, tournaments, products, etc.
   - Use Firebase Admin SDK or Firestore export

2. **Import to Supabase**
   - Transform data to match Supabase schema
   - Import using Supabase client

3. **Update Application Code**
   - Replace Firebase calls with Supabase calls
   - Update authentication flow
   - Update storage uploads

4. **Test Everything**
   - Test user registration/login
   - Test data CRUD operations
   - Test file uploads
   - Test real-time features

5. **Deploy**
   - Deploy to production
   - Monitor for issues
   - Keep Firebase as backup initially

---

## 📞 Need Help?

If you encounter issues:

1. Check Supabase logs in Dashboard
2. Check browser console for errors
3. Review migration SQL for syntax errors
4. Consult Supabase documentation
5. Ask for help with specific error messages

---

**Good luck with the migration testing!** 🎉

