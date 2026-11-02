import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

// Admin only: refreshing sessions on public pages could let a CDN cache Set-Cookie.
export const config = {
  matcher: '/admin/:path*',
}
