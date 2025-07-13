// src/components/admin/Toaster.tsx
'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

// นี่คือ Component ที่จะนำไปวางใน Layout เพื่อให้ระบบพร้อมใช้งาน Toast
export function Toaster() {
  return (
    <HotToaster
      position="top-right" // แสดงผลที่มุมขวาบน
      toastOptions={{
        // กำหนดสไตล์เริ่มต้นสำหรับ Toast
        style: {
          background: '#333',
          color: '#fff',
          zIndex: 9999,
        },
        success: {
          duration: 3000, // แสดงผล 3 วินาที
          iconTheme: {
            primary: '#10B981', // สีไอคอน Success (เขียว)
            secondary: '#fff',
          },
        },
        error: {
          duration: 5000, // แสดงผล 5 วินาที
           iconTheme: {
            primary: '#EF4444', // สีไอคอน Error (แดง)
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
