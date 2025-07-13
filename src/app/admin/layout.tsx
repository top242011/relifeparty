// src/app/admin/layout.tsx

import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
// import Sidebar from "@/components/admin/Sidebar"; // 1. ลบการ import Sidebar ที่ไม่ได้ใช้ออก
import AdminNavbar from "@/components/admin/AdminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/admin/login");
  }

  // 2. แก้ไขโครงสร้าง Layout ทั้งหมด
  // ลบ <div className="d-flex"> และ <Sidebar /> ออก
  // ให้เหลือโครงสร้างแบบคอลัมน์เดียว ที่มี AdminNavbar อยู่ด้านบนสุด
  return (
    <div>
      <AdminNavbar />
      <main className="container-fluid p-4">
        {children}
      </main>
    </div>
  );
}
