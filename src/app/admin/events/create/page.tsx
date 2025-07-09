// src/app/admin/events/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import Link from 'next/link'

export default function CreateEventPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase
      .from('events') // 👈 เปลี่ยนเป็นตาราง 'events'
      .insert([
        {
          title,
          description,
          eventDate,
          location,
        },
      ])

    if (error) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`)
    } else {
      setMessage('เพิ่มกิจกรรมสำเร็จ!')
      router.push('/admin/events')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4 text-dark-blue">เพิ่มกิจกรรมใหม่</h1>
        <div className="card shadow-sm p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">ชื่อกิจกรรม</label>
              <input type="text" className="form-control" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">รายละเอียด</label>
              <textarea className="form-control" id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="eventDate" className="form-label">วันที่จัดกิจกรรม</label>
              <input type="date" className="form-control" id="eventDate" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="location" className="form-label">สถานที่ (ถ้ามี)</label>
              <input type="text" className="form-control" id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary me-2" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกกิจกรรม'}
            </button>
            <Link href="/admin/events" className="btn btn-secondary">ยกเลิก</Link>
          </form>
          {message && <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
        </div>
      </main>
    </div>
  )
}
