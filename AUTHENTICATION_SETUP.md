# Authentication & User Management Setup Guide

This guide will help you set up the complete authentication system for NourishSA using Supabase.

## Prerequisites

- Node.js 18+ installed
- Supabase account and project created
- Git repository cloned

## 1. Supabase Project Setup

### Create a new Supabase project:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### Configure Authentication:

1. In your Supabase dashboard, go to **Authentication > Settings**
2. Enable **Email confirmations** (recommended for production)
3. Configure **Site URL** to your local development URL (e.g., `http://localhost:5173`)
4. Add redirect URLs for OAuth (if using Google sign-in):
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/signin`

### Set up Google OAuth (Optional):

1. Go to **Authentication > Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials (Client ID and Secret)

## 2. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase project credentials.

## 3. Database Setup

### Run the migration:

1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref your-project-ref`
4. Run the migration: `supabase db push`

Or manually run the SQL from `supabase/migrations/001_create_profiles_table.sql` in your Supabase SQL editor.

## 4. Features Implemented

### ✅ User Registration & Login

- Email/password registration with role selection
- Email/password login
- Google OAuth integration
- Email verification (configurable)

### ✅ Role-Based Access Control

- **Donor**: Can donate surplus food
- **Recipient**: Can claim food from hubs
- **Volunteer**: Can help with distribution
- **Admin**: Full system access

### ✅ Session Management

- JWT-based authentication via Supabase
- Automatic session persistence
- Session state management with React Context

### ✅ User Profile Management

- Complete user profiles with contact information
- Profile editing capabilities
- Role-based profile restrictions

### ✅ Authorization Checks

- Protected routes based on authentication status
- Role-based route protection
- Automatic redirects for unauthorized access

## 5. Components Created

### Authentication Components:

- `AuthContext.tsx` - Main authentication context
- `SignInForm.tsx` - Sign-in form with Google OAuth
- `SignUpForm.tsx` - Registration form with role selection
- `UserProfile.tsx` - Profile management component
- `ProtectedRoute.tsx` - Route protection wrapper

### Database Schema:

- `profiles` table with role-based access
- Row Level Security (RLS) policies
- Automatic profile creation on user registration
- Indexes for performance optimization

## 6. Usage Examples

### Protecting Routes:

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Protect any route
<Route path="/admin" element={
  <ProtectedRoute requiredRole="admin">
    <AdminDashboard />
  </ProtectedRoute>
} />

// Protect donor-only routes
<Route path="/donate" element={
  <ProtectedRoute requiredRole="donor">
    <DonateForm />
  </ProtectedRoute>
} />
```

### Using Authentication in Components:

```tsx
import { useAuth } from "@/contexts/AuthContext";

const MyComponent = () => {
  const { user, profile, signOut, hasRole } = useAuth();

  if (!user) return <div>Please sign in</div>;

  return (
    <div>
      <h1>Welcome, {profile?.full_name}</h1>
      {hasRole("admin") && <AdminPanel />}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};
```

### Checking User Roles:

```tsx
const { isAdmin, isDonor, isRecipient, isVolunteer } = useAuth();

if (isAdmin) {
  // Show admin features
} else if (isDonor) {
  // Show donor features
}
```

## 7. Security Features

### Row Level Security (RLS):

- Users can only view/edit their own profiles
- Admins can view/edit all profiles
- Automatic profile creation on registration

### Authentication Security:

- Password hashing (handled by Supabase)
- JWT token management
- Session persistence
- Email verification

### Authorization Security:

- Role-based access control
- Protected route components
- Automatic redirects for unauthorized access

## 8. Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/signup` to test registration
3. Try signing in with the created account
4. Test role-based access by visiting protected routes
5. Test profile management at `/profile`

## 9. Production Considerations

### Environment Variables:

- Use production Supabase project
- Set up proper redirect URLs
- Configure email templates

### Security:

- Enable email verification
- Set up proper CORS policies
- Configure rate limiting
- Use HTTPS in production

### Database:

- Review and adjust RLS policies
- Set up database backups
- Monitor performance with indexes

## 10. Troubleshooting

### Common Issues:

**"Missing Supabase environment variables"**

- Check your `.env` file exists
- Verify variable names are correct
- Restart your development server

**"Authentication failed"**

- Check Supabase project settings
- Verify redirect URLs are correct
- Check browser console for errors

**"Database connection failed"**

- Verify Supabase project is active
- Check network connectivity
- Verify API keys are correct

**"Role-based access not working"**

- Check RLS policies are applied
- Verify user has correct role in database
- Check ProtectedRoute component usage

## Support

For additional help:

1. Check Supabase documentation
2. Review React Router documentation
3. Check browser console for errors
4. Verify all dependencies are installed

## Next Steps

After setting up authentication, consider implementing:

- Password reset functionality
- Email notifications
- User activity logging
- Advanced role permissions
- Multi-factor authentication
