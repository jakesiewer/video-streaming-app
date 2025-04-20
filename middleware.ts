import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach((cookie) => {
            res.cookies.set(cookie)
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // List of public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register']
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  console.log('Current path:', req.nextUrl.pathname)
  console.log('Session exists:', !!session)
  console.log('Is public route:', isPublicRoute)

  // If the user is not authenticated and trying to access a protected route
  if (!session && !isPublicRoute) {
    console.log('Redirecting to login - No session and not a public route')
    const redirectUrl = new URL('/auth/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is authenticated and trying to access auth pages
  if (session && isPublicRoute) {
    console.log('Redirecting to home - Has session and trying to access public route')
    const redirectUrl = new URL('/', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
} 