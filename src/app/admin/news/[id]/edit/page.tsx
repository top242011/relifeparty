// src/app/admin/news/[id]/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '../../../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import Link from 'next/link'

export default function EditNewsPage() {
  const params = useParams()
  const newsId = params.id as string

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchNews = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('news') // 👈 เปลี่ยนเป็นตาราง 'news'
        .select('*')
        .eq('id', newsId)
        .single()

      if (data) {
        setTitle(data.title)
        setContent(data.content)
        setPublishDate(data.publishDate ? new Date(data.publishDate).toISOString().split('T')[0] : '')
        setImageUrl(data.imageUrl || '')
      }
      setLoading(false)
    }
    fetchNews()
  }, [newsId])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const supabase = createClient()
    const { error } = await supabase
      .from('news') // 👈 เปลี่ยนเป็นตาราง 'news'
      .update({
        title,
        content,
        publishDate,
        imageUrl,
      })
      .eq('id', newsId)

    if (error) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`)
    } else {
      setMessage('แก้ไขข่าวสารสำเร็จ!')
      router.push('/admin/news')
      router.refresh()
    }
  }

  if (loading) return <p>กำลังโหลดข้อมูล...</p>

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <h1 className="mb-4 text-dark-blue">แก้ไขข่าวสาร</h1>
        <div className="card shadow-sm p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">หัวข้อข่าว</label>
              <input type="text" className="form-control" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="content" className="form-label">เนื้อหาข่าว</label>
              <textarea className="form-control" id="content" rows={5} value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="publishDate" className="form-label">วันที่เผยแพร่</label>
              <input type="date" className="form-control" id="publishDate" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="imageUrl" className="form-label">URL รูปภาพ (ถ้ามี)</label>
              <input type="url" className="form-control" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary me-2">บันทึกการแก้ไข</button>
            <Link href="/admin/news" className="btn btn-secondary">ยกเลิก</Link>
          </form>
          {message && <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
        </div>
      </main>
    </div>
  )
}
