// src/app/admin/motions/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import DeleteButton from '@/components/admin/DeleteButton'

// 1. แก้ไข Type ให้ตรงกับข้อมูลที่ Supabase ส่งมาจริงๆ
// โดยระบุว่า meetings และ personnel อาจเป็น Array ที่มี Object เดียว
interface MotionView extends Motion {
  meetings: { topic: string } | null; // แก้ไข: ให้เป็น Object หรือ null
  personnel: { name: string } | null; // แก้ไข: ให้เป็น Object หรือ null
}

interface Motion {
  id: string;
  title: string;
  result: string | null;
  created_at: string;
}

export default function AdminMotionsPage() {
  const [motions, setMotions] = useState<MotionView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMotions = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('motions')
        .select(`
          id,
          title,
          result,
          created_at,
          meetings ( topic ),
          personnel ( name )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else if (data) {
        // Map meetings and personnel arrays to single object or null
        setMotions(
          data.map((motion: any) => ({
            ...motion,
            meetings: Array.isArray(motion.meetings) && motion.meetings.length > 0 ? motion.meetings[0] : null,
            personnel: Array.isArray(motion.personnel) && motion.personnel.length > 0 ? motion.personnel[0] : null,
          }))
        )
      }
      setLoading(false)
    }

    fetchMotions()
  }, [])

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-dark-blue">จัดการญัตติ</h1>
          <Link href="/admin/motions/create" className="btn btn-primary">
            + เสนอญัตติใหม่
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
                  <th>ชื่อญัตติ</th>
                  <th>ผู้เสนอ</th>
                  <th>ผลการลงมติ</th>
                  <th className="text-end">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {motions.map((motion) => (
                  <tr key={motion.id}>
                    <td>{motion.title}</td>
                    {/* 3. เข้าถึงข้อมูลได้โดยตรง ไม่ต้องใช้ ?.[0] */}
                    <td>{motion.personnel?.name || 'N/A'}</td>
                    <td>
                      <span className={`badge ${motion.result === 'ผ่าน' ? 'bg-success' : motion.result === 'ไม่ผ่าน' ? 'bg-danger' : 'bg-secondary'}`}>
                        {motion.result || 'รอลงมติ'}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link href={`/admin/motions/${motion.id}/edit`} className="btn btn-success btn-sm me-2">
                        <i className="bi bi-pencil-square me-1"></i> แก้ไขและบันทึกผลโหวต
                      </Link>
                      <DeleteButton recordId={motion.id} tableName="motions" />
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
