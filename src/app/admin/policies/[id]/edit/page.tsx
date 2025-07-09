// src/app/admin/policies/[id]/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../../../utils/supabase/client' // 👈 1. แก้ไข import
import AdminNavbar from 'src/components/admin/AdminNavbar'
import Link from 'next/link'

interface Policy {
  id: string
  title: string
  content: string
  status: string
  publishDate: string
  imageUrl: string | null
  created_at: string
}

export default function EditPolicyPage({ params }: { params: { id: string } }) {
  const policyId = params.id
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient() // 👈 2. แก้ไขการเรียกใช้ฟังก์ชัน

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!policyId) return

      try {
        const { data, error } = await supabase
          .from('policies')
          .select('*')
          .eq('id', policyId)
          .single()

        if (error) throw error

        if (data) {
          setTitle(data.title)
          setContent(data.content)
          setPublishDate(data.publishDate ? new Date(data.publishDate).toISOString().split('T')[0] : '')
          setImageUrl(data.imageUrl || '')
          setStatus(data.status)
        }
      } catch (err: any) {
        setMessage(`เกิดข้อผิดพลาดในการโหลดนโยบาย: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchPolicy()
  }, [policyId, supabase])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('policies')
        .update({
          title,
          content,
          publishDate: publishDate || null,
          imageUrl: imageUrl || null,
          status,
        })
        .eq('id', policyId)

      if (error) throw error

      setMessage('แก้ไขนโยบายสำเร็จ!')
      router.push('/admin/policies')
      router.refresh()
    } catch (err: any) {
      setMessage(`เกิดข้อผิดพลาดในการบันทึก: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <AdminNavbar />
        <main className="container flex-grow-1 py-4 text-center">
          <p className="text-dark-blue">กำลังโหลดข้อมูลนโยบาย...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4 text-dark-blue">แก้ไขนโยบาย</h1>
        <div className="card shadow-sm p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label text-dark-blue">ชื่อนโยบาย</label>
              <input
                type="text"
                className="form-control"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="content" className="form-label text-dark-blue">รายละเอียดนโยบาย</label>
              <textarea
                className="form-control"
                id="content"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={submitting}
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="publishDate" className="form-label text-dark-blue">วันที่เผยแพร่</label>
              <input
                type="date"
                className="form-control"
                id="publishDate"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="imageUrl" className="form-label text-dark-blue">URL รูปภาพ</label>
              <input
                type="url"
                className="form-control"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="status" className="form-label text-dark-blue">สถานะ</label>
              <select
                className="form-select"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={submitting}
              >
                <option value="เสนอแล้ว">เสนอแล้ว</option>
                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                <option value="สำเร็จ">สำเร็จ</option>
                <option value="ถูกระงับ">ถูกระงับ</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-dark-blue me-2"
              disabled={submitting}
            >
              {submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
            <Link href="/admin/policies" className="btn btn-secondary">
              ยกเลิก
            </Link>
          </form>
          {message && (
            <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`} role="alert">
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
