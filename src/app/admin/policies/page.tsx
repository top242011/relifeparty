// src/app/admin/policies/page.tsx

import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Policy } from '@/lib/definitions';
import DeleteButton from '@/components/admin/DeleteButton';
import { deletePolicy } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function PoliciesPage() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
      },
    }
  );

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
