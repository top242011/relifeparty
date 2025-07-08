// src/app/admin/policies/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from 'utils/supabase/server';
import AdminNavbar from '../../../components/admin/AdminNavbar';
import Link from 'next/link';
import DeletePolicyButton from 'src/components/admin/DeletePolicyButton'; // 👈 1. Import Component ใหม่

interface Policy {
  id: string;
  title: string;
  content: string;
  status: string;
  publishDate: string;
  imageUrl: string | null;
  created_at: string;
}

export default async function AdminPoliciesPage() {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: policies, error } = await supabase
    .from('policies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching policies:', error);
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
                      {/* 👈 2. ใช้ Component ปุ่มลบใหม่ที่นี่ */}
                      <DeletePolicyButton policyId={policy.id} />
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