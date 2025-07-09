// src/app/admin/committees/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import DeleteButton from '@/components/admin/DeleteButton'

interface Committee {
  id: string;
  name: string;
  description: string | null;
}

export default function AdminCommitteesPage() {
  const [committees, setCommittees] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCommittees = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('committees')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setCommittees(data)
      }
      setLoading(false)
    }

    fetchCommittees()
  }, [])

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-dark-blue">จัดการคณะกรรมาธิการ</h1>
          <Link href="/admin/committees/create" className="btn btn-primary">
            + เพิ่มคณะกรรมาธิการ
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
                  <th>ชื่อคณะกรรมาธิการ</th>
                  <th>คำอธิบาย</th>
                  <th className="text-end">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {committees.map((committee) => (
                  <tr key={committee.id}>
                    <td>{committee.name}</td>
                    <td>{committee.description || '-'}</td>
                    <td className="text-end">
                      <Link href={`/admin/committees/${committee.id}/edit`} className="btn btn-info btn-sm me-2">
                        แก้ไข
                      </Link>
                      <DeleteButton recordId={committee.id} tableName="committees" />
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
