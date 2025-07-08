// utils/supabase/client.ts
// Supabase Client สำหรับฝั่ง Client-side (Frontend)

import { createClient } from '@supabase/supabase-js';

// ตรวจสอบว่า Environment Variables ถูกตั้งค่าแล้ว
// NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY
// จะถูกโหลดโดย Next.js โดยอัตโนมัติเมื่อรันในฝั่ง Client-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ตรวจสอบว่า environment variables ถูกกำหนดหรือไม่
if (!supabaseUrl || !supabaseAnonKey) {
  // หากไม่ถูกกำหนด ให้ throw error เพื่อป้องกันการทำงานผิดพลาด
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// สร้าง Supabase Client Instance สำหรับฝั่ง Browser
// เปลี่ยนชื่อฟังก์ชันที่ export เพื่อไม่ให้ชนกับ createClient ที่ import มา
export const getSupabaseBrowserClient = () => {
  return createClient( // ใช้ createClient ที่ import เข้ามา
    supabaseUrl,
    supabaseAnonKey
  );
};
