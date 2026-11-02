import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    // @supabase/ssr leaves out Secure by default; set it whenever the site is served over HTTPS
    { cookieOptions: { secure: process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://') } }
  )
}
