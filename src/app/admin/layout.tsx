// src/app/admin/layout.tsx

// ไฟล์นี้ "ห้าม" import global css เช่น 'bootstrap.min.css' หรือ './globals.css'
import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
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

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <AdminNavbar />
        <main className="flex-grow-1 bg-light p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
