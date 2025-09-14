import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationData {
  user_id: string
  title: string
  message: string
  type: 'donation_match' | 'claim_update' | 'task_assignment' | 'announcement' | 'system'
  related_entity_type?: string
  related_entity_id?: string
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

    const { notification_data, user_ids, announcement_data } = await req.json()

    // Handle bulk notifications for multiple users
    if (user_ids && announcement_data) {
      const notifications: NotificationData[] = user_ids.map((user_id: string) => ({
        user_id,
        title: announcement_data.title,
        message: announcement_data.message,
        type: 'announcement',
        related_entity_type: 'announcement',
        related_entity_id: announcement_data.id
      }))

      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select()

      if (error) {
        throw new Error(`Failed to create notifications: ${error.message}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          notifications_created: data.length
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Handle single notification
    if (notification_data) {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification_data])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create notification: ${error.message}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          notification: data
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('Invalid request data')

  } catch (error) {
    console.error('Error in notifications function:', error)
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