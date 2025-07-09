// src/app/admin/meetings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import DeleteButton from '@/components/admin/DeleteButton'

interface Meeting {
  id: string;
  date: string;
  topic: string;
  scope: string; // Add scope
}

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeetings = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setMeetings(data)
      }
      setLoading(false)
    }

    fetchMeetings()
  }, [])

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case 'General Assembly': return <span className="badge bg-primary">สภาใหญ่</span>;
      case 'Rangsit': return <span className="badge bg-info text-dark">ศูนย์รังสิต</span>;
      case 'Tha Prachan': return <span className="badge bg-warning text-dark">ศูนย์ท่าพระจันทร์</span>;
      case 'Lampang': return <span className="badge bg-secondary">ศูนย์ลำปาง</span>;
      default: return <span className="badge bg-light text-dark">{scope}</span>;
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-dark-blue">จัดการการประชุมสภา</h1>
          <Link href="/admin/meetings/create" className="btn btn-primary">
            + เพิ่มการประชุม
          </Link>
        </div>

        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : error ? (
          <div className="alert alert-danger">เกิดข้อผิดพลาด: {error}</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>วันที่ประชุม</th>
                  <th>หัวข้อหลัก</th>
                  <th>ขอบเขต</th>
                  <th className="text-end">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting) => (
                  <tr key={meeting.id}>
                    <td>{new Date(meeting.date).toLocaleDateString('th-TH', { dateStyle: 'long' })}</td>
                    <td>{meeting.topic}</td>
                    <td>{getScopeBadge(meeting.scope)}</td>
                    <td className="text-end">
                      <Link href={`/admin/meetings/${meeting.id}/edit`} className="btn btn-success btn-sm me-2">
                        <i className="bi bi-clipboard-check me-1"></i> บันทึกผลการประชุม
                      </Link>
                      <DeleteButton recordId={meeting.id} tableName="meetings" />
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
