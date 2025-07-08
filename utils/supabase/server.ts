// utils/supabase/server.ts

import { createClient as _createClient } from '@supabase/supabase-js';
import { createServerClient as _createServerClient } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';
import type { CookieOptions } from '@supabase/ssr';

interface CookieHandler {
  get: (name: string) => string | undefined | null;
  set?: (name: string, value: string, options: CookieOptions) => void;
  remove?: (name: string, options: CookieOptions) => void;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const createServerClient = (
  cookiesInstance?: CookieHandler
) => {
  const cookieStore = cookiesInstance || nextCookies();

  return _createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          if (cookieStore.set) {
            // ใช้ Type Assertion เพื่อบอก TypeScript ว่า cookieStore เป็น CookieHandler
            (cookieStore as CookieHandler).set(name, value, options);
          } else {
            console.warn('Attempted to set cookie on a read-only cookie store.');
          }
        },
        remove: (name: string, options: CookieOptions) => {
          if (cookieStore.remove) {
            // ใช้ Type Assertion เพื่อบอก TypeScript ว่า cookieStore เป็น CookieHandler
            (cookieStore as CookieHandler).remove(name, options); // และแก้ typo: ลบ 'value' ออกตามที่แจ้งไปก่อนหน้านี้
          } else {
            console.warn('Attempted to remove cookie on a read-only cookie store.');
          }
        },
      },
    }
  );
};
export const createAdminClient = () => {
  return _createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
};