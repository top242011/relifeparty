import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This function creates a Supabase client that is configured for Server Components.
// It uses the 'cookies' function from Next.js to securely handle authentication.
export function createClient() {
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
            // This error is expected when trying to set a cookie from a Server Component.
            // It can be safely ignored if you have middleware handling session refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // This error is expected when trying to remove a cookie from a Server Component.
            // It can be safely ignored if you have middleware handling session refresh.
          }
        },
      },
    }
  )
}
