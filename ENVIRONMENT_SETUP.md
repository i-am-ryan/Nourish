# Environment Setup Guide

This guide will help you set up the environment variables needed for the NourishSA authentication system.

## Prerequisites

1. A Supabase project (create one at [supabase.com](https://supabase.com))
2. Your project URL and anon key from Supabase

## Step 1: Create Environment File

Create a `.env` file in your project root (same level as `package.json`) with the following content:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 2: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## Step 3: Update Your .env File

Replace the placeholder values in your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Configure Supabase Authentication

In your Supabase dashboard:

1. Go to **Authentication** → **Settings**
2. Set **Site URL** to: `http://localhost:5173` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/signin`
   - `http://localhost:5173/signup`

## Step 5: Enable Email Confirmation (Recommended)

1. Go to **Authentication** → **Settings**
2. Enable **Enable email confirmations**
3. Customize email templates if desired

## Step 6: Set Up Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret

## Step 7: Run Database Migrations

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref your-project-ref`
4. Push migrations: `supabase db push`

Or manually run the SQL from `supabase/migrations/` in your Supabase SQL editor.

## Step 8: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:5173/signup`
3. Try creating a new account
4. Check your email for confirmation link
5. Test signing in

## Troubleshooting

### "Missing Supabase environment variables"
- Check that your `.env` file exists in the project root
- Verify variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your development server after creating/modifying `.env`

### "Authentication failed"
- Verify your Supabase project is active
- Check that your API keys are correct
- Ensure redirect URLs are properly configured

### "Database connection failed"
- Verify your Supabase project URL is correct
- Check that your anon key is valid
- Ensure your project is not paused

### Email confirmation not working
- Check that email confirmations are enabled in Supabase
- Verify the Site URL is set correctly
- Check your spam folder for confirmation emails

## Production Setup

For production deployment:

1. Update Site URL to your production domain
2. Add production redirect URLs
3. Use production Supabase project
4. Set up proper email templates
5. Configure CORS policies

## Security Notes

- Never commit your `.env` file to version control
- Use different Supabase projects for development and production
- Regularly rotate your API keys
- Monitor your Supabase usage and billing

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Check Supabase project status
4. Review the authentication logs in Supabase dashboard 