// src/app/admin/personnel/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../utils/supabase/client'
import AdminNavbar from '@/components/admin/AdminNavbar'
import DeleteButton from '@/components/admin/DeleteButton'

interface Personnel {
  id: string;
  name: string;
  position: string;
  is_active: boolean;
  image_url: string | null;
}

export default function AdminPersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPersonnel = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setPersonnel(data)
      }
      setLoading(false)
    }

    fetchPersonnel()
  }, [])

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-dark-blue">จัดการบุคลากร</h1>
          <Link href="/admin/personnel/create" className="btn btn-primary">
            + เพิ่มบุคลากรใหม่
          </Link>
        </div>

        {loading ? (
          <p>กำลังโหลดข้อมูลบุคลากร...</p>
        ) : error ? (
          <div className="alert alert-danger">เกิดข้อผิดพลาด: {error}</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '10%' }}>รูปภาพ</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ตำแหน่ง</th>
                  <th>สถานะ</th>
                  <th className="text-end">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {personnel.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <img 
                        src={person.image_url || `https://placehold.co/60x60/EFEFEF/AAAAAA&text=No+Image`} 
                        alt={person.name} 
                        className="rounded-circle"
                        width="50"
                        height="50"
                        style={{ objectFit: 'cover' }}
                      />
                    </td>
                    <td>{person.name}</td>
                    <td>{person.position}</td>
                    <td>
                      <span className={`badge ${person.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {person.is_active ? 'ดำรงตำแหน่ง' : 'พ้นจากตำแหน่ง'}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link href={`/admin/personnel/${person.id}/edit`} className="btn btn-info btn-sm me-2">
                        แก้ไข
                      </Link>
                      <DeleteButton recordId={person.id} tableName="personnel" />
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
