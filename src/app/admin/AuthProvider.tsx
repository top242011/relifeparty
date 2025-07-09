// src/app/admin/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { ReactNode } from 'react';

// Component นี้จะรับผิดชอบ Logic ฝั่ง Client ทั้งหมด
export default function AuthProvider({
  serverUser,
  children,
}: {
  serverUser: User | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ตรวจสอบข้อมูล user ที่ส่งมาจาก Server Component
    // ถ้าไม่มี user และไม่ได้อยู่ที่หน้า login ให้ redirect
    if (!serverUser && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [serverUser, pathname, router]);

  // ถ้ามี user หรืออยู่ที่หน้า login ก็ให้แสดงเนื้อหาของ Page นั้นๆ
  if (serverUser || pathname === '/admin/login') {
    return <>{children}</>;
  }

  // ระหว่างรอ redirect หรือตรวจสอบ ให้แสดงหน้า Loading
  return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
  );
}
