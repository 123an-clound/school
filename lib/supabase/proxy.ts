import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// UX only: redirects signed-out visitors to the login page. Admin rights are checked
// with school_is_admin() in every admin page, Server Action and Route Handler.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: { secure: process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://') },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  // Nothing may run between createServerClient and getClaims(), or sessions drop at random.
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims && !request.nextUrl.pathname.startsWith('/admin/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    const redirect = NextResponse.redirect(url)
    // Carry refreshed/cleared auth cookies and no-cache headers onto the redirect.
    supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    for (const header of ['cache-control', 'expires', 'pragma']) {
      const value = supabaseResponse.headers.get(header)
      if (value) redirect.headers.set(header, value)
    }
    return redirect
  }

  return supabaseResponse
}
