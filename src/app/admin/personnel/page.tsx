// src/app/admin/personnel/page.tsx

import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import DeleteButton from '@/components/admin/DeleteButton';
import { deletePersonnel } from '@/lib/actions'; // 1. Import action

// 2. กำหนด Type สำหรับข้อมูล
interface Personnel {
  id: string;
  name: string;
  position: string;
  image_url: string | null;
}

// 3. เปลี่ยนเป็น Server Component
export default async function AdminPersonnelPage() {
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

  // 4. ดึงข้อมูลโดยตรง
  const { data: personnel, error } = await supabase
    .from('personnel')
    .select('*')
    .order('name', { ascending: true });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-dark-blue">จัดการบุคลากร</h1>
        <Link href="/admin/personnel/create" className="btn btn-primary">
          + เพิ่มบุคลากรใหม่
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
                    <th style={{width: '50px'}}>รูป</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ตำแหน่ง</th>
                    <th className="text-center" style={{ width: '150px' }}>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {personnel?.map((person: Personnel) => (
                    <tr key={person.id}>
                      <td>
                        <Image
                          src={person.image_url || 'https://placehold.co/100x100/EFEFEF/AAAAAA&text=No+Image'}
                          alt={`รูปของ ${person.name}`}
                          width={40}
                          height={40}
                          className="rounded-circle"
                          style={{ objectFit: 'cover' }}
                        />
                      </td>
                      <td>{person.name}</td>
                      <td>{person.position}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Link href={`/admin/personnel/${person.id}/edit`} className="btn btn-info btn-sm">
                            แก้ไข
                          </Link>
                          {/* 5. เรียกใช้ DeleteButton ด้วย props ที่ถูกต้อง */}
                          <DeleteButton idToDelete={person.id} formAction={deletePersonnel} />
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
