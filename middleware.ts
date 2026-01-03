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
                getAll() {
                    return req.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        req.cookies.set(name, value)
                        res.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Routes that require authentication
    const protectedRoutes = ['/dashboard', '/groups', '/add-expense', '/profile', '/settle', '/group']

    // Public routes that should NOT be accessible if already logged in (optional but good)
    const authRoutes = ['/auth']

    const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route))

    // 1. Redirect to login if user is not authenticated and tries to access protected content
    if (!session && isProtectedRoute) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/auth'
        redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // 2. Redirect to dashboard if user is authenticated and tries to access auth pages
    if (session && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public folder)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}
