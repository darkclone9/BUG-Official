# 🚀 Run Supabase Migration NOW - Quick Start

## ✅ Step 1: Run Database Migration (5 minutes)

### 1.1 Open Supabase SQL Editor

1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Select your project (nxnjhrbdhdijuaxiblfh)
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### 1.2 Copy and Run Migration SQL

1. Open the file: `supabase/migrations/000_run_all_migrations.sql`
2. Copy **ALL** the contents (Ctrl+A, Ctrl+C)
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for success message (should take 5-10 seconds)

### 1.3 Verify Tables Created

1. Click **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ users
   - ✅ user_profiles
   - ✅ tournaments
   - ✅ teams
   - ✅ matches
   - ✅ conversations
   - ✅ messages
   - ✅ products
   - ✅ orders
   - ✅ announcements
   - ✅ events

**If you see all 11 tables, you're good to go!** ✅

---

## ✅ Step 2: Set Up Storage Buckets (5 minutes)

### 2.1 Create Buckets

1. Click **Storage** in the left sidebar
2. Click **New bucket**

**Create these 4 buckets:**

#### Bucket 1: avatars
- Name: `avatars`
- Public bucket: ✅ **Yes**
- Click **Create bucket**

#### Bucket 2: banners
- Name: `banners`
- Public bucket: ✅ **Yes**
- Click **Create bucket**

#### Bucket 3: products
- Name: `products`
- Public bucket: ✅ **Yes**
- Click **Create bucket**

#### Bucket 4: tournaments
- Name: `tournaments`
- Public bucket: ✅ **Yes**
- Click **Create bucket**

### 2.2 Set Storage Policies

For **each bucket**, do the following:

1. Click on the bucket name
2. Click **Policies** tab
3. Click **New policy**
4. Select **For full customization**
5. Click **Get started**

**Add these 3 policies for EACH bucket:**

#### Policy 1: Public Read
```sql
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```
*(Change 'avatars' to the bucket name)*

#### Policy 2: Authenticated Upload
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);
```
*(Change 'avatars' to the bucket name)*

#### Policy 3: Users Update Own Files
```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```
*(Change 'avatars' to the bucket name)*

**Repeat for all 4 buckets!**

---

## ✅ Step 3: Configure Authentication (2 minutes)

### 3.1 Enable Email Auth

1. Click **Authentication** in the left sidebar
2. Click **Providers**
3. Find **Email** provider
4. Make sure it's **Enabled** ✅
5. Settings:
   - Confirm email: **Disabled** (for easier testing)
   - Secure email change: **Enabled**
6. Click **Save**

### 3.2 Configure Site URL

1. Click **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000`
3. Add **Redirect URLs**:
   - `http://localhost:3000`
   - `http://localhost:3000/auth/callback`
4. Click **Save**

---

## ✅ Step 4: Test Supabase Connection (2 minutes)

### 4.1 Restart Dev Server

```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

### 4.2 Test Connection

Open browser console and run:

```javascript
// Test Supabase connection
const { data, error } = await fetch('/api/test-supabase').then(r => r.json());
console.log('Supabase test:', data, error);
```

---

## 🎯 What's Next?

After completing these 4 steps, I'll:

1. **Create a test API route** to verify Supabase connection
2. **Export your Firebase data** to JSON files
3. **Create import scripts** to load data into Supabase
4. **Update AuthContext** to use Supabase Auth
5. **Update database.ts** with Supabase functions
6. **Update all components** to use Supabase
7. **Test everything** thoroughly
8. **Deploy** to production

---

## 📊 Progress Checklist

- [ ] Step 1: Run database migration SQL
- [ ] Step 2: Create 4 storage buckets
- [ ] Step 3: Set storage policies (12 total - 3 per bucket)
- [ ] Step 4: Enable email authentication
- [ ] Step 5: Configure site URL
- [ ] Step 6: Restart dev server

**Once you complete these steps, let me know and I'll continue with the code migration!** 🚀

---

## ⚠️ Troubleshooting

### Error: "relation already exists"
- This means tables are already created
- You can skip Step 1
- Or drop all tables and re-run

### Error: "permission denied"
- Make sure you're logged into the correct Supabase project
- Check that you're using the SQL Editor, not the Table Editor

### Storage policies not working
- Make sure bucket is set to **Public**
- Make sure you replaced 'avatars' with the correct bucket name in policies
- Try deleting and recreating the policy

### Can't connect to Supabase
- Check `.env.local` has correct credentials
- Restart dev server
- Check browser console for errors

---

## 💡 Quick Tips

- **SQL Editor**: Use Ctrl+Enter to run queries
- **Table Editor**: Click on table name to view data
- **Storage**: Click on bucket to see uploaded files
- **Logs**: Check **Logs** in sidebar for errors

---

**Ready? Let's do this!** 🎉

Start with Step 1 and let me know when you're done!

