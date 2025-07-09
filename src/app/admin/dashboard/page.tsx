// src/app/admin/dashboard/page.tsx
import { redirect } from 'next/navigation';
// 🔽 1. เปลี่ยนชื่อฟังก์ชันที่ import
import { createSupabaseServerClient } from 'utils/supabase/server';
import AdminNavbar from 'src/components/admin/AdminNavbar';
import Link from 'next/link';

// src/app/admin/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server' // 👈 1. Import ฟังก์ชันที่ถูกต้อง
import { redirect } from 'next/navigation'
import AdminNavbar from '@/components/admin/AdminNavbar' // ใช้ Path Alias เพื่อความสะอาด
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = createClient() // 👈 2. เรียกใช้ฟังก์ชันที่ถูกต้อง

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/admin/login')
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4 text-dark-blue">Admin Dashboard</h1>
        <p className="mt-4 text-dark-blue">
          ยินดีต้อนรับ, {data.user.email}!
        </p>
        <p>คุณเข้าสู่ระบบสำเร็จแล้ว!</p>
      </main>
    </div>
  )
}

export default async function AdminDashboardPage() {
  // 🔽 2. เปลี่ยนชื่อฟังก์ชันที่เรียกใช้ และส่ง true เพื่อบอกว่าเป็นโหมดอ่านอย่างเดียว
  const supabase = createSupabaseServerClient(true);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // ดึงข้อมูลสรุป (ตัวอย่าง)
  const { count: policyCount } = await supabase.from('policies').select('*', { count: 'exact', head: true });

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4 text-dark-blue">Admin Dashboard</h1>
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card text-dark-blue shadow-sm">
              <div className="card-body">
                <h5 className="card-title">นโยบายทั้งหมด</h5>
                <p className="card-text fs-2 fw-bold">{policyCount ?? 0}</p>
                <Link href="/admin/policies" className="btn btn-primary btn-sm">จัดการ</Link>
              </div>
            </div>
          </div>
          {/* สามารถเพิ่ม Card อื่นๆ ได้ตามต้องการ */}
        </div>
        <p className="mt-4 text-dark-blue">ยินดีต้อนรับ, {user?.email || 'Admin'}!</p>
      </main>
      <footer className="footer mt-auto py-3 bg-light border-top">
        <div className="container text-center text-muted">
          &copy; {new Date().getFullYear()} Relife Party Admin
        </div>
      </footer>
    </div>
  );
}