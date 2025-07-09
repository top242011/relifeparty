// src/app/admin/meetings/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import Link from 'next/link'

export default function CreateMeetingPage() {
  const [date, setDate] = useState('')
  const [topic, setTopic] = useState('')
  const [scope, setScope] = useState('General Assembly') // 👈 Add state for scope
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    // 👈 Add scope to the insert object
    const { data: newMeeting, error } = await supabase
      .from('meetings')
      .insert([{ date, topic, scope }])
      .select('id')
      .single()

    if (error) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`)
      setLoading(false)
    } else {
      setMessage('เพิ่มการประชุมสำเร็จ! กำลังไปที่หน้าบันทึกผล...')
      // Redirect directly to the new edit page to start recording attendance
      router.push(`/admin/meetings/${newMeeting.id}/edit`)
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4">เพิ่มการประชุมใหม่</h1>
        <div className="card shadow-sm p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="date" className="form-label">วันที่ประชุม</label>
              <input type="date" className="form-control" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="topic" className="form-label">หัวข้อการประชุมหลัก</label>
              <textarea className="form-control" id="topic" rows={3} value={topic} onChange={(e) => setTopic(e.target.value)} required></textarea>
            </div>
            {/* 👇 New dropdown for meeting scope */}
            <div className="mb-3">
              <label htmlFor="scope" className="form-label">ขอบเขตการประชุม</label>
              <select id="scope" className="form-select" value={scope} onChange={(e) => setScope(e.target.value)}>
                <option value="General Assembly">การประชุมสภาใหญ่ (ทุกศูนย์)</option>
                <option value="Rangsit">ประชุมเฉพาะศูนย์รังสิต</option>
                <option value="Tha Prachan">ประชุมเฉพาะศูนย์ท่าพระจันทร์</option>
                <option value="Lampang">ประชุมเฉพาะศูนย์ลำปาง</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary me-2" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกและไปต่อ'}
            </button>
            <Link href="/admin/meetings" className="btn btn-secondary">ยกเลิก</Link>
          </form>
          {message && <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
        </div>
      </main>
    </div>
  )
}
