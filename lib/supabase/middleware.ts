import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // IMPORTANT: getUser() validates JWT server-side. Never use getSession() here.
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login (except login and auth callback paths)
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based routing: redirect consultants away from /library to /engagements.
  // This eliminates the library skeleton flash during post-login navigation.
  // Only redirects the exact /library path — /library/[promptId] remains accessible.
  if (user) {
    const pathname = request.nextUrl.pathname
    const role = user.app_metadata?.role as string | undefined
    const isAnonymous = user.is_anonymous ?? false
    const demoRole = isAnonymous
      ? (user.user_metadata?.demo_role as string | undefined) ?? 'consultant'
      : undefined
    const effectiveRole = role ?? demoRole ?? 'consultant'

    if (effectiveRole !== 'admin' && pathname === '/library') {
      const url = request.nextUrl.clone()
      url.pathname = '/engagements'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
