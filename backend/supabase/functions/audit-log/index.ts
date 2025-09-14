import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuditLogData {
  user_id?: string
  action: string
  entity_type: string
  entity_id?: string
  old_values?: any
  new_values?: any
  ip_address?: string
  user_agent?: string
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

    const { audit_data } = await req.json()

    if (!audit_data || !audit_data.action || !audit_data.entity_type) {
      throw new Error('Invalid audit data: action and entity_type are required')
    }

    // Get user info from request headers if available
    const authHeader = req.headers.get('authorization')
    let user_id: string | undefined

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error } = await supabase.auth.getUser(token)
        if (user && !error) {
          user_id = user.id
        }
      } catch (error) {
        console.warn('Could not extract user from token:', error)
      }
    }

    // Get IP address and user agent
    const ip_address = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown'
    const user_agent = req.headers.get('user-agent') || 'unknown'

    const auditLogEntry: AuditLogData = {
      user_id,
      action: audit_data.action,
      entity_type: audit_data.entity_type,
      entity_id: audit_data.entity_id,
      old_values: audit_data.old_values,
      new_values: audit_data.new_values,
      ip_address: ip_address.toString(),
      user_agent
    }

    // Insert audit log entry
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([auditLogEntry])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create audit log: ${error.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        audit_log: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in audit log function:', error)
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