import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // เปลี่ยนจาก Geist เป็น Inter
import Script from 'next/script'; // Import Script component
import './globals.css';

// กำหนดฟอนต์ Inter
const inter = Inter({ subsets: ['latin'] });

// กำหนด Metadata สำหรับ SEO
export const metadata: Metadata = {
  title: 'Relife Party - สร้างชีวิตใหม่ให้ธรรมศาสตร์',
  description: 'แพลตฟอร์ม Open Data สำหรับพรรค Relife Party มหาวิทยาลัยธรรมศาสตร์',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={inter.className}> {/* ใช้ className ของ Inter */}
        {children}
        {/* เพิ่ม Bootstrap JavaScript */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" // แก้ไข xintegrity เป็น integrity
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}