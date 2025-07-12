// src/app/admin/events/page.tsx

import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import DeleteButton from '@/components/admin/DeleteButton';
import { deleteEvent } from '@/lib/actions'; // 1. Import action สำหรับลบ Event

// 2. กำหนด Type สำหรับข้อมูล (ควรย้ายไปที่ definitions.ts ในอนาคต)
interface Event {
  id: string;
  title: string;
  eventDate: string; // Supabase ส่งมาเป็น string ในรูปแบบ ISO 8601
  location: string | null;
}

// 3. เปลี่ยนเป็น Server Component โดยใช้ async
export default async function AdminEventsPage() {
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
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('eventDate', { ascending: true });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-dark-blue">จัดการกิจกรรม</h1>
        <Link href="/admin/events/create" className="btn btn-primary">
          + เพิ่มกิจกรรมใหม่
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
                    <th>ชื่อกิจกรรม</th>
                    <th>วันที่จัด</th>
                    <th>สถานที่</th>
                    <th className="text-center" style={{ width: '150px' }}>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {events?.map((eventItem: Event) => (
                    <tr key={eventItem.id}>
                      <td>{eventItem.title}</td>
                      {/* จัดรูปแบบวันที่ให้สวยงาม */}
                      <td>{new Date(eventItem.eventDate).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                      })}</td>
                      <td>{eventItem.location || '-'}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Link href={`/admin/events/${eventItem.id}/edit`} className="btn btn-info btn-sm">
                            แก้ไข
                          </Link>
                          {/* 5. เรียกใช้ DeleteButton ด้วย props ที่ถูกต้อง */}
                          <DeleteButton idToDelete={eventItem.id} formAction={deleteEvent} />
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
