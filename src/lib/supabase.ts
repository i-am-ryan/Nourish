import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility function to clear any existing session data with improved error handling
export const clearExistingSession = async () => {
  try {
    console.log('Clearing any existing session data...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Warning: Failed to clear existing session:', error.message);
    } else {
      console.log('Session data cleared successfully');
    }
  } catch (error) {
    console.error('Error clearing session data:', error);
    // Continue even if signOut fails to avoid blocking authentication
  }
};

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: 'donor' | 'recipient' | 'volunteer' | 'admin';
          phone: string | null;
          address: string | null;
          city: string;
          suburb: string | null;
          business_name: string | null;
          organization_type: string | null;
          verification_status: 'pending' | 'verified' | 'rejected';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          role?: 'donor' | 'recipient' | 'volunteer' | 'admin';
          phone?: string | null;
          address?: string | null;
          city: string;
          suburb?: string | null;
          business_name?: string | null;
          organization_type?: string | null;
          verification_status?: 'pending' | 'verified' | 'rejected';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: 'donor' | 'recipient' | 'volunteer' | 'admin';
          phone?: string | null;
          address?: string | null;
          city?: string;
          suburb?: string | null;
          business_name?: string | null;
          organization_type?: string | null;
          verification_status?: 'pending' | 'verified' | 'rejected';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          city: string;
          suburb: string | null;
          province: string | null;
          country: string;
          coordinates: unknown | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          city: string;
          suburb?: string | null;
          province?: string | null;
          country?: string;
          coordinates?: unknown | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          city?: string;
          suburb?: string | null;
          province?: string | null;
          country?: string;
          coordinates?: unknown | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          donor_id: string;
          title: string;
          description: string | null;
          food_type: string;
          quantity: string;
          expiry_date: string;
          pickup_location: string;
          city: string;
          suburb: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          images: string[] | null;
          status: 'available' | 'claimed' | 'expired' | 'cancelled';
          ai_matched_recipients: string[] | null;
          is_urgent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          donor_id: string;
          title: string;
          description?: string | null;
          food_type: string;
          quantity: string;
          expiry_date: string;
          pickup_location: string;
          city: string;
          suburb?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          images?: string[] | null;
          status?: 'available' | 'claimed' | 'expired' | 'cancelled';
          ai_matched_recipients?: string[] | null;
          is_urgent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string;
          title?: string;
          description?: string | null;
          food_type?: string;
          quantity?: string;
          expiry_date?: string;
          pickup_location?: string;
          city?: string;
          suburb?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          images?: string[] | null;
          status?: 'available' | 'claimed' | 'expired' | 'cancelled';
          ai_matched_recipients?: string[] | null;
          is_urgent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      claims: {
        Row: {
          id: string;
          donation_id: string;
          recipient_id: string;
          status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
          claim_message: string | null;
          admin_notes: string | null;
          pickup_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          donation_id: string;
          recipient_id: string;
          status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
          claim_message?: string | null;
          admin_notes?: string | null;
          pickup_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          donation_id?: string;
          recipient_id?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
          claim_message?: string | null;
          admin_notes?: string | null;
          pickup_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      volunteer_tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          task_type: 'pickup' | 'delivery' | 'sorting' | 'distribution' | 'other';
          city: string;
          suburb: string | null;
          address: string | null;
          required_skills: string[] | null;
          estimated_duration: number | null;
          status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          created_by: string | null;
          assigned_to: string | null;
          scheduled_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          task_type: 'pickup' | 'delivery' | 'sorting' | 'distribution' | 'other';
          city: string;
          suburb?: string | null;
          address?: string | null;
          required_skills?: string[] | null;
          estimated_duration?: number | null;
          status?: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          created_by?: string | null;
          assigned_to?: string | null;
          scheduled_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          task_type?: 'pickup' | 'delivery' | 'sorting' | 'distribution' | 'other';
          city?: string;
          suburb?: string | null;
          address?: string | null;
          required_skills?: string[] | null;
          estimated_duration?: number | null;
          status?: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          created_by?: string | null;
          assigned_to?: string | null;
          scheduled_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      volunteer_applications: {
        Row: {
          id: string;
          volunteer_id: string;
          task_id: string;
          status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
          availability_notes: string | null;
          skills: string[] | null;
          experience_level: 'beginner' | 'intermediate' | 'expert' | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          volunteer_id: string;
          task_id: string;
          status?: 'pending' | 'approved' | 'rejected' | 'withdrawn';
          availability_notes?: string | null;
          skills?: string[] | null;
          experience_level?: 'beginner' | 'intermediate' | 'expert' | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          volunteer_id?: string;
          task_id?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'withdrawn';
          availability_notes?: string | null;
          skills?: string[] | null;
          experience_level?: 'beginner' | 'intermediate' | 'expert' | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      food_hubs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          city: string;
          suburb: string | null;
          address: string;
          contact_person: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          operating_hours: string | null;
          logo_url: string | null;
          images: string[] | null;
          is_active: boolean;
          manager_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          city: string;
          suburb?: string | null;
          address: string;
          contact_person?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          operating_hours?: string | null;
          logo_url?: string | null;
          images?: string[] | null;
          is_active?: boolean;
          manager_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          city?: string;
          suburb?: string | null;
          address?: string;
          contact_person?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          operating_hours?: string | null;
          logo_url?: string | null;
          images?: string[] | null;
          is_active?: boolean;
          manager_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      hub_inventory: {
        Row: {
          id: string;
          hub_id: string;
          item_name: string;
          description: string | null;
          quantity: string;
          food_type: string;
          expiry_date: string | null;
          status: 'available' | 'reserved' | 'distributed' | 'expired';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hub_id: string;
          item_name: string;
          description?: string | null;
          quantity: string;
          food_type: string;
          expiry_date?: string | null;
          status?: 'available' | 'reserved' | 'distributed' | 'expired';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hub_id?: string;
          item_name?: string;
          description?: string | null;
          quantity?: string;
          food_type?: string;
          expiry_date?: string | null;
          status?: 'available' | 'reserved' | 'distributed' | 'expired';
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_matches: {
        Row: {
          id: string;
          donation_id: string;
          recipient_id: string;
          match_score: number | null;
          match_reason: string | null;
          distance_km: number | null;
          is_notified: boolean;
          notification_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          donation_id: string;
          recipient_id: string;
          match_score?: number | null;
          match_reason?: string | null;
          distance_km?: number | null;
          is_notified?: boolean;
          notification_sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          donation_id?: string;
          recipient_id?: string;
          match_score?: number | null;
          match_reason?: string | null;
          distance_km?: number | null;
          is_notified?: boolean;
          notification_sent_at?: string | null;
          created_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: 'general' | 'urgent' | 'maintenance' | 'update';
          target_audience: string[];
          is_active: boolean;
          published_at: string;
          expires_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          type?: 'general' | 'urgent' | 'maintenance' | 'update';
          target_audience?: string[];
          is_active?: boolean;
          published_at?: string;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          type?: 'general' | 'urgent' | 'maintenance' | 'update';
          target_audience?: string[];
          is_active?: boolean;
          published_at?: string;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'donation_match' | 'claim_update' | 'task_assignment' | 'announcement' | 'system';
          is_read: boolean;
          related_entity_type: string | null;
          related_entity_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: 'donation_match' | 'claim_update' | 'task_assignment' | 'announcement' | 'system';
          is_read?: boolean;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'donation_match' | 'claim_update' | 'task_assignment' | 'announcement' | 'system';
          is_read?: boolean;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_values: unknown | null;
          new_values: unknown | null;
          ip_address: unknown | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_values?: unknown | null;
          new_values?: unknown | null;
          ip_address?: unknown | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_values?: unknown | null;
          new_values?: unknown | null;
          ip_address?: unknown | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      statistics: {
        Row: {
          id: string;
          stat_name: string;
          stat_value: unknown;
          last_calculated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          stat_name: string;
          stat_value: unknown;
          last_calculated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          stat_name?: string;
          stat_value?: unknown;
          last_calculated?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Location = Database['public']['Tables']['locations']['Row'];
export type LocationInsert = Database['public']['Tables']['locations']['Insert'];
export type LocationUpdate = Database['public']['Tables']['locations']['Update'];

export type Donation = Database['public']['Tables']['donations']['Row'];
export type DonationInsert = Database['public']['Tables']['donations']['Insert'];
export type DonationUpdate = Database['public']['Tables']['donations']['Update'];

export type Claim = Database['public']['Tables']['claims']['Row'];
export type ClaimInsert = Database['public']['Tables']['claims']['Insert'];
export type ClaimUpdate = Database['public']['Tables']['claims']['Update'];

export type VolunteerTask = Database['public']['Tables']['volunteer_tasks']['Row'];
export type VolunteerTaskInsert = Database['public']['Tables']['volunteer_tasks']['Insert'];
export type VolunteerTaskUpdate = Database['public']['Tables']['volunteer_tasks']['Update'];

export type VolunteerApplication = Database['public']['Tables']['volunteer_applications']['Row'];
export type VolunteerApplicationInsert = Database['public']['Tables']['volunteer_applications']['Insert'];
export type VolunteerApplicationUpdate = Database['public']['Tables']['volunteer_applications']['Update'];

export type FoodHub = Database['public']['Tables']['food_hubs']['Row'];
export type FoodHubInsert = Database['public']['Tables']['food_hubs']['Insert'];
export type FoodHubUpdate = Database['public']['Tables']['food_hubs']['Update'];

export type HubInventory = Database['public']['Tables']['hub_inventory']['Row'];
export type HubInventoryInsert = Database['public']['Tables']['hub_inventory']['Insert'];
export type HubInventoryUpdate = Database['public']['Tables']['hub_inventory']['Update'];

export type AIMatch = Database['public']['Tables']['ai_matches']['Row'];
export type AIMatchInsert = Database['public']['Tables']['ai_matches']['Insert'];
export type AIMatchUpdate = Database['public']['Tables']['ai_matches']['Update'];

export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert'];
export type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update'];

export type Statistic = Database['public']['Tables']['statistics']['Row'];
export type StatisticInsert = Database['public']['Tables']['statistics']['Insert'];
export type StatisticUpdate = Database['public']['Tables']['statistics']['Update'];