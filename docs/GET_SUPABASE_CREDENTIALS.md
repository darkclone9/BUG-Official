# How to Get Your Supabase Credentials

## Step 1: Access Your Supabase Project

1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Sign in with your account
3. Select your BUG Gaming Club project

## Step 2: Get API Credentials

### Project URL and API Keys

1. In your project dashboard, click on the **Settings** icon (⚙️) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   Copy this entire URL

   **API Keys:**
   - **anon/public key** - This is safe to use in the browser
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
     ```
   
   - **service_role key** - ⚠️ **KEEP THIS SECRET!** Never expose in client code
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
     ```

## Step 3: Get Database Connection String

1. Still in **Settings**, click on **Database** in the left menu
2. Scroll down to **Connection string**
3. Select the **URI** tab
4. Copy the connection string (it will look like):
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with: `LastOfUs1883@!#$`

## Step 4: Update .env.local

Once you have all the credentials, I'll update your `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres.xxxxxxxxxxxxx:LastOfUs1883@!#$@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## What I Need From You

Please provide:
1. ✅ Project URL (starts with `https://` and ends with `.supabase.co`)
2. ✅ Anon/Public Key (the long JWT token)
3. ✅ Service Role Key (the long JWT token - keep secret!)
4. ✅ Database Connection String (with password already filled in)

## Security Notes

- ✅ The **anon key** is safe to use in browser/client code
- ⚠️ The **service_role key** should ONLY be used in server-side code
- ⚠️ Never commit the service_role key to git
- ✅ The `.env.local` file is already in `.gitignore`

## Next Steps

Once you provide these credentials, I will:
1. Update your `.env.local` file
2. Create the Supabase client configuration
3. Set up the database schema
4. Create migration scripts to move data from Firebase
5. Update all application code to use Supabase

This will save you $25-50+ per month in database costs! 🎉

