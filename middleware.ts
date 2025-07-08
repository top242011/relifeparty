// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from './utils/supabase/server'; // พาธสัมพัทธ์จาก middleware.ts

export async function middleware(request: NextRequest) {
  // สร้าง Response object เพื่อให้สามารถแก้ไข cookies ได้
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // สร้าง Supabase client ที่ตั้งค่าให้ใช้ cookies จาก request และ response
  // เพื่อให้ Supabase สามารถอ่านและเขียน cookies ได้ใน middleware
  const supabase = createServerClient({
    get: (name: string) => request.cookies.get(name)?.value,
    set: (name: string, value: string, options: any) => {
      request.cookies.set(name, value, options);
      response.cookies.set(name, value, options);
    },
    remove: (name: string, options: any) => {
      request.cookies.set(name, '', options);
      response.cookies.set(name, '', options);
    },
  });

  // Refresh the session
  // นี่คือส่วนสำคัญที่จะทำให้ Supabase พยายาม Refresh session
  // และตั้งค่า cookies ใหม่ (ถ้าจำเป็น) ใน response
  await supabase.auth.getSession();

  // Return the response, potentially with updated cookies
  return response;
}

// กำหนดว่า middleware ควรทำงานกับ paths ใดบ้าง
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any /api/auth/ routes (our auth API routes)
     * - public files (e.g., /vercel.svg)
     * - This ensures middleware runs on all pages that need session handling
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\..*).*)',
  ],
};
