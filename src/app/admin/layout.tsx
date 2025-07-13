// src/app/admin/layout.tsx

import { createClient } from "../../../utils/supabase/server";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AuthProvider from "./AuthProvider"; // 1. Import AuthProvider

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. ลบ Logic การ redirect ฝั่ง Server ออกทั้งหมด
  // และใช้ AuthProvider ในการจัดการแทน
  return (
    <AuthProvider serverUser={user}>
      {/* 3. ใช้เงื่อนไขเพื่อแสดง Layout ที่ต่างกัน */}
      {user ? (
        // ถ้ามี user (ล็อกอินแล้ว) ให้แสดง Layout เต็มรูปแบบพร้อม Navbar
        <div>
          <AdminNavbar />
          <main className="container-fluid p-4">
            {children}
          </main>
        </div>
      ) : (
        // ถ้าไม่มี user (ยังไม่ล็อกอิน) ให้แสดงแค่ children
        // ซึ่งก็คือหน้า Login Page โดยไม่มี Navbar
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            {children}
        </div>
      )}
    </AuthProvider>
  );
}
