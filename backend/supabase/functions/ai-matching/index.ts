import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Donation {
  id: string
  title: string
  food_type: string
  quantity: string
  expiry_date: string
  city: string
  suburb: string | null
  donor_id: string
  status: string
}

interface Recipient {
  id: string
  full_name: string
  city: string
  suburb: string | null
  organization_type: string | null
  role: string
}

interface AIMatch {
  donation_id: string
  recipient_id: string
  match_score: number
  match_reason: string
  distance_km: number
}

// Calculate distance between two cities (simplified - in production, use proper geocoding)
function calculateDistance(city1: string, city2: string): number {
  const cities = {
    'Johannesburg': { lat: -26.2041, lng: 28.0473 },
    'Cape Town': { lat: -33.9249, lng: 18.4241 },
    'Durban': { lat: -29.8587, lng: 31.0218 },
    'Pretoria': { lat: -25.7479, lng: 28.2293 },
    'Port Elizabeth': { lat: -33.7139, lng: 25.5207 },
    'Bloemfontein': { lat: -29.0852, lng: 26.1596 },
    'Nelspruit': { lat: -25.4753, lng: 30.9694 },
    'Kimberley': { lat: -28.7282, lng: 24.7499 },
    'Polokwane': { lat: -23.9045, lng: 29.4698 },
    'East London': { lat: -33.0292, lng: 27.8546 }
  }

  const city1Coords = cities[city1 as keyof typeof cities]
  const city2Coords = cities[city2 as keyof typeof cities]

  if (!city1Coords || !city2Coords) {
    return 50 // Default distance if city not found
  }

  // Haversine formula to calculate distance
  const R = 6371 // Earth's radius in kilometers
  const dLat = (city2Coords.lat - city1Coords.lat) * Math.PI / 180
  const dLng = (city2Coords.lng - city1Coords.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(city1Coords.lat * Math.PI / 180) * Math.cos(city2Coords.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Calculate match score based on various factors
function calculateMatchScore(donation: Donation, recipient: Recipient): { score: number; reason: string } {
  let score = 0
  const reasons: string[] = []

  // Location matching (40% weight)
  const distance = calculateDistance(donation.city, recipient.city)
  const locationScore = Math.max(0, 1 - (distance / 100)) // Score decreases with distance
  score += locationScore * 0.4
  reasons.push(`Location match: ${locationScore.toFixed(2)} (${distance.toFixed(1)}km)`)

  // Same suburb bonus (20% weight)
  if (donation.suburb && recipient.suburb && donation.suburb.toLowerCase() === recipient.suburb.toLowerCase()) {
    score += 0.2
    reasons.push('Same suburb: +0.20')
  }

  // Organization type matching (20% weight)
  if (donation.food_type && recipient.organization_type) {
    const foodType = donation.food_type.toLowerCase()
    const orgType = recipient.organization_type.toLowerCase()
    
    if (orgType.includes('orphanage') || orgType.includes('shelter')) {
      if (foodType.includes('fresh') || foodType.includes('canned')) {
        score += 0.2
        reasons.push('Organization type match: +0.20')
      }
    } else if (orgType.includes('community') || orgType.includes('center')) {
      score += 0.15
      reasons.push('Community center match: +0.15')
    }
  }

  // Quantity matching (10% weight)
  const quantity = donation.quantity.toLowerCase()
  if (quantity.includes('large') || quantity.includes('bulk')) {
    if (recipient.organization_type && 
        (recipient.organization_type.toLowerCase().includes('orphanage') || 
         recipient.organization_type.toLowerCase().includes('shelter'))) {
      score += 0.1
      reasons.push('Large quantity for organization: +0.10')
    }
  }

  // Fresh food priority (10% weight)
  if (donation.food_type.toLowerCase().includes('fresh')) {
    score += 0.1
    reasons.push('Fresh food priority: +0.10')
  }

  return {
    score: Math.min(1, score),
    reason: reasons.join(', ')
  }
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

    const { donation_id } = await req.json()

    if (!donation_id) {
      throw new Error('donation_id is required')
    }

    // Get the donation
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .select('*')
      .eq('id', donation_id)
      .single()

    if (donationError || !donation) {
      throw new Error('Donation not found')
    }

    // Get all active recipients in the same city or nearby cities
    const { data: recipients, error: recipientsError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'recipient')
      .eq('is_active', true)
      .eq('verification_status', 'verified')

    if (recipientsError) {
      throw new Error('Failed to fetch recipients')
    }

    // Calculate matches
    const matches: AIMatch[] = []
    
    for (const recipient of recipients) {
      const { score, reason } = calculateMatchScore(donation, recipient)
      
      if (score > 0.3) { // Only include matches with score > 30%
        const distance = calculateDistance(donation.city, recipient.city)
        matches.push({
          donation_id: donation.id,
          recipient_id: recipient.id,
          match_score: score,
          match_reason: reason,
          distance_km: distance
        })
      }
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.match_score - a.match_score)

    // Take top 5 matches
    const topMatches = matches.slice(0, 5)

    // Insert matches into database
    if (topMatches.length > 0) {
      const { error: insertError } = await supabase
        .from('ai_matches')
        .insert(topMatches)

      if (insertError) {
        console.error('Error inserting matches:', insertError)
      }

      // Update donation with matched recipients
      const matchedRecipientIds = topMatches.map(match => match.recipient_id)
      const { error: updateError } = await supabase
        .from('donations')
        .update({ ai_matched_recipients: matchedRecipientIds })
        .eq('id', donation_id)

      if (updateError) {
        console.error('Error updating donation:', updateError)
      }

      // Create notifications for matched recipients
      const notifications = topMatches.map(match => ({
        user_id: match.recipient_id,
        title: 'New Food Donation Available!',
        message: `A new donation "${donation.title}" is available in ${donation.city}. Match score: ${(match.match_score * 100).toFixed(0)}%`,
        type: 'donation_match',
        related_entity_type: 'donation',
        related_entity_id: donation.id
      }))

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (notificationError) {
        console.error('Error creating notifications:', notificationError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        matches: topMatches,
        total_matches: matches.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in AI matching function:', error)
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