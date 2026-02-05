import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// ============ VALIDATION ============

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Portuguese phone validation
// Accepts: +351XXXXXXXXX, 351XXXXXXXXX, 9XXXXXXXX, 2XXXXXXXX
const PHONE_REGEX = /^(?:\+?351)?[29]\d{8}$/

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

function validatePhone(phone: string): boolean {
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  return PHONE_REGEX.test(cleaned)
}

function normalizePhone(phone: string): string {
  // Remove all non-digits except leading +
  let cleaned = phone.replace(/[^\d+]/g, '')
  // Ensure +351 prefix
  if (cleaned.startsWith('+351')) return cleaned
  if (cleaned.startsWith('351')) return '+' + cleaned
  if (cleaned.startsWith('9') || cleaned.startsWith('2')) return '+351' + cleaned
  return cleaned
}

// ============ ANTI-SPAM ============

// Simple in-memory rate limiter (resets on server restart)
// In production, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5 // max 5 requests per minute per IP/email

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count }
}

// Clean up old entries periodically (simple memory management)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60 * 1000) // Clean every minute

// ============ TYPES ============

interface LeadData {
  // Location
  address: string
  lat: number | null
  lng: number | null
  placeId?: string
  // House
  roofType: 'inclinada' | 'plana'
  electricityBill: number
  gridType: 'monofasica' | 'trifasica'
  // Contact
  name: string
  email: string
  phone: string
  // Honeypot (anti-spam) - should be empty
  website?: string
  // Package (optional, stage 2)
  selectedPackage?: {
    id: string
    brand: 'deye' | 'huawei'
    panelCount: number
    price: number
    power: number
    hasBattery: boolean
    batteryCapacity: string | null
  }
  // Meta
  source: string
  stage?: string
  createdAt: string
}

// ============ API HANDLER ============

export async function POST(request: NextRequest) {
  try {
    const data: LeadData = await request.json()

    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor?.split(',')[0]?.trim() || 'unknown'

    // 1. ANTI-SPAM: Check honeypot field
    if (data.website && data.website.trim() !== '') {
      console.log('[SPAM] Honeypot triggered from IP:', clientIp)
      // Return fake success to not alert bots
      return NextResponse.json({
        success: true,
        message: 'Lead received',
        leadId: `lead_${Date.now()}`
      })
    }

    // 2. ANTI-SPAM: Rate limiting by IP
    const ipRateLimit = checkRateLimit(`ip:${clientIp}`)
    if (!ipRateLimit.allowed) {
      console.log('[RATE LIMIT] IP blocked:', clientIp)
      return NextResponse.json(
        { success: false, error: 'Demasiados pedidos. Tente novamente em 1 minuto.' },
        { status: 429 }
      )
    }

    // 3. VALIDATION: Email
    if (!data.email || !validateEmail(data.email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido', field: 'email' },
        { status: 400 }
      )
    }

    // 4. ANTI-SPAM: Rate limiting by email
    const emailRateLimit = checkRateLimit(`email:${data.email.toLowerCase()}`)
    if (!emailRateLimit.allowed) {
      console.log('[RATE LIMIT] Email blocked:', data.email)
      return NextResponse.json(
        { success: false, error: 'Este email já submeteu um pedido recentemente.' },
        { status: 429 }
      )
    }

    // 5. VALIDATION: Phone
    if (!data.phone || !validatePhone(data.phone)) {
      return NextResponse.json(
        { success: false, error: 'Número de telefone inválido. Use formato português (+351 9XX XXX XXX)', field: 'phone' },
        { status: 400 }
      )
    }

    // 6. VALIDATION: Name (min 2 chars)
    if (!data.name || data.name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Nome inválido', field: 'name' },
        { status: 400 }
      )
    }

    // 7. VALIDATION: Electricity bill (reasonable range)
    if (!data.electricityBill || data.electricityBill < 30 || data.electricityBill > 2000) {
      return NextResponse.json(
        { success: false, error: 'Valor da fatura inválido', field: 'electricityBill' },
        { status: 400 }
      )
    }

    // Normalize phone number
    const normalizedPhone = normalizePhone(data.phone)

    // 8. Log lead data for debugging
    console.log('=== NEW LEAD ===')
    console.log('Stage:', data.stage || 'contact-submitted')
    console.log('Name:', data.name)
    console.log('Email:', data.email)
    console.log('Phone:', normalizedPhone)
    console.log('Address:', data.address)
    console.log('Roof:', data.roofType)
    console.log('Grid:', data.gridType)
    console.log('Bill:', data.electricityBill, '€/month')
    console.log('IP:', clientIp)
    if (data.selectedPackage) {
      console.log('Package:', {
        brand: data.selectedPackage.brand,
        panels: data.selectedPackage.panelCount,
        power: data.selectedPackage.power + ' kWp',
        price: '€' + data.selectedPackage.price,
        battery: data.selectedPackage.batteryCapacity || 'none'
      })
    }
    console.log('Created:', data.createdAt)
    console.log('================')

    // 9. Save to Supabase database
    let leadId = `lead_${Date.now()}`
    const supabase = createServerClient()

    if (supabase) {
      try {
        const { data: insertedLead, error: supabaseError } = await supabase
          .from('leads')
          .insert({
            name: data.name,
            email: data.email,
            phone: normalizedPhone,
            address: data.address,
            lat: data.lat,
            lng: data.lng,
            place_id: data.placeId || null,
            roof_type: data.roofType,
            electricity_bill: data.electricityBill,
            grid_type: data.gridType,
            selected_package: data.selectedPackage || null,
            source: data.source,
            stage: data.stage || 'contact-submitted',
            ip_address: clientIp,
          })
          .select('id')
          .single()

        if (supabaseError) {
          console.error('[SUPABASE] Insert error:', supabaseError.message)
        } else if (insertedLead) {
          leadId = insertedLead.id
          console.log('[SUPABASE] Lead saved with ID:', leadId)
        }
      } catch (err) {
        console.error('[SUPABASE] Unexpected error:', err)
        // Continue without failing - lead will still be sent to CRM if configured
      }
    } else {
      console.log('[SUPABASE] Not configured, skipping database save')
    }

    // 11. Forward to external CRM webhook if configured
    const externalCrmUrl = process.env.CRM_WEBHOOK_URL
    if (externalCrmUrl) {
      try {
        const crmResponse = await fetch(externalCrmUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            phone: normalizedPhone, // Use normalized phone
          })
        })
        if (!crmResponse.ok) {
          console.error('CRM webhook returned:', crmResponse.status)
        }
      } catch (crmError) {
        console.error('CRM webhook failed:', crmError)
        // Don't block user response
      }
    }

    // 12. Return success response
    return NextResponse.json({
      success: true,
      message: 'Lead received',
      leadId
    })

  } catch (error) {
    console.error('Lead API error:', error)
    return NextResponse.json(
      { success: false, error: 'Pedido inválido' },
      { status: 400 }
    )
  }
}
