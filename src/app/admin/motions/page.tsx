// src/app/admin/motions/page.tsx

import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import DeleteButton from '@/components/admin/DeleteButton';
import { deleteMotion } from '@/lib/actions';

interface MotionView {
  id: string;
  title: string;
  result: string | null;
  meetings: { topic: string }[] | null;
  personnel: { name: string }[] | null;
}

const getResultBadge = (result: string | null) => {
    if (result === 'ผ่าน') return <span className="badge bg-success">ผ่าน</span>;
    if (result === 'ไม่ผ่าน') return <span className="badge bg-danger">ไม่ผ่าน</span>;
    return <span className="badge bg-secondary">รอลงมติ</span>;
};

export default async function AdminMotionsPage() {
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

  const { data: motions, error } = await supabase
    .from('motions')
    .select(`
      id,
      title,
      result,
      meetings ( topic ),
      personnel ( name )
    `)
    .order('created_at', { ascending: false });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-dark-blue">จัดการญัตติ</h1>
        <Link href="/admin/motions/create" className="btn btn-primary">
          + เสนอญัตติใหม่
        </Link>
      </div>

      {error ? (
        <div className="alert alert-danger">เกิดข้อผิดพลาด: {error.message}</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ชื่อญัตติ</th>
                    <th>ผู้เสนอ</th>
                    <th>ผลการลงมติ</th>
                    <th className="text-center" style={{ width: '150px' }}>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {(motions as MotionView[])?.map((motion) => (
                    <tr key={motion.id}>
                      <td>{motion.title}</td>
                      <td>{motion.personnel?.[0]?.name || 'N/A'}</td>
                      <td>{getResultBadge(motion.result)}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Link href={`/admin/motions/${motion.id}/edit`} className="btn btn-info btn-sm">
                            แก้ไข
                          </Link>
                          <DeleteButton idToDelete={motion.id} formAction={deleteMotion} />
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
