// src/app/admin/news/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import DeleteButton from '@/components/admin/DeleteButton' // 1. ตรวจสอบว่า import DeleteButton มาถูกต้อง

interface NewsArticle {
  id: string;
  title: string;
  publishDate: string;
  created_at: string;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setNews(data)
      }
      setLoading(false)
    }

    fetchNews()
  }, [])

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-dark-blue">จัดการข่าวสาร</h1>
          <Link href="/admin/news/create" className="btn btn-primary">
            + เพิ่มข่าวใหม่
          </Link>
        </div>

        {loading ? (
          <p>กำลังโหลดข้อมูลข่าวสาร...</p>
        ) : error ? (
          <div className="alert alert-danger">เกิดข้อผิดพลาด: {error}</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover shadow-sm rounded overflow-hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <th scope="col">หัวข้อข่าว</th>
                  <th scope="col">วันที่เผยแพร่</th>
                  <th scope="col">สร้างเมื่อ</th>
                  <th scope="col">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {news.map((article) => (
                  <tr key={article.id}>
                    <td>{article.title}</td>
                    <td>{new Date(article.publishDate).toLocaleDateString('th-TH')}</td>
                    <td>{new Date(article.created_at).toLocaleDateString('th-TH')}</td>
                    <td>
                      <Link href={`/admin/news/${article.id}/edit`} className="btn btn-info btn-sm me-2">แก้ไข</Link>
                      {/* 2. แก้ไข props จาก policyId เป็น recordId */}
                      <DeleteButton recordId={article.id} tableName="news" />
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
