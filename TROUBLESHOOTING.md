# Troubleshooting: Profile Creation Failed

## Issue: "Account created but profile setup failed"

This error occurs when a user successfully registers but their profile isn't created in the database. Here's how to fix it:

## Quick Fix Steps

### 1. Run the Database Migration

First, apply the fix migration to your Supabase database:

**Option A: Using Supabase CLI**

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (replace with your project ref)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

**Option B: Manual SQL Execution**

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/002_fix_profile_creation.sql`
4. Click **Run**

### 2. Verify Environment Variables

Make sure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
```

### 3. Check Supabase Project Settings

1. **Authentication Settings:**

   - Go to **Authentication > Settings**
   - Ensure **Email confirmations** is enabled
   - Set **Site URL** to your development URL (e.g., `http://localhost:5173`)

2. **Database Settings:**
   - Go to **Database > Policies**
   - Verify RLS is enabled on the `profiles` table
   - Check that all policies are active

## Common Causes and Solutions

### Cause 1: Trigger Function Not Working

**Solution:** The migration `002_fix_profile_creation.sql` fixes this by:

- Recreating the trigger function with better error handling
- Adding proper permissions
- Including fallback profile creation in the frontend

### Cause 2: RLS Policies Blocking Insert

**Solution:** The migration adds a new policy:

```sql
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### Cause 3: Missing Permissions

**Solution:** The migration grants necessary permissions:

```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
```

## Testing the Fix

1. **Clear your browser data** (cookies, local storage)
2. **Restart your development server:**
   ```bash
   npm run dev
   ```
3. **Try registering a new user** at `/signup`
4. **Check the browser console** for any errors
5. **Verify in Supabase Dashboard:**
   - Go to **Authentication > Users** - should see the new user
   - Go to **Table Editor > profiles** - should see the user's profile

## Debugging Steps

### Check Supabase Logs

1. Go to **Logs** in your Supabase Dashboard
2. Look for any errors related to profile creation
3. Check for trigger function errors

### Test Database Connection

Add this to your browser console to test:

```javascript
// Test if you can access the profiles table
const { data, error } = await supabase.from("profiles").select("*").limit(1);
console.log("Test result:", { data, error });
```

### Verify Trigger Function

Run this in Supabase SQL Editor:

```sql
-- Check if trigger exists
SELECT
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

## Manual Profile Creation (Emergency Fix)

If the automatic profile creation still fails, you can manually create profiles:

1. **Get the user ID** from Supabase Authentication > Users
2. **Run this SQL** in the SQL Editor:

```sql
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
) VALUES (
    'user-id-from-auth',
    'user-email@example.com',
    'User Name',
    'recipient',
    NOW(),
    NOW()
);
```

## Prevention

To prevent this issue in the future:

1. **Always test migrations** in a development environment first
2. **Monitor Supabase logs** for trigger function errors
3. **Use the fallback profile creation** in the frontend (already implemented)
4. **Set up proper error monitoring** for production

## Still Having Issues?

If the problem persists:

1. **Check Supabase Status** at https://status.supabase.com
2. **Review your project's resource usage** (free tier limits)
3. **Contact Supabase Support** with your project details
4. **Share the specific error messages** from browser console and Supabase logs

## Alternative Solution

If the trigger approach continues to fail, you can disable automatic profile creation and rely on the frontend fallback:

1. **Disable the trigger:**

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

2. **The frontend will handle profile creation** automatically with the updated AuthContext code.

This approach is less elegant but more reliable for immediate fixes.
