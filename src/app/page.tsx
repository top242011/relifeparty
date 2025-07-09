// src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../utils/supabase/client' // 👈 1. แก้ไข import

interface Policy {
  id: string
  title: string
  content: string
  status: string
}

export default function Home() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPolicies = async () => {
      const supabase = createClient() // 👈 2. แก้ไขการเรียกใช้ฟังก์ชัน
      try {
        const { data, error } = await supabase
          .from('policies')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)

        if (error) {
          throw error
        }
        setPolicies(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPolicies()
  }, [])

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-gradient-primary-secondary text-white p-4">
      <h1 className="display-3 display-md-1 fw-bold mb-4 text-center">
        Relife Party
      </h1>
      <p className="fs-4 fs-md-3 mb-5 text-center">
        "สร้างชีวิตใหม่ให้ธรรมศาสตร์"
      </p>
      <div className="bg-white text-dark-blue p-5 rounded shadow-lg text-center" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="h2 fw-semibold mb-4">ยินดีต้อนรับ</h2>
        <p className="fs-5">
          แพลตฟอร์ม Open Data เพื่อความโปร่งใสในการทำงานของพรรค
        </p>
        <p className="fs-5 mt-2">
          สำรวจนโยบาย ข่าวสาร และผลงานของเราได้ที่นี่
        </p>
        <div className="mt-4">
          <a
            href="/policies"
            className="btn btn-dark-blue px-4 py-2 rounded me-3"
          >
            ดูนโยบาย
          </a>
          <a
            href="/news"
            className="btn btn-dark-blue px-4 py-2 rounded"
          >
            อ่านข่าวสาร
          </a>
        </div>
      </div>

      <div className="mt-5 text-dark-blue bg-white p-4 rounded shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
        <h3 className="h3 fw-semibold mb-3">นโยบายล่าสุด (จาก Supabase)</h3>
        {loading && <p>กำลังโหลดนโยบาย...</p>}
        {error && <p className="text-danger">เกิดข้อผิดพลาด: {error}</p>}
        {!loading && policies.length === 0 && !error && <p>ยังไม่มีนโยบาย</p>}
        {!loading && policies.length > 0 && (
          <ul className="list-group">
            {policies.map((policy) => (
              <li key={policy.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">{policy.title}</h5>
                  <small className="text-muted">สถานะ: {policy.status}</small>
                </div>
                <span className="badge bg-primary rounded-pill">ดูรายละเอียด</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
