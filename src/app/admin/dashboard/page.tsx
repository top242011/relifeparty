// src/app/admin/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from 'utils/supabase/server'; // ใช้ Server-side Supabase Client
import AdminNavbar from 'src/components/admin/AdminNavbar'; // Import AdminNavbar
import Link from 'next/link';

export default async function AdminDashboardPage() {
  // สร้าง Supabase Client สำหรับ Server-side
  // Middleware จะจัดการ session ให้แล้ว
  const supabase = createServerClient();

  // ตรวจสอบสถานะการ Login ของผู้ใช้
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // เพิ่ม console.log สำหรับ Debugging
  console.log('User in AdminDashboardPage:', user);
  if (userError) {
    console.error('Error fetching user in AdminDashboardPage:', userError);
  }

  // หากผู้ใช้ไม่ได้ Login ให้ redirect ไปยังหน้า Login
  if (!user) {
    console.log('No user found, redirecting to login.');
    redirect('/admin/login');
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar /> {/* ใช้ AdminNavbar Component */}

      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4 text-dark-blue">Admin Dashboard</h1>
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card text-dark-blue shadow-sm">
              <div className="card-body">
                <h5 className="card-title">นโยบายทั้งหมด</h5>
                <p className="card-text fs-2 fw-bold">XX</p> {/* Placeholder */}
                <Link href="/admin/policies" className="btn btn-primary btn-sm">จัดการ</Link>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card text-dark-blue shadow-sm">
              <div className="card-body">
                <h5 className="card-title">ข่าวสารทั้งหมด</h5>
                <p className="card-text fs-2 fw-bold">XX</p> {/* Placeholder */}
                <Link href="/admin/news" className="btn btn-primary btn-sm">จัดการ</Link>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card text-dark-blue shadow-sm">
              <div className="card-body">
                <h5 className="card-title">กิจกรรมทั้งหมด</h5>
                <p className="card-text fs-2 fw-bold">XX</p> {/* Placeholder */}
                <Link href="/admin/events" className="btn btn-primary btn-sm">จัดการ</Link>
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
