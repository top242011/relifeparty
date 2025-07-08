// app/admin/policies/page.tsx
// หน้าสำหรับแสดงรายการนโยบายใน Admin Dashboard

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from 'utils/supabase/server'; // ใช้ Server-side Supabase Client
import AdminNavbar from '../../../components/admin/AdminNavbar'; // Import AdminNavbar
import Link from 'next/link';

interface Policy {
  id: string;
  title: string;
  content: string;
  status: string;
  publishDate: string; // เพิ่ม publishDate
  imageUrl: string | null; // เพิ่ม imageUrl
  created_at: string;
}

export default async function AdminPoliciesPage() {
  const supabase = createServerClient();

  // ตรวจสอบสถานะการ Login ของผู้ใช้
  const { data: { user } } = await supabase.auth.getUser();

  // หากผู้ใช้ไม่ได้ Login ให้ redirect ไปยังหน้า Login
  if (!user) {
    redirect('/admin/login');
  }

  // ดึงข้อมูลนโยบายทั้งหมดจาก Supabase
  const { data: policies, error } = await supabase
    .from('policies')
    .select('*')
    .order('created_at', { ascending: false }); // เรียงตามวันที่สร้างล่าสุด

  if (error) {
    console.error('Error fetching policies:', error);
    // สามารถแสดงข้อความ Error บนหน้าจอได้
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <AdminNavbar />
        <main className="container flex-grow-1 py-4">
          <h1 className="mb-4 text-dark-blue">จัดการนโยบาย</h1>
          <div className="alert alert-danger" role="alert">
            เกิดข้อผิดพลาดในการโหลดนโยบาย: {error.message}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4 text-dark-blue">จัดการนโยบาย</h1>
        <div className="d-flex justify-content-end mb-3">
          <Link href="/admin/policies/create" className="btn btn-dark-blue">
            + เพิ่มนโยบายใหม่
          </Link>
        </div>

        {policies.length === 0 ? (
          <div className="alert alert-info" role="alert">
            ยังไม่มีนโยบายในระบบ
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover shadow-sm rounded overflow-hidden">
              <thead className="bg-dark-blue text-white">
                <tr>
                  <th scope="col">ชื่อนโยบาย</th>
                  <th scope="col">สถานะ</th>
                  <th scope="col">วันที่เผยแพร่</th>
                  <th scope="col">สร้างเมื่อ</th>
                  <th scope="col">รูปภาพ</th>
                  <th scope="col">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id}>
                    <td>{policy.title}</td>
                    <td><span className={`badge ${policy.status === 'สำเร็จ' ? 'bg-success' : policy.status === 'กำลังดำเนินการ' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{policy.status}</span></td>
                    <td>{new Date(policy.publishDate).toLocaleDateString('th-TH')}</td>
                    <td>{new Date(policy.created_at).toLocaleDateString('th-TH')}</td>
                    <td>
                      {policy.imageUrl ? (
                        <img src={policy.imageUrl} alt={policy.title} className="img-thumbnail" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/admin/policies/${policy.id}/edit`} className="btn btn-info btn-sm me-2">
                        แก้ไข
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={async () => {
                          'use client'; // ต้องระบุว่าเป็น Client Component เพื่อใช้ onClick
                          // Prompt for confirmation before deleting
                          if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบนโยบายนี้?')) {
                            const { getSupabaseBrowserClient } = await import('../../../../utils/supabase/client');
                            const supabaseClient = getSupabaseBrowserClient();
                            const { error: deleteError } = await supabaseClient
                              .from('policies')
                              .delete()
                              .eq('id', policy.id);

                            if (deleteError) {
                              alert(`เกิดข้อผิดพลาดในการลบนโยบาย: ${deleteError.message}`);
                            } else {
                              alert('ลบนโยบายสำเร็จ');
                              window.location.reload(); // Refresh the page to show updated list
                            }
                          }
                        }}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="footer mt-auto py-3 bg-light border-top">
        <div className="container text-center text-muted">
          &copy; {new Date().getFullYear()} Relife Party Admin
        </div>
      </footer>
    </div>
  );
}
