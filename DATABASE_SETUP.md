# Database Setup Guide for NourishSA

This guide will help you set up the complete database schema for your NourishSA platform using Supabase.

## 🗄️ Database Schema Overview

The NourishSA database includes **13 main tables** designed to support all platform features:

### Core Tables
1. **`profiles`** - Enhanced user profiles with role-based access
2. **`locations`** - City/suburb data for geolocation
3. **`donations`** - Food donation listings
4. **`claims`** - Food claim requests
5. **`volunteer_tasks`** - Volunteer task management
6. **`volunteer_applications`** - Volunteer applications for tasks
7. **`food_hubs`** - Food hub information
8. **`hub_inventory`** - Food hub inventory management
9. **`ai_matches`** - AI matching history
10. **`announcements`** - Admin announcements
11. **`notifications`** - User notifications
12. **`audit_logs`** - System audit trail
13. **`statistics`** - Cached dashboard statistics

## 🚀 Quick Setup

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Run the migration:**
   ```bash
   supabase db push
   ```

### Option 2: Manual SQL Execution

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/003_create_complete_database_schema.sql`
4. Execute the SQL

## 📊 Table Details

### 1. Profiles Table
```sql
-- Enhanced user profiles with role-based access
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'recipient' CHECK (role IN ('donor', 'recipient', 'volunteer', 'admin')),
    city TEXT NOT NULL,
    suburb TEXT,
    business_name TEXT, -- For donors
    organization_type TEXT, -- For recipients
    verification_status TEXT DEFAULT 'pending',
    is_active BOOLEAN DEFAULT true,
    -- ... other fields
);
```

### 2. Donations Table
```sql
-- Food donation listings
CREATE TABLE public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    food_type TEXT NOT NULL,
    quantity TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    city TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    ai_matched_recipients UUID[],
    -- ... other fields
);
```

### 3. Claims Table
```sql
-- Food claim requests
CREATE TABLE public.claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending',
    -- ... other fields
    UNIQUE(donation_id, recipient_id) -- Prevent duplicate claims
);
```

## 🔐 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

- **Profiles**: Users can only view/edit their own profile, admins can view all
- **Donations**: Public viewing, donors can edit their own donations
- **Claims**: Recipients can view their claims, donors can view claims on their donations
- **Volunteer Tasks**: Public viewing, admins can manage all tasks
- **Notifications**: Users can only view their own notifications

### Example RLS Policy:
```sql
-- Users can view all donations
CREATE POLICY "Users can view all donations" ON public.donations 
FOR SELECT USING (true);

-- Donors can create donations
CREATE POLICY "Donors can create donations" ON public.donations 
FOR INSERT WITH CHECK (auth.uid() = donor_id);
```

## 📈 Performance Optimizations

### Indexes
The schema includes strategic indexes for optimal performance:

```sql
-- Donations indexes
CREATE INDEX idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX idx_donations_status ON public.donations(status);
CREATE INDEX idx_donations_city ON public.donations(city);
CREATE INDEX idx_donations_expiry_date ON public.donations(expiry_date);

-- Claims indexes
CREATE INDEX idx_claims_donation_id ON public.claims(donation_id);
CREATE INDEX idx_claims_recipient_id ON public.claims(recipient_id);
CREATE INDEX idx_claims_status ON public.claims(status);
```

### Triggers
Automatic timestamp updates:
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 🤖 AI Matching System

### AI Matches Table
```sql
CREATE TABLE public.ai_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    match_score DECIMAL(3,2), -- 0.00 to 1.00
    match_reason TEXT, -- Why this match was made
    distance_km DECIMAL(8,2),
    is_notified BOOLEAN DEFAULT false,
    -- ... other fields
);
```

## 📱 Notification System

### Notifications Table
```sql
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('donation_match', 'claim_update', 'task_assignment', 'announcement', 'system')),
    is_read BOOLEAN DEFAULT false,
    related_entity_type TEXT,
    related_entity_id UUID,
    -- ... other fields
);
```

## 🔍 Audit Trail

### Audit Logs Table
```sql
CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    -- ... other fields
);
```

## 📊 Sample Data

The migration includes sample data for testing:

```sql
-- Sample locations
INSERT INTO public.locations (city, suburb, province) VALUES
('Johannesburg', 'Sandton', 'Gauteng'),
('Cape Town', 'Sea Point', 'Western Cape'),
('Durban', 'Berea', 'KwaZulu-Natal');

-- Sample food hubs
INSERT INTO public.food_hubs (name, description, city, suburb, address) VALUES
('Sandton Community Hub', 'Central food distribution hub in Sandton', 'Johannesburg', 'Sandton', '123 Rivonia Road, Sandton');

-- Sample statistics
INSERT INTO public.statistics (stat_name, stat_value) VALUES
('total_donations', '{"value": 0, "last_updated": "2024-01-01T00:00:00Z"}'),
('total_claims', '{"value": 0, "last_updated": "2024-01-01T00:00:00Z"}');
```

## 🛠️ Testing the Setup

### 1. Verify Tables Created
```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. Test RLS Policies
```sql
-- Test profile access
SELECT * FROM public.profiles WHERE id = auth.uid();

-- Test donation access
SELECT * FROM public.donations LIMIT 5;
```

### 3. Test Triggers
```sql
-- Test updated_at trigger
UPDATE public.profiles 
SET full_name = 'Test User' 
WHERE id = auth.uid();
```

## 🔧 Troubleshooting

### Common Issues

**1. "Permission denied" errors**
- Ensure RLS policies are correctly configured
- Check user authentication status
- Verify user role permissions

**2. "Foreign key constraint" errors**
- Ensure referenced tables exist
- Check that referenced IDs are valid
- Verify cascade delete settings

**3. "Index already exists" errors**
- Drop existing indexes before recreating
- Use `CREATE INDEX IF NOT EXISTS` for safety

### Debugging RLS
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📋 Next Steps

After setting up the database:

1. **Configure Authentication:**
   - Set up email confirmations
   - Configure OAuth providers (Google)
   - Set up redirect URLs

2. **Set up Storage:**
   - Create storage buckets for images
   - Configure storage policies

3. **Create Edge Functions:**
   - AI matching logic
   - Notification sending
   - Statistics calculation

4. **Test the System:**
   - Create test users with different roles
   - Test donation creation and claiming
   - Verify notifications work

## 📞 Support

If you encounter issues:

1. Check Supabase logs in the dashboard
2. Verify all environment variables are set
3. Test database connections
4. Review RLS policies
5. Check browser console for errors

## 🔄 Migration Updates

To update the database schema in the future:

1. Create a new migration file
2. Test locally first
3. Deploy to staging environment
4. Deploy to production
5. Update TypeScript types

---

**Note**: This database schema is designed to be scalable and secure. All tables include proper indexing, RLS policies, and audit trails for production use. 