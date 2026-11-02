import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Bypasses RLS. Only for public form inserts after Turnstile verification.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
