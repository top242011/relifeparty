import Link from 'next/link';
// --- FIX: Remove direct imports from supabase/ssr and cookies ---
// import { cookies } from 'next/headers';
// import { createServerClient } from '@supabase/ssr';
import { createClient } from '../../../../utils/supabase/server'; // --- FIX: Import the centralized client ---
import { Policy } from '@/lib/definitions';
import DeleteButton from '@/components/admin/DeleteButton';
import { deletePolicy } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function PoliciesPage() {
  // --- FIX: Use the centralized createClient function ---
  const supabase = createClient();

  const { data: policies, error } = await supabase
    .from('policies')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>จัดการนโยบาย</h1>
        <Link href="/admin/policies/create" className="btn btn-success">
          + สร้างใหม่
        </Link>
      </div>

      {error ? (
         <div className="alert alert-danger">เกิดข้อผิดพลาด: {error.message}</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th scope="col">ชื่อนโยบาย</th>
                    <th scope="col">รายละเอียด</th>
                    <th scope="col" style={{ width: '150px', textAlign: 'center' }}>
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {policies?.map((policy: Policy) => (
                    <tr key={policy.id}>
                      <td>{policy.title}</td>
                      <td>{policy.description || '-'}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Link
                            href={`/admin/policies/${policy.id}/edit`}
                            className="btn btn-primary btn-sm"
                          >
                            แก้ไข
                          </Link>
                          <DeleteButton idToDelete={policy.id} formAction={deletePolicy} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
