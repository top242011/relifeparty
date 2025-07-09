// src/app/admin/layout.tsx
// ไม่ต้องใช้ 'use client' อีกต่อไป
import { createClient } from '../../../utils/supabase/server'; // 👈 เปลี่ยนไปใช้ server client
import AuthProvider from './AuthProvider'; // 👈 เรียกใช้ Client Component ที่เราสร้างขึ้น
import type { ReactNode } from 'react';

// ทำให้ Layout เป็น async Server Component
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  // ตรวจสอบ user session บน server
  const { data: { user } } = await supabase.auth.getUser();

  // ส่งข้อมูล user ที่ได้จาก server ไปให้ AuthProvider ที่เป็น client component
  return (
    <AuthProvider serverUser={user}>
      {children}
    </AuthProvider>
  );
}
