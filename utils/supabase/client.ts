// utils/supabase/client.ts
// นี่จะเป็นไฟล์เดียวที่เราใช้สร้าง Supabase Client

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // สร้าง Client สำหรับใช้งานในเบราว์เซอร์โดยเฉพาะ
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
