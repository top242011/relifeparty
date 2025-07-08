// utils/supabase/server.ts
// Supabase Client สำหรับฝั่ง Server-side (Next.js API Routes หรือ Server Components)

import { createClient as _createClient } from '@supabase/supabase-js';
import { createServerClient as _createServerClient } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers'; // เปลี่ยนชื่อ import เพื่อไม่ให้ชน
import type { CookieOptions } from '@supabase/ssr';

// กำหนด Type สำหรับ Cookie Handler ที่จะส่งให้ createServerClient
// เพื่อรองรับทั้ง ReadonlyRequestCookies (จาก Server Components)
// และ RequestCookies (จาก Middleware/Route Handlers)
interface CookieHandler {
  get: (name: string) => string | undefined | null;
  set?: (name: string, value: string, options: CookieOptions) => void;
  remove?: (name: string, options: CookieOptions) => void;
}

// ตรวจสอบว่า Environment Variables ถูกตั้งค่าแล้ว
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ตรวจสอบว่า environment variables ถูกกำหนดหรือไม่
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

// สร้าง Supabase Client Instance สำหรับฝั่ง Server (สำหรับใช้ใน API Routes หรือ Server Components)
// ฟังก์ชันนี้จะรับ `cookiesInstance` ซึ่งอาจมาจาก middleware หรือจาก next/headers โดยตรง
export const createServerClient = (
  cookiesInstance?: CookieHandler // รับ CookieHandler เป็น Argument
) => {
  // ใช้ cookiesInstance ที่ส่งมา หรือเรียก nextCookies() ถ้าไม่มี
  const cookieStore = cookiesInstance || nextCookies();

  return _createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          // พยายามเรียก set ถ้ามีเมธอดนี้อยู่
          if (cookieStore.set) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // อาจเกิดข้อผิดพลาดถ้าเรียกใน Server Component ที่ response ถูกส่งไปแล้ว
              console.warn('Could not set cookie in Server Component (expected):', error);
            }
          } else {
            // ถ้าไม่มี set method (เช่น ReadonlyRequestCookies)
            console.warn('Attempted to set cookie on a read-only cookie store.');
          }
        },
        remove: (name: string, options: CookieOptions) => {
          // พยายามเรียก remove ถ้ามีเมธอดนี้อยู่
          if (cookieStore.remove) {
            try {
              cookieStore.remove(name, options);
            } catch (error) {
              // อาจเกิดข้อผิดพลาดถ้าเรียกใน Server Component ที่ response ถูกส่งไปแล้ว
              console.warn('Could not remove cookie in Server Component (expected):', error);
            }
          } else {
            // ถ้าไม่มี remove method (เช่น ReadonlyRequestCookies)
            console.warn('Attempted to remove cookie on a read-only cookie store.');
          }
        },
      },
    }
  );
};

// สร้าง Supabase Client สำหรับ Admin โดยเฉพาะ (ใช้ service_role_key โดยตรง)
// เหมาะสำหรับงานที่ต้องการสิทธิ์สูง เช่น การจัดการผู้ใช้ หรือการเข้าถึงข้อมูลที่ละเอียดอ่อน
// ไม่ควรใช้ในส่วนที่ผู้ใช้ทั่วไปเข้าถึงได้
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
