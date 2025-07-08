// utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// นี่คือเวอร์ชันที่ถูกต้องและแนะนำโดย Supabase
// สังเกตว่าเราไม่ได้ใช้ createClient จาก @supabase/supabase-js โดยตรงสำหรับ Admin อีกต่อไป
// เพื่อให้จัดการ Client ได้ในที่เดียว

export function createSupabaseServerClient(readonly: boolean = false) {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // ถ้าเป็น Readonly (เช่นใน Server Component) เราจะไม่ต้องมี set/remove
        ...(readonly === false && {
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // การโยน error นี้เป็นเรื่องปกติเมื่อพยายาม set cookie ใน Server Actions หรือ Route Handlers
              // ที่พยายามจะ redirect หรือ stream response กลับไปแล้ว
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // เช่นเดียวกับด้านบน
            }
          },
        })
      },
    }
  )
}

// สร้าง Admin client โดยใช้ service_role key
export function createSupabaseAdminClient() {
    const cookieStore = cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // ❗️ ใช้ Service Role Key ที่นี่
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
            // สำหรับ Admin Client เราไม่จำเป็นต้องให้มันจัดการ auth state ของผู้ใช้
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    )
}