'use client'

import { createClient } from '../../../utils/supabase/client' // 👈 1. แก้ path และชื่อ import
import { useRouter } from 'next/navigation'

export default function DeletePolicyButton({ policyId }: { policyId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบนโยบายนี้?')) {
      const supabase = createClient() // 👈 2. แก้ชื่อฟังก์ชันที่เรียกใช้
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', policyId)

      if (error) {
        alert(`เกิดข้อผิดพลาดในการลบนโยบาย: ${error.message}`)
      } else {
        alert('ลบนโยบายสำเร็จ')
        router.refresh() // ใช้ router.refresh() แทน window.location.reload()
      }
    }
  }

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
      ลบ
    </button>
  )
}