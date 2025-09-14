-- Complete Database Schema for NourishSA Platform
-- This migration creates all necessary tables for the full application

-- =====================================================
-- 1. ENHANCED PROFILES TABLE (Updated)
-- =====================================================

-- Drop existing profiles table if it exists
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create enhanced profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'recipient' CHECK (role IN ('donor', 'recipient', 'volunteer', 'admin')),
    phone TEXT,
    address TEXT,
    city TEXT NOT NULL,
    suburb TEXT,
    business_name TEXT, -- For donors
    organization_type TEXT, -- For recipients (orphanage, shelter, etc.)
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. LOCATIONS TABLE
-- =====================================================

CREATE TABLE public.locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city TEXT NOT NULL,
    suburb TEXT,
    province TEXT,
    country TEXT DEFAULT 'South Africa',
    coordinates POINT, -- For geolocation
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. FOOD DONATIONS TABLE
-- =====================================================

CREATE TABLE public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    food_type TEXT NOT NULL, -- (fresh, canned, frozen, etc.)
    quantity TEXT NOT NULL, -- (e.g., "5kg", "10 cans", "2 boxes")
    expiry_date DATE NOT NULL,
    pickup_location TEXT NOT NULL,
    city TEXT NOT NULL,
    suburb TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    images TEXT[], -- Array of image URLs
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'expired', 'cancelled')),
    ai_matched_recipients UUID[], -- Array of recipient IDs that AI matched
    is_urgent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. FOOD CLAIMS TABLE
-- =====================================================

CREATE TABLE public.claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    claim_message TEXT,
    admin_notes TEXT,
    pickup_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(donation_id, recipient_id) -- Prevent duplicate claims
);

-- =====================================================
-- 5. VOLUNTEER TASKS TABLE
-- =====================================================

CREATE TABLE public.volunteer_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('pickup', 'delivery', 'sorting', 'distribution', 'other')),
    city TEXT NOT NULL,
    suburb TEXT,
    address TEXT,
    required_skills TEXT[],
    estimated_duration INTEGER, -- in minutes
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. VOLUNTEER APPLICATIONS TABLE
-- =====================================================

CREATE TABLE public.volunteer_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    volunteer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.volunteer_tasks(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    availability_notes TEXT,
    skills TEXT[],
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'expert')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(volunteer_id, task_id) -- Prevent duplicate applications
);

-- =====================================================
-- 7. FOOD HUBS TABLE
-- =====================================================

CREATE TABLE public.food_hubs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    suburb TEXT,
    address TEXT NOT NULL,
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    operating_hours TEXT,
    logo_url TEXT,
    images TEXT[],
    is_active BOOLEAN DEFAULT true,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. FOOD HUB INVENTORY TABLE
-- =====================================================

CREATE TABLE public.hub_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hub_id UUID REFERENCES public.food_hubs(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    description TEXT,
    quantity TEXT NOT NULL,
    food_type TEXT NOT NULL,
    expiry_date DATE,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'distributed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. AI MATCHING HISTORY TABLE
-- =====================================================

CREATE TABLE public.ai_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    match_score DECIMAL(3,2), -- 0.00 to 1.00
    match_reason TEXT, -- Why this match was made
    distance_km DECIMAL(8,2),
    is_notified BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. ADMIN ANNOUNCEMENTS TABLE
-- =====================================================

CREATE TABLE public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'urgent', 'maintenance', 'update')),
    target_audience TEXT[] DEFAULT ARRAY['all'], -- ['all', 'donors', 'recipients', 'volunteers']
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('donation_match', 'claim_update', 'task_assignment', 'announcement', 'system')),
    is_read BOOLEAN DEFAULT false,
    related_entity_type TEXT, -- 'donation', 'claim', 'task', etc.
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'donation', 'claim', 'profile', etc.
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. STATISTICS TABLE (for caching dashboard stats)
-- =====================================================

CREATE TABLE public.statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stat_name TEXT NOT NULL UNIQUE,
    stat_value JSONB NOT NULL,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_profiles_verification_status ON public.profiles(verification_status);

-- Donations indexes
CREATE INDEX idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX idx_donations_status ON public.donations(status);
CREATE INDEX idx_donations_city ON public.donations(city);
CREATE INDEX idx_donations_expiry_date ON public.donations(expiry_date);
CREATE INDEX idx_donations_created_at ON public.donations(created_at);

