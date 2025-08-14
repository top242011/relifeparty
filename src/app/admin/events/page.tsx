// src/app/admin/events/page.tsx

import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '../../../../utils/supabase/server'; // แก้ไขที่นี่
import DeleteButton from '@/components/admin/DeleteButton';
import { deleteEvent } from '@/lib/actions';
import type { Event } from '@/lib/definitions'; // แก้ไขที่นี่

export default async function AdminEventsPage() {
  const supabase = createClient(cookies()); // แก้ไขที่นี่

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('eventDate', { ascending: true });

  return (
    <>
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
    </>
  );
}
