// src/app/layout.tsx

// 1. นำเข้า Global CSS ทั้งหมดที่ไฟล์นี้ ที่เดียวเท่านั้น
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Relife Party Admin',
  description: 'ระบบจัดการหลังบ้านสำหรับเว็บไซต์ Relife Party',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
