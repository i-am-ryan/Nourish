import { supabase } from './supabase'
import type {
  Donation,
  Claim,
  VolunteerTask,
  FoodHub,
  Notification,
  Announcement,
  Profile
} from './supabase'

export type ClaimRequest = {
  id: string
  requester_id: string
  hub_id: string | null
  food_category: string
  dietary: any | null
  notes: string | null
  preferred_window: string | null
  // ⬇️ Extended statuses to match UI: scheduled, ready, collected
  status:
    | 'pending'
    | 'approved'
    | 'scheduled'
    | 'ready'
    | 'collected'
    | 'completed'
    | 'rejected'
    | 'cancelled'
  created_at: string
  updated_at: string
}

// API Service class for all backend operations
export class APIService {
  private supabaseUrl: string
  private supabaseKey: string

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  }

  // Helper: get the signed-in user or throw
  private async requireUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!data?.user) throw new Error('You must be signed in to perform this action.')
    return data.user
  }

  // =====================================================
  // DONATIONS API
  // =====================================================

  async getRandomRecipientOrg(city?: string): Promise<{ data: any | null; error: any }> {
    try {
      let query = supabase
        .from('recipient_orgs')
        .select('*')
        .eq('is_active', true)

      if (city) query = query.eq('city', city)

      // small pre-pool then pick one client-side
      const { data, error } = await query.order('id', { ascending: false }).limit(100)
      if (error) throw error

      const pool = data || []
      if (pool.length === 0) return { data: null, error: null }

      const pick = pool[Math.floor(Math.random() * pool.length)]
      return { data: pick, error: null }
    } catch (error) {
      console.error('Error fetching random recipient org:', error)
      return { data: null, error }
    }
  }

  async getFoodHubCities(): Promise<{ data: string[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('food_hubs')
        .select('city')
        .eq('is_active', true)
        .order('city', { ascending: true })

      if (error) throw error
      const cities = Array.from(new Set((data || []).map((r: any) => r.city))).sort()
      return { data: cities, error: null }
    } catch (error) {
      console.error('Error fetching hub cities:', error)
      return { data: null, error }
    }
  }

async getHubsByCity(
  city: string
): Promise<{ data: Array<{ id: string; name: string; suburb: string | null; address: string; address_line1: string | null }> | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('food_hubs')
      .select('id,name,suburb,address,address_line1')
      .eq('city', city)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return { data: (data || []) as any, error: null }
  } catch (error) {
    console.error('Error fetching hubs by city:', error)
    return { data: null, error }
  }
}

