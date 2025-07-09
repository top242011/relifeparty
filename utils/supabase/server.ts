// utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// นี่คือฟังก์ชันเดียวที่เราจะใช้สำหรับสร้าง Client บน Server ทั้งหมด
export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // นี่เป็นเรื่องปกติเมื่อพยายาม set cookie ใน Server Actions/Route Handlers
            // ซึ่งเราสามารถละเลยได้ถ้ามี Middleware คอยจัดการ Session อยู่แล้ว
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // เช่นเดียวกับด้านบน
          }
        },
      },
    }
  )
}