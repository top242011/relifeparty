// src/app/admin/committees/page.tsx

import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import DeleteButton from '@/components/admin/DeleteButton';
import { deleteCommittee } from '@/lib/actions'; // 1. Import action สำหรับลบ

// 2. กำหนด Type สำหรับข้อมูล (ควรย้ายไปที่ definitions.ts ในอนาคต)
interface Committee {
  id: string;
  name: string;
  description: string | null;
}

// 3. เปลี่ยนเป็น Server Component โดยใช้ async
export default async function AdminCommitteesPage() {
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

  // 4. ดึงข้อมูลโดยตรงใน Server Component
  const { data: committees, error } = await supabase
    .from('committees')
    .select('*')
    .order('name', { ascending: true });

  // 5. ไม่จำเป็นต้องมี state สำหรับ loading, error, committees อีกต่อไป

  return (
    // Layout ยังคงเดิม แต่ logic การแสดงผลเปลี่ยนไป
    <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="text-dark-blue">จัดการคณะกรรมาธิการ</h1>
            <Link href="/admin/committees/create" className="btn btn-primary">
                + เพิ่มคณะกรรมาธิการ
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
                                    <th>ชื่อคณะกรรมาธิการ</th>
                                    <th>คำอธิบาย</th>
                                    <th className="text-center" style={{ width: '150px' }}>การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {committees?.map((committee: Committee) => (
                                    <tr key={committee.id}>
                                        <td>{committee.name}</td>
                                        <td>{committee.description || '-'}</td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <Link href={`/admin/committees/${committee.id}/edit`} className="btn btn-info btn-sm">
                                                    แก้ไข
                                                </Link>
                                                {/* 6. เรียกใช้ DeleteButton ด้วย props ที่ถูกต้อง */}
                                                <DeleteButton idToDelete={committee.id} formAction={deleteCommittee} />
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
    </div>
  );
}
