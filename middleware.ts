import { createClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/timeline']
const AUTH_PATHS = ['/login']

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Always use getUser() — getSession() is unsafe for server-side auth checks
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
