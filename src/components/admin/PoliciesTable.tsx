// src/components/admin/PoliciesTable.tsx
'use client'

import Link from 'next/link'
import DeleteButton from './DeleteButton' // 1. ตรวจสอบว่า import Component ที่ถูกต้อง

// กำหนด Type ของ Policy
interface Policy {
  id: string;
  title: string;
  status: string;
  publishDate: string;
  imageUrl: string | null;
  created_at: string;
}

export default function PoliciesTable({ policies }: { policies: Policy[] }) {
  if (policies.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        ยังไม่มีนโยบายในระบบ
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover shadow-sm rounded overflow-hidden">
        <thead className="bg-primary text-white">
          <tr>
            <th scope="col">ชื่อนโยบาย</th>
            <th scope="col">สถานะ</th>
            <th scope="col">วันที่เผยแพร่</th>
            <th scope="col">สร้างเมื่อ</th>
            <th scope="col">รูปภาพ</th>
            <th scope="col">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy) => (
            <tr key={policy.id}>
              <td>{policy.title}</td>
              <td>
                <span className={`badge ${policy.status === 'สำเร็จ' ? 'bg-success' : policy.status === 'กำลังดำเนินการ' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                  {policy.status}
                </span>
              </td>
              <td>{new Date(policy.publishDate).toLocaleDateString('th-TH')}</td>
              <td>{new Date(policy.created_at).toLocaleDateString('th-TH')}</td>
              <td>
                {policy.imageUrl ? (
                  <img src={policy.imageUrl} alt={policy.title} className="img-thumbnail" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                ) : (
                  <span>-</span>
                )}
              </td>
              <td>
                <Link href={`/admin/policies/${policy.id}/edit`} className="btn btn-info btn-sm me-2">
                  แก้ไข
                </Link>
                {/* 2. แก้ไข props จาก policyId เป็น recordId ที่นี่ */}
                <DeleteButton recordId={policy.id} tableName="policies" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
