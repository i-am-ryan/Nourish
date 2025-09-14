import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Statistics {
  total_donations: number
  total_claims: number
  active_volunteers: number
  total_recipients: number
  total_donors: number
  pending_claims: number
  completed_claims: number
  total_food_hubs: number
  recent_donations: any[]
  recent_claims: any[]
  donations_by_city: any[]
  claims_by_status: any[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { force_refresh = false } = await req.json()

    // Check if we should use cached statistics
    if (!force_refresh) {
      const { data: cachedStats } = await supabase
        .from('statistics')
        .select('*')
        .eq('stat_name', 'dashboard_stats')
        .single()

      if (cachedStats && cachedStats.last_calculated) {
        const lastCalculated = new Date(cachedStats.last_calculated)
        const now = new Date()
        const hoursSinceLastCalc = (now.getTime() - lastCalculated.getTime()) / (1000 * 60 * 60)

        // Use cached stats if less than 1 hour old
        if (hoursSinceLastCalc < 1) {
          return new Response(
            JSON.stringify({
              success: true,
              statistics: cachedStats.stat_value,
              cached: true,
              last_calculated: cachedStats.last_calculated
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
      }
    }

    // Calculate fresh statistics
    const statistics: Statistics = {
      total_donations: 0,
      total_claims: 0,
      active_volunteers: 0,
      total_recipients: 0,
      total_donors: 0,
      pending_claims: 0,
      completed_claims: 0,
      total_food_hubs: 0,
      recent_donations: [],
      recent_claims: [],
      donations_by_city: [],
      claims_by_status: []
    }

    // Get total donations
    const { count: donationsCount } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true })

    statistics.total_donations = donationsCount || 0

    // Get total claims
    const { count: claimsCount } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })

    statistics.total_claims = claimsCount || 0

    // Get active volunteers
    const { count: volunteersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'volunteer')
      .eq('is_active', true)

    statistics.active_volunteers = volunteersCount || 0

    // Get total recipients
    const { count: recipientsCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'recipient')
      .eq('is_active', true)

    statistics.total_recipients = recipientsCount || 0

    // Get total donors
    const { count: donorsCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'donor')
      .eq('is_active', true)

    statistics.total_donors = donorsCount || 0

    // Get claims by status
    const { data: claimsByStatus } = await supabase
      .from('claims')
      .select('status')

    if (claimsByStatus) {
      const statusCounts = claimsByStatus.reduce((acc: any, claim) => {
        acc[claim.status] = (acc[claim.status] || 0) + 1
        return acc
      }, {})

      statistics.pending_claims = statusCounts.pending || 0
      statistics.completed_claims = statusCounts.completed || 0
      statistics.claims_by_status = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }))
    }

    // Get total food hubs
    const { count: hubsCount } = await supabase
      .from('food_hubs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    statistics.total_food_hubs = hubsCount || 0

    // Get recent donations (last 10)
    const { data: recentDonations } = await supabase
      .from('donations')
      .select(`
        id,
        title,
        food_type,
        quantity,
        city,
        status,
        created_at,
        profiles!donations_donor_id_fkey(full_name, business_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    statistics.recent_donations = recentDonations || []

    // Get recent claims (last 10)
    const { data: recentClaims } = await supabase
      .from('claims')
      .select(`
        id,
        status,
        created_at,
        donations!claims_donation_id_fkey(title, city),
        profiles!claims_recipient_id_fkey(full_name, organization_type)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    statistics.recent_claims = recentClaims || []

    // Get donations by city
    const { data: donationsByCity } = await supabase
      .from('donations')
      .select('city')

    if (donationsByCity) {
      const cityCounts = donationsByCity.reduce((acc: any, donation) => {
        acc[donation.city] = (acc[donation.city] || 0) + 1
        return acc
      }, {})

      statistics.donations_by_city = Object.entries(cityCounts).map(([city, count]) => ({
        city,
        count
      }))
    }

    // Cache the statistics
    const { error: cacheError } = await supabase
      .from('statistics')
      .upsert({
        stat_name: 'dashboard_stats',
        stat_value: statistics,
        last_calculated: new Date().toISOString()
      })

    if (cacheError) {
      console.error('Error caching statistics:', cacheError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        statistics,
        cached: false,
        last_calculated: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in statistics function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 