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

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  let isAdmin = false

  if (session) {
    const { data: userRole, error: roleError } = await supabase
      .from('user_role')
      .select('role_id, role_name')
      .eq('user_id', session.user.id)
      .single()

    if (roleError) {
      console.error('Error fetching user role:', roleError);
      const redirectUrl = new URL('/', req.url)
      return NextResponse.redirect(redirectUrl)
    } else {
      isAdmin = userRole?.role_name.toLowerCase() === 'admin'
    }

    if (isAdminRoute && !isAdmin) {
      console.log('User not authorized, isAdminRoute: ', isAdminRoute, 'isAdmin:', isAdmin)
      const redirectUrl = new URL('/', req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  const publicRoutes = ['/auth/login', '/auth/register']
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  console.log('Current path:', req.nextUrl.pathname)
  console.log('Session exists:', !!session)
  console.log('Is public route:', isPublicRoute)

  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/auth/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (session && isPublicRoute) {
    const redirectUrl = new URL('/', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}



// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     *
     * It will apply to both UI routes and API routes.
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
} 