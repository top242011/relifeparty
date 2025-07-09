// src/app/admin/events/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import DeleteButton from '@/components/admin/DeleteButton'

interface Event {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  created_at: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('events') // 👈 เปลี่ยนเป็นตาราง 'events'
        .select('*')
        .order('eventDate', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setEvents(data)
      }
      setLoading(false)
    }

    fetchEvents()
  }, [])

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-dark-blue">จัดการกิจกรรม</h1>
          <Link href="/admin/events/create" className="btn btn-primary">
            + เพิ่มกิจกรรมใหม่
          </Link>
        </div>

        {loading ? (
          <p>กำลังโหลดข้อมูลกิจกรรม...</p>
        ) : error ? (
          <div className="alert alert-danger">เกิดข้อผิดพลาด: {error}</div>
        ) : events.length === 0 ? (
          <div className="alert alert-info">ยังไม่มีกิจกรรมในระบบ</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover shadow-sm rounded overflow-hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <th scope="col">ชื่อกิจกรรม</th>
                  <th scope="col">วันที่จัด</th>
                  <th scope="col">สถานที่</th>
                  <th scope="col">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {events.map((eventItem) => (
                  <tr key={eventItem.id}>
                    <td>{eventItem.title}</td>
                    <td>{new Date(eventItem.eventDate).toLocaleDateString('th-TH')}</td>
                    <td>{eventItem.location || '-'}</td>
                    <td>
                      <Link href={`/admin/events/${eventItem.id}/edit`} className="btn btn-info btn-sm me-2">
                        แก้ไข
                      </Link>
                      <DeleteButton recordId={eventItem.id} tableName="events" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