-- Claims indexes
CREATE INDEX idx_claims_donation_id ON public.claims(donation_id);
CREATE INDEX idx_claims_recipient_id ON public.claims(recipient_id);
CREATE INDEX idx_claims_status ON public.claims(status);

-- Volunteer tasks indexes
CREATE INDEX idx_volunteer_tasks_status ON public.volunteer_tasks(status);
CREATE INDEX idx_volunteer_tasks_city ON public.volunteer_tasks(city);
CREATE INDEX idx_volunteer_tasks_assigned_to ON public.volunteer_tasks(assigned_to);

-- Food hubs indexes
CREATE INDEX idx_food_hubs_city ON public.food_hubs(city);
CREATE INDEX idx_food_hubs_is_active ON public.food_hubs(is_active);

-- AI matches indexes
CREATE INDEX idx_ai_matches_donation_id ON public.ai_matches(donation_id);
CREATE INDEX idx_ai_matches_recipient_id ON public.ai_matches(recipient_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_volunteer_tasks_updated_at BEFORE UPDATE ON public.volunteer_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_volunteer_applications_updated_at BEFORE UPDATE ON public.volunteer_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_hubs_updated_at BEFORE UPDATE ON public.food_hubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hub_inventory_updated_at BEFORE UPDATE ON public.hub_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Donations policies
CREATE POLICY "Users can view all donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Donors can create donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Donors can update own donations" ON public.donations FOR UPDATE USING (auth.uid() = donor_id);
CREATE POLICY "Admins can manage all donations" ON public.donations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Claims policies
CREATE POLICY "Users can view claims" ON public.claims FOR SELECT USING (
    auth.uid() = recipient_id OR 
    EXISTS (SELECT 1 FROM public.donations WHERE id = donation_id AND donor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Recipients can create claims" ON public.claims FOR INSERT WITH CHECK (
    auth.uid() = recipient_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'recipient')
);
CREATE POLICY "Admins can manage all claims" ON public.claims FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Volunteer tasks policies
CREATE POLICY "Users can view volunteer tasks" ON public.volunteer_tasks FOR SELECT USING (true);
CREATE POLICY "Admins can manage volunteer tasks" ON public.volunteer_tasks FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Assigned volunteers can update tasks" ON public.volunteer_tasks FOR UPDATE USING (auth.uid() = assigned_to);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Announcements policies
CREATE POLICY "Users can view active announcements" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert sample locations
INSERT INTO public.locations (city, suburb, province) VALUES
('Johannesburg', 'Sandton', 'Gauteng'),
('Johannesburg', 'Rosebank', 'Gauteng'),
('Cape Town', 'Sea Point', 'Western Cape'),
('Cape Town', 'Observatory', 'Western Cape'),
('Durban', 'Berea', 'KwaZulu-Natal'),
('Pretoria', 'Hatfield', 'Gauteng');

-- Insert sample food hubs
INSERT INTO public.food_hubs (name, description, city, suburb, address, contact_person, contact_phone, contact_email) VALUES
('Sandton Community Hub', 'Central food distribution hub in Sandton', 'Johannesburg', 'Sandton', '123 Rivonia Road, Sandton', 'Sarah Johnson', '+27 11 234 5678', 'sarah@sandtonhub.org'),
('Cape Town Central Hub', 'Main distribution center for Cape Town area', 'Cape Town', 'Sea Point', '456 Main Road, Sea Point', 'David Smith', '+27 21 345 6789', 'david@capetownhub.org');

-- Insert sample statistics
INSERT INTO public.statistics (stat_name, stat_value) VALUES
('total_donations', '{"value": 0, "last_updated": "2024-01-01T00:00:00Z"}'),
('total_claims', '{"value": 0, "last_updated": "2024-01-01T00:00:00Z"}'),
('active_volunteers', '{"value": 0, "last_updated": "2024-01-01T00:00:00Z"}'),
('total_recipients', '{"value": 0, "last_updated": "2024-01-01T00:00:00Z"}');

-- =====================================================
-- CREATE UPDATED PROFILE TRIGGER
-- =====================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile with better error handling
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        role,
        city,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'recipient'),
        COALESCE(NEW.raw_user_meta_data->>'city', ''),
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error (you can check this in Supabase logs)
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 