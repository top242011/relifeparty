// src/app/admin/motions/create/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import Link from 'next/link'

interface Meeting { id: string; topic: string; date: string; }
interface Personnel { id: string; name: string; }

export default function CreateMotionPage() {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [meetingId, setMeetingId] = useState('')
  const [proposerId, setProposerId] = useState('')
  
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: meetingsData } = await supabase.from('meetings').select('id, topic, date').order('date', { ascending: false });
      const { data: personnelData } = await supabase.from('personnel').select('id, name').eq('is_active', true).order('name');
      setMeetings(meetingsData || [])
      setPersonnel(personnelData || [])
    }
    fetchData()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase
      .from('motions')
      .insert([{ 
        title, 
        details,
        meeting_id: meetingId || null,
        proposer_id: proposerId || null,
        result: 'รอลงมติ'
      }])

    if (error) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`)
    } else {
      setMessage('เสนอญัตติสำเร็จ!')
      router.push('/admin/motions')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4">เสนอญัตติใหม่</h1>
        <div className="card shadow-sm p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">ชื่อญัตติ</label>
              <input type="text" className="form-control" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="details" className="form-label">รายละเอียด</label>
              <textarea className="form-control" id="details" rows={5} value={details} onChange={(e) => setDetails(e.target.value)}></textarea>
            </div>
             <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="meetingId" className="form-label">เสนอในการประชุม</label>
                    <select id="meetingId" className="form-select" value={meetingId} onChange={(e) => setMeetingId(e.target.value)}>
                        <option value="">-- ไม่ระบุ --</option>
                        {meetings.map(m => <option key={m.id} value={m.id}>{new Date(m.date).toLocaleDateString('th-TH')} - {m.topic}</option>)}
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="proposerId" className="form-label">ผู้เสนอ</label>
                    <select id="proposerId" className="form-select" value={proposerId} onChange={(e) => setProposerId(e.target.value)}>
                        <option value="">-- ไม่ระบุ --</option>
                        {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>
            <button type="submit" className="btn btn-primary me-2" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกญัตติ'}
            </button>
            <Link href="/admin/motions" className="btn btn-secondary">ยกเลิก</Link>
          </form>
          {message && <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
        </div>
      </main>
    </div>
  )
}
