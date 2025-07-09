// src/app/admin/committees/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import Link from 'next/link'

export default function CreateCommitteePage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase
      .from('committees')
      .insert([{ name, description }])

    if (error) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`)
    } else {
      setMessage('เพิ่มคณะกรรมาธิการสำเร็จ!')
      router.push('/admin/committees')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4">เพิ่มคณะกรรมาธิการใหม่</h1>
        <div className="card shadow-sm p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">ชื่อคณะกรรมาธิการ</label>
              <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">คำอธิบายหน้าที่</label>
              <textarea className="form-control" id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>
            <button type="submit" className="btn btn-primary me-2" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
            <Link href="/admin/committees" className="btn btn-secondary">ยกเลิก</Link>
          </form>
          {message && <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
        </div>
      </main>
    </div>
  )
}
