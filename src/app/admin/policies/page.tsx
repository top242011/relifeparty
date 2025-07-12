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

  if (error) {
    return <p className="text-danger">Error fetching policies: {error.message}</p>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>จัดการนโยบาย</h1>
        <Link href="/admin/policies/create" className="btn btn-success">
          + สร้างใหม่
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th scope="col">ชื่อนโยบาย</th>
                <th scope="col">รายละเอียด</th>
                <th scope="col" style={{ width: '150px' }}>
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {policies?.map((policy: Policy) => (
                <tr key={policy.id}>
                  <td>{policy.title}</td>
                  <td>{policy.description}</td>
                  <td>
                    <Link
                      href={`/admin/policies/${policy.id}/edit`}
                      className="btn btn-primary btn-sm me-2"
                    >
                      แก้ไข
                    </Link>
                    <DeleteButton idToDelete={policy.id} formAction={deletePolicy} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
