import { createClient } from '@supabase/supabase-js'

// Database types for leads table
export interface LeadRow {
  id: string
  created_at: string
  name: string
  email: string
  phone: string
  address: string
  lat: number | null
  lng: number | null
  place_id: string | null
  roof_type: 'inclinada' | 'plana'
  electricity_bill: number
  grid_type: 'monofasica' | 'trifasica'
  selected_package: {
    id: string
    brand: 'deye' | 'huawei'
    panelCount: number
    price: number
    power: number
    hasBattery: boolean
    batteryCapacity: string | null
  } | null
  source: string
  stage: string
  ip_address: string | null
  user_agent: string | null
}

// Public client (for client-side operations if needed)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Server-side client with service role key (bypasses RLS)
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.warn('Supabase credentials not configured')
    return null
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
