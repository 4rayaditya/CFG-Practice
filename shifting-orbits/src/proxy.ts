import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  // Update session
  const { supabaseResponse, user } = await updateSession(request)

  const path = request.nextUrl.pathname

  // Public paths
  if (path === '/' || path.startsWith('/login') || path.startsWith('/auth')) {
    return supabaseResponse
  }

  if (!user) {
    // If no user, redirect to login
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Get user role from user_metadata (default to student if missing)
  const role = user.user_metadata?.role || 'student'

  // Route Guards based on Role
  if (path.startsWith('/student') && role !== 'student') {
    return redirectBasedOnRole(request, role)
  }

  if (path.startsWith('/volunteer') && role !== 'volunteer') {
    return redirectBasedOnRole(request, role)
  }

  if (path.startsWith('/admin') && role !== 'admin') {
    return redirectBasedOnRole(request, role)
  }

  // If user is logged in and visits root "/", redirect to their dashboard
  if (path === '/') {
    return redirectBasedOnRole(request, role)
  }

  return supabaseResponse
}

function redirectBasedOnRole(request: NextRequest, role: string) {
  const redirectUrl = request.nextUrl.clone()
  if (role === 'admin') {
    redirectUrl.pathname = '/admin'
  } else if (role === 'volunteer') {
    redirectUrl.pathname = '/volunteer'
  } else {
    redirectUrl.pathname = '/student'
  }
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. manifest.json)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
