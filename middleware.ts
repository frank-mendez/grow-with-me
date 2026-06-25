import { createClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/timeline', '/kicks', '/settings']
const AUTH_PATHS = ['/login']
const HOME_PATH = '/'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Supabase sometimes redirects to site_url (/) instead of /auth/callback when the
  // redirect URL isn't in the project allowlist. Forward the code so the handler can run.
  const code = searchParams.get('code')
  if (pathname === HOME_PATH && code) {
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.searchParams.set('code', code)
    return NextResponse.redirect(callbackUrl)
  }

  const { supabase, response } = createClient(request)

  // Always use getUser() — getSession() is unsafe for server-side auth checks
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !user) {
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c))
    return redirectResponse
  }

  if ((AUTH_PATHS.some((p) => pathname.startsWith(p)) || pathname === HOME_PATH) && user) {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c))
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/dashboard/:path*',
    '/timeline',
    '/timeline/:path*',
    '/kicks',
    '/kicks/:path*',
    '/settings',
    '/settings/:path*',
    '/login',
    '/login/:path*',
  ],
}
