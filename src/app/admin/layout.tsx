// src/app/admin/layout.tsx

import { createClient } from "../../../utils/supabase/server";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AuthProvider from "./AuthProvider";
import { Toaster } from "@/components/admin/Toaster"; // 1. Import Toaster

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthProvider serverUser={user}>
      {/* 2. เพิ่ม Toaster เข้ามาใน Layout */}
      <Toaster /> 
      {user ? (
        <div>
          <AdminNavbar />
          <main className="container-fluid p-4">
            {children}
          </main>
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            {children}
        </div>
      )}
    </AuthProvider>
  );
}
