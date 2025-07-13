// src/app/admin/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { ReactNode } from 'react';

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
    // Logic การ Redirect จะทำงานที่นี่
    // ถ้าไม่มี user และ "ไม่ได้" อยู่ที่หน้า login ให้ redirect ไปที่หน้า login
    if (!serverUser && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [serverUser, pathname, router]);

  // ถ้ามี user หรือ อยู่ที่หน้า login อยู่แล้ว ก็ให้แสดงเนื้อหาของ Page นั้นๆ
  if (serverUser || pathname === '/admin/login') {
    return <>{children}</>;
  }

  // ระหว่างรอ redirect หรือตรวจสอบ ให้แสดงหน้า Loading
  // นี่คือสิ่งที่ผู้ใช้อาจเห็นแวบเดียวก่อนถูก redirect
  return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
  );
}