async createDonation(donationData: Partial<Donation>): Promise<{ data: Donation | null; error: any }> {
  try {
    // Get the current user directly from supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('You must be signed in to create a donation');
    }

    const payload = {
      donor_id: user.id, // Use user.id directly
      user_id: user.id,  // Required by RLS policy
      title: donationData.title,
      description: donationData.description,
      food_type: donationData.food_type,
      quantity: donationData.quantity,
      expiry_date: donationData.expiry_date,
      pickup_location: donationData.pickup_location,
      city: donationData.city,
      suburb: donationData.suburb,
      contact_email: donationData.contact_email,
      contact_phone: donationData.contact_phone,
      images: donationData.images || [],
      status: donationData.status || 'available',
      is_urgent: donationData.is_urgent || false,
      hub_id: donationData.hub_id,
    }

    // Only add optional fields if they exist
    if (donationData.dropoff_time) {
      (payload as any).dropoff_time = donationData.dropoff_time;
    }
    
    console.log('Inserting donation payload:', payload)
    console.log('User ID:', user.id) // Add this to debug

    const { data, error } = await supabase.from('donations').insert(payload).select().single()
    if (error) {
      console.error('Supabase error details:', error)
      throw error
    }

    if (data) {
      await this.triggerAIMatching(data.id).catch(() => {})
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error creating donation:', error)
    return { data: null, error }
  }
}

  async getDonations(filters?: {
    city?: string
    status?: string
    donor_id?: string
    limit?: number
  }): Promise<{ data: Donation[] | null; error: any }> {
    try {
      let query = supabase
        .from('donations')
        .select(
          `
          *,
          profiles!donations_donor_id_fkey(
            full_name,
            business_name,
            avatar_url
          )
        `
        )
        .order('created_at', { ascending: false })

      if (filters?.city) query = query.eq('city', filters.city)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.donor_id) query = query.eq('donor_id', filters.donor_id)
      if (filters?.limit) query = query.limit(filters.limit)

      const { data, error } = await query
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching donations:', error)
      return { data: null, error }
    }
  }

  async getDonation(id: string): Promise<{ data: Donation | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(
          `
          *,
          profiles!donations_donor_id_fkey(
            full_name,
            business_name,
            avatar_url,
            phone,
            email
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching donation:', error)
      return { data: null, error }
    }
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<{ data: Donation | null; error: any }> {
    try {
      const { data, error } = await supabase.from('donations').update(updates).eq('id', id).select().single()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating donation:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // CLAIMS API
  // =====================================================

  // ---------- CLAIM REQUESTS (new) ----------
  async createClaimRequest(input: {
    hub_id: string
    food_category: string
    dietary?: any
    notes?: string
    preferred_window?: string
  }): Promise<{ data: ClaimRequest | null; error: any }> {
    try {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth?.user) throw new Error('You must be signed in to submit a request.')

      const payload = {
        requester_id: auth.user.id,
        hub_id: input.hub_id,
        food_category: input.food_category,
        dietary: input.dietary ?? null,
        notes: input.notes ?? null,
        preferred_window: input.preferred_window ?? null
      }

      const { data, error } = await supabase.from('claim_requests').insert([payload]).select('*').single()
      if (error) throw error
      return { data: data as ClaimRequest, error: null }
    } catch (error) {
      console.error('Error creating claim request:', error)
      return { data: null, error }
    }
  }

  async getClaimRequests(filters?: {
    status?: ClaimRequest['status']
    hub_id?: string
    mine?: boolean // if true, only current user's
  }): Promise<{ data: ClaimRequest[] | null; error: any }> {
    try {
      let query = supabase.from('claim_requests').select('*').order('created_at', { ascending: false })

      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.hub_id) query = query.eq('hub_id', filters.hub_id)

      if (filters?.mine) {
        const { data: auth } = await supabase.auth.getUser()
        if (!auth?.user) throw new Error('Not signed in')
        query = query.eq('requester_id', auth.user.id)
      }

      const { data, error } = await query
      if (error) throw error
      return { data: (data || []) as ClaimRequest[], error: null }
    } catch (error) {
      console.error('Error fetching claim requests:', error)
      return { data: null, error }
    }
  }

  // Admin / staff triage (or requester can update, depending on your RLS)
  async updateClaimRequestStatus(
    id: string,
    status: ClaimRequest['status'] // now accepts scheduled/ready/collected/etc.
  ): Promise<{ data: ClaimRequest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('claim_requests')
        .update({ status })
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      return { data: data as ClaimRequest, error: null }
    } catch (error) {
      console.error('Error updating claim request:', error)
      return { data: null, error }
    }
  }

  async getClaimRequestsAdmin() {
    return this.getClaimRequests()
  }

  async updateClaimRequest(id: string, patch: Partial<ClaimRequest>) {
    try {
      const { error } = await supabase.from('claim_requests').update(patch).eq('id', id)
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // (legacy claims against donations — keeping as-is)
  async createClaim(claimData: Partial<Claim>): Promise<{ data: Claim | null; error: any }> {
    try {
      const user = await this.requireUser()

      const payload: Partial<Claim> = {
        ...claimData,
        recipient_id: user.id
      }

      const { data, error } = await supabase
        .from('claims')
        .insert([payload])
        .select(
          `
          *,
          donations!claims_donation_id_fkey(
            title,
            food_type,
            quantity,
            city,
            donor_id
          ),
          profiles!claims_recipient_id_fkey(
            full_name,
            organization_type
          )
        `
        )
        .single()

      if (error) throw error

      if (data) {
        await this.createNotification({
          user_id: (data as any).donations?.donor_id || '',
          title: 'New Claim Request',
          message: `Someone has claimed your donation "${(data as any).donations?.title ?? ''}"`,
          type: 'claim_update',
          related_entity_type: 'claim',
          related_entity_id: data.id
        }).catch(() => {})
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error creating claim:', error)
      return { data: null, error }
    }
  }

  async getClaims(filters?: {
    recipient_id?: string
    donor_id?: string
    status?: string
  }): Promise<{ data: Claim[] | null; error: any }> {
    try {
      let query = supabase
        .from('claims')
        .select(
          `
          *,
          donations!claims_donation_id_fkey(
            title,
            food_type,
            quantity,
            city,
            donor_id
          ),
          profiles!claims_recipient_id_fkey(
            full_name,
            organization_type
          )
        `
        )
        .order('created_at', { ascending: false })

      if (filters?.recipient_id) query = query.eq('recipient_id', filters.recipient_id)
      if (filters?.donor_id) query = query.eq('donations.donor_id', filters.donor_id)
      if (filters?.status) query = query.eq('status', filters.status)

      const { data, error } = await query
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching claims:', error)
      return { data: null, error }
    }
  }

  async updateClaim(id: string, updates: Partial<Claim>): Promise<{ data: Claim | null; error: any }> {
    try {
      const { data, error } = await supabase.from('claims').update(updates).eq('id', id).select().single()
      if (error) throw error

      if (data && updates.status) {
        const notificationMessage = this.getClaimStatusMessage(updates.status as string)
        await this.createNotification({
          user_id: data.recipient_id,
          title: 'Claim Status Updated',
          message: notificationMessage,
          type: 'claim_update',
          related_entity_type: 'claim',
          related_entity_id: data.id
        }).catch(() => {})
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error updating claim:', error)
      return { data: null, error }
    }
  }

  private getClaimStatusMessage(status: string): string {
    switch (status) {
      case 'approved':
        return 'Your claim has been approved! Please arrange pickup.'
      case 'rejected':
        return 'Your claim has been rejected. Please contact us for more information.'
      case 'completed':
        return 'Your claim has been completed. Thank you for using NourishSA!'
      default:
        return 'Your claim status has been updated.'
    }
  }

  // =====================================================
  // VOLUNTEER TASKS API
  // =====================================================

  async createVolunteerTask(taskData: Partial<VolunteerTask>): Promise<{ data: VolunteerTask | null; error: any }> {
    try {
      const { data, error } = await supabase.from('volunteer_tasks').insert([taskData]).select().single()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating volunteer task:', error)
      return { data: null, error }
    }
  }

  async getVolunteerTasks(filters?: {
    city?: string
    status?: string
    assigned_to?: string
    task_type?: string
  }): Promise<{ data: VolunteerTask[] | null; error: any }> {
    try {
      let query = supabase
        .from('volunteer_tasks')
        .select(
          `
          *,
          profiles!volunteer_tasks_created_by_fkey(full_name),
          profiles!volunteer_tasks_assigned_to_fkey(full_name)
        `
        )
        .order('created_at', { ascending: false })

      if (filters?.city) query = query.eq('city', filters.city)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to)
      if (filters?.task_type) query = query.eq('task_type', filters.task_type)

      const { data, error } = await query
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching volunteer tasks:', error)
      return { data: null, error }
    }
  }

  async updateVolunteerTask(id: string, updates: Partial<VolunteerTask>): Promise<{ data: VolunteerTask | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('volunteer_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error

      if (data && updates.assigned_to && updates.status === 'assigned') {
        await this.createNotification({
          user_id: updates.assigned_to,
          title: 'New Task Assigned',
          message: `You have been assigned a new volunteer task: "${data.title}"`
        } as any).catch(() => {})
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error updating volunteer task:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // FOOD HUBS API
  // =====================================================

  async getFoodHubs(filters?: { city?: string; is_active?: boolean }): Promise<{ data: FoodHub[] | null; error: any }> {
    try {
      let query = supabase.from('food_hubs').select('*').order('name')

      if (filters?.city) query = query.eq('city', filters.city)
      if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active)

      const { data, error } = await query
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching food hubs:', error)
      return { data: null, error }
    }
  }

  async createFoodHub(hubData: Partial<FoodHub>): Promise<{ data: FoodHub | null; error: any }> {
    try {
      const { data, error } = await supabase.from('food_hubs').insert([hubData]).select().single()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating food hub:', error)
      return { data: null, error }
    }
  }

  async updateFoodHub(id: string, updates: Partial<FoodHub>): Promise<{ data: FoodHub | null; error: any }> {
    try {
      const { data, error } = await supabase.from('food_hubs').update(updates).eq('id', id).select().single()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating food hub:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // NOTIFICATIONS API
  // =====================================================

  async getNotifications(userId: string): Promise<{ data: Notification[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return { data: null, error }
    }
  }

  async markNotificationAsRead(id: string): Promise<{ data: Notification | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return { data: null, error }
    }
  }

  async createNotification(notificationData: {
    user_id: string
    title: string
    message: string
    type: 'donation_match' | 'claim_update' | 'task_assignment' | 'announcement' | 'system'
    related_entity_type?: string
    related_entity_id?: string
  }): Promise<{ data: Notification | null; error: any }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({
          notification_data: notificationData
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      return { data: result.notification, error: null }
    } catch (error) {
      console.error('Error creating notification:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // ANNOUNCEMENTS API
  // =====================================================

  async getAnnouncements(targetAudience?: string[]): Promise<{ data: Announcement[] | null; error: any }> {
    try {
      let query = supabase.from('announcements').select('*').eq('is_active', true).order('published_at', {
        ascending: false
      })

      if (targetAudience) query = query.overlaps('target_audience', targetAudience)

      const { data, error } = await query
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching announcements:', error)
      return { data: null, error }
    }
  }

  async createAnnouncement(announcementData: Partial<Announcement>): Promise<{ data: Announcement | null; error: any }> {
    try {
      const { data, error } = await supabase.from('announcements').insert([announcementData]).select().single()
      if (error) throw error

      if (data && data.target_audience) {
        const { data: users } = await supabase
          .from('profiles')
          .select('id')
          .in('role', data.target_audience as any)
          .eq('is_active', true)

        if (users && users.length > 0) {
          const userIds = users.map((user) => user.id as string)
          await this.sendBulkNotifications(userIds, {
            id: (data as any).id,
            title: (data as any).title,
            message: (data as any).content
          }).catch(() => {})
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error creating announcement:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // AI MATCHING API
  // =====================================================

  async triggerAIMatching(donationId: string): Promise<{ data: any; error: any }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/ai-matching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({
          donation_id: donationId
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      return { data: result, error: null }
    } catch (error) {
      console.error('Error triggering AI matching:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // STATISTICS API
  // =====================================================

  async getStatistics(forceRefresh = false): Promise<{ data: any; error: any }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({
          force_refresh: forceRefresh
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      return { data: result.statistics, error: null }
    } catch (error) {
      console.error('Error fetching statistics:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // AUDIT LOG API
  // =====================================================

  async createAuditLog(auditData: {
    action: string
    entity_type: string
    entity_id?: string
    old_values?: any
    new_values?: any
  }): Promise<{ data: any; error: any }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/audit-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({
          audit_data: auditData
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      return { data: result.audit_log, error: null }
    } catch (error) {
      console.error('Error creating audit log:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // ADMIN via RPC
  // =====================================================

  async promoteUserByEmail(email: string) {
    const { error } = await supabase.rpc('promote_user_by_email', { p_email: email })
    if (error) throw error
    return { success: true }
  }

  async demoteUserByEmail(email: string) {
    const { error } = await supabase.rpc('demote_user_by_email', { p_email: email })
    if (error) throw error
    return { success: true }
  }

  async deactivateUserById(userId: string) {
    const { error } = await supabase.rpc('deactivate_user', { p_user_id: userId })
    if (error) throw error
    return { success: true }
  }

  // =====================================================
  // UTIL
  // =====================================================

  private async sendBulkNotifications(userIds: string[], announcementData: any): Promise<void> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.supabaseKey}`
        },
        body: JSON.stringify({
          user_ids: userIds,
          announcement_data: announcementData
        })
      })

      const result = await response.json()

      if (!result.success) {
        console.error('Error sending bulk notifications:', result.error)
      }
    } catch (error) {
      console.error('Error sending bulk notifications:', error)
    }
  }
}

export const apiService = new APIService()
