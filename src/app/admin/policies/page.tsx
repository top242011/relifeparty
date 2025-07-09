// src/app/admin/policies/page.tsx
'use client' // 👈 1. ประกาศให้เป็น Client Component

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../utils/supabase/client' // 👈 2. Import จาก client.ts เท่านั้น
import AdminNavbar from '@/components/admin/AdminNavbar'
import DeletePolicyButton from '@/components/admin/DeletePolicyButton'

// กำหนด Type ของ Policy
interface Policy {
  id: string;
  title: string;
  status: string;
  publishDate: string;
  imageUrl: string | null;
  created_at: string;
}

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 3. ใช้ useEffect เพื่อดึงข้อมูลหลังจากหน้าเว็บโหลดเสร็จ
  useEffect(() => {
    const fetchPolicies = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setPolicies(data)
      }
      setLoading(false)
    }

    fetchPolicies()
  }, [])

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <AdminNavbar />
      <main className="container flex-grow-1 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-dark-blue">จัดการนโยบาย</h1>
          <Link href="/admin/policies/create" className="btn btn-primary">
            + เพิ่มนโยบายใหม่
          </Link>
        </div>

        {/* 4. แสดงผลตาม State ที่ได้จากการดึงข้อมูล */}
        {loading ? (
          <p>กำลังโหลดข้อมูลนโยบาย...</p>
        ) : error ? (
          <div className="alert alert-danger">เกิดข้อผิดพลาด: {error}</div>
        ) : policies.length === 0 ? (
          <div className="alert alert-info">ยังไม่มีนโยบายในระบบ</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover shadow-sm rounded overflow-hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <th scope="col">ชื่อนโยบาย</th>
                  <th scope="col">สถานะ</th>
                  <th scope="col">วันที่เผยแพร่</th>
                  <th scope="col">สร้างเมื่อ</th>
                  <th scope="col">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id}>
                    <td>{policy.title}</td>
                    <td>
                      <span className={`badge ${policy.status === 'สำเร็จ' ? 'bg-success' : 'bg-secondary'}`}>
                        {policy.status}
                      </span>
                    </td>
                    <td>{new Date(policy.publishDate).toLocaleDateString('th-TH')}</td>
                    <td>{new Date(policy.created_at).toLocaleDateString('th-TH')}</td>
                    <td>
                      <Link href={`/admin/policies/${policy.id}/edit`} className="btn btn-info btn-sm me-2">
                        แก้ไข
                      </Link>
                      <DeletePolicyButton policyId={policy.id} />
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
