// middleware.ts
import { createServerClient } from './utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient({
    get(name: string) {
      return request.cookies.get(name)?.value
    },
    set(name: string, value: string, options) {
      request.cookies.set({ name, value, ...options })
      response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })
      response.cookies.set({ name, value, ...options })
    },
    remove(name: string, options) {
      request.cookies.set({ name, value: '', ...options })
      response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })
      response.cookies.set({ name, value: '', ...options })
    },
  })

  // Refresh session if expired - this will refresh the token if it's expired
  const { data: { user } } = await supabase.auth.getUser()

  // 1. ถ้ายังไม่ล็อกอิน และพยายามเข้าหน้า /admin อื่นๆ ที่ไม่ใช่หน้า login
  if (!user && request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    // ให้ redirect ไปยังหน้า login
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // 2. ถ้าล็อกอินแล้ว และกำลังจะเข้าหน้า login (เช่นกดปุ่ม back)
  if (user && request.nextUrl.pathname === '/admin/login') {
    // ให้ redirect ไปยังหน้า dashboard ทันที
    const url = request.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }


  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}