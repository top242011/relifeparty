'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import DeleteButton from '@/components/admin/DeleteButton'

interface Motion {
  id: string;
  title: string;
  result: string | null;
  created_at: string;
}

// This interface now correctly expects meetings and personnel to be single objects or null
interface MotionView extends Motion {
  meetings: { topic: string } | null;
  personnel: { name: string } | null;
}

export default function AdminMotionsPage() {
  const [motions, setMotions] = useState<MotionView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMotions = async () => {
      const supabase = createClient()
      // The select query remains the same
      const { data, error: fetchError } = await supabase
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

      if (fetchError) {
        setError(fetchError.message)
      } else if (data) {
        // 👇 **THE FIX IS HERE**
        // We manually transform the data to match our MotionView interface
        const transformedData = data.map(motion => ({
          ...motion,
          // If meetings/personnel is an array, take the first element, otherwise use it as is (or null)
          meetings: Array.isArray(motion.meetings) ? motion.meetings[0] || null : motion.meetings,
          personnel: Array.isArray(motion.personnel) ? motion.personnel[0] || null : motion.personnel,
        }));
        setMotions(transformedData)
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
