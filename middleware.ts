import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // รีเฟรช session และดึงข้อมูลผู้ใช้
  const { data: { user } } = await supabase.auth.getUser()

  // ---- ตรรกะการป้องกันเส้นทาง ----

  // 1. ถ้าผู้ใช้ยังไม่ล็อกอิน และกำลังพยายามเข้าหน้าใน /admin/... (ยกเว้นหน้า /admin/login)
  if (!user && request.nextUrl.pathname.startsWith('/admin/') && request.nextUrl.pathname !== '/admin/login') {
    // ให้ส่งกลับไปที่หน้า login
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // 2. ถ้าผู้ใช้ล็อกอินแล้ว และกำลังจะเข้าหน้า /admin/login
  if (user && request.nextUrl.pathname === '/admin/login') {
    // ให้ส่งไปที่หน้า dashboard ทันที
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // ---- จบตรรกะการป้องกันเส้นทาง ----

  // ส่ง response กลับไป ซึ่งอาจจะมี Set-Cookie ตัวใหม่ (หากมีการรีเฟรช token)
  return response
}

// กำหนดให้ middleware ทำงานกับเส้นทางของ admin เท่านั้น
export const config = {
  matcher: ['/admin/:path*'],
}